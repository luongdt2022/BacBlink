using System.Collections.Concurrent;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Technology.Application;

namespace NacenTech.Api.V2;

[ApiController]
[Route("api/v2/technologies")]
[Route("api/v1/technologies")]
public sealed class TechnologyOffersController : ControllerBase
{
    // In-memory store cho Demo & Autopilot test, có khởi tạo dữ liệu mẫu 18 ngành chuẩn
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
    public IActionResult CreateSellerOffer([FromBody] CreateSellerOfferDto dto)
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
        var offerCode = $"OFF-{DateTime.UtcNow:yyyyMMdd}-{OffersStore.Count + 1:D5}";
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
            Status: "APPROVED", // Auto-approved for demo testing
            SuccessfulConnections: 0,
            RatingScore: 5.0m,
            ReviewCount: 0,
            CreatedAt: DateTimeOffset.UtcNow,
            PublishedAt: DateTimeOffset.UtcNow
        );

        OffersStore[id] = newOffer;

        return CreatedAtAction(nameof(GetOfferById), new { id }, new { success = true, data = newOffer });
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
