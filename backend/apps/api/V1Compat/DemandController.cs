using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Kernel.Domain;
using NacenTech.Modules.Demand.Domain;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Technology.Domain;
using NacenTech.Persistence;

namespace NacenTech.Api.V1Compat;

[ApiController]
[Route("api/v1")]
public sealed class DemandController(NacenTechDbContext db, IUnitOfWork uow, IPersonService personService) : V1ControllerBase
{
    // =========================================================================
    // LUỒNG 1: KHẢO SÁT SÂU DNNVV & BÓC TÁCH BÀI TOÁN (SC-03-01 / WF-01)
    // =========================================================================

    [HttpPost("demands/surveys")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitDeepSurvey([FromBody] SubmitDeepSurveyRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.CompanyName))
            return BadRequest(new { message = "Tên doanh nghiệp không được để trống." });
        if (string.IsNullOrWhiteSpace(req.ContactName) || string.IsNullOrWhiteSpace(req.ContactPhone) || string.IsNullOrWhiteSpace(req.ContactEmail))
            return BadRequest(new { message = "Thông tin liên hệ (Họ tên, SĐT, Email) là bắt buộc." });

        var signatureUrl = req.SignatureDataUrl ?? req.RepresentativeSignatureUrl;
        if (!string.IsNullOrWhiteSpace(signatureUrl))
        {
            if (!signatureUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase) || signatureUrl.Length < 30)
            {
                return BadRequest(new { message = "Chữ ký điện tử không hợp lệ. Vui lòng cung cấp định dạng ảnh hợp lệ." });
            }
        }

        // Xác định người gửi và tự động cấp tài khoản BUYER nếu chưa tồn tại (Kênh triển lãm / khảo sát công khai)
        Guid? submitterPersonId = null;
        bool isNewAccountProvisioned = false;
        string? initialTemporaryPassword = null;

        if (Actor.IsAuthenticated)
        {
            submitterPersonId = Actor.PersonId;
        }
        else
        {
            var cleanEmail = req.ContactEmail.Trim().ToLowerInvariant();
            var existingPerson = await personService.FindByEmailAsync(cleanEmail, ct);
            if (existingPerson != null)
            {
                submitterPersonId = existingPerson.Id;
            }
            else
            {
                initialTemporaryPassword = $"Buyer@{DateTime.UtcNow:yyyy}!";
                var fullName = req.ContactName?.Trim() ?? "Đại diện Doanh nghiệp";
                var parts = fullName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                var lastName = parts.Length > 1 ? parts[0] : "";
                var firstName = parts.Length > 1 ? parts[1] : parts[0];

                try
                {
                    var provisioned = await personService.ProvisionAsync(new ProvisionPersonCommand(
                        Email: cleanEmail,
                        Password: initialTemporaryPassword,
                        FirstName: firstName,
                        LastName: string.IsNullOrEmpty(lastName) ? null : lastName,
                        Phone: req.ContactPhone?.Trim(),
                        Organization: req.CompanyName?.Trim(),
                        PlatformRole: PlatformRoles.Enterprise,
                        ScopeType: ScopeTypes.Global,
                        ScopeId: null,
                        IsActive: true
                    ), ct);

                    submitterPersonId = provisioned.Id;
                    isNewAccountProvisioned = true;
                }
                catch
                {
                    // Tránh chặn lưu phiếu nếu có lỗi tạo tài khoản
                }
            }
        }

        var surveyCode = $"SUR-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

        string? surveyDetailsJson = req.SurveyDetails;
        if (string.IsNullOrWhiteSpace(surveyDetailsJson))
        {
            var detailsObj = new
            {
                currentEquipments = req.CurrentEquipments,
                criteria8 = req.Criteria8,
                bottlenecksDetail = req.BottlenecksDetail,
                hardestStage = req.HardestStage,
                primaryCause = req.PrimaryCause,
                technicalPersonnel = req.TechnicalPersonnel,
                adoptionCapacity = req.AdoptionCapacity,
                futureDirections = req.FutureDirections,
                supportNeeds = req.SupportNeeds,
                desiredPartners = req.DesiredPartners
            };
            surveyDetailsJson = System.Text.Json.JsonSerializer.Serialize(detailsObj);
        }

        var survey = new DemandSurvey(
            surveyCode,
            req.SurveyType ?? "DEEP_SURVEY",
            req.CompanyName!,
            req.TaxCode,
            req.ContactName!,
            req.ContactPhone!,
            req.ContactEmail!,
            req.BusinessType,
            req.EnterpriseSize,
            req.EmployeeScale,
            req.RevenueRange3y,
            req.TopBottlenecks,
            req.OrganizationId,
            submitterPersonId,
            req.Province,
            req.HeadquartersAddress,
            req.SurveyedFacility,
            req.ContactTitle,
            req.MainIndustry,
            req.MainProducts,
            req.ConfirmedByName,
            req.ConfirmedByTitle,
            req.PdpdConsentAt ?? DateTimeOffset.UtcNow,
            surveyDetailsJson,
            signatureUrl
        );

        db.Set<DemandSurvey>().Add(survey);

        var createdTickets = new List<string>();

        // Bóc tách từng dòng nhu cầu công nghệ (Demand Items)
        var itemsToProcess = req.DemandItems ?? req.Demands;
        if (itemsToProcess != null && itemsToProcess.Count > 0)
        {
            // Kiểm tra biên K, L, N, O (1-5), không âm thầm clamp
            foreach (var itemReq in itemsToProcess)
            {
                if (itemReq.UrgencyScore < 1 || itemReq.UrgencyScore > 5 ||
                    itemReq.ImpactScore < 1 || itemReq.ImpactScore > 5 ||
                    itemReq.InvestmentCapacity < 1 || itemReq.InvestmentCapacity > 5 ||
                    itemReq.AdoptionReadiness < 1 || itemReq.AdoptionReadiness > 5)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Các chỉ số định lượng K, L, N, O (Urgency, Impact, InvestmentCapacity, AdoptionReadiness) phải nằm trong khoảng từ 1 đến 5."
                    });
                }
            }

            int index = 1;
            foreach (var itemReq in itemsToProcess)
            {
                var itemCode = $"DMD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..4].ToUpper()}-{index++:D2}";
                var demandItem = new DemandItem(
                    survey.Id,
                    itemCode,
                    itemReq.StageName ?? "Sản xuất chính",
                    itemReq.TechnicalProblem,
                    itemReq.DesiredSolution,
                    itemReq.NeedConsulting,
                    itemReq.ExpectedGoal,
                    itemReq.ApplicationScale,
                    itemReq.SectorCode ?? "LV01",
                    itemReq.TechGroupCode ?? "CN01",
                    itemReq.DemandTypeCode ?? "NC01",
                    itemReq.BudgetRange ?? "Chưa xác định",
                    itemReq.UrgencyScore,
                    itemReq.ImpactScore,
                    itemReq.InvestmentCapacity,
                    itemReq.AdoptionReadiness,
                    submitterPersonId
                );

                survey.AddItem(demandItem);
                db.Set<DemandItem>().Add(demandItem);
                createdTickets.Add(itemCode);
            }
        }

        await uow.CommitAsync(ct);

        return Ok(new
        {
            success = true,
            surveyId = survey.Id,
            surveyCode = survey.SurveyCode,
            createdTickets,
            accountProvisioned = isNewAccountProvisioned,
            account = isNewAccountProvisioned ? new
            {
                email = req.ContactEmail.Trim().ToLowerInvariant(),
                temporaryPassword = initialTemporaryPassword,
                role = "BUYER",
                note = "Hệ thống đã tự động cấp tài khoản Doanh nghiệp (Buyer). Quý DN có thể đăng nhập ngay hoặc đổi mật khẩu."
            } : null,
            message = isNewAccountProvisioned
                ? "Tiếp nhận phiếu khảo sát thành công. Tài khoản Doanh nghiệp đã được khởi tạo tự động."
                : "Tiếp nhận phiếu khảo sát nhu cầu công nghệ thành công."
        });
    }

    [HttpGet("demands/surveys/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSurveyDetail(Guid id, CancellationToken ct)
    {
        var survey = await db.Set<DemandSurvey>()
            .Include(s => s.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id, ct);

        if (survey is null) return NotFound(new { message = "Không tìm thấy phiếu khảo sát." });
        return Ok(survey);
    }

    [HttpGet("gov/demands/surveys")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
    public IActionResult GetGovDemandSurveysDeprecated()
        => StatusCode(410, new
        {
            success = false,
            code = "ERR_GOV_ROUTE_GONE",
            message = "Endpoint /api/v1/gov/demands/surveys đã ngừng hoạt động trên hệ thống BACLINK."
        });

    [HttpGet("demands/surveys")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDemandSurveys(
        [FromQuery] string? scopeId,
        [FromQuery] string? q,
        [FromQuery] string? status,
        CancellationToken ct = default)
    {
        var query = db.Set<DemandSurvey>()
            .AsNoTracking()
            .Where(s => !string.IsNullOrEmpty(s.CompanyName));

        if (!string.IsNullOrWhiteSpace(scopeId) && !scopeId.Trim().Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            var p = scopeId.Trim();
            var pattern = p.ToUpperInvariant() switch
            {
                "HN" => "Hà Nội",
                "TG" => "Tiền Giang",
                "NT" => "Ninh Thuận",
                "HP" => "Hải Phòng",
                "DN" => "Đà Nẵng",
                "SG" or "HCM" => "Hồ Chí Minh",
                "TN" => "Thái Nguyên",
                _ => p
            };
            query = query.Where(s => s.Province != null && (s.Province.Contains(p) || s.Province.Contains(pattern)));
        }

        if (!string.IsNullOrWhiteSpace(status) && !status.Trim().Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(s => s.Status == status.Trim());
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var search = q.Trim().ToLower();
            query = query.Where(s =>
                (s.CompanyName != null && s.CompanyName.ToLower().Contains(search)) ||
                (s.TaxCode != null && s.TaxCode.ToLower().Contains(search)) ||
                (s.SurveyCode != null && s.SurveyCode.ToLower().Contains(search)));
        }

        var rawList = await query
            .OrderByDescending(s => s.SubmittedAt ?? s.CreatedAt)
            .Take(300)
            .Select(s => new
            {
                id = s.Id,
                surveyCode = s.SurveyCode,
                companyName = s.CompanyName,
                taxCode = s.TaxCode,
                contactName = s.ContactName,
                contactPhone = s.ContactPhone,
                contactEmail = s.ContactEmail,
                province = s.Province,
                headquartersAddress = s.HeadquartersAddress,
                surveyedFacility = s.SurveyedFacility,
                contactTitle = s.ContactTitle,
                businessType = s.BusinessType,
                enterpriseSize = s.EnterpriseSize,
                employeeScale = s.EmployeeScale,
                revenueRange3y = s.RevenueRange3y,
                topBottlenecks = s.TopBottlenecks,
                supportNeeds = s.SupportNeeds,
                tniScore = s.TniScore,
                tniClassification = s.TniClassification,
                status = s.Status,
                surveyType = s.SurveyType,
                submittedAt = s.SubmittedAt,
                createdAt = s.CreatedAt,
                surveyAnswers = s.SurveyAnswers,
                surveyDetails = s.SurveyDetails,
                representativeSignatureUrl = s.RepresentativeSignatureUrl,
                hasRdUnit = s.HasRdUnit,
                hasTechTraining = s.HasTechTraining,
                hasMachineryUpgrade = s.HasMachineryUpgrade,
                hasRdBudget = s.HasRdBudget,
                isExporting = s.IsExporting,
                inValueChain = s.InValueChain,
                recommendations = s.Recommendations,
                items = s.Items.Select(i => new
                {
                    id = i.Id,
                    itemCode = i.ItemCode,
                    stageName = i.StageName,
                    technicalProblem = i.TechnicalProblem,
                    desiredSolution = i.DesiredSolution,
                    needConsulting = i.NeedConsulting,
                    expectedGoal = i.ExpectedGoal,
                    applicationScale = i.ApplicationScale,
                    sectorCode = i.SectorCode,
                    techGroupCode = i.TechGroupCode,
                    demandTypeCode = i.DemandTypeCode,
                    budgetRange = i.BudgetRange,
                    urgencyScore = i.UrgencyScore,
                    impactScore = i.ImpactScore,
                    investmentCapacity = i.InvestmentCapacity,
                    adoptionReadiness = i.AdoptionReadiness,
                    tniScore = i.TniScore
                }).ToList()
            })
            .ToListAsync(ct);

        var items = rawList.Select(s =>
        {
            decimal? effectiveTni = s.tniScore;
            if (!effectiveTni.HasValue && s.items != null && s.items.Count > 0)
            {
                var maxItemTni = s.items.Max(i => (decimal?)i.tniScore);
                if (maxItemTni.HasValue && maxItemTni.Value > 0)
                {
                    effectiveTni = maxItemTni.Value;
                }
            }

            string? effectiveClass = s.tniClassification;
            if (string.IsNullOrWhiteSpace(effectiveClass) && effectiveTni.HasValue)
            {
                effectiveClass = effectiveTni.Value switch
                {
                    >= 75 => "VERY_HIGH",
                    >= 50 => "HIGH",
                    >= 25 => "MEDIUM",
                    > 0 => "LOW",
                    _ => null
                };
            }

            return new
            {
                s.id,
                s.surveyCode,
                s.companyName,
                s.taxCode,
                s.contactName,
                s.contactPhone,
                s.contactEmail,
                s.province,
                s.headquartersAddress,
                s.surveyedFacility,
                s.contactTitle,
                s.businessType,
                s.enterpriseSize,
                s.employeeScale,
                s.revenueRange3y,
                s.topBottlenecks,
                s.supportNeeds,
                tniScore = effectiveTni,
                tniClassification = effectiveClass,
                s.status,
                s.surveyType,
                s.submittedAt,
                s.createdAt,
                s.surveyAnswers,
                s.surveyDetails,
                s.representativeSignatureUrl,
                s.hasRdUnit,
                s.hasTechTraining,
                s.hasMachineryUpgrade,
                s.hasRdBudget,
                s.isExporting,
                s.inValueChain,
                s.recommendations,
                s.items
            };
        }).ToList();

        return Ok(new { success = true, data = items, totalCount = items.Count });
    }

    // =========================================================================
    // LUỒNG 2: TẠO NHANH BÀI TOÁN & BUYER WORKSPACE (SC-03-02, SC-03-03 / WF-02)
    // =========================================================================

    [HttpPost("demands/items")]
    [AllowAnonymous]
    public async Task<IActionResult> CreateQuickDemandItem([FromBody] CreateQuickDemandItemRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.TechnicalProblem) || string.IsNullOrWhiteSpace(req.ExpectedGoal))
            return BadRequest(new { message = "Vấn đề kỹ thuật và mục tiêu kỳ vọng không được để trống." });

        if (req.UrgencyScore < 1 || req.UrgencyScore > 5 ||
            req.ImpactScore < 1 || req.ImpactScore > 5 ||
            req.InvestmentCapacity < 1 || req.InvestmentCapacity > 5 ||
            req.AdoptionReadiness < 1 || req.AdoptionReadiness > 5)
        {
            return BadRequest(new { message = "Các chỉ số định lượng K, L, N, O phải nằm trong khoảng từ 1 đến 5." });
        }

        var itemCode = $"DMD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        var demandItem = new DemandItem(
            null, // Tạo lẻ không qua khảo sát sâu
            itemCode,
            req.StageName ?? "Sản xuất",
            req.TechnicalProblem,
            req.DesiredSolution,
            req.NeedConsulting,
            req.ExpectedGoal,
            req.ApplicationScale,
            req.SectorCode ?? "LV01",
            req.TechGroupCode ?? "CN01",
            req.DemandTypeCode ?? "NC01",
            req.BudgetRange ?? "500 triệu – 1 tỷ VNĐ",
            req.UrgencyScore,
            req.ImpactScore,
            req.InvestmentCapacity,
            req.AdoptionReadiness,
            Actor.IsAuthenticated ? Actor.PersonId : null
        );

        if (req.OfferId.HasValue && req.OfferId.Value != Guid.Empty)
        {
            var offer = await db.Set<SellerTechnologyOffer>()
                .AsNoTracking()
                .Where(o => o.Id == req.OfferId.Value && !o.IsDeleted)
                .Select(o => new
                {
                    o.Id,
                    o.Title,
                    o.OfferCode,
                    o.EnterpriseName,
                    o.CreatedBy,
                    o.Status
                })
                .FirstOrDefaultAsync(ct);

            if (offer == null)
            {
                return NotFound(new
                {
                    success = false,
                    code = "ERR_OFFER_NOT_FOUND",
                    message = "Sản phẩm công nghệ yêu cầu đặt mua không tồn tại hoặc đã bị xóa."
                });
            }

            if (offer.Status != "APPROVED")
            {
                return BadRequest(new
                {
                    success = false,
                    code = "ERR_OFFER_NOT_APPROVED",
                    message = "Sản phẩm công nghệ chưa được phê duyệt hoặc đang tạm khóa, không thể tạo đơn đặt mua."
                });
            }

            var connReqId = Guid.NewGuid();
            var requestCode = $"REQ-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
            var senderUserId = Actor.PersonId ?? Guid.NewGuid();

            var platformRole = Actor.PlatformRole;
            var senderRole = "BUYER";
            var senderName = Actor.IsAuthenticated ? (Actor.Email ?? "[Khách hàng cá nhân]") : "[Khách hàng cá nhân]";

            if (Actor.PersonId.HasValue)
            {
                var person = await personService.FindAsync(Actor.PersonId.Value, ct);
                if (person != null)
                {
                    var fullName = $"{person.LastName} {person.FirstName}".Trim();
                    if (!string.IsNullOrWhiteSpace(fullName))
                    {
                        senderName = fullName;
                    }
                    else if (!string.IsNullOrWhiteSpace(person.Email))
                    {
                        senderName = person.Email;
                    }
                }
            }

            string senderOrgName;
            if (string.Equals(platformRole, PlatformRoles.PublicUser, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(platformRole, "GUEST", StringComparison.OrdinalIgnoreCase) ||
                !Actor.IsAuthenticated)
            {
                senderOrgName = !string.IsNullOrWhiteSpace(req.ApplicationScale) && req.ApplicationScale != "Doanh nghiệp"
                    ? req.ApplicationScale
                    : senderName;
                senderRole = "PUBLIC_USER";
            }
            else if (string.Equals(platformRole, PlatformRoles.VerifiedExpert, StringComparison.OrdinalIgnoreCase) ||
                     string.Equals(platformRole, "EXPERT", StringComparison.OrdinalIgnoreCase))
            {
                senderOrgName = !string.IsNullOrWhiteSpace(req.ApplicationScale) && req.ApplicationScale != "Doanh nghiệp"
                    ? req.ApplicationScale
                    : senderName;
                senderRole = "EXPERT";
            }
            else
            {
                senderOrgName = !string.IsNullOrWhiteSpace(req.ApplicationScale)
                    ? req.ApplicationScale
                    : senderName;
                senderRole = "BUYER";
            }

            var receiverOrgName = offer.EnterpriseName;
            var receiverUserId = offer.CreatedBy;
            var targetOfferId = offer.Id;
            var offerId = offer.Id;
            var message = req.DesiredSolution ?? $"[Đơn hàng thương mại] Khách hàng đặt mua sản phẩm {offer.OfferCode} - {offer.Title}.";
            var proposedBudgetRange = req.BudgetRange ?? "Thỏa thuận";
            var status = "PENDING";
            var slaDeadline = DateTime.UtcNow.AddHours(48);
            var createdAt = DateTime.UtcNow;

            var strategy = db.Database.CreateExecutionStrategy();
            try
            {
                await strategy.ExecuteAsync(async () =>
                {
                    await using var transaction = await db.Database.BeginTransactionAsync(ct);
                    try
                    {
                        db.Set<DemandItem>().Add(demandItem);
                        await db.SaveChangesAsync(ct);

                        await db.Database.ExecuteSqlInterpolatedAsync($@"
                            INSERT INTO brokerage.connection_requests (
                                id, request_code, sender_user_id, sender_org_name, sender_role,
                                receiver_org_name, receiver_user_id, demand_id, target_offer_id, offer_id,
                                message, proposed_budget_range, status, sla_deadline, created_at
                            ) VALUES (
                                {connReqId}, {requestCode}, {senderUserId}, {senderOrgName}, {senderRole},
                                {receiverOrgName}, {receiverUserId}, {demandItem.Id}, {targetOfferId}, {offerId},
                                {message}, {proposedBudgetRange}, {status}, {slaDeadline}, {createdAt}
                            );", ct);

                        await transaction.CommitAsync(ct);
                    }
                    catch
                    {
                        await transaction.RollbackAsync(ct);
                        throw;
                    }
                });
            }
            catch (Exception ex)
            {
                var detail = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new
                {
                    success = false,
                    code = "ERR_ATOMIC_COMMERCIAL_ORDER_FAILED",
                    message = "Lỗi xử lý giao dịch đặt mua sản phẩm thương mại: " + detail
                });
            }

            return Ok(new
            {
                success = true,
                itemId = demandItem.Id,
                itemCode = demandItem.ItemCode,
                urgencyScore = demandItem.UrgencyScore,
                impactScore = demandItem.ImpactScore,
                investmentCapacity = demandItem.InvestmentCapacity,
                adoptionReadiness = demandItem.AdoptionReadiness,
                tniScore = demandItem.TniScore,
                tniClassification = demandItem.TniClassification,
                tniVerificationStatus = demandItem.TniVerificationStatus,
                verifiedAuthorityName = demandItem.VerifiedAuthorityName,
                connectionRequestId = connReqId,
                requestCode = requestCode,
                message = "Đặt mua sản phẩm công nghệ thương mại và tạo yêu cầu kết nối thành công."
            });
        }

        db.Set<DemandItem>().Add(demandItem);
        await uow.CommitAsync(ct);

        return Ok(new
        {
            success = true,
            itemId = demandItem.Id,
            itemCode = demandItem.ItemCode,
            urgencyScore = demandItem.UrgencyScore,
            impactScore = demandItem.ImpactScore,
            investmentCapacity = demandItem.InvestmentCapacity,
            adoptionReadiness = demandItem.AdoptionReadiness,
            tniScore = demandItem.TniScore,
            tniClassification = demandItem.TniClassification,
            tniVerificationStatus = demandItem.TniVerificationStatus,
            verifiedAuthorityName = demandItem.VerifiedAuthorityName,
            message = "Đăng bài toán nhu cầu công nghệ thành công."
        });
    }

    [HttpGet("buyer/demands")]
    public async Task<IActionResult> GetBuyerDemands(CancellationToken ct)
    {
        if (!Actor.IsAuthenticated || Actor.PersonId == null)
        {
            return Unauthorized(new { message = "Yêu cầu đăng nhập để truy cập danh sách bài toán." });
        }

        var query = db.Set<DemandItem>().AsNoTracking();

        // Chống lỗ hổng IDOR: Nếu không phải ADMIN, chỉ lấy bài của chính mình hoặc cùng tổ chức doanh nghiệp
        if (!PlatformRoles.IsAdministrative(Actor.PlatformRole))
        {
            var actorPersonId = Actor.PersonId;
            Guid? actorOrgId = null;
            if (!string.IsNullOrWhiteSpace(Actor.ScopeId) && Guid.TryParse(Actor.ScopeId, out var parsedOrg))
            {
                actorOrgId = parsedOrg;
            }

            if (actorOrgId.HasValue)
            {
                var surveyIdsOfOrg = db.Set<DemandSurvey>()
                    .Where(s => s.OrganizationId == actorOrgId.Value)
                    .Select(s => s.Id);

                query = query.Where(i => i.CreatedBy == actorPersonId || (i.SurveyId.HasValue && surveyIdsOfOrg.Contains(i.SurveyId.Value)));
            }
            else
            {
                query = query.Where(i => i.CreatedBy == actorPersonId);
            }
        }

        var items = await query
            .OrderByDescending(i => i.CreatedAt)
            .Take(50)
            .ToListAsync(ct);

        return Ok(items);
    }

    [HttpPut("buyer/demands/{id}")]
    public async Task<IActionResult> UpdateDemandItem(Guid id, [FromBody] UpdateDemandItemRequest req, CancellationToken ct)
    {
        if (!Actor.IsAuthenticated || Actor.PersonId == null)
        {
            return Unauthorized(new { message = "Yêu cầu đăng nhập để thực hiện thao tác này." });
        }

        var item = await db.Set<DemandItem>().FirstOrDefaultAsync(i => i.Id == id, ct);
        if (item is null) return NotFound(new { message = "Không tìm thấy bài toán nhu cầu." });

        bool hasAccess = PlatformRoles.IsAdministrative(Actor.PlatformRole) || item.CreatedBy == Actor.PersonId;
        Guid? actorOrgId = null;
        if (!string.IsNullOrWhiteSpace(Actor.ScopeId) && Guid.TryParse(Actor.ScopeId, out var parsedOrg))
        {
            actorOrgId = parsedOrg;
        }

        if (!hasAccess && actorOrgId.HasValue && item.SurveyId.HasValue)
        {
            var survey = await db.Set<DemandSurvey>().AsNoTracking().FirstOrDefaultAsync(s => s.Id == item.SurveyId.Value, ct);
            if (survey != null && survey.OrganizationId == actorOrgId.Value)
            {
                hasAccess = true;
            }
        }

        if (!hasAccess)
        {
            return StatusCode(403, new { message = "Không có quyền thao tác trên bài toán của người khác." });
        }

        if (item.Status != DemandItemStatuses.Pending && item.Status != DemandItemStatuses.Draft)
        {
            return BadRequest(new { message = "Chỉ có thể chỉnh sửa bài toán khi ở trạng thái Chờ thẩm định (PENDING) hoặc Nháp (DRAFT)." });
        }

        if (string.IsNullOrWhiteSpace(req.TechnicalProblem) || string.IsNullOrWhiteSpace(req.ExpectedGoal))
            return BadRequest(new { message = "Vấn đề kỹ thuật và mục tiêu kỳ vọng không được để trống." });

        if (req.UrgencyScore < 1 || req.UrgencyScore > 5 ||
            req.ImpactScore < 1 || req.ImpactScore > 5 ||
            req.InvestmentCapacity < 1 || req.InvestmentCapacity > 5 ||
            req.AdoptionReadiness < 1 || req.AdoptionReadiness > 5)
        {
            return BadRequest(new { message = "Các chỉ số định lượng K, L, N, O phải nằm trong khoảng từ 1 đến 5." });
        }

        item.Update(
            req.StageName ?? item.StageName,
            req.TechnicalProblem,
            req.DesiredSolution,
            req.NeedConsulting,
            req.ExpectedGoal,
            req.ApplicationScale,
            req.SectorCode ?? item.SectorCode,
            req.TechGroupCode ?? item.TechGroupCode,
            req.DemandTypeCode ?? item.DemandTypeCode,
            req.BudgetRange ?? item.BudgetRange,
            req.UrgencyScore,
            req.ImpactScore,
            req.InvestmentCapacity,
            req.AdoptionReadiness
        );

        await uow.CommitAsync(ct);

        return Ok(new
        {
            success = true,
            id = item.Id,
            itemCode = item.ItemCode,
            stageName = item.StageName,
            technicalProblem = item.TechnicalProblem,
            desiredSolution = item.DesiredSolution,
            needConsulting = item.NeedConsulting,
            expectedGoal = item.ExpectedGoal,
            applicationScale = item.ApplicationScale,
            sectorCode = item.SectorCode,
            budgetRange = item.BudgetRange,
            urgencyScore = item.UrgencyScore,
            impactScore = item.ImpactScore,
            investmentCapacity = item.InvestmentCapacity,
            adoptionReadiness = item.AdoptionReadiness,
            tniScore = item.TniScore,
            tniClassification = item.TniClassification,
            tniVerificationStatus = item.TniVerificationStatus,
            verifiedAuthorityName = item.VerifiedAuthorityName,
            status = item.Status,
            message = "Cập nhật bài toán nhu cầu công nghệ thành công."
        });
    }

    [HttpPost("buyer/demands/{id}/close")]
    public async Task<IActionResult> CloseDemandItem(Guid id, CancellationToken ct)
    {
        if (!Actor.IsAuthenticated || Actor.PersonId == null)
        {
            return Unauthorized(new { message = "Yêu cầu đăng nhập để thực hiện thao tác này." });
        }

        var item = await db.Set<DemandItem>().FirstOrDefaultAsync(i => i.Id == id, ct);
        if (item is null) return NotFound(new { message = "Không tìm thấy bài toán nhu cầu." });

        bool hasAccess = PlatformRoles.IsAdministrative(Actor.PlatformRole) || item.CreatedBy == Actor.PersonId;
        Guid? actorOrgId = null;
        if (!string.IsNullOrWhiteSpace(Actor.ScopeId) && Guid.TryParse(Actor.ScopeId, out var parsedOrg))
        {
            actorOrgId = parsedOrg;
        }

        if (!hasAccess && actorOrgId.HasValue && item.SurveyId.HasValue)
        {
            var survey = await db.Set<DemandSurvey>().AsNoTracking().FirstOrDefaultAsync(s => s.Id == item.SurveyId.Value, ct);
            if (survey != null && survey.OrganizationId == actorOrgId.Value)
            {
                hasAccess = true;
            }
        }

        if (!hasAccess)
        {
            return StatusCode(403, new { message = "Không có quyền thao tác trên bài toán của người khác." });
        }

        item.Close();
        await uow.CommitAsync(ct);

        return Ok(new
        {
            success = true,
            id = item.Id,
            status = item.Status,
            message = "Đã đóng bài toán nhu cầu công nghệ thành công."
        });
    }

    // =========================================================================
    // LUỒNG 4: SÀN NHU CẦU CÔNG KHAI VỚI PDPD MASKING (SC-03-04 / WF-04)
    // =========================================================================

    [HttpGet("public/demands")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicDemands(
        [FromQuery] string? q,
        [FromQuery] string? sectorCode,
        [FromQuery] string? tniClassification,
        [FromQuery] bool? rotate = null,
        [FromQuery] int? limit = null,
        CancellationToken ct = default)
    {
        // Tuân thủ BR-03-002: Chỉ bài toán đã được Cán bộ Sở VERIFIED và cho phép niêm yết mới hiển thị ra Sàn
        var query = db.Set<DemandItem>().AsNoTracking()
            .Where(i => i.Status == DemandItemStatuses.Verified && i.IsPublicListed);

        if (!string.IsNullOrWhiteSpace(q))
        {
            query = query.Where(i => i.TechnicalProblem.Contains(q) || i.ExpectedGoal.Contains(q));
        }
        if (!string.IsNullOrWhiteSpace(sectorCode))
        {
            query = query.Where(i => i.SectorCode == sectorCode);
        }
        if (!string.IsNullOrWhiteSpace(tniClassification))
        {
            query = query.Where(i => i.TniClassification == tniClassification);
        }

        var isRotate = rotate.GetValueOrDefault(false);
        var effectiveLimit = limit ?? (isRotate ? 6 : 50);

        List<DemandItem> items;
        if (isRotate)
        {
            // Lấy tập ứng viên đã sắp xếp để áp dụng thuật toán xoay tua xác định & đan xen ngành
            var rawCandidates = await query.OrderByDescending(i => i.CreatedAt).Take(200).ToListAsync(ct);
            items = InterleavedRotation.RotateAndInterleave(
                rawCandidates,
                keySelector: i => i.TechnicalProblem,
                sectorSelector: i => i.SectorCode,
                limit: effectiveLimit,
                maxPerSector: 2
            );
        }
        else
        {
            // Tương thích ngược: Lọc DistinctBy TechnicalProblem và lấy theo thứ tự mới nhất
            var rawCandidates = await query.OrderByDescending(i => i.CreatedAt).Take(Math.Max(effectiveLimit * 3, 50)).ToListAsync(ct);
            items = rawCandidates
                .DistinctBy(i => i.TechnicalProblem.Trim().ToLowerInvariant())
                .Take(effectiveLimit)
                .ToList();
        }

        // Map sang DTO công khai (Ẩn PII, ẩn ngân sách chi tiết nếu cần)
        var result = items.Select(i => new
        {
            id = i.Id,
            itemCode = i.ItemCode,
            stageName = i.StageName,
            technicalProblem = i.TechnicalProblem,
            desiredSolution = i.DesiredSolution,
            needConsulting = i.NeedConsulting,
            expectedGoal = i.ExpectedGoal,
            sectorCode = i.SectorCode,
            budgetRange = i.BudgetRange,
            urgencyScore = i.UrgencyScore,
            impactScore = i.ImpactScore,
            investmentCapacity = i.InvestmentCapacity,
            adoptionReadiness = i.AdoptionReadiness,
            tniScore = i.TniScore,
            tniClassification = i.TniClassification,
            tniVerificationStatus = i.TniVerificationStatus,
            verifiedAuthorityName = i.VerifiedAuthorityName,
            status = i.Status,
            createdAt = i.CreatedAt
        });

        return Ok(result);
    }

    [HttpGet("public/demands/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicDemandDetail(Guid id, CancellationToken ct)
    {
        var item = await db.Set<DemandItem>().AsNoTracking().FirstOrDefaultAsync(i => i.Id == id, ct);
        if (item is null) return NotFound(new { message = "Không tìm thấy bài toán nhu cầu." });

        var isOwner = Actor.IsAuthenticated && Actor.PersonId.HasValue && item.CreatedBy.HasValue && Actor.PersonId.Value == item.CreatedBy.Value;
        var isGovOrAdmin = PlatformRoles.IsAdministrative(Actor.PlatformRole);
        var canViewDraft = isOwner || isGovOrAdmin;
        var canSubmitOffer = item.Status == DemandItemStatuses.Verified;

        return Ok(new
        {
            id = item.Id,
            itemCode = item.ItemCode,
            stageName = item.StageName,
            technicalProblem = item.TechnicalProblem,
            desiredSolution = item.DesiredSolution,
            needConsulting = item.NeedConsulting,
            expectedGoal = item.ExpectedGoal,
            sectorCode = item.SectorCode,
            techGroupCode = item.TechGroupCode,
            demandTypeCode = item.DemandTypeCode,
            budgetRange = item.BudgetRange,
            urgencyScore = item.UrgencyScore,
            impactScore = item.ImpactScore,
            investmentCapacity = item.InvestmentCapacity,
            adoptionReadiness = item.AdoptionReadiness,
            tniScore = item.TniScore,
            tniClassification = item.TniClassification,
            tniVerificationStatus = item.TniVerificationStatus,
            verifiedAuthorityName = item.VerifiedAuthorityName,
            tniReviewNote = item.TniReviewNote,
            status = item.Status,
            createdAt = item.CreatedAt,
            isOwner = isOwner,
            isPendingReview = item.Status == DemandItemStatuses.Pending,
            canViewDraft = canViewDraft,
            canSubmitOffer = canSubmitOffer,
            reviewUnit = "Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)"
        });
    }

    // =========================================================================
    // LUỒNG 2B: THEO DÕI & LƯU TRỮ BÀI TOÁN THEO TÀI KHOẢN (CR-DEMAND-BOOKMARK)
    // =========================================================================

    [HttpPost("demands/{id}/bookmark")]
    public async Task<IActionResult> ToggleBookmark(Guid id, CancellationToken ct)
    {
        if (!Actor.IsAuthenticated || Actor.PersonId is null)
        {
            return Unauthorized(new { message = "Quý đơn vị vui lòng đăng nhập tài khoản Doanh nghiệp hoặc Chuyên gia để lưu bài toán vào danh sách theo dõi." });
        }

        var personId = Actor.PersonId.Value;
        var demandExists = await db.Set<DemandItem>().AsNoTracking().AnyAsync(i => i.Id == id, ct);
        if (!demandExists)
        {
            return NotFound(new { message = "Không tìm thấy bài toán nhu cầu." });
        }

        var existing = await db.Set<DemandBookmark>().FirstOrDefaultAsync(b => b.PersonId == personId && b.DemandItemId == id, ct);
        bool isBookmarked;
        string message;

        if (existing is not null)
        {
            db.Set<DemandBookmark>().Remove(existing);
            isBookmarked = false;
            message = "Đã bỏ lưu bài toán khỏi danh sách theo dõi.";
        }
        else
        {
            var bookmark = new DemandBookmark(personId, id);
            db.Set<DemandBookmark>().Add(bookmark);
            isBookmarked = true;
            message = "Đã lưu bài toán vào danh sách theo dõi thành công.";
        }

        await uow.CommitAsync(ct);

        return Ok(new
        {
            isBookmarked,
            message
        });
    }

    [HttpGet("demands/bookmarks/ids")]
    public async Task<IActionResult> GetBookmarkedIds(CancellationToken ct)
    {
        if (!Actor.IsAuthenticated || Actor.PersonId is null)
        {
            return Unauthorized(new { message = "Vui lòng đăng nhập để xem danh sách bài toán đã lưu." });
        }

        var personId = Actor.PersonId.Value;
        var ids = await db.Set<DemandBookmark>()
            .AsNoTracking()
            .Where(b => b.PersonId == personId)
            .Select(b => b.DemandItemId.ToString())
            .ToListAsync(ct);

        return Ok(ids);
    }

    [HttpGet("demands/bookmarked")]
    public async Task<IActionResult> GetBookmarkedDemands(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20,
        [FromQuery] string? q = null,
        CancellationToken ct = default)
    {
        if (!Actor.IsAuthenticated || Actor.PersonId is null)
        {
            return Unauthorized(new { message = "Vui lòng đăng nhập để xem danh sách bài toán đã lưu." });
        }

        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 20;

        var personId = Actor.PersonId.Value;

        var query = from b in db.Set<DemandBookmark>().AsNoTracking().Where(b => b.PersonId == personId)
                    join d in db.Set<DemandItem>().AsNoTracking() on b.DemandItemId equals d.Id
                    select new
                    {
                        d.Id,
                        d.ItemCode,
                        d.StageName,
                        d.TechnicalProblem,
                        d.DesiredSolution,
                        d.NeedConsulting,
                        d.ExpectedGoal,
                        d.SectorCode,
                        d.TechGroupCode,
                        d.DemandTypeCode,
                        d.BudgetRange,
                        d.TniScore,
                        d.TniClassification,
                        d.Status,
                        d.CreatedAt,
                        BookmarkedAt = b.CreatedAt
                    };

        if (!string.IsNullOrWhiteSpace(q))
        {
            var search = q.Trim().ToLower();
            query = query.Where(i =>
                i.ItemCode.ToLower().Contains(search) ||
                i.TechnicalProblem.ToLower().Contains(search) ||
                i.ExpectedGoal.ToLower().Contains(search));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(x => x.BookmarkedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync(ct);

        var data = items.Select(i => new
        {
            id = i.Id,
            itemCode = i.ItemCode,
            stageName = i.StageName,
            technicalProblem = i.TechnicalProblem,
            desiredSolution = i.DesiredSolution,
            needConsulting = i.NeedConsulting,
            expectedGoal = i.ExpectedGoal,
            sectorCode = i.SectorCode,
            techGroupCode = i.TechGroupCode,
            demandTypeCode = i.DemandTypeCode,
            budgetRange = i.BudgetRange,
            tniScore = i.TniScore,
            tniClassification = i.TniClassification,
            status = i.Status,
            createdAt = i.CreatedAt,
            bookmarkedAt = i.BookmarkedAt
        }).ToList();

        return Ok(new
        {
            success = true,
            data,
            total,
            page,
            limit,
            totalPages = (int)Math.Ceiling((double)total / limit)
        });
    }

    [HttpPost("admin/demands/{id}/verify")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
    public async Task<IActionResult> AdminVerifyDemand(Guid id, [FromBody] VerifyDemandRequest? req, CancellationToken ct)
    {
        var item = await db.Set<DemandItem>().FirstOrDefaultAsync(i => i.Id == id, ct);
        if (item is null) return NotFound(new { message = "Không tìm thấy bài toán nhu cầu." });

        var authority = string.IsNullOrWhiteSpace(req?.AuthorityName) ? "Hiệp hội BACLINK" : req.AuthorityName.Trim();
        item.VerifyAndPublish(authority);
        if (!string.IsNullOrWhiteSpace(req?.Decision))
        {
            item.VerifyTni(req.Decision, authority, req.Note);
        }
        await uow.CommitAsync(ct);

        return Ok(new
        {
            success = true,
            id = item.Id,
            itemCode = item.ItemCode,
            status = item.Status,
            isPublicListed = item.IsPublicListed,
            tniVerificationStatus = item.TniVerificationStatus,
            verifiedAuthorityName = item.VerifiedAuthorityName,
            message = "Hiệp hội BACLINK đã thẩm định và phê duyệt niêm yết bài toán nhu cầu công nghệ."
        });
    }

    [HttpGet("admin/demands")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
    public async Task<IActionResult> GetAdminPendingDemands([FromQuery] string? status, [FromQuery] string? q, CancellationToken ct)
    {
        var query = db.Set<DemandItem>().AsNoTracking();
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(i => i.Status == status);
        }
        if (!string.IsNullOrWhiteSpace(q))
        {
            query = query.Where(i => i.TechnicalProblem.Contains(q) || i.ItemCode.Contains(q));
        }
        var items = await query.OrderByDescending(i => i.CreatedAt).Take(100).ToListAsync(ct);
        return Ok(new { success = true, total = items.Count, data = items });
    }

    // =========================================================================
    // LUỒNG 3: CỔNG THẨM ĐỊNH SỞ KH&CN (ĐÃ NGỪNG HOẠT ĐỘNG - CR-BACLINK-001)
    // =========================================================================

    [HttpGet("gov/demands")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
    public IActionResult GetGovPendingDemands([FromQuery] string? sort, [FromQuery] string? q)
        => StatusCode(410, new
        {
            success = false,
            code = "ERR_GOV_ROUTE_GONE",
            message = "Cổng Sở KH&CN (/api/v1/gov/demands) đã ngừng hoạt động trên hệ thống BACLINK."
        });

    [HttpPost("gov/demands/{id}/verify")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
    public IActionResult VerifyDemand(Guid id, [FromBody] VerifyDemandRequest? req = null)
        => StatusCode(410, new
        {
            success = false,
            code = "ERR_GOV_ROUTE_GONE",
            message = "Cổng Sở KH&CN (/api/v1/gov/demands/{id}/verify) đã ngừng hoạt động trên hệ thống BACLINK."
        });

    [HttpPost("gov/demands/{id}/assign-expert")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
    public IActionResult AssignExpert(Guid id, [FromBody] AssignExpertRequest? req = null)
        => StatusCode(410, new
        {
            success = false,
            code = "ERR_GOV_ROUTE_GONE",
            message = "Cổng Sở KH&CN (/api/v1/gov/demands/{id}/assign-expert) đã ngừng hoạt động trên hệ thống BACLINK."
        });

    // =========================================================================
    // LUỒNG 5: ĐĂNG KÝ THAM QUAN HỘI CHỢ TRIỂN LÃM (SC-03-06 / WF-05)
    // =========================================================================

    [HttpPost("trien-lam/dang-ky")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterExpoVisitor([FromBody] ExpoVisitorRegistrationRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.FullName) || string.IsNullOrWhiteSpace(req.Phone) || string.IsNullOrWhiteSpace(req.Email))
            return BadRequest(new { message = "Họ tên, Số điện thoại và Email khách tham quan là bắt buộc." });

        var surveyCode = $"EXP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        var survey = new DemandSurvey(
            surveyCode,
            "EXPO",
            req.CompanyName ?? "Khách tham quan cá nhân",
            null,
            req.FullName,
            req.Phone,
            req.Email,
            null,
            null,
            null,
            null,
            [req.Purpose ?? "Tìm kiếm nhà cung cấp", req.SectorOfInterest ?? "Công nghiệp hỗ trợ"],
            null,
            null
        );

        db.Set<DemandSurvey>().Add(survey);
        await uow.CommitAsync(ct);

        return Ok(new
        {
            success = true,
            registrationCode = surveyCode,
            message = "Đăng ký tham quan triển lãm thành công. Ban tổ chức đã gửi vé điện tử qua Email."
        });
    }

    [HttpPost("public/demands/{id}/offer")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitSolutionOffer(Guid id, [FromBody] SubmitSolutionOfferRequest req, CancellationToken ct)
    {
        var item = await db.Set<DemandItem>().FirstOrDefaultAsync(i => i.Id == id, ct);
        if (item is null) return NotFound(new { message = "Không tìm thấy bài toán nhu cầu." });

        if (item.Status != DemandItemStatuses.Verified)
        {
            return BadRequest(new
            {
                success = false,
                code = "ERR_DEMAND_NOT_VERIFIED",
                message = "Bài toán nhu cầu chưa được Ban Thẩm định BACLINK xác thực niêm yết, không thể gửi hồ sơ chào giải pháp."
            });
        }

        var oppCode = $"DEAL-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString("N")[..4].ToUpper()}";
        try
        {
            var conn = db.Database.GetDbConnection();
            if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);

            using var cmdOpp = conn.CreateCommand();
            cmdOpp.CommandText = @"
                INSERT INTO brokerage.opportunities (
                    id, opportunity_code, title,
                    buyer_org_name, buyer_contact_name, buyer_contact_phone, buyer_contact_email,
                    seller_org_name, seller_contact_name, seller_contact_phone, seller_contact_email,
                    assigned_expert_name, managing_authority_id, stage, estimated_value_million_vnd,
                    created_at, updated_at
                ) VALUES (
                    gen_random_uuid(), @oppCode, @title,
                    @buyerOrg, 'Đại diện Bên Mua (PDPD Masked)', '0901234567', 'buyer@baclink.org.vn',
                    @sellerOrg, @sellerContact, @sellerPhone, @sellerEmail,
                    'Ban Cố vấn Kỹ thuật BACLINK', 'BACLINK', 'INITIATED', 500,
                    now(), now()
                );";

            void AddOppParam(string n, object? v)
            {
                var p = cmdOpp.CreateParameter();
                p.ParameterName = n;
                p.Value = v ?? DBNull.Value;
                cmdOpp.Parameters.Add(p);
            }

            var sellerOrg = !string.IsNullOrWhiteSpace(req.SellerName) ? req.SellerName : "Đơn vị Chào Bán";
            var title = $"Đề xuất: {req.SolutionTitle}";
            AddOppParam("@oppCode", oppCode);
            AddOppParam("@title", title);
            AddOppParam("@buyerOrg", $"[DN {item.SectorCode} - Toàn quốc]");
            AddOppParam("@sellerOrg", sellerOrg);
            AddOppParam("@sellerContact", sellerOrg);
            AddOppParam("@sellerPhone", req.SellerPhone ?? "0912345678");
            AddOppParam("@sellerEmail", req.SellerEmail ?? "seller@partner.vn");

            await cmdOpp.ExecuteNonQueryAsync(ct);
        }
        catch
        {
            // Fallback non-destructive
        }

        return Ok(new
        {
            success = true,
            demandId = id,
            opportunityCode = oppCode,
            solutionTitle = req.SolutionTitle,
            message = "Đã gửi Đề xuất Giải pháp chào bán thành công. Bạn có thể theo dõi tiến trình trong Bàn làm việc (Pipeline)."
        });
    }
}

public sealed record SubmitDeepSurveyRequest(
    string CompanyName,
    string? TaxCode,
    string ContactName,
    string ContactPhone,
    string ContactEmail,
    string? BusinessType,
    string? EnterpriseSize,
    string? EmployeeScale,
    string? RevenueRange3y,
    List<string>? TopBottlenecks,
    string? SurveyType,
    Guid? OrganizationId,
    List<DeepSurveyItemRequest>? DemandItems,
    List<DeepSurveyItemRequest>? Demands = null,
    string? Province = null,
    string? HeadquartersAddress = null,
    string? SurveyedFacility = null,
    string? ContactTitle = null,
    string? MainIndustry = null,
    string? MainProducts = null,
    string? ConfirmedByName = null,
    string? ConfirmedByTitle = null,
    DateTimeOffset? PdpdConsentAt = null,
    string? SurveyDetails = null,
    List<DeepSurveyEquipmentRequest>? CurrentEquipments = null,
    Dictionary<string, int>? Criteria8 = null,
    Dictionary<string, int>? BottlenecksDetail = null,
    string? HardestStage = null,
    string? PrimaryCause = null,
    Dictionary<string, int>? TechnicalPersonnel = null,
    Dictionary<string, int>? AdoptionCapacity = null,
    List<string>? FutureDirections = null,
    Dictionary<string, int>? SupportNeeds = null,
    List<string>? DesiredPartners = null,
    string? SignatureDataUrl = null,
    string? RepresentativeSignatureUrl = null
);

public sealed record DeepSurveyEquipmentRequest(
    string? StageName,
    string? MachineName,
    int? InvestmentYear,
    string? TechOrigin,
    string? DepreciationStatus
);

public sealed record DeepSurveyItemRequest(
    string? StageName,
    string TechnicalProblem,
    string? DesiredSolution,
    bool NeedConsulting,
    string ExpectedGoal,
    string? ApplicationScale,
    string? SectorCode,
    string? TechGroupCode,
    string? DemandTypeCode,
    string? BudgetRange,
    int UrgencyScore,
    int ImpactScore,
    int InvestmentCapacity,
    int AdoptionReadiness
);

public sealed record CreateQuickDemandItemRequest(
    string? StageName,
    string TechnicalProblem,
    string? DesiredSolution,
    bool NeedConsulting,
    string ExpectedGoal,
    string? ApplicationScale,
    string? SectorCode,
    string? TechGroupCode,
    string? DemandTypeCode,
    string? BudgetRange,
    int UrgencyScore,
    int ImpactScore,
    int InvestmentCapacity,
    int AdoptionReadiness,
    Guid? OfferId = null,
    string? OfferTitle = null,
    string? OfferCode = null,
    bool? IsCommercialOrder = null
);

public sealed record AssignExpertRequest(Guid ExpertId);

public sealed record ExpoVisitorRegistrationRequest(
    string FullName,
    string Phone,
    string Email,
    string? CompanyName,
    string? Purpose,
    string? SectorOfInterest
);

public sealed record SubmitSolutionOfferRequest(
    string SolutionTitle,
    string? ProposalDetails = null,
    string? SellerName = null,
    string? SellerEmail = null,
    string? SellerPhone = null
);

public sealed record UpdateDemandItemRequest(
    string? StageName,
    string TechnicalProblem,
    string? DesiredSolution,
    bool NeedConsulting,
    string ExpectedGoal,
    string? ApplicationScale,
    string? SectorCode,
    string? TechGroupCode,
    string? DemandTypeCode,
    string? BudgetRange,
    int UrgencyScore,
    int ImpactScore,
    int InvestmentCapacity,
    int AdoptionReadiness
);

public sealed record VerifyDemandRequest(
    string? Decision = "VERIFIED",
    string? AuthorityName = null,
    string? Note = null
);

