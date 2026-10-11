using System.Collections.Concurrent;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Technology.Application;
using NacenTech.Modules.Technology.Domain;
using NacenTech.Persistence;

namespace NacenTech.Api.V2;

[ApiController]
[Route("api/v1/technologies")]
[Route("api/v2/technologies")]
public sealed class TechnologyOffersController(NacenTechDbContext db, IUnitOfWork uow) : V2ControllerBase
{
    // In-memory cache & fallback store, có khởi tạo dữ liệu mẫu 18 ngành chuẩn
    private static readonly ConcurrentDictionary<Guid, SellerOfferDto> OffersStore = new(SeedInitialOffers());

    private static IEnumerable<KeyValuePair<Guid, SellerOfferDto>> SeedInitialOffers()
    {
        var items = new List<SellerOfferDto>
        {
            new(
                Id: Guid.Parse("11111111-1111-1111-1111-111111111111"),
                OfferCode: "OFF-20261008-00001",
                OfferType: "SOLUTION",
                HasTechTransfer: true,
                Title: "Hệ thống sấy thăng hoa chân không tích hợp AI tối ưu năng lượng",
                Summary: "Công nghệ sấy nhiệt độ thấp bảo toàn 98% hoạt tính sinh học của nông sản và dược liệu xuất khẩu.",
                ProblemSolved: "Giảm 42% tiêu hao điện năng và rút ngắn 30% thời gian sấy so với công nghệ truyền thống.",
                SectorCode: "FOOD",
                SectorName: "Công nghệ chế biến nông sản - thực phẩm",
                PricingType: "RANGE",
                PriceAmount: null,
                PriceMin: 850000000,
                PriceMax: 1200000000,
                Currency: "VND",
                Unit: "dây chuyền",
                DeveloperOrigin: "Viện Cơ điện Nông nghiệp và Công nghệ sau thu hoạch (VIAEP)",
                TrlLevel: 8,
                IpStatus: "PATENT_GRANTED",
                IpRegistrationNumber: "VN-1-0028491",
                TransferMethod: "EXCLUSIVE_LICENSE",
                CommercialStatus: "COMMERCIALLY_READY",
                ContactPointRole: "Phòng Sở hữu Trí tuệ & Chuyển giao Công nghệ",
                Status: "APPROVED",
                SuccessfulConnections: 12,
                RatingScore: 4.85m,
                ReviewCount: 15,
                CreatedAt: DateTimeOffset.UtcNow.AddDays(-20),
                PublishedAt: DateTimeOffset.UtcNow.AddDays(-18)
            ),
            new(
                Id: Guid.Parse("22222222-2222-2222-2222-222222222222"),
                OfferCode: "OFF-20261008-00002",
                OfferType: "DEVICE",
                HasTechTransfer: true,
                Title: "Robot hàn laser 6 trục siêu chính xác cho công nghiệp ô tô & đóng tàu",
                Summary: "Thiết bị robot công nghiệp độ chính xác 0.02mm, tích hợp thị giác máy tính và cảm biến bù nhiệt tự động.",
                ProblemSolved: "Thay thế thợ hàn bậc cao trong môi trường độc hại, tốc độ hàn tăng 3.5 lần.",
                SectorCode: "MECH",
                SectorName: "Cơ khí chế tạo & Tự động hóa",
                PricingType: "FIXED",
                PriceAmount: 2400000000,
                PriceMin: null,
                PriceMax: null,
                Currency: "VND",
                Unit: "hệ thống",
                DeveloperOrigin: "Đại học Bách Khoa Hà Nội - Phòng Lab Robotics Quốc Gia",
                TrlLevel: 7,
                IpStatus: "UTILITY_MODEL",
                IpRegistrationNumber: "VN-2-0005124",
                TransferMethod: "NON_EXCLUSIVE_LICENSE",
                CommercialStatus: "PILOT_TESTING",
                ContactPointRole: "Trung tâm Đổi mới Sáng tạo Bách Khoa",
                Status: "APPROVED",
                SuccessfulConnections: 8,
                RatingScore: 4.90m,
                ReviewCount: 9,
                CreatedAt: DateTimeOffset.UtcNow.AddDays(-15),
                PublishedAt: DateTimeOffset.UtcNow.AddDays(-14)
            ),
            new(
                Id: Guid.Parse("33333333-3333-3333-3333-333333333333"),
                OfferCode: "OFF-20261008-00003",
                OfferType: "PRODUCT",
                HasTechTransfer: false,
                Title: "Bộ điều khiển IoT Gateway công nghiệp chuẩn RS485/Modbus RTU",
                Summary: "Gateway công nghiệp giám sát năng lượng và tự động hóa nhà máy chuẩn DIN-rail, truyền thông 4G/LTE.",
                ProblemSolved: "Thu thập dữ liệu cảm biến đa điểm, chống nhiễu công nghiệp cấp độ 4.",
                SectorCode: "IT",
                SectorName: "Công nghệ thông tin, Viễn thông & IoT",
                PricingType: "FIXED",
                PriceAmount: 4500000,
                PriceMin: null,
                PriceMax: null,
                Currency: "VND",
                Unit: "bộ",
                DeveloperOrigin: null,
                TrlLevel: null,
                IpStatus: null,
                IpRegistrationNumber: null,
                TransferMethod: null,
                CommercialStatus: null,
                ContactPointRole: null,
                Status: "APPROVED",
                SuccessfulConnections: 45,
                RatingScore: 4.70m,
                ReviewCount: 38,
                CreatedAt: DateTimeOffset.UtcNow.AddDays(-10),
                PublishedAt: DateTimeOffset.UtcNow.AddDays(-9)
            ),
            new(
                Id: Guid.Parse("44444444-4444-4444-4444-444444444444"),
                OfferCode: "OFF-20261008-00004",
                OfferType: "SOLUTION",
                HasTechTransfer: true,
                Title: "Chế phẩm sinh học xử lý nước thải dệt nhuộm và phân hủy hợp chất azo",
                Summary: "Quần thể vi sinh vật bản địa thích nghi nồng độ muối cao, hiệu suất khử màu đạt trên 95%.",
                ProblemSolved: "Giảm 60% bùn thải nguy hại và chi phí hóa chất keo tụ PAC/Polymer.",
                SectorCode: "ENV",
                SectorName: "Công nghệ môi trường & Kinh tế tuần hoàn",
                PricingType: "CONTACT",
                PriceAmount: null,
                PriceMin: null,
                PriceMax: null,
                Currency: "VND",
                Unit: "quy trình",
                DeveloperOrigin: "Viện Hàn lâm Khoa học và Công nghệ Việt Nam (VAST)",
                TrlLevel: 9,
                IpStatus: "PATENT_GRANTED",
                IpRegistrationNumber: "VN-1-0019283",
                TransferMethod: "ASSIGNMENT_SALE",
                CommercialStatus: "COMMERCIALLY_READY",
                ContactPointRole: "Ban Quản lý Ứng dụng & Triển khai Công nghệ",
                Status: "APPROVED",
                SuccessfulConnections: 19,
                RatingScore: 5.00m,
                ReviewCount: 22,
                CreatedAt: DateTimeOffset.UtcNow.AddDays(-5),
                PublishedAt: DateTimeOffset.UtcNow.AddDays(-4)
            )
        };

        return items.Select(x => new KeyValuePair<Guid, SellerOfferDto>(x.Id, x));
    }

    [HttpGet]
    [AllowAnonymous]
    public IActionResult GetOffers(
        [FromQuery] string? search,
        [FromQuery] string? sectorCode,
        [FromQuery] string? offerType,
        [FromQuery] bool? hasTechTransfer,
        [FromQuery] int? minTrl,
        [FromQuery] string? ipStatus,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 12)
    {
        var query = OffersStore.Values.Where(x => x.Status == "APPROVED");

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLowerInvariant();
            query = query.Where(x => x.Title.ToLowerInvariant().Contains(s)
                                  || x.Summary.ToLowerInvariant().Contains(s)
                                  || (x.DeveloperOrigin != null && x.DeveloperOrigin.ToLowerInvariant().Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(sectorCode) && sectorCode != "ALL")
        {
            query = query.Where(x => x.SectorCode.Equals(sectorCode, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(offerType) && offerType != "ALL")
        {
            query = query.Where(x => x.OfferType.Equals(offerType, StringComparison.OrdinalIgnoreCase));
        }

        if (hasTechTransfer.HasValue)
        {
            query = query.Where(x => x.HasTechTransfer == hasTechTransfer.Value);
        }

        if (minTrl.HasValue)
        {
            query = query.Where(x => x.TrlLevel >= minTrl.Value);
        }

        if (!string.IsNullOrWhiteSpace(ipStatus) && ipStatus != "ALL")
        {
            query = query.Where(x => x.IpStatus != null && x.IpStatus.Equals(ipStatus, StringComparison.OrdinalIgnoreCase));
        }

        var total = query.Count();
        var data = query.OrderByDescending(x => x.PublishedAt ?? x.CreatedAt)
                        .Skip((page - 1) * limit)
                        .Take(limit)
                        .ToList();

        return Ok(new
        {
            success = true,
            total,
            page,
            limit,
            totalPages = (int)Math.Ceiling(total / (double)limit),
            data
        });
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public IActionResult GetOfferById(Guid id)
    {
        if (OffersStore.TryGetValue(id, out var offer))
        {
            return Ok(new { success = true, data = offer });
        }

        return NotFound(new { success = false, message = "Không tìm thấy hồ sơ công nghệ." });
    }

    [HttpGet("/api/v1/portal/seller/technologies")]
    [HttpGet("/api/v2/portal/seller/technologies")]
    [AllowAnonymous] // Cho phép trải nghiệm nhanh trên portal
    public IActionResult GetSellerOffers(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10)
    {
        var query = OffersStore.Values.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLowerInvariant();
            query = query.Where(x => x.Title.ToLowerInvariant().Contains(s) || x.OfferCode.ToLowerInvariant().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "ALL")
        {
            query = query.Where(x => x.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
        }

        var total = query.Count();
        var data = query.OrderByDescending(x => x.CreatedAt)
                        .Skip((page - 1) * limit)
                        .Take(limit)
                        .ToList();

        var kpi = new
        {
            totalOffers = OffersStore.Count,
            publishedOffers = OffersStore.Values.Count(x => x.Status == "APPROVED"),
            pendingOffers = OffersStore.Values.Count(x => x.Status == "PENDING"),
            successfulConnections = OffersStore.Values.Sum(x => x.SuccessfulConnections)
        };

        return Ok(new
        {
            success = true,
            kpi,
            total,
            page,
            limit,
            data
        });
    }

    [HttpPost("/api/v1/portal/seller/technologies")]
    [HttpPost("/api/v2/portal/seller/technologies")]
    [AllowAnonymous]
    public async Task<IActionResult> CreateSellerOffer([FromBody] CreateSellerOfferDto dto, CancellationToken ct = default)
    {
        var validation = SellerOfferRulesValidator.Validate(dto);
        if (!validation.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Dữ liệu hồ sơ chào bán không hợp lệ theo quy tắc BR-SELLER.",
                errors = validation.Errors
            });
        }

        var id = Guid.NewGuid();
        var totalDbOffers = await db.Set<SellerTechnologyOffer>().CountAsync(ct);
        var offerCode = $"OFF-{DateTime.UtcNow:yyyyMMdd}-{(totalDbOffers + 1):D5}-{Guid.NewGuid().ToString("N")[..4].ToUpperInvariant()}";
        var newOffer = new SellerOfferDto(
            Id: id,
            OfferCode: offerCode,
            OfferType: dto.OfferType.ToUpperInvariant(),
            HasTechTransfer: dto.HasTechTransfer,
            Title: dto.Title,
            Summary: dto.Summary,
            ProblemSolved: dto.ProblemSolved,
            SectorCode: dto.SectorCode.ToUpperInvariant(),
            SectorName: MapSectorName(dto.SectorCode),
            PricingType: dto.PricingType.ToUpperInvariant(),
            PriceAmount: dto.PriceAmount,
            PriceMin: dto.PriceMin,
            PriceMax: dto.PriceMax,
            Currency: dto.Currency ?? "VND",
            Unit: dto.Unit,
            DeveloperOrigin: dto.DeveloperOrigin,
            TrlLevel: dto.TrlLevel,
            IpStatus: dto.IpStatus,
            IpRegistrationNumber: dto.IpRegistrationNumber,
            TransferMethod: dto.TransferMethod,
            CommercialStatus: dto.CommercialStatus,
            ContactPointRole: dto.ContactPointRole,
            Status: "PENDING", // Khởi tạo chờ Sở KH&CN thẩm định theo BR-SELLER-05
            SuccessfulConnections: 0,
            RatingScore: 5.0m,
            ReviewCount: 0,
            CreatedAt: DateTimeOffset.UtcNow,
            PublishedAt: null, // Chưa xuất bản khi chưa duyệt
            ManagingAuthorityId: dto.ManagingAuthorityId ?? "VN-HN",
            ManagingAuthorityName: dto.ManagingAuthorityName ?? "Sở Khoa học và Công nghệ TP. Hà Nội",
            ScopeType: dto.ScopeType ?? "PROVINCE",
            ScopeId: dto.ScopeId ?? dto.ManagingAuthorityId ?? "VN-HN"
        );

        // Lưu thực thể lâu dài vào CSDL PostgreSQL
        var entity = new SellerTechnologyOffer(
            id,
            offerCode,
            dto.OfferType.ToUpperInvariant(),
            dto.HasTechTransfer,
            dto.Title,
            dto.Summary,
            dto.ProblemSolved,
            dto.SectorCode.ToUpperInvariant(),
            MapSectorName(dto.SectorCode),
            dto.PricingType.ToUpperInvariant(),
            dto.PriceAmount,
            dto.PriceMin,
            dto.PriceMax,
            dto.Currency ?? "VND",
            dto.Unit,
            dto.DeveloperOrigin,
            dto.TrlLevel,
            dto.IpStatus,
            dto.IpRegistrationNumber,
            dto.TransferMethod,
            dto.CommercialStatus,
            dto.ContactPointRole,
            "PENDING",
            dto.ManagingAuthorityId ?? "VN-HN",
            dto.ManagingAuthorityName ?? "Sở Khoa học và Công nghệ TP. Hà Nội",
            dto.ScopeType ?? "PROVINCE",
            dto.ScopeId ?? dto.ManagingAuthorityId ?? "VN-HN",
            dto.LegalConsent
        );

        db.Set<SellerTechnologyOffer>().Add(entity);
        await uow.CommitAsync(ct);

        OffersStore[id] = newOffer;

        return CreatedAtAction(nameof(GetOfferById), new { id }, new { success = true, data = newOffer });
    }

    [HttpPost("/api/v1/portal/seller/technologies/{id:guid}/review")]
    [HttpPost("/api/v2/portal/seller/technologies/{id:guid}/review")]
    [AllowAnonymous]
    public async Task<IActionResult> ReviewOffer(Guid id, [FromBody] ReviewOfferDto dto, CancellationToken ct = default)
    {
        if (!OffersStore.TryGetValue(id, out var offer))
        {
            return NotFound(new { success = false, message = "Không tìm thấy hồ sơ chào bán công nghệ." });
        }

        var action = dto.Action?.Trim().ToUpperInvariant() ?? string.Empty;
        SellerOfferDto updated;
        if (action == "APPROVE")
        {
            updated = offer with
            {
                Status = "APPROVED",
                PublishedAt = DateTimeOffset.UtcNow
            };
        }
        else if (action == "REJECT")
        {
            updated = offer with
            {
                Status = "REJECTED"
            };
        }
        else if (action == "REQUEST_CHANGES")
        {
            updated = offer with
            {
                Status = "CHANGES_REQUESTED"
            };
        }
        else
        {
            return BadRequest(new { success = false, message = $"Hành động '{dto.Action}' không hợp lệ. Chấp nhận: APPROVE, REJECT, REQUEST_CHANGES." });
        }

        // Cập nhật CSDL PostgreSQL
        var entity = await db.Set<SellerTechnologyOffer>().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            entity.Review(action, dto.ReviewNote);
            await uow.CommitAsync(ct);
        }

        OffersStore[id] = updated;
        return Ok(new { success = true, message = $"Thẩm định hồ sơ thành công: {action}", data = updated });
    }

    [HttpPut("/api/v1/portal/seller/technologies/{id:guid}")]
    [HttpPut("/api/v2/portal/seller/technologies/{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateSellerOffer(Guid id, [FromBody] UpdateSellerOfferDto dto, CancellationToken ct = default)
    {
        if (!OffersStore.TryGetValue(id, out var existing))
        {
            return NotFound(new { success = false, message = "Không tìm thấy hồ sơ chào bán công nghệ." });
        }

        var validation = SellerOfferRulesValidator.ValidateUpdate(dto);
        if (!validation.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Dữ liệu cập nhật hồ sơ không hợp lệ theo quy tắc BR-SELLER.",
                errors = validation.Errors
            });
        }

        // BR-SELLER-07: Quy tắc kiểm soát vòng đời & Tự động chuyển PENDING nếu sửa TRL hoặc SHTT
        bool needsReaudit = existing.HasTechTransfer && dto.HasTechTransfer && (
            existing.TrlLevel != dto.TrlLevel ||
            !string.Equals(existing.IpStatus, dto.IpStatus, StringComparison.OrdinalIgnoreCase) ||
            !string.Equals(existing.IpRegistrationNumber, dto.IpRegistrationNumber, StringComparison.OrdinalIgnoreCase) ||
            !string.Equals(existing.TransferMethod, dto.TransferMethod, StringComparison.OrdinalIgnoreCase)
        );

        var newStatus = needsReaudit ? "PENDING" : existing.Status;
        var newPublishedAt = needsReaudit ? null : existing.PublishedAt;

        var updated = existing with
        {
            OfferType = dto.OfferType.ToUpperInvariant(),
            HasTechTransfer = dto.HasTechTransfer,
            Title = dto.Title,
            Summary = dto.Summary,
            ProblemSolved = dto.ProblemSolved,
            SectorCode = dto.SectorCode.ToUpperInvariant(),
            SectorName = MapSectorName(dto.SectorCode),
            PricingType = dto.PricingType.ToUpperInvariant(),
            PriceAmount = dto.PriceAmount,
            PriceMin = dto.PriceMin,
            PriceMax = dto.PriceMax,
            Currency = dto.Currency ?? "VND",
            Unit = dto.Unit,
            DeveloperOrigin = dto.DeveloperOrigin,
            TrlLevel = dto.TrlLevel,
            IpStatus = dto.IpStatus,
            IpRegistrationNumber = dto.IpRegistrationNumber,
            TransferMethod = dto.TransferMethod,
            CommercialStatus = dto.CommercialStatus,
            ContactPointRole = dto.ContactPointRole,
            Status = newStatus,
            PublishedAt = newPublishedAt,
            ManagingAuthorityId = dto.ManagingAuthorityId ?? existing.ManagingAuthorityId,
            ManagingAuthorityName = dto.ManagingAuthorityName ?? existing.ManagingAuthorityName,
            ScopeType = dto.ScopeType ?? existing.ScopeType,
            ScopeId = dto.ScopeId ?? existing.ScopeId
        };

        // Cập nhật CSDL PostgreSQL
        var entity = await db.Set<SellerTechnologyOffer>().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            entity.Update(
                dto.OfferType.ToUpperInvariant(),
                dto.HasTechTransfer,
                dto.Title,
                dto.Summary,
                dto.ProblemSolved,
                dto.SectorCode.ToUpperInvariant(),
                MapSectorName(dto.SectorCode),
                dto.PricingType.ToUpperInvariant(),
                dto.PriceAmount,
                dto.PriceMin,
                dto.PriceMax,
                dto.Currency ?? "VND",
                dto.Unit,
                dto.DeveloperOrigin,
                dto.TrlLevel,
                dto.IpStatus,
                dto.IpRegistrationNumber,
                dto.TransferMethod,
                dto.CommercialStatus,
                dto.ContactPointRole,
                dto.ManagingAuthorityId ?? existing.ManagingAuthorityId,
                dto.ManagingAuthorityName ?? existing.ManagingAuthorityName,
                dto.ScopeType ?? existing.ScopeType,
                dto.ScopeId ?? existing.ScopeId
            );
            await uow.CommitAsync(ct);
        }

        OffersStore[id] = updated;

        var message = needsReaudit
            ? "Cập nhật hồ sơ thành công! Lưu ý: Do bạn đã thay đổi Cấp độ TRL / Tình trạng SHTT / Phương thức chuyển giao, hồ sơ tự động chuyển về trạng thái CHỜ THẨM ĐỊNH (PENDING) bởi Sở KH&CN theo quy tắc BR-SELLER-07."
            : "Cập nhật thông tin công nghệ chào bán thành công.";

        return Ok(new
        {
            success = true,
            needsReaudit,
            message,
            data = updated
        });
    }

    [HttpDelete("/api/v1/portal/seller/technologies/{id:guid}")]
    [HttpDelete("/api/v2/portal/seller/technologies/{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> DeleteSellerOffer(Guid id, CancellationToken ct = default)
    {
        if (!OffersStore.TryRemove(id, out var _))
        {
            return NotFound(new { success = false, message = "Không tìm thấy hồ sơ chào bán công nghệ để xóa." });
        }

        var entity = await db.Set<SellerTechnologyOffer>().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            db.Set<SellerTechnologyOffer>().Remove(entity);
            await uow.CommitAsync(ct);
        }

        return Ok(new { success = true, message = "Đã xóa hồ sơ công nghệ thành công khỏi kho lưu trữ." });
    }

    [HttpPost("/api/v1/portal/seller/technologies/{id:guid}/toggle-publish")]
    [HttpPost("/api/v2/portal/seller/technologies/{id:guid}/toggle-publish")]
    [AllowAnonymous]
    public async Task<IActionResult> TogglePublish(Guid id, [FromQuery] bool? publish, CancellationToken ct = default)
    {
        if (!OffersStore.TryGetValue(id, out var offer))
        {
            return NotFound(new { success = false, message = "Không tìm thấy hồ sơ chào bán công nghệ." });
        }

        bool shouldPublish = publish ?? (offer.Status != "APPROVED");
        var updated = offer with
        {
            Status = shouldPublish ? "APPROVED" : "HIDDEN",
            PublishedAt = shouldPublish ? DateTimeOffset.UtcNow : null
        };

        var entity = await db.Set<SellerTechnologyOffer>().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            if (shouldPublish)
                entity.Review("APPROVE");
            else
                entity.Review("REQUEST_CHANGES", "Tạm ẩn bởi Bên bán");
            await uow.CommitAsync(ct);
        }

        OffersStore[id] = updated;
        return Ok(new
        {
            success = true,
            message = shouldPublish ? "Đã công khai công nghệ lên sàn giao dịch." : "Đã tạm ẩn công nghệ khỏi sàn giao dịch.",
            data = updated
        });
    }

    private static string MapSectorName(string code) => code.ToUpperInvariant() switch
    {
        "FOOD" => "Công nghệ chế biến nông sản - thực phẩm",
        "MECH" => "Cơ khí chế tạo & Tự động hóa",
        "IT" => "Công nghệ thông tin, Viễn thông & IoT",
        "ENV" => "Công nghệ môi trường & Kinh tế tuần hoàn",
        "BIO" => "Công nghệ sinh học & Dược liệu",
        "CHEM" => "Hóa chất & Vật liệu mới",
        "ENERGY" => "Năng lượng mới & Tái tạo",
        "HEALTH" => "Y tế, Thiết bị & Chăm sóc sức khỏe",
        _ => "Lĩnh vực công nghệ tổng hợp"
    };
}
