using NacenTech.Kernel.Domain;

namespace NacenTech.Contracts.Events;

/// <summary>Nội dung public của một subject đổi → matching re-chunk/re-embed/reindex.</summary>
public sealed record SubjectContentChanged(SubjectRef Subject, Guid? OwnerPersonId) : DomainEvent;

/// <summary>Subject được publish (draft → published). Chỉ subject published mới vào candidate universe (§14.1).</summary>
public sealed record SubjectPublished(SubjectRef Subject, Guid? OwnerPersonId) : DomainEvent;

public sealed record SubjectUnpublished(SubjectRef Subject) : DomainEvent;

public sealed record SubjectDeleted(SubjectRef Subject) : DomainEvent;

/// <summary>Matching đã chunk/embed/index xong (hoặc thất bại) → module chủ subject cập nhật AiChunkingStatus.</summary>
public sealed record SubjectChunkingCompleted(SubjectRef Subject, bool Success, string? Error) : DomainEvent;

/// <summary>Một MatchRound hoàn tất (§14.2). CandidateCount = số candidate sau hard filter.</summary>
public sealed record MatchRoundCompleted(SubjectRef Subject, Guid RoundId, int CandidateCount, string SearchEngineVersion) : DomainEvent;
