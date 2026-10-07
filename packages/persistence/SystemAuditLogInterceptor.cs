using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Audit.Domain;
using NacenTech.Kernel.Domain;
using System.Linq;
using System.Collections.Generic;
using System;
using System.Text.Json;

namespace NacenTech.Persistence;

public class SystemAuditLogInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentActor _actor;
    
    public SystemAuditLogInterceptor(ICurrentActor actor)
    {
        _actor = actor;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        GenerateAuditLogs(eventData.Context);
        return base.SavingChanges(eventData, result);
    }
    
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        GenerateAuditLogs(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void GenerateAuditLogs(DbContext? context)
    {
        if (context == null) return;

        var entries = context.ChangeTracker.Entries()
            .Where(e => e.Entity is AggregateRoot && (e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted))
            .ToList();

        foreach (var entry in entries)
        {
            var action = entry.State switch
            {
                EntityState.Added => "CREATE",
                EntityState.Modified => "UPDATE",
                EntityState.Deleted => "DELETE",
                _ => "UNKNOWN"
            };

            var entityType = entry.Entity.GetType().Name;
            var entityId = (entry.Entity as Entity)?.Id;
            var version = (entry.Entity as AggregateRoot)?.Version;
            
            string? details = null;
            if (entry.State == EntityState.Modified)
            {
                var dict = new Dictionary<string, object?>();
                foreach (var prop in entry.Properties)
                {
                    if (prop.IsModified)
                    {
                        dict[prop.Metadata.Name] = new { Old = prop.OriginalValue, New = prop.CurrentValue };
                    }
                }
                details = JsonSerializer.Serialize(dict);
            }

            var auditEvent = new AuditEvent(
                actorRef: _actor?.PersonId != Guid.Empty ? _actor?.PersonId : null,
                actorRole: string.IsNullOrEmpty(_actor?.PlatformRole) ? "SYSTEM" : _actor.PlatformRole,
                action: action,
                objectKind: entityType,
                objectId: entityId,
                objectVersion: version,
                purpose: "System Audit",
                outcome: "SUCCESS",
                ruleId: null,
                correlationId: _actor?.CorrelationId ?? Guid.NewGuid().ToString(),
                ipAddress: _actor?.IpAddress,
                userAgent: _actor?.UserAgent,
                details: details,
                occurredAt: DateTimeOffset.UtcNow
            );

            context.Set<AuditEvent>().Add(auditEvent);
        }
    }
}
