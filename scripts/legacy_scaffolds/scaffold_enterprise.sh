#!/bin/bash
set -e

BACKEND_DIR="SourceCode/backend"
MODULE_DIR="$BACKEND_DIR/modules/enterprise"

rm -rf "$MODULE_DIR"
mkdir -p "$MODULE_DIR"
cd "$MODULE_DIR"

dotnet new classlib -n NacenTech.Modules.Enterprise
rm NacenTech.Modules.Enterprise/Class1.cs
cd NacenTech.Modules.Enterprise

dotnet add reference ../../../packages/kernel/NacenTech.Kernel.csproj
dotnet add reference ../../../packages/contracts/NacenTech.Contracts.csproj
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Relational

mkdir -p Domain Application Infrastructure

# 2. Tạo Domain Entities
cat << 'CS' > Domain/Enterprise.cs
using System;
using System.Collections.Generic;

namespace NacenTech.Modules.Enterprise.Domain;

public class Enterprise
{
    public Guid Id { get; set; }
    public string SubjectType { get; set; } = "INNOVATIVE_ENTERPRISE";
    public string LegalName { get; set; } = string.Empty;
    public string AddressInfoJson { get; set; } = string.Empty; // Hybrid JSONB
    public string Status { get; set; } = "ACTIVE";
    
    public ICollection<EnterpriseIdentifier> Identifiers { get; set; } = new List<EnterpriseIdentifier>();
    public ICollection<EnterpriseInnovationProject> InnovationProjects { get; set; } = new List<EnterpriseInnovationProject>();
    public ICollection<EnterpriseIntellectualProperty> IntellectualProperties { get; set; } = new List<EnterpriseIntellectualProperty>();
}
CS

cat << 'CS' > Domain/EnterpriseIdentifier.cs
using System;

namespace NacenTech.Modules.Enterprise.Domain;

public class EnterpriseIdentifier
{
    public Guid Id { get; set; }
    public Guid EnterpriseId { get; set; }
    public string Type { get; set; } = string.Empty; // TAX_CODE, BRC
    public string Value { get; set; } = string.Empty;
}
CS

cat << 'CS' > Domain/EnterpriseInnovationProject.cs
using System;

namespace NacenTech.Modules.Enterprise.Domain;

public class EnterpriseInnovationProject
{
    public Guid Id { get; set; }
    public Guid EnterpriseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
CS

cat << 'CS' > Domain/EnterpriseIntellectualProperty.cs
using System;

namespace NacenTech.Modules.Enterprise.Domain;

public class EnterpriseIntellectualProperty
{
    public Guid Id { get; set; }
    public Guid EnterpriseId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
}
CS

# EF Core Mapping
cat << 'CS' > Infrastructure/EnterpriseDbContext.cs
using Microsoft.EntityFrameworkCore;
using NacenTech.Modules.Enterprise.Domain;

namespace NacenTech.Modules.Enterprise.Infrastructure;

public class EnterpriseDbContext : DbContext
{
    public EnterpriseDbContext(DbContextOptions<EnterpriseDbContext> options) : base(options) { }

    public DbSet<Domain.Enterprise> Enterprises { get; set; }
    public DbSet<EnterpriseIdentifier> EnterpriseIdentifiers { get; set; }
    public DbSet<EnterpriseInnovationProject> EnterpriseInnovationProjects { get; set; }
    public DbSet<EnterpriseIntellectualProperty> EnterpriseIntellectualProperties { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("enterprise");

        modelBuilder.Entity<Domain.Enterprise>(b =>
        {
            b.ToTable("Enterprises");
            b.HasKey(x => x.Id);
            b.Property(x => x.AddressInfoJson).HasColumnType("jsonb");
            b.HasMany(x => x.Identifiers).WithOne().HasForeignKey(x => x.EnterpriseId);
            b.HasMany(x => x.InnovationProjects).WithOne().HasForeignKey(x => x.EnterpriseId);
            b.HasMany(x => x.IntellectualProperties).WithOne().HasForeignKey(x => x.EnterpriseId);
        });

        modelBuilder.Entity<EnterpriseIdentifier>().ToTable("EnterpriseIdentifiers");
        modelBuilder.Entity<EnterpriseInnovationProject>().ToTable("EnterpriseInnovationProjects");
        modelBuilder.Entity<EnterpriseIntellectualProperty>().ToTable("EnterpriseIntellectualProperties");
    }
}
CS

# add to sln
cd ../../../../
dotnet sln add modules/enterprise/NacenTech.Modules.Enterprise/NacenTech.Modules.Enterprise.csproj

echo "Phase 2 step 1 & 2 done"
