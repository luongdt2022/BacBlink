using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Brokerage.Domain;

namespace NacenTech.Modules.Brokerage.Application;

public sealed class ExpertService(DbContext db, IUnitOfWork uow, IClock clock, IObjectStorage storage, IExpertProvinceScopeLookup provinceScopes, IOptions<ExpertDraftOptions> draftOptions) : IExpertService
{
    public async Task<ExpertProfileDto> SubmitUpgradeAsync(Guid personId, SubmitExpertUpgradeRequest request, CancellationToken ct)
    {
        if (!request.PdpdConsent)
            throw new ValidationException("Bắt buộc đồng ý cam kết PDPD theo Nghị định 13/2023/NĐ-CP.");
        if (!request.LegalOath)
            throw new ValidationException("Bắt buộc cam kết tính chính xác của hồ sơ.");

        ValidateTimelineAndYears(request);

        ExpertProfile? draft = null;
        if (!string.IsNullOrWhiteSpace(request.DraftToken))
        {
            var hash = new ExpertDraftTokens(draftOptions.Value).ValidateAndHash(request.DraftToken, clock.UtcNow);
            // Host transaction keeps this row lock through profile and approval commits.
            draft = await db.Set<ExpertProfile>().FromSqlInterpolated($"SELECT * FROM brokerage.expert_profiles WHERE magic_link_token = {hash} FOR UPDATE").FirstOrDefaultAsync(ct);
            ValidateDraft(draft);
            if (draft!.PersonId is not null && draft.PersonId != personId) throw ExpertDraftTokens.Invalid();
        }
        var existing = await db.Set<ExpertProfile>().FirstOrDefaultAsync(p => p.PersonId == personId, ct);
        if (existing is not null)
        {
            if (existing.Status == ExpertStatuses.PendingReview)
                throw new ConflictException("Hồ sơ chuyên gia của bạn đang trong quá trình thẩm định. Vui lòng chờ phản hồi từ Hội đồng Khoa học.");
            
            if (existing.Status == ExpertStatuses.Approved)
                throw new ConflictException("Tài khoản của bạn đã được phê duyệt tư cách Chuyên gia KH&CN.");
            
            // Re-apply if Rejected or ChangesRequested
            db.Remove(existing);
        }

        var profile = new ExpertProfile(
            personId: personId,
            fullName: request.FullName,
            birthYear: request.BirthYear,
            gender: request.Gender,
            idCardNumber: null,
            idCardDate: null,
            academicRank: request.AcademicRank ?? "NONE",
            academicRankYear: request.AcademicRankYear,
            degree: request.Degree,
            degreeYear: request.DegreeYear,
            organizationName: request.OrganizationName,
            organizationAddress: request.OrganizationAddress,
            researchTitle: request.ResearchTitle,
            positionTitle: request.PositionTitle,
            expertiseSectors: request.ExpertiseSectors ?? [],
            trainingHistoryJson: request.TrainingHistoryJson,
            employmentHistoryJson: request.EmploymentHistoryJson,
            publicationsJson: request.PublicationsJson,
            consultingSummary: request.ConsultingSummary,
            isProjectLeader: request.IsProjectLeader,
            isMainContributor: request.IsMainContributor,
            pdpdConsentAtUtc: clock.UtcNow,
            legalOath: request.LegalOath,
            specializedKeywords: request.SpecializedKeywords);

        if (!string.IsNullOrWhiteSpace(request.Phone) || !string.IsNullOrWhiteSpace(request.Email))
        {
            profile.SetContactInfo(request.Phone, request.Email);
        }

        if (draft is not null)
        {
            draft.CompleteDraft(personId, profile);
            profile = draft;
        }
        else db.Add(profile);
        await uow.CommitAsync(ct);

        return ToDto(profile);
    }

    public async Task<ExpertDraftDto> GetDraftAsync(string token, CancellationToken ct)
    {
        var hash = new ExpertDraftTokens(draftOptions.Value).ValidateAndHash(token, clock.UtcNow);
        var draft = await db.Set<ExpertProfile>().AsNoTracking().FirstOrDefaultAsync(profile => profile.MagicLinkToken == hash, ct);
        ValidateDraft(draft);
        return new ExpertDraftDto(draft!.Id, draft.FullName, draft.Phone, draft.Email, draft.Degree,
            draft.OrganizationName, draft.ExpertiseSectors.FirstOrDefault(), draft.MasteredTechCodes, draft.Status,
            draft.TrainingHistoryJson, draft.EmploymentHistoryJson, draft.PublicationsJson, SpecializedKeywords: draft.SpecializedKeywords);
    }

    private void ValidateDraft(ExpertProfile? draft)
    {
        if (draft is null || draft.MagicLinkExpiresAtUtc is null || draft.MagicLinkExpiresAtUtc <= clock.UtcNow ||
            draft.PersonId is not null || draft.DraftSource != "ZALO_MINI_APP") throw ExpertDraftTokens.Invalid();
    }

    public async Task<ExpertProfileDto?> GetMyProfileAsync(Guid personId, CancellationToken ct)
    {
        var profile = await db.Set<ExpertProfile>().AsNoTracking().FirstOrDefaultAsync(p => p.PersonId == personId, ct);
        return profile is null ? null : ToDto(profile);
    }

    public async Task<QuickExpertIntakeResponse> SubmitQuickIntakeAsync(QuickExpertIntakeRequest request, CancellationToken ct)
    {
        var profile = ExpertProfile.CreateQuickIntake(
            fullName: request.FullName,
            phone: request.Phone,
            email: request.Email,
            highestDegree: request.HighestDegree,
            organizationName: request.Organization,
            sectorCode: request.SectorCode,
            masteredTechCodes: request.MasteredTechCodes ?? [],
            cvFileUrl: request.CvFileName,
            pdpdConsentAtUtc: clock.UtcNow);

        if (!request.PdpdConsent) throw new ValidationException("Bắt buộc đồng ý cam kết PDPD.");
        var link = new ExpertDraftTokens(draftOptions.Value).Issue(clock.UtcNow);
        profile.IssueDraftLink(link.Hash, link.ExpiresAt);
        if (!Uri.TryCreate(draftOptions.Value.FrontendUrl, UriKind.Absolute, out var frontend) ||
            (frontend.Scheme != Uri.UriSchemeHttps && !(frontend.IsLoopback && frontend.Scheme == Uri.UriSchemeHttp)))
            throw new InvalidOperationException("Auth:FrontendUrl phải là HTTPS hoặc localhost HTTP.");
        db.Add(profile);
        await uow.CommitAsync(ct);

        var magicLinkUrl = new Uri(frontend, "/profile/upgrade/expert?draftToken=" + Uri.EscapeDataString(link.Token)).AbsoluteUri;

        return new QuickExpertIntakeResponse(
            Success: true,
            TrackingId: $"DRAFT-EXP-{profile.Id.ToString()[..8].ToUpperInvariant()}",
            Status: profile.Status,
            Message: "Đã lưu hồ sơ sơ bộ. Mở liên kết để rà soát và bổ sung hồ sơ trên Web Portal.",
            MagicLinkUrl: magicLinkUrl,
            EstimatedSeconds: 0);
    }

    public async Task<ExpertPublicDetailDto?> GetPublicDetailAsync(string expertCode, CancellationToken ct)
    {
        var profile = await db.Set<ExpertProfile>().AsNoTracking()
            .FirstOrDefaultAsync(p => p.ExpertCode == expertCode && p.Status == ExpertStatuses.Approved && p.VisibilityStatus == ExpertVisibilityStatuses.Public, ct);
        return profile is null ? null : await ToPublicDetailAsync(profile, ct);
    }


    public async Task<ExpertPublicDirectoryDto> GetPublicDirectoryAsync(
        string? q,
        IReadOnlyList<string>? degrees,
        IReadOnlyList<string>? sectorCodes,
        string? provinceCode,
        bool? acceptingConsultation,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 9 : (pageSize > 50 ? 50 : pageSize);

        var query = db.Set<ExpertProfile>().AsNoTracking()
            .Where(p => p.Status == ExpertStatuses.Approved && p.VisibilityStatus == ExpertVisibilityStatuses.Public);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var keyword = q.Trim().ToLower();
            query = query.Where(p =>
                p.FullName.ToLower().Contains(keyword) ||
                p.OrganizationName.ToLower().Contains(keyword) ||
                (p.ConsultingSummary != null && p.ConsultingSummary.ToLower().Contains(keyword)) ||
                p.MasteredTechCodes.Any(code => code.ToLower().Contains(keyword)) ||
                p.SpecializedKeywords.Any(tag => tag.ToLower().Contains(keyword)));
        }

        if (degrees is { Count: > 0 })
        {
            var degList = degrees.Where(d => !string.IsNullOrWhiteSpace(d)).Select(d => d.Trim()).ToList();
            if (degList.Count > 0)
            {
                var expandedDegs = new HashSet<string>(degList, StringComparer.OrdinalIgnoreCase);
                foreach (var deg in degList)
                {
                    if (string.Equals(deg, "GS", StringComparison.OrdinalIgnoreCase) || string.Equals(deg, "PROFESSOR", StringComparison.OrdinalIgnoreCase))
                    {
                        expandedDegs.Add("GS");
                        expandedDegs.Add("PROFESSOR");
                    }
                    else if (string.Equals(deg, "PGS", StringComparison.OrdinalIgnoreCase) || string.Equals(deg, "ASSOCIATE_PROFESSOR", StringComparison.OrdinalIgnoreCase))
                    {
                        expandedDegs.Add("PGS");
                        expandedDegs.Add("ASSOCIATE_PROFESSOR");
                    }
                    else if (string.Equals(deg, "DOCTOR", StringComparison.OrdinalIgnoreCase) || string.Equals(deg, "TS", StringComparison.OrdinalIgnoreCase) || string.Equals(deg, "TSKH", StringComparison.OrdinalIgnoreCase))
                    {
                        expandedDegs.Add("DOCTOR");
                        expandedDegs.Add("TS");
                        expandedDegs.Add("TSKH");
                    }
                    else if (string.Equals(deg, "MASTER", StringComparison.OrdinalIgnoreCase) || string.Equals(deg, "ThS", StringComparison.OrdinalIgnoreCase))
                    {
                        expandedDegs.Add("MASTER");
                        expandedDegs.Add("ThS");
                        expandedDegs.Add("ENGINEER");
                        expandedDegs.Add("BACHELOR");
                        expandedDegs.Add("KS");
                        expandedDegs.Add("CN");
                    }
                }
                var expandedList = expandedDegs.ToList();
                query = query.Where(p => expandedList.Contains(p.Degree) || expandedList.Contains(p.AcademicRank));
            }
        }

        if (sectorCodes is { Count: > 0 })
        {
            var secList = sectorCodes.Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s.Trim()).ToList();
            if (secList.Count > 0)
            {
                query = query.Where(p => p.ExpertiseSectors.Any(s => secList.Contains(s)));
            }
        }

        if (!string.IsNullOrWhiteSpace(provinceCode))
        {
            var provinces = provinceCode.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                                       .Select(p => p.ToUpperInvariant()).ToList();
            if (provinces.Count == 1)
            {
                var scopedPersonIds = await provinceScopes.GetPersonIdsInProvinceAsync(provinces[0], ct);
                query = query.Where(p => p.PersonId != null && scopedPersonIds.Contains(p.PersonId.Value));
            }
            else if (provinces.Count > 1)
            {
                var allScopedIds = new HashSet<Guid>();
                foreach (var prov in provinces)
                {
                    var ids = await provinceScopes.GetPersonIdsInProvinceAsync(prov, ct);
                    foreach (var id in ids) allScopedIds.Add(id);
                }
                query = query.Where(p => p.PersonId != null && allScopedIds.Contains(p.PersonId.Value));
            }
        }

        if (acceptingConsultation == true)
            query = query.Where(p => p.IsAcceptingConsultation);

        var totalCount = await query.CountAsync(ct);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var profiles = await query
            .OrderByDescending(p => p.AcademicRank != "NONE")
            .ThenByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var profileIds = profiles.Select(p => p.Id).ToList();

        var pubCounts = await db.Set<ExpertPublication>().AsNoTracking()
            .Where(x => profileIds.Contains(x.ExpertProfileId) && x.IsActive && x.IsPublic)
            .GroupBy(x => x.ExpertProfileId)
            .Select(g => new { Id = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Id, x => x.Count, ct);

        var patCounts = await db.Set<ExpertPatent>().AsNoTracking()
            .Where(x => profileIds.Contains(x.ExpertProfileId) && x.IsActive && x.IsPublic)
            .GroupBy(x => x.ExpertProfileId)
            .Select(g => new { Id = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Id, x => x.Count, ct);

        var projCounts = await db.Set<ExpertResearchProject>().AsNoTracking()
            .Where(x => profileIds.Contains(x.ExpertProfileId) && x.IsActive && x.IsPublic)
            .GroupBy(x => x.ExpertProfileId)
            .Select(g => new { Id = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Id, x => x.Count, ct);

        var personIds = profiles.Where(p => p.PersonId != null).Select(p => p.PersonId!.Value).Distinct().ToList();
        var provinceByPerson = await provinceScopes.GetProvinceScopesAsync(personIds, ct);

        var items = profiles.Select(p => new ExpertPublicCardDto(
            ExpertCode: p.ExpertCode,
            FullName: p.FullName,
            AcademicRank: p.AcademicRank,
            Degree: p.Degree,
            OrganizationName: p.OrganizationName,
            PositionTitle: p.PositionTitle,
            PrimarySectorCode: p.ExpertiseSectors.FirstOrDefault(),
            PrimarySectorName: p.ExpertiseSectors.FirstOrDefault(),
            ExpertiseSectors: p.ExpertiseSectors,
            MasteredTechCodes: p.MasteredTechCodes,
            ProvinceCode: p.PersonId is Guid personId && provinceByPerson.TryGetValue(personId, out var code) ? code : null,
            ProvinceName: null,
            PublicationCount: pubCounts.GetValueOrDefault(p.Id, 0),
            PatentCount: patCounts.GetValueOrDefault(p.Id, 0),
            ProjectCount: projCounts.GetValueOrDefault(p.Id, 0),
            IsVerified: p.Status == ExpertStatuses.Approved,
            IsAcceptingConsultation: p.IsAcceptingConsultation,
            SpecializedKeywords: p.SpecializedKeywords,
            ConnectionCount: p.ConnectionCount
        )).ToList();

        return new ExpertPublicDirectoryDto(items, totalCount, page, pageSize, totalPages);
    }

    public async Task<ExpertPrivateDetailDto?> GetMyDetailAsync(Guid personId, CancellationToken ct)
    {
        var profile = await db.Set<ExpertProfile>().AsNoTracking().FirstOrDefaultAsync(p => p.PersonId == personId, ct);
        return profile is null ? null : await ToPrivateDetailAsync(profile, ct);
    }

    public async Task<ExpertPrivateDetailDto?> GetAdminDetailAsync(string expertCode, CancellationToken ct)
    {
        var profile = await db.Set<ExpertProfile>().AsNoTracking().FirstOrDefaultAsync(p => p.ExpertCode == expertCode, ct);
        return profile is null ? null : await ToPrivateDetailAsync(profile, ct);
    }

    public async Task SetPublicListingAsync(string expertCode, bool isPublic, bool isAcceptingConsultation, string? publicBio, CancellationToken ct)
    {
        var profile = await db.Set<ExpertProfile>().FirstOrDefaultAsync(p => p.ExpertCode == expertCode, ct)
            ?? throw new NotFoundException("Không tìm thấy hồ sơ chuyên gia.");
        profile.SetPublicListing(isPublic, isAcceptingConsultation, publicBio);
        await uow.CommitAsync(ct);
    }

    public async Task<ExpertDocumentContent?> OpenMyDocumentAsync(Guid personId, Guid documentId, CancellationToken ct)
    {
        var document = await (from d in db.Set<ExpertDocument>()
                              join p in db.Set<ExpertProfile>() on d.ExpertProfileId equals p.Id
                              where d.Id == documentId && d.IsActive && p.PersonId == personId
                              select d).AsNoTracking().FirstOrDefaultAsync(ct);
        return document is null ? null : await OpenDocumentAsync(document, ct);
    }

    public async Task<ExpertDocumentContent?> OpenAdminDocumentAsync(string expertCode, Guid documentId, CancellationToken ct)
    {
        var document = await (from d in db.Set<ExpertDocument>()
                              join p in db.Set<ExpertProfile>() on d.ExpertProfileId equals p.Id
                              where d.Id == documentId && d.IsActive && p.ExpertCode == expertCode
                              select d).AsNoTracking().FirstOrDefaultAsync(ct);
        return document is null ? null : await OpenDocumentAsync(document, ct);
    }

    public async Task<IReadOnlyList<ExpertDocumentInfoDto>> GetMyDocumentsAsync(Guid personId, CancellationToken ct)
    {
        return await (from d in db.Set<ExpertDocument>()
                      join p in db.Set<ExpertProfile>() on d.ExpertProfileId equals p.Id
                      where d.IsActive && p.PersonId == personId
                      orderby d.Id descending
                      select new ExpertDocumentInfoDto(
                          d.Id,
                          d.DocumentType,
                          d.MimeType,
                          d.SizeBytes,
                          d.Sha256,
                          $"{d.DocumentType}-{d.Id:N}")).ToListAsync(ct);
    }

    public async Task<IReadOnlyList<ExpertDocumentInfoDto>> GetAdminDocumentsAsync(string expertCode, CancellationToken ct)
    {
        return await (from d in db.Set<ExpertDocument>()
                      join p in db.Set<ExpertProfile>() on d.ExpertProfileId equals p.Id
                      where d.IsActive && p.ExpertCode == expertCode
                      orderby d.Id descending
                      select new ExpertDocumentInfoDto(
                          d.Id,
                          d.DocumentType,
                          d.MimeType,
                          d.SizeBytes,
                          d.Sha256,
                          $"{d.DocumentType}-{d.Id:N}")).ToListAsync(ct);
    }

    public async Task<ExpertProfileDto> UpdateMyProfileAsync(Guid personId, UpdateExpertProfileRequest request, CancellationToken ct)
    {
        var profile = await db.Set<ExpertProfile>().FirstOrDefaultAsync(p => p.PersonId == personId, ct)
            ?? throw new NotFoundException("Không tìm thấy hồ sơ chuyên gia.");

        profile.UpdateProfileDetails(
            academicRank: request.AcademicRank ?? "NONE",
            academicRankYear: request.AcademicRankYear,
            degree: request.Degree,
            degreeYear: request.DegreeYear,
            organizationName: request.OrganizationName,
            organizationAddress: request.OrganizationAddress,
            researchTitle: request.ResearchTitle,
            positionTitle: request.PositionTitle,
            expertiseSectors: request.ExpertiseSectors ?? [],
            specializedKeywords: request.SpecializedKeywords,
            publicBio: request.PublicBio,
            isAcceptingConsultation: request.IsAcceptingConsultation,
            trainingHistoryJson: request.TrainingHistoryJson,
            employmentHistoryJson: request.EmploymentHistoryJson,
            publicationsJson: request.PublicationsJson,
            consultingSummary: request.ConsultingSummary);

        await uow.CommitAsync(ct);
        return ToDto(profile);
    }

    public async Task<ExpertCompletenessDto> GetMyCompletenessAsync(Guid personId, CancellationToken ct)
    {
        var profile = await db.Set<ExpertProfile>().AsNoTracking().FirstOrDefaultAsync(p => p.PersonId == personId, ct)
            ?? throw new NotFoundException("Không tìm thấy hồ sơ chuyên gia.");

        var (score, grade, completed, missing, suggestions) = profile.CalculateCompleteness();
        return new ExpertCompletenessDto(score, grade, completed, missing, suggestions);
    }

    private async Task<ExpertDocumentContent?> OpenDocumentAsync(ExpertDocument document, CancellationToken ct)
    {
        var content = await storage.OpenReadAsync(document.StorageKey, ct);
        return content is null ? null : new ExpertDocumentContent(content, document.MimeType, $"{document.DocumentType}-{document.Id:N}");
    }

    private async Task<ExpertPublicDetailDto> ToPublicDetailAsync(ExpertProfile p, CancellationToken ct)
    {
        var training = await db.Set<ExpertTrainingRecord>().AsNoTracking().Where(x => x.ExpertProfileId == p.Id && x.IsPublic && x.IsActive)
            .OrderBy(x => x.DisplayOrder).Select(x => new ExpertTimelineDto(x.Level, x.Institution, x.GraduationYear == null ? null : x.GraduationYear.ToString())).ToListAsync(ct);
        var employment = await db.Set<ExpertEmploymentRecord>().AsNoTracking().Where(x => x.ExpertProfileId == p.Id && x.IsPublic && x.IsActive)
            .OrderBy(x => x.DisplayOrder).Select(x => new ExpertTimelineDto(x.PositionTitle ?? x.Organization, x.Organization, x.FromDate == null ? null : x.FromDate.Value.Year.ToString())).ToListAsync(ct);
        var patents = await db.Set<ExpertPatent>().AsNoTracking().Where(x => x.ExpertProfileId == p.Id && x.IsPublic && x.IsActive)
            .Select(x => new ExpertAchievementDto("PATENT", x.Title, x.CertificateNumber, x.TechnologyReadinessLevel == null ? x.Description : $"TRL {x.TechnologyReadinessLevel}: {x.Description}")).ToListAsync(ct);
        var projects = await db.Set<ExpertResearchProject>().AsNoTracking().Where(x => x.ExpertProfileId == p.Id && x.IsPublic && x.IsActive)
            .Select(x => new ExpertAchievementDto("RESEARCH_PROJECT", x.Title, x.ManagementLevel, $"{x.StartYear}–{x.EndYear} · {x.Role} · {x.AcceptanceStatus}")).ToListAsync(ct);
        var publications = await db.Set<ExpertPublication>().AsNoTracking().Where(x => x.ExpertProfileId == p.Id && x.IsPublic && x.IsActive)
            .OrderBy(x => x.DisplayOrder).Select(x => new ExpertAchievementDto("PUBLICATION", x.Title, x.Journal, x.Doi)).ToListAsync(ct);
        var practical = await db.Set<ExpertPracticalProject>().AsNoTracking().Where(x => x.ExpertProfileId == p.Id && x.IsPublic && x.IsActive)
            .Select(x => new ExpertAchievementDto("PRACTICAL", x.Title, x.ReceivingOrganization, x.Outcome ?? x.Scale)).ToListAsync(ct);
        var awards = await db.Set<ExpertAward>().AsNoTracking().Where(x => x.ExpertProfileId == p.Id && x.IsPublic && x.IsActive)
            .Select(x => new ExpertAchievementDto("AWARD", x.Name, x.AwardLevel ?? x.Form, x.Description ?? (x.AwardedYear == null ? null : x.AwardedYear.ToString()))).ToListAsync(ct);

        if (training.Count == 0 && !string.IsNullOrWhiteSpace(p.TrainingHistoryJson))
            training = ParseTrainingHistoryJson(p.TrainingHistoryJson);

        if (employment.Count == 0 && !string.IsNullOrWhiteSpace(p.EmploymentHistoryJson))
            employment = ParseEmploymentHistoryJson(p.EmploymentHistoryJson);

        if (publications.Count == 0 && !string.IsNullOrWhiteSpace(p.PublicationsJson))
            publications = ParsePublicationsJson(p.PublicationsJson);

        return new ExpertPublicDetailDto(p.ExpertCode, p.FullName, p.AcademicRank, p.Degree, p.BirthYear, p.Gender,
            p.OrganizationName, p.PositionTitle, p.PublicBio, p.ExpertiseSectors, p.MasteredTechCodes,
            p.Status == ExpertStatuses.Approved, p.IsAcceptingConsultation, training, employment, patents, projects, publications, practical, awards, p.SpecializedKeywords);
    }

    private async Task<ExpertPrivateDetailDto> ToPrivateDetailAsync(ExpertProfile p, CancellationToken ct)
    {
        var publicProfile = await ToPublicDetailAsync(p, ct);
        var documentTypes = await db.Set<ExpertDocument>().AsNoTracking()
            .Where(x => x.ExpertProfileId == p.Id && x.IsActive).Select(x => x.DocumentType).ToListAsync(ct);
        return new ExpertPrivateDetailDto(publicProfile, p.Phone, p.Email,
            p.OrganizationAddress, p.PdpdConsentAtUtc != default, p.LegalOath, p.Status, documentTypes);
    }

    private static ExpertProfileDto ToDto(ExpertProfile p)
        => new(
            Id: p.Id,
            PersonId: p.PersonId ?? Guid.Empty,
            FullName: p.FullName,
            BirthYear: p.BirthYear,
            Gender: p.Gender,
            AcademicRank: p.AcademicRank,
            AcademicRankYear: p.AcademicRankYear,
            Degree: p.Degree,
            DegreeYear: p.DegreeYear,
            OrganizationName: p.OrganizationName,
            OrganizationAddress: p.OrganizationAddress,
            ResearchTitle: p.ResearchTitle,
            PositionTitle: p.PositionTitle,
            ExpertiseSectors: p.ExpertiseSectors,
            TrainingHistoryJson: p.TrainingHistoryJson,
            EmploymentHistoryJson: p.EmploymentHistoryJson,
            PublicationsJson: p.PublicationsJson,
            ConsultingSummary: p.ConsultingSummary,
            IsProjectLeader: p.IsProjectLeader,
            IsMainContributor: p.IsMainContributor,
            Status: p.Status,
            ReviewerNote: p.ReviewerNote,
            CreatedAtUtc: p.CreatedAt,
            UpdatedAtUtc: p.UpdatedAt,
            SpecializedKeywords: p.SpecializedKeywords,
            Phone: p.Phone,
            Email: p.Email);

    private static void ValidateTimelineAndYears(SubmitExpertUpgradeRequest request)
    {
        var currentYear = DateTime.UtcNow.Year;
        if (request.BirthYear < 1920 || request.BirthYear > currentYear - 18)
            throw new ValidationException($"Năm sinh không hợp lệ. Phải từ 1920 đến {currentYear - 18}.");

        if (request.DegreeYear > currentYear)
            throw new ValidationException($"Năm tốt nghiệp không được vượt quá năm hiện tại ({currentYear}).");

        if (request.AcademicRankYear.HasValue && request.AcademicRankYear.Value > currentYear)
            throw new ValidationException($"Năm phong học hàm không được vượt quá năm hiện tại ({currentYear}).");

        if (!string.IsNullOrWhiteSpace(request.TrainingHistoryJson))
        {
            try
            {
                using var doc = JsonDocument.Parse(request.TrainingHistoryJson);
                if (doc.RootElement.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in doc.RootElement.EnumerateArray())
                    {
                        if (item.ValueKind == JsonValueKind.Object)
                        {
                            var year = ExtractYear(item, "graduationYear", "year", "năm");
                            if (year.HasValue && year.Value > currentYear)
                                throw new ValidationException($"Năm đào tạo ({year.Value}) không được vượt quá năm hiện tại ({currentYear}).");
                        }
                    }
                }
            }
            catch (JsonException) { }
        }

        if (!string.IsNullOrWhiteSpace(request.PublicationsJson))
        {
            try
            {
                using var doc = JsonDocument.Parse(request.PublicationsJson);
                if (doc.RootElement.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in doc.RootElement.EnumerateArray())
                    {
                        if (item.ValueKind == JsonValueKind.Object)
                        {
                            var year = ExtractYear(item, "year", "năm", "publicationYear");
                            if (year.HasValue && year.Value > currentYear)
                                throw new ValidationException($"Năm ấn phẩm ({year.Value}) không được vượt quá năm hiện tại ({currentYear}).");
                        }
                    }
                }
            }
            catch (JsonException) { }
        }
    }

    private static List<ExpertTimelineDto> ParseTrainingHistoryJson(string json)
    {
        var list = new List<ExpertTimelineDto>();
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var el in doc.RootElement.EnumerateArray())
                {
                    if (el.ValueKind != JsonValueKind.Object) continue;
                    var degree = GetStringProperty(el, "degree", "level", "bậc", "degreeName") ?? string.Empty;
                    var institution = GetStringProperty(el, "institution", "school", "university", "nơi đào tạo") ?? string.Empty;
                    var major = GetStringProperty(el, "major", "chuyên ngành");
                    var year = ExtractYear(el, "graduationYear", "year", "năm")?.ToString();

                    var title = !string.IsNullOrWhiteSpace(degree)
                        ? (!string.IsNullOrWhiteSpace(major) ? $"{degree} - {major}" : degree)
                        : (major ?? "Đào tạo");
                    list.Add(new ExpertTimelineDto(title, institution, year));
                }
            }
        }
        catch (JsonException) { }
        return list;
    }

    private static List<ExpertTimelineDto> ParseEmploymentHistoryJson(string json)
    {
        var list = new List<ExpertTimelineDto>();
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var el in doc.RootElement.EnumerateArray())
                {
                    if (el.ValueKind != JsonValueKind.Object) continue;
                    var position = GetStringProperty(el, "positionTitle", "position", "chức danh", "vị trí", "role") ?? string.Empty;
                    var org = GetStringProperty(el, "organization", "org", "cơ quan", "đơn vị", "công ty") ?? string.Empty;
                    var period = GetStringProperty(el, "period", "giai đoạn", "duration");
                    if (string.IsNullOrWhiteSpace(period))
                    {
                        var from = GetStringProperty(el, "fromDate", "from", "bắt đầu") ?? ExtractYear(el, "fromYear", "startYear")?.ToString();
                        var to = GetStringProperty(el, "toDate", "to", "kết thúc") ?? ExtractYear(el, "toYear", "endYear")?.ToString();
                        if (from is not null && to is not null) period = $"{from} - {to}";
                        else period = from ?? to ?? ExtractYear(el, "year", "năm")?.ToString();
                    }

                    var title = !string.IsNullOrWhiteSpace(position) ? position : org;
                    list.Add(new ExpertTimelineDto(title, org, period));
                }
            }
        }
        catch (JsonException) { }
        return list;
    }

    private static List<ExpertAchievementDto> ParsePublicationsJson(string json)
    {
        var list = new List<ExpertAchievementDto>();
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var el in doc.RootElement.EnumerateArray())
                {
                    if (el.ValueKind != JsonValueKind.Object) continue;
                    var title = GetStringProperty(el, "title", "tên", "tên công trình") ?? string.Empty;
                    var journal = GetStringProperty(el, "journal", "tạp chí", "publisher", "nơi xuất bản", "role");
                    var doi = GetStringProperty(el, "doi");
                    var year = ExtractYear(el, "year", "năm", "publicationYear")?.ToString();

                    string? desc = null;
                    if (!string.IsNullOrWhiteSpace(doi) && !string.IsNullOrWhiteSpace(year))
                        desc = $"{year} · DOI: {doi}";
                    else if (!string.IsNullOrWhiteSpace(doi))
                        desc = doi;
                    else if (!string.IsNullOrWhiteSpace(year))
                        desc = year;

                    list.Add(new ExpertAchievementDto("PUBLICATION", title, journal, desc));
                }
            }
        }
        catch (JsonException) { }
        return list;
    }

    private static int? ExtractYear(JsonElement element, params string[] propertyNames)
    {
        foreach (var prop in propertyNames)
        {
            foreach (var property in element.EnumerateObject())
            {
                if (property.Name.Equals(prop, StringComparison.OrdinalIgnoreCase))
                {
                    if (property.Value.ValueKind == JsonValueKind.Number && property.Value.TryGetInt32(out var y))
                        return y;
                    if (property.Value.ValueKind == JsonValueKind.String && int.TryParse(property.Value.GetString(), out var ys))
                        return ys;
                }
            }
        }
        return null;
    }

    private static string? GetStringProperty(JsonElement element, params string[] propertyNames)
    {
        foreach (var prop in propertyNames)
        {
            foreach (var property in element.EnumerateObject())
            {
                if (property.Name.Equals(prop, StringComparison.OrdinalIgnoreCase))
                {
                    if (property.Value.ValueKind == JsonValueKind.String)
                        return property.Value.GetString();
                    if (property.Value.ValueKind == JsonValueKind.Number)
                        return property.Value.ToString();
                }
            }
        }
        return null;
    }
}
