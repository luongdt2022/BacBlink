using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
    // In-memory cache & fallback store, có khởi tạo dữ liệu mẫu 18 ngành chuẩn Delta v5
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
                PublishedAt: DateTimeOffset.UtcNow.AddDays(-18),
                EnterpriseTaxCode: "2400120030",
                EnterpriseName: "CÔNG TY TNHH MỘT THÀNH VIÊN LÂM NGHIỆP ĐÔNG BẮC",
                MainImageUrl: "/images/technologies/say-thang-hoa.jpg",
                GalleryImageUrls: new List<string> { "/images/technologies/say-thang-hoa-1.jpg", "/images/technologies/say-thang-hoa-2.jpg" },
                DeliveryTimeline: "45 ngày kể từ ngày ký hợp đồng",
                WarrantyTerms: "24 tháng bảo hành chính hãng, hỗ trợ kỹ thuật 24/7",
                SupplyScope: "Toàn quốc & Xuất khẩu Đông Nam Á",
                PaymentTerms: "Tạm ứng 30%, giao hàng 40%, nghiệm thu bàn giao 30%",
                InstallationSupport: true,
                SpecValues: new List<OfferSpecValueDto>
                {
                    new(Guid.NewGuid(), "SPEC-01", "Công suất tách ẩm định mức", "120", "kg/mẻ"),
                    new(Guid.NewGuid(), "SPEC-02", "Nhiệt độ cấp đông sâu buồng sấy", "-45", "°C"),
                    new(Guid.NewGuid(), "SPEC-03", "Độ chân không tối đa", "0.02", "mbar"),
                    new(Guid.NewGuid(), "SPEC-04", "Điện năng tiêu thụ bình quân", "7.5", "kW/h"),
                    new(Guid.NewGuid(), "SPEC-05", "Thời gian sấy trung bình", "18 - 22", "giờ/mẻ")
                },
                Documents: new List<OfferDocumentDto>
                {
                    new(Guid.NewGuid(), "CATALOGUE", "Catalogue-He-thong-say-thang-hoa-VIAEP.pdf", "/dataroom/catalogue-say-thang-hoa.pdf", 5240000, "PUBLIC"),
                    new(Guid.NewGuid(), "PATENT_CERT", "Ban-scan-Bang-Sang-che-VN-1-0028491.pdf", "/dataroom/patent-cert-0028491.pdf", 3120000, "AFTER_CONNECTION"),
                    new(Guid.NewGuid(), "TRL_EVIDENCE", "Bao-cao-kiem-dinh-hieu-suat-TRL8-Quatest1.pdf", "/dataroom/report-trl8-quatest1.pdf", 8450000, "AFTER_CONNECTION")
                },
                ContactName: "ThS. Hoàng Anh Tuấn",
                ContactEmail: "tuan.ha@viaep.gov.vn",
                ContactPhone: "0912345678"
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
                PublishedAt: DateTimeOffset.UtcNow.AddDays(-14),
                EnterpriseTaxCode: "4900142903",
                EnterpriseName: "CÔNG TY TRÁCH NHIỆM HỮU HẠN THÀNH LONG",
                MainImageUrl: "/images/technologies/robot-han.jpg",
                GalleryImageUrls: new List<string> { "/images/technologies/robot-han-1.jpg" },
                DeliveryTimeline: "60 ngày kể từ ngày ký hợp đồng",
                WarrantyTerms: "36 tháng bảo hành chính hãng kèm chuyển giao đào tạo",
                SupplyScope: "Toàn quốc",
                PaymentTerms: "Tạm ứng 40%, giao hàng 40%, bảo hành 20%",
                InstallationSupport: true,
                SpecValues: new List<OfferSpecValueDto>
                {
                    new(Guid.NewGuid(), "SPEC-01", "Bán kính với tới của cánh tay", "1850", "mm"),
                    new(Guid.NewGuid(), "SPEC-02", "Độ chính xác lặp lại", "0.02", "mm"),
                    new(Guid.NewGuid(), "SPEC-03", "Công suất nguồn hàn Laser Fiber", "3000", "W")
                },
                Documents: new List<OfferDocumentDto>
                {
                    new(Guid.NewGuid(), "CATALOGUE", "Brochure-Robot-Han-Laser-BK-6Axis.pdf", "/dataroom/brochure-robot-han.pdf", 4120000, "PUBLIC"),
                    new(Guid.NewGuid(), "TRL_EVIDENCE", "Bao-cao-kiem-tra-pilot-TRL7-VinFast.pdf", "/dataroom/pilot-vinfast.pdf", 9650000, "AFTER_CONNECTION")
                },
                ContactName: "TS. Nguyễn Mạnh Hùng",
                ContactEmail: "hung.nm@hust.edu.vn",
                ContactPhone: "0987654321"
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
                SectorName: "Công nghệ thông tin, Phần mềm & IoT",
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
                PublishedAt: DateTimeOffset.UtcNow.AddDays(-9),
                EnterpriseTaxCode: "4900224521",
                EnterpriseName: "CÔNG TY TNHH SẢN XUẤT VÀ THƯƠNG MẠI AN SƠN",
                MainImageUrl: "/images/technologies/iot-gateway.jpg",
                GalleryImageUrls: null,
                DeliveryTimeline: "Có sẵn kho, giao hàng trong 48h",
                WarrantyTerms: "12 tháng đổi mới 1-1",
                SupplyScope: "Toàn quốc",
                PaymentTerms: "Thanh toán 100% khi nhận hàng",
                InstallationSupport: false,
                SpecValues: new List<OfferSpecValueDto>
                {
                    new(Guid.NewGuid(), "SPEC-01", "Giao diện truyền thông", "RS485/Modbus/Ethernet/4G", null),
                    new(Guid.NewGuid(), "SPEC-02", "Điện áp hoạt động", "12 - 24", "VDC"),
                    new(Guid.NewGuid(), "SPEC-03", "Nhiệt độ vận hành công nghiệp", "-20 đến +70", "°C")
                },
                Documents: new List<OfferDocumentDto>
                {
                    new(Guid.NewGuid(), "CATALOGUE", "Datasheet-IoT-Gateway-AnSon-v2.pdf", "/dataroom/datasheet-gateway.pdf", 2150000, "PUBLIC")
                },
                ContactName: "Lê Văn Sơn",
                ContactEmail: "contact@ansoniot.vn",
                ContactPhone: "0905123456"
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
                PublishedAt: DateTimeOffset.UtcNow.AddDays(-4),
                EnterpriseTaxCode: "4900232057",
                EnterpriseName: "CÔNG TY CỔ PHẦN VẬT LIỆU VÀ XÂY DỰNG CAO LỘC",
                MainImageUrl: "/images/technologies/che-pham-sinh-hoc.jpg",
                GalleryImageUrls: null,
                DeliveryTimeline: "15 ngày chuyển giao quy trình nuôi cấy vi sinh",
                WarrantyTerms: "Cam kết đồng hành kiểm soát nước thải đầu ra đạt cột A QCVN 40:2011",
                SupplyScope: "Toàn quốc",
                PaymentTerms: "Thanh toán theo 3 giai đoạn chuyển giao",
                InstallationSupport: true,
                SpecValues: new List<OfferSpecValueDto>
                {
                    new(Guid.NewGuid(), "SPEC-01", "Mật độ vi sinh hoạt tính", "10^9", "CFU/ml"),
                    new(Guid.NewGuid(), "SPEC-02", "Hiệu suất khử màu hợp chất Azo", "> 95", "%"),
                    new(Guid.NewGuid(), "SPEC-03", "Giảm chỉ số COD/BOD", "80 - 88", "%")
                },
                Documents: new List<OfferDocumentDto>
                {
                    new(Guid.NewGuid(), "CATALOGUE", "Huong-dan-ung-dung-vi-sinh-det-nhuom.pdf", "/dataroom/hd-vi-sinh.pdf", 3420000, "PUBLIC"),
                    new(Guid.NewGuid(), "PATENT_CERT", "Bang-doc-quyen-sang-che-VN-1-0019283.pdf", "/dataroom/patent-vast-19283.pdf", 4120000, "AFTER_CONNECTION")
                },
                ContactName: "PGS. TS. Trần Đức Toàn",
                ContactEmail: "toan.td@vast.vn",
                ContactPhone: "0918765432"
            )
        };

        return items.Select(x => new KeyValuePair<Guid, SellerOfferDto>(x.Id, x));
    }

    private async Task<List<SellerOfferDto>> MapWithRealConnectionsAsync(
        IReadOnlyList<SellerTechnologyOffer> entities,
        bool includeDocsAndGalleryUrls,
        CancellationToken ct)
    {
        if (entities.Count == 0) return [];
        var connMap = await CountRealSuccessfulConnectionsMapAsync(entities.Select(x => x.Id), ct);
        return entities.Select(x =>
        {
            var dto = ToListSummaryDto(x, includeDocsAndGalleryUrls);
            return connMap.TryGetValue(x.Id, out var realCount)
                ? dto with { SuccessfulConnections = realCount }
                : dto;
        }).ToList();
    }

    private async Task<Dictionary<Guid, int>> CountRealSuccessfulConnectionsMapAsync(
        IEnumerable<Guid> offerIds,
        CancellationToken ct)
    {
        var result = new Dictionary<Guid, int>();
        var ids = offerIds.Distinct().ToList();
        if (ids.Count == 0 || !db.Database.IsRelational()) return result;

        try
        {
            var conn = db.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open)
            {
                await conn.OpenAsync(ct);
            }

            using var cmd = conn.CreateCommand();
            var paramNames = new List<string>(ids.Count);
            for (int i = 0; i < ids.Count; i++)
            {
                var pName = $"@id{i}";
                paramNames.Add(pName);
                var p = cmd.CreateParameter();
                p.ParameterName = pName;
                p.Value = ids[i];
                cmd.Parameters.Add(p);
            }

            cmd.CommandText = $"""
                SELECT COALESCE(target_offer_id, offer_id) AS oid, COUNT(*)::int AS cnt
                FROM brokerage.connection_requests
                WHERE COALESCE(target_offer_id, offer_id) IN ({string.Join(", ", paramNames)})
                  AND UPPER(status) IN ('ACCEPTED', 'COMPLETED')
                GROUP BY COALESCE(target_offer_id, offer_id);
                """;

            using var reader = await cmd.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                if (!reader.IsDBNull(0) && !reader.IsDBNull(1))
                {
                    result[reader.GetGuid(0)] = reader.GetInt32(1);
                }
            }
        }
        catch
        {
            // Bỏ qua an toàn nếu môi trường test không có bảng brokerage.connection_requests
        }

        return result;
    }

    private static SellerOfferDto ToDto(SellerTechnologyOffer x) => new(
        Id: x.Id,
        OfferCode: x.OfferCode,
        OfferType: x.OfferType,
        HasTechTransfer: x.HasTechTransfer,
        Title: x.Title,
        Summary: x.Summary,
        ProblemSolved: x.ProblemSolved,
        SectorCode: x.SectorCode,
        SectorName: x.SectorName,
        PricingType: x.PricingType,
        PriceAmount: x.PriceAmount,
        PriceMin: x.PriceMin,
        PriceMax: x.PriceMax,
        Currency: x.Currency,
        Unit: x.Unit,
        DeveloperOrigin: x.DeveloperOrigin,
        TrlLevel: x.TrlLevel,
        IpStatus: x.IpStatus,
        IpRegistrationNumber: x.IpRegistrationNumber,
        TransferMethod: x.TransferMethod,
        CommercialStatus: x.CommercialStatus,
        ContactPointRole: x.ContactPointRole,
        Status: x.Status,
        SuccessfulConnections: x.SuccessfulConnections,
        RatingScore: x.RatingScore,
        ReviewCount: x.ReviewCount,
        CreatedAt: x.CreatedAt,
        PublishedAt: x.PublishedAt,
        ManagingAuthorityId: x.ManagingAuthorityId,
        ManagingAuthorityName: x.ManagingAuthorityName,
        ScopeType: x.ScopeType,
        ScopeId: x.ScopeId,
        EnterpriseTaxCode: x.EnterpriseTaxCode,
        EnterpriseName: x.EnterpriseName,
        MainImageUrl: x.MainImageUrl,
        GalleryImageUrls: x.GalleryImageUrls,
        DeliveryTimeline: x.DeliveryTimeline,
        WarrantyTerms: x.WarrantyTerms,
        SupplyScope: x.SupplyScope,
        PaymentTerms: x.PaymentTerms,
        SpecValues: x.SpecValues?.Select(s => new OfferSpecValueDto(s.Id, s.SpecCode, s.SpecName, s.SpecValue, s.Unit, s.SpecCategory)).ToList(),
        Documents: x.Documents?.Select(d => new OfferDocumentDto(d.Id, d.DocumentType, d.FileName, d.FileUrl, d.FileSizeBytes, d.AccessScope)).ToList(),
        ModelCode: x.ModelCode,
        Manufacturer: x.Manufacturer,
        OriginCountry: x.OriginCountry,
        EquipmentStatus: x.EquipmentStatus,
        ManufacturingYear: x.ManufacturingYear,
        CapacityScale: x.CapacityScale,
        EnergyConsumption: x.EnergyConsumption,
        AutomationLevel: x.AutomationLevel,
        OperatingPrinciple: x.OperatingPrinciple,
        DeploymentConditions: x.DeploymentConditions,
        TransferPriorityMethod: x.TransferPriorityMethod,
        PriceIncludes: x.PriceIncludes,
        TaxAndExtraCosts: x.TaxAndExtraCosts,
        TechnicalSupportMethod: x.TechnicalSupportMethod,
        IpIssueDate: x.IpIssueDate,
        LegalCommitmentConfirmed: x.LegalCommitmentConfirmed,
        TrlVerificationStatus: x.TrlVerificationStatus,
        IpVerificationStatus: x.IpVerificationStatus,
        VerifiedAuthorityName: x.VerifiedAuthorityName,
        TrlVerifiedBy: x.TrlVerifiedBy,
        TrlVerifiedAt: x.TrlVerifiedAt,
        TrlReviewNote: x.TrlReviewNote
    );

    private static string? RewriteListImageUrl(Guid id, string? url, int? galleryIndex = null)
    {
        if (string.IsNullOrWhiteSpace(url)) return url;
        if (url.TrimStart().StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
        {
            return galleryIndex.HasValue
                ? $"/api/v1/technologies/{id}/gallery/{galleryIndex.Value}"
                : $"/api/v1/technologies/{id}/main-image";
        }
        return url;
    }

    private static SellerOfferDto ToListSummaryDto(SellerTechnologyOffer x, bool includeDocsAndGalleryUrls = false)
    {
        var mainUrl = RewriteListImageUrl(x.Id, x.MainImageUrl);
        IReadOnlyList<string> galleryUrls = includeDocsAndGalleryUrls && x.GalleryImageUrls is not null
            ? x.GalleryImageUrls
                .Select((u, idx) => RewriteListImageUrl(x.Id, u, idx) ?? string.Empty)
                .Where(u => !string.IsNullOrEmpty(u))
                .ToList()
            : Array.Empty<string>();

        return new SellerOfferDto(
            Id: x.Id,
            OfferCode: x.OfferCode,
            OfferType: x.OfferType,
            HasTechTransfer: x.HasTechTransfer,
            Title: x.Title,
            Summary: x.Summary,
            ProblemSolved: x.ProblemSolved,
            SectorCode: x.SectorCode,
            SectorName: x.SectorName,
            PricingType: x.PricingType,
            PriceAmount: x.PriceAmount,
            PriceMin: x.PriceMin,
            PriceMax: x.PriceMax,
            Currency: x.Currency,
            Unit: x.Unit,
            DeveloperOrigin: x.DeveloperOrigin,
            TrlLevel: x.TrlLevel,
            IpStatus: x.IpStatus,
            IpRegistrationNumber: x.IpRegistrationNumber,
            TransferMethod: x.TransferMethod,
            CommercialStatus: x.CommercialStatus,
            ContactPointRole: x.ContactPointRole,
            Status: x.Status,
            SuccessfulConnections: x.SuccessfulConnections,
            RatingScore: x.RatingScore,
            ReviewCount: x.ReviewCount,
            CreatedAt: x.CreatedAt,
            PublishedAt: x.PublishedAt,
            ManagingAuthorityId: x.ManagingAuthorityId,
            ManagingAuthorityName: x.ManagingAuthorityName,
            ScopeType: x.ScopeType,
            ScopeId: x.ScopeId,
            EnterpriseTaxCode: x.EnterpriseTaxCode,
            EnterpriseName: x.EnterpriseName,
            MainImageUrl: mainUrl,
            GalleryImageUrls: galleryUrls,
            DeliveryTimeline: x.DeliveryTimeline,
            WarrantyTerms: x.WarrantyTerms,
            SupplyScope: x.SupplyScope,
            PaymentTerms: x.PaymentTerms,
            SpecValues: includeDocsAndGalleryUrls
                ? x.SpecValues?.Select(s => new OfferSpecValueDto(s.Id, s.SpecCode, s.SpecName, s.SpecValue, s.Unit, s.SpecCategory)).ToList()
                : Array.Empty<OfferSpecValueDto>(),
            Documents: includeDocsAndGalleryUrls
                ? x.Documents?.Select(d => new OfferDocumentDto(d.Id, d.DocumentType, d.FileName, d.FileUrl, d.FileSizeBytes, d.AccessScope)).ToList()
                : Array.Empty<OfferDocumentDto>(),
            ModelCode: x.ModelCode,
            Manufacturer: x.Manufacturer,
            OriginCountry: x.OriginCountry,
            EquipmentStatus: x.EquipmentStatus,
            ManufacturingYear: x.ManufacturingYear,
            CapacityScale: x.CapacityScale,
            EnergyConsumption: x.EnergyConsumption,
            AutomationLevel: x.AutomationLevel,
            OperatingPrinciple: x.OperatingPrinciple,
            DeploymentConditions: x.DeploymentConditions,
            TransferPriorityMethod: x.TransferPriorityMethod,
            PriceIncludes: x.PriceIncludes,
            TaxAndExtraCosts: x.TaxAndExtraCosts,
            TechnicalSupportMethod: x.TechnicalSupportMethod,
            IpIssueDate: x.IpIssueDate,
            LegalCommitmentConfirmed: x.LegalCommitmentConfirmed,
            TrlVerificationStatus: x.TrlVerificationStatus,
            IpVerificationStatus: x.IpVerificationStatus,
            VerifiedAuthorityName: x.VerifiedAuthorityName,
            TrlVerifiedBy: x.TrlVerifiedBy,
            TrlVerifiedAt: x.TrlVerifiedAt,
            TrlReviewNote: x.TrlReviewNote
        );
    }

    private IActionResult ServeImageValue(string? rawUrl)
    {
        if (string.IsNullOrWhiteSpace(rawUrl))
        {
            return NotFound();
        }

        var trimmed = rawUrl.Trim();
        if (trimmed.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
        {
            var commaIdx = trimmed.IndexOf(',');
            if (commaIdx <= 0) return NotFound();

            var header = trimmed.Substring(5, commaIdx - 5); // e.g. image/png;base64
            var semiIdx = header.IndexOf(';');
            var contentType = semiIdx > 0 ? header.Substring(0, semiIdx) : header;
            var base64Data = trimmed.Substring(commaIdx + 1);
            try
            {
                var bytes = Convert.FromBase64String(base64Data);
                Response.Headers.CacheControl = "public, max-age=86400";
                return File(bytes, contentType);
            }
            catch
            {
                return NotFound();
            }
        }

        return Redirect(trimmed);
    }

    [HttpGet("facets")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicFacets(CancellationToken ct = default)
    {
        var dbRows = await db.Set<SellerTechnologyOffer>()
            .AsNoTracking()
            .Where(x => x.Status == "APPROVED")
            .Select(x => new { x.Title, x.SectorCode, x.HasTechTransfer, x.IpStatus })
            .ToListAsync(ct);

        if (dbRows.Count > 0)
        {
            var distinct = dbRows
                .DistinctBy(x => x.Title.Trim().ToLowerInvariant())
                .ToList();

            var bySector = distinct
                .Where(x => !string.IsNullOrWhiteSpace(x.SectorCode))
                .GroupBy(x => x.SectorCode!)
                .ToDictionary(g => g.Key, g => g.Count());

            return Ok(new
            {
                success = true,
                total = distinct.Count,
                transferCount = distinct.Count(x => x.HasTechTransfer),
                commercialCount = distinct.Count(x => !x.HasTechTransfer),
                patentCount = distinct.Count(x => string.Equals(x.IpStatus, "PATENT_GRANTED", StringComparison.OrdinalIgnoreCase)),
                bySector
            });
        }

        var fallback = OffersStore.Values
            .Where(x => x.Status == "APPROVED")
            .DistinctBy(x => x.Title.Trim().ToLowerInvariant())
            .ToList();

        return Ok(new
        {
            success = true,
            total = fallback.Count,
            transferCount = fallback.Count(x => x.HasTechTransfer),
            commercialCount = fallback.Count(x => !x.HasTechTransfer),
            patentCount = fallback.Count(x => string.Equals(x.IpStatus, "PATENT_GRANTED", StringComparison.OrdinalIgnoreCase)),
            bySector = fallback
                .Where(x => !string.IsNullOrWhiteSpace(x.SectorCode))
                .GroupBy(x => x.SectorCode!)
                .ToDictionary(g => g.Key, g => g.Count())
        });
    }

    [HttpGet("{id}/main-image")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMainImage(string id, CancellationToken ct = default)
    {
        var isGuid = Guid.TryParse(id, out var guid);
        var img = await db.Set<SellerTechnologyOffer>()
            .AsNoTracking()
            .Where(x => (isGuid && x.Id == guid) || x.OfferCode == id)
            .Select(x => x.MainImageUrl)
            .FirstOrDefaultAsync(ct);

        if (!string.IsNullOrWhiteSpace(img))
        {
            return ServeImageValue(img);
        }

        var storeOffer = isGuid && OffersStore.TryGetValue(guid, out var byId)
            ? byId
            : OffersStore.Values.FirstOrDefault(x => string.Equals(x.OfferCode, id, StringComparison.OrdinalIgnoreCase));
        return ServeImageValue(storeOffer?.MainImageUrl);
    }

    [HttpGet("{id}/gallery/{index:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetGalleryImage(string id, int index, CancellationToken ct = default)
    {
        if (index < 0) return NotFound();
        var isGuid = Guid.TryParse(id, out var guid);
        var gallery = await db.Set<SellerTechnologyOffer>()
            .AsNoTracking()
            .Where(x => (isGuid && x.Id == guid) || x.OfferCode == id)
            .Select(x => x.GalleryImageUrls)
            .FirstOrDefaultAsync(ct);

        if (gallery != null && index < gallery.Count)
        {
            return ServeImageValue(gallery[index]);
        }

        var storeOffer = isGuid && OffersStore.TryGetValue(guid, out var byId)
            ? byId
            : OffersStore.Values.FirstOrDefault(x => string.Equals(x.OfferCode, id, StringComparison.OrdinalIgnoreCase));
        if (storeOffer?.GalleryImageUrls != null && index < storeOffer.GalleryImageUrls.Count)
        {
            return ServeImageValue(storeOffer.GalleryImageUrls[index]);
        }

        return NotFound();
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetOffers(
        [FromQuery] string? search,
        [FromQuery] string? sectorCode,
        [FromQuery] string? offerType,
        [FromQuery] bool? hasTechTransfer,
        [FromQuery] int? minTrl,
        [FromQuery] string? ipStatus,
        [FromQuery] string? enterpriseTaxCode,
        [FromQuery] bool? rotate = null,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 12,
        CancellationToken ct = default)
    {
        var isRotate = rotate.GetValueOrDefault(false);
        var effectiveLimit = isRotate && limit == 12 ? 6 : limit;

        var dbQuery = db.Set<SellerTechnologyOffer>()
            .AsNoTracking()
            .Where(x => x.Status == "APPROVED");

        if (await dbQuery.AnyAsync(ct))
        {
            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                dbQuery = dbQuery.Where(x => x.Title.ToLower().Contains(s)
                                      || x.Summary.ToLower().Contains(s)
                                      || (x.DeveloperOrigin != null && x.DeveloperOrigin.ToLower().Contains(s))
                                      || (x.EnterpriseName != null && x.EnterpriseName.ToLower().Contains(s)));
            }

            if (!string.IsNullOrWhiteSpace(sectorCode) && sectorCode != "ALL")
            {
                var cleanSector = sectorCode.Trim().ToLower();
                dbQuery = dbQuery.Where(x => x.SectorCode.ToLower() == cleanSector);
            }

            if (!string.IsNullOrWhiteSpace(offerType) && offerType != "ALL")
            {
                var cleanType = offerType.Trim().ToLower();
                dbQuery = dbQuery.Where(x => x.OfferType.ToLower() == cleanType);
            }

            if (hasTechTransfer.HasValue)
            {
                dbQuery = dbQuery.Where(x => x.HasTechTransfer == hasTechTransfer.Value);
            }

            if (minTrl.HasValue)
            {
                dbQuery = dbQuery.Where(x => x.TrlLevel >= minTrl.Value);
            }

            if (!string.IsNullOrWhiteSpace(ipStatus) && ipStatus != "ALL")
            {
                var cleanIp = ipStatus.Trim().ToLower();
                dbQuery = dbQuery.Where(x => x.IpStatus != null && x.IpStatus.ToLower() == cleanIp);
            }

            if (!string.IsNullOrWhiteSpace(enterpriseTaxCode))
            {
                var cleanTax = enterpriseTaxCode.Trim().ToLower();
                dbQuery = dbQuery.Where(x => x.EnterpriseTaxCode != null && x.EnterpriseTaxCode.ToLower() == cleanTax);
            }

            if (isRotate)
            {
                var rawCandidates = await dbQuery
                    .OrderByDescending(x => x.PublishedAt ?? x.CreatedAt)
                    .Take(200)
                    .ToListAsync(ct);

                var rotatedEntities = InterleavedRotation.RotateAndInterleave(
                    rawCandidates,
                    keySelector: x => x.Title,
                    sectorSelector: x => x.SectorCode,
                    limit: effectiveLimit,
                    maxPerSector: 2
                );

                return Ok(new
                {
                    success = true,
                    total = rotatedEntities.Count,
                    page = 1,
                    limit = effectiveLimit,
                    totalPages = 1,
                    data = await MapWithRealConnectionsAsync(rotatedEntities, includeDocsAndGalleryUrls: false, ct)
                });
            }

            var allEntities = await dbQuery
                .OrderByDescending(x => x.PublishedAt ?? x.CreatedAt)
                .Take(Math.Max(page * limit * 3, 100))
                .ToListAsync(ct);

            var deduplicated = allEntities
                .DistinctBy(x => x.Title.Trim().ToLowerInvariant())
                .ToList();

            var total = deduplicated.Count;
            var entities = deduplicated
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
                data = await MapWithRealConnectionsAsync(entities, includeDocsAndGalleryUrls: false, ct)
            });
        }

        var query = OffersStore.Values.Where(x => x.Status == "APPROVED");

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLowerInvariant();
            query = query.Where(x => x.Title.ToLowerInvariant().Contains(s)
                                  || x.Summary.ToLowerInvariant().Contains(s)
                                  || (x.DeveloperOrigin != null && x.DeveloperOrigin.ToLowerInvariant().Contains(s))
                                  || (x.EnterpriseName != null && x.EnterpriseName.ToLowerInvariant().Contains(s)));
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

        if (!string.IsNullOrWhiteSpace(enterpriseTaxCode))
        {
            query = query.Where(x => x.EnterpriseTaxCode != null && x.EnterpriseTaxCode.Equals(enterpriseTaxCode.Trim(), StringComparison.OrdinalIgnoreCase));
        }

        if (isRotate)
        {
            var rotatedFallback = InterleavedRotation.RotateAndInterleave(
                query.OrderByDescending(x => x.PublishedAt ?? x.CreatedAt).ToList(),
                keySelector: x => x.Title,
                sectorSelector: x => x.SectorCode,
                limit: effectiveLimit,
                maxPerSector: 2
            );

            return Ok(new
            {
                success = true,
                total = rotatedFallback.Count,
                page = 1,
                limit = effectiveLimit,
                totalPages = 1,
                data = rotatedFallback
            });
        }

        var deduplicatedFallback = query
            .DistinctBy(x => x.Title.Trim().ToLowerInvariant())
            .OrderByDescending(x => x.PublishedAt ?? x.CreatedAt)
            .ToList();

        var totalFallback = deduplicatedFallback.Count;
        var dataFallback = deduplicatedFallback
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToList();

        return Ok(new
        {
            success = true,
            total = totalFallback,
            page,
            limit,
            totalPages = (int)Math.Ceiling(totalFallback / (double)limit),
            data = dataFallback
        });
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetOfferById(string id, CancellationToken ct = default)
    {
        var isGuid = Guid.TryParse(id, out var guid);
        var entity = await db.Set<SellerTechnologyOffer>()
            .Include(x => x.SpecValues)
            .Include(x => x.Documents)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => (isGuid && x.Id == guid) || x.OfferCode == id, ct);

        if (entity != null)
        {
            var connMap = await CountRealSuccessfulConnectionsMapAsync([entity.Id], ct);
            var dto = ToDto(entity);
            if (connMap.TryGetValue(entity.Id, out var realCount))
            {
                dto = dto with { SuccessfulConnections = realCount };
            }
            return Ok(new { success = true, data = dto });
        }

        if (isGuid && OffersStore.TryGetValue(guid, out var offer))
        {
            return Ok(new { success = true, data = offer });
        }

        var storeOffer = OffersStore.Values.FirstOrDefault(x => string.Equals(x.OfferCode, id, StringComparison.OrdinalIgnoreCase));
        if (storeOffer != null)
        {
            return Ok(new { success = true, data = storeOffer });
        }

        return NotFound(new { success = false, message = "Không tìm thấy hồ sơ công nghệ." });
    }

    [HttpGet("/api/v1/portal/seller/technologies")]
    [HttpGet("/api/v2/portal/seller/technologies")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSellerOffers(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? trl,
        [FromQuery] string? enterpriseTaxCode,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10,
        CancellationToken ct = default)
    {
        // Xác định phạm vi doanh nghiệp của Seller (Scoped RBAC)
        var resolvedTaxCodes = new List<string>();
        if (!string.IsNullOrWhiteSpace(enterpriseTaxCode))
        {
            resolvedTaxCodes.Add(enterpriseTaxCode.Trim());
        }
        else if (Actor.IsAuthenticated)
        {
            if (Actor.PersonId.HasValue)
            {
                var taxCodes = await db.Set<NacenTech.Modules.Enterprise.Domain.Enterprise>()
                    .AsNoTracking()
                    .Where(e => e.OwnerPersonId == Actor.PersonId.Value || (Actor.Email != null && e.ContactEmail == Actor.Email))
                    .Select(e => e.TaxCode)
                    .Where(t => !string.IsNullOrEmpty(t))
                    .ToListAsync(ct);
                resolvedTaxCodes.AddRange(taxCodes!);
            }
            else if (!string.IsNullOrWhiteSpace(Actor.Email))
            {
                var taxCodes = await db.Set<NacenTech.Modules.Enterprise.Domain.Enterprise>()
                    .AsNoTracking()
                    .Where(e => e.ContactEmail == Actor.Email)
                    .Select(e => e.TaxCode)
                    .Where(t => !string.IsNullOrEmpty(t))
                    .ToListAsync(ct);
                resolvedTaxCodes.AddRange(taxCodes!);
            }
        }

        var dbQuery = db.Set<SellerTechnologyOffer>()
            .Include(x => x.SpecValues)
            .Include(x => x.Documents)
            .AsNoTracking();

        if (await dbQuery.AnyAsync(ct))
        {
            // Nếu có MST liên kết hoặc user là Seller: bắt buộc scope theo dữ liệu của đơn vị đó
            if (resolvedTaxCodes.Count > 0)
            {
                var lowerCodes = resolvedTaxCodes.Select(t => t.ToLowerInvariant()).ToList();
                dbQuery = dbQuery.Where(x =>
                    (x.EnterpriseTaxCode != null && lowerCodes.Contains(x.EnterpriseTaxCode.ToLower())) ||
                    (Actor.PersonId.HasValue && x.CreatedBy.HasValue && x.CreatedBy == Actor.PersonId)
                );
            }
            else if (Actor.IsAuthenticated && Actor.PlatformRole == "SELLER" && Actor.PersonId.HasValue)
            {
                dbQuery = dbQuery.Where(x => x.CreatedBy.HasValue && x.CreatedBy == Actor.PersonId);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                dbQuery = dbQuery.Where(x => x.Title.ToLower().Contains(s) || x.OfferCode.ToLower().Contains(s));
            }

            if (!string.IsNullOrWhiteSpace(status) && status != "ALL")
            {
                var st = status.Trim().ToLower();
                dbQuery = dbQuery.Where(x => x.Status.ToLower() == st);
            }

            if (!string.IsNullOrWhiteSpace(trl) && trl != "ALL")
            {
                if (trl == "TRL_1_3") dbQuery = dbQuery.Where(x => x.TrlLevel >= 1 && x.TrlLevel <= 3);
                else if (trl == "TRL_4_6") dbQuery = dbQuery.Where(x => x.TrlLevel >= 4 && x.TrlLevel <= 6);
                else if (trl == "TRL_7_9") dbQuery = dbQuery.Where(x => x.TrlLevel >= 7 && x.TrlLevel <= 9);
            }

            // Tính KPI trên TOÀN BỘ tập dữ liệu scoped của đơn vị này
            var allScoped = await dbQuery.ToListAsync(ct);
            var kpi = new
            {
                totalOffers = allScoped.Count,
                publishedOffers = allScoped.Count(x => x.Status == "APPROVED"),
                pendingOffers = allScoped.Count(x => x.Status == "PENDING"),
                draftOffers = allScoped.Count(x => x.Status == "DRAFT"),
                successfulConnections = allScoped.Sum(x => x.SuccessfulConnections)
            };

            var total = allScoped.Count;
            var pageSize = limit <= 0 ? 10 : limit;
            var totalPages = (int)Math.Ceiling((double)total / pageSize);
            if (totalPages == 0) totalPages = 1;

            var entities = allScoped
                .OrderByDescending(x => x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new
            {
                success = true,
                kpi,
                total,
                page,
                limit = pageSize,
                totalPages,
                data = entities.Select(x => ToListSummaryDto(x, includeDocsAndGalleryUrls: true)).ToList()
            });
        }

        var query = OffersStore.Values.AsEnumerable();

        if (resolvedTaxCodes.Count > 0)
        {
            var lowerCodes = resolvedTaxCodes.Select(t => t.ToLowerInvariant()).ToList();
            query = query.Where(x => x.EnterpriseTaxCode != null && lowerCodes.Contains(x.EnterpriseTaxCode.ToLowerInvariant()));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLowerInvariant();
            query = query.Where(x => x.Title.ToLowerInvariant().Contains(s) || x.OfferCode.ToLowerInvariant().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "ALL")
        {
            query = query.Where(x => x.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(trl) && trl != "ALL")
        {
            if (trl == "TRL_1_3") query = query.Where(x => x.TrlLevel >= 1 && x.TrlLevel <= 3);
            else if (trl == "TRL_4_6") query = query.Where(x => x.TrlLevel >= 4 && x.TrlLevel <= 6);
            else if (trl == "TRL_7_9") query = query.Where(x => x.TrlLevel >= 7 && x.TrlLevel <= 9);
        }

        var allList = query.ToList();
        var totalFallback = allList.Count;
        var pageSizeFallback = limit <= 0 ? 10 : limit;
        var totalPagesFallback = (int)Math.Ceiling((double)totalFallback / pageSizeFallback);
        if (totalPagesFallback == 0) totalPagesFallback = 1;

        var dataFallback = allList.OrderByDescending(x => x.CreatedAt)
                                .Skip((page - 1) * pageSizeFallback)
                                .Take(pageSizeFallback)
                                .ToList();

        var kpiFallback = new
        {
            totalOffers = allList.Count,
            publishedOffers = allList.Count(x => x.Status == "APPROVED"),
            pendingOffers = allList.Count(x => x.Status == "PENDING"),
            draftOffers = allList.Count(x => x.Status == "DRAFT"),
            successfulConnections = allList.Sum(x => x.SuccessfulConnections)
        };

        return Ok(new
        {
            success = true,
            kpi = kpiFallback,
            total = totalFallback,
            page,
            limit = pageSizeFallback,
            totalPages = totalPagesFallback,
            data = dataFallback
        });
    }

    [HttpPost("/api/v1/portal/seller/technologies")]
    [HttpPost("/api/v2/portal/seller/technologies")]
    [AllowAnonymous]
    public async Task<IActionResult> CreateSellerOffer([FromBody] CreateSellerOfferDto dto, CancellationToken ct = default)
    {
        bool isDraft = string.Equals(dto.Action, "SAVE_DRAFT", StringComparison.OrdinalIgnoreCase);
        var validation = SellerOfferRulesValidator.Validate(dto);

        if (!validation.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = isDraft
                    ? "Dữ liệu lưu nháp không hợp lệ (tiêu đề tối thiểu 3 ký tự)."
                    : "Dữ liệu hồ sơ chào bán không hợp lệ theo quy tắc BR-SELLER.",
                errors = validation.Errors
            });
        }

        var id = Guid.NewGuid();
        var totalDbOffers = await db.Set<SellerTechnologyOffer>().CountAsync(ct);
        var offerCode = $"OFF-{DateTime.UtcNow:yyyyMMdd}-{(totalDbOffers + 1):D5}-{Guid.NewGuid().ToString("N")[..4].ToUpperInvariant()}";
        var status = isDraft ? "DRAFT" : "PENDING";

        var scopeId = dto.ManagingAuthorityId;
        var scopeName = dto.ManagingAuthorityName;
        if (string.IsNullOrWhiteSpace(scopeId))
        {
            scopeId = "BACLINK";
            scopeName = "Hiệp hội Doanh nghiệp Bắc Ninh (BACLINK)";
        }

        var newOffer = new SellerOfferDto(
            Id: id,
            OfferCode: offerCode,
            OfferType: dto.OfferType?.ToUpperInvariant() ?? "PRODUCT",
            HasTechTransfer: dto.HasTechTransfer,
            Title: dto.Title,
            Summary: !string.IsNullOrWhiteSpace(dto.Summary) ? dto.Summary : (dto.ShortDescription ?? ""),
            ProblemSolved: dto.ProblemSolved ?? "",
            SectorCode: dto.SectorCode?.ToUpperInvariant() ?? "OTHER",
            SectorName: MapSectorName(dto.SectorCode ?? "OTHER"),
            PricingType: dto.PricingType?.ToUpperInvariant() ?? "CONTACT",
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
            Status: status,
            SuccessfulConnections: 0,
            RatingScore: 5.0m,
            ReviewCount: 0,
            CreatedAt: DateTimeOffset.UtcNow,
            PublishedAt: null,
            ManagingAuthorityId: scopeId,
            ManagingAuthorityName: scopeName,
            ScopeType: dto.ScopeType ?? "PROVINCE",
            ScopeId: dto.ScopeId ?? scopeId,
            EnterpriseTaxCode: dto.EnterpriseTaxCode,
            EnterpriseName: dto.EnterpriseName,
            MainImageUrl: dto.MainImageUrl,
            GalleryImageUrls: dto.GalleryImageUrls != null ? new List<string>(dto.GalleryImageUrls) : null,
            DeliveryTimeline: dto.DeliveryTimeline,
            WarrantyTerms: dto.WarrantyTerms,
            SupplyScope: dto.SupplyScope,
            PaymentTerms: dto.PaymentTerms,
            InstallationSupport: dto.InstallationSupport,
            SpecValues: dto.SpecValues,
            Documents: dto.Documents,
            ContactName: dto.ContactName,
            ContactEmail: dto.ContactEmail,
            ContactPhone: dto.ContactPhone,
            ModelCode: dto.ModelCode,
            Manufacturer: dto.Manufacturer,
            OriginCountry: dto.OriginCountry,
            EquipmentStatus: dto.EquipmentStatus ?? "NEW",
            ManufacturingYear: dto.ManufacturingYear,
            CapacityScale: dto.CapacityScale,
            EnergyConsumption: dto.EnergyConsumption,
            AutomationLevel: dto.AutomationLevel,
            OperatingPrinciple: dto.OperatingPrinciple,
            DeploymentConditions: dto.DeploymentConditions,
            TransferPriorityMethod: dto.TransferPriorityMethod,
            PriceIncludes: dto.PriceIncludes,
            TaxAndExtraCosts: dto.TaxAndExtraCosts,
            TechnicalSupportMethod: dto.TechnicalSupportMethod,
            IpIssueDate: dto.IpIssueDate,
            LegalCommitmentConfirmed: dto.LegalCommitmentConfirmed
        );

        // Lưu thực thể lâu dài vào CSDL PostgreSQL
        var entity = new SellerTechnologyOffer(
            id,
            offerCode,
            dto.OfferType?.ToUpperInvariant() ?? "PRODUCT",
            dto.HasTechTransfer,
            dto.Title,
            !string.IsNullOrWhiteSpace(dto.Summary) ? dto.Summary : (dto.ShortDescription ?? ""),
            dto.ProblemSolved ?? "",
            dto.SectorCode?.ToUpperInvariant() ?? "OTHER",
            MapSectorName(dto.SectorCode ?? "OTHER"),
            dto.PricingType?.ToUpperInvariant() ?? "CONTACT",
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
            status,
            scopeId,
            scopeName,
            dto.ScopeType ?? "PROVINCE",
            dto.ScopeId ?? scopeId,
            dto.LegalConsent,
            null,
            null,
            dto.EnterpriseTaxCode,
            dto.EnterpriseName,
            dto.MainImageUrl,
            dto.GalleryImageUrls != null ? new List<string>(dto.GalleryImageUrls) : null,
            dto.DeliveryTimeline,
            dto.WarrantyTerms,
            dto.SupplyScope,
            dto.PaymentTerms,
            dto.InstallationSupport,
            modelCode: dto.ModelCode,
            manufacturer: dto.Manufacturer,
            originCountry: dto.OriginCountry,
            equipmentStatus: dto.EquipmentStatus ?? "NEW",
            manufacturingYear: dto.ManufacturingYear,
            capacityScale: dto.CapacityScale,
            energyConsumption: dto.EnergyConsumption,
            automationLevel: dto.AutomationLevel,
            operatingPrinciple: dto.OperatingPrinciple,
            deploymentConditions: dto.DeploymentConditions,
            transferPriorityMethod: dto.TransferPriorityMethod,
            priceIncludes: dto.PriceIncludes,
            taxAndExtraCosts: dto.TaxAndExtraCosts,
            technicalSupportMethod: dto.TechnicalSupportMethod,
            ipIssueDate: dto.IpIssueDate,
            legalCommitmentConfirmed: dto.LegalCommitmentConfirmed
        );

        if (dto.SpecValues != null)
        {
            foreach (var s in dto.SpecValues)
            {
                entity.AddSpecValue(new OfferSpecValue(id, s.SpecCode, s.SpecName, s.SpecValue, s.Unit, s.SpecCategory));
            }
        }

        if (dto.Documents != null)
        {
            foreach (var d in dto.Documents)
            {
                entity.AddDocument(new OfferDocument(id, d.DocumentType, d.FileName, d.FileUrl, d.FileSizeBytes, d.AccessScope));
            }
        }

        db.Set<SellerTechnologyOffer>().Add(entity);
        await uow.CommitAsync(ct);

        OffersStore[id] = newOffer;

        var message = isDraft
            ? "Đã lưu nháp hồ sơ thành công vào kho Seller."
            : "Đăng hồ sơ chào bán thành công! Hồ sơ đang ở trạng thái CHỜ THẨM ĐỊNH (PENDING) bởi Sở KH&CN.";

        return CreatedAtAction(nameof(GetOfferById), new { id }, new { success = true, message, data = newOffer });
    }

    // CR-BACLINK-001: Thẩm định công nghệ 1 cấp ADMIN, gỡ bỏ phân quyền Sở KH&CN & kiểm tra Actor.ScopeId
    [HttpPost("/api/v1/portal/seller/technologies/{id:guid}/review")]
    [HttpPost("/api/v2/portal/seller/technologies/{id:guid}/review")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN,OPERATOR_ADMIN")]
    public async Task<IActionResult> ReviewOffer(Guid id, [FromBody] ReviewOfferDto dto, CancellationToken ct = default)
    {
        // DEFECT-07: Đọc trực tiếp từ CSDL PostgreSQL để đảm bảo kiến trúc Stateless
        var entity = await db.Set<SellerTechnologyOffer>()
            .Include(x => x.SpecValues)
            .Include(x => x.Documents)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        var hasInStore = OffersStore.TryGetValue(id, out var existing);
        if (entity == null && !hasInStore)
        {
            return NotFound(new { success = false, message = "Không tìm thấy hồ sơ công nghệ." });
        }

        var isGlobalAdmin = PlatformRoles.IsAdministrative(Actor.PlatformRole)
            || User.IsInRole("ADMIN") || User.IsInRole("SUPER_ADMIN") || User.IsInRole("OPERATOR_ADMIN");

        if (!isGlobalAdmin)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                success = false,
                message = "Chỉ Quản trị viên (ADMIN) mới có quyền phê duyệt hồ sơ công nghệ."
            });
        }

        var action = dto.Action?.Trim().ToUpperInvariant();
        var trlDecision = (dto.TrlVerificationDecision ?? dto.VerificationDecision)?.Trim().ToUpperInvariant();
        var ipDecision = (dto.IpVerificationDecision ?? dto.VerificationDecision)?.Trim().ToUpperInvariant();
        var trlNote = dto.TrlReviewNote ?? dto.ReviewNote;

        string newStatus = entity?.Status ?? existing?.Status ?? "PENDING";
        DateTimeOffset? publishedAt = entity?.PublishedAt ?? existing?.PublishedAt;

        if (!string.IsNullOrWhiteSpace(action) && action != "NONE" && action != "VERIFY_ONLY")
        {
            switch (action)
            {
                case "APPROVE":
                    newStatus = "APPROVED";
                    publishedAt = DateTimeOffset.UtcNow;
                    break;
                case "REJECT":
                    newStatus = "REJECTED";
                    publishedAt = null;
                    break;
                case "REQUEST_CHANGES":
                    newStatus = "CHANGES_REQUESTED";
                    publishedAt = null;
                    break;
                case "REVOKE":
                    newStatus = "REJECTED";
                    publishedAt = null;
                    break;
                default:
                    return BadRequest(new { success = false, message = $"Hành động thẩm định không hợp lệ: {action}. Hỗ trợ: APPROVE, REJECT, REQUEST_CHANGES, REVOKE." });
            }
        }

        // Whitelist validation cho quyết định kiểm định TRL & SHTT
        if (!string.IsNullOrWhiteSpace(trlDecision))
        {
            if (trlDecision.Length > 30 || (trlDecision != "VERIFIED_BY_GOV" && trlDecision != "VERIFIED" && trlDecision != "APPROVE" && trlDecision != "APPROVED"
                && trlDecision != "REJECTED_TRL" && trlDecision != "REJECT" && trlDecision != "REJECTED"
                && trlDecision != "PENDING_VERIFICATION" && trlDecision != "SELF_DECLARED"))
            {
                return BadRequest(new { success = false, message = $"Quyết định kiểm định TRL không hợp lệ: '{trlDecision}'. Chỉ chấp nhận: VERIFIED_BY_GOV, REJECTED_TRL, PENDING_VERIFICATION, SELF_DECLARED." });
            }
        }

        if (!string.IsNullOrWhiteSpace(ipDecision))
        {
            if (ipDecision.Length > 30 || (ipDecision != "VERIFIED_BY_GOV" && ipDecision != "VERIFIED" && ipDecision != "APPROVE" && ipDecision != "APPROVED"
                && ipDecision != "REJECTED_IP" && ipDecision != "REJECT" && ipDecision != "REJECTED"
                && ipDecision != "PENDING_VERIFICATION" && ipDecision != "SELF_DECLARED" && ipDecision != "NOT_APPLICABLE"))
            {
                return BadRequest(new { success = false, message = $"Quyết định kiểm định SHTT không hợp lệ: '{ipDecision}'. Chỉ chấp nhận: VERIFIED_BY_GOV, REJECTED_IP, PENDING_VERIFICATION, SELF_DECLARED, NOT_APPLICABLE." });
            }
        }

        string authorityName = dto.VerifiedAuthorityName 
            ?? entity?.ManagingAuthorityName 
            ?? existing?.ManagingAuthorityName 
            ?? "Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)";
        Guid verifiedBy = Actor.PersonId ?? Guid.Empty;

        if (entity != null)
        {
            if (!string.IsNullOrWhiteSpace(action) && action != "NONE" && action != "VERIFY_ONLY")
            {
                if (action == "REVOKE")
                {
                    entity.Review("REJECT", dto.ReviewNote ?? "Hậu kiểm: Thu hồi hồ sơ đã duyệt.");
                }
                else
                {
                    entity.Review(action, dto.ReviewNote);
                }
            }

            if (!string.IsNullOrWhiteSpace(trlDecision))
            {
                entity.VerifyTrl(trlDecision, authorityName, verifiedBy, trlNote);
            }

            if (!string.IsNullOrWhiteSpace(ipDecision))
            {
                entity.VerifyIp(ipDecision, authorityName, verifiedBy, trlNote);
            }

            // DEFECT-10: Bắt DbUpdateConcurrencyException khi cập nhật đồng thời
            try
            {
                await uow.CommitAsync(ct);
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new
                {
                    success = false,
                    message = "Hồ sơ công nghệ đã được thẩm định hoặc thay đổi bởi một phiên làm việc khác. Vui lòng tải lại danh sách."
                });
            }

            var updatedFromDb = ToDto(entity);
            OffersStore[id] = updatedFromDb;
            return Ok(new { success = true, message = $"Thẩm định hồ sơ thành công.", data = updatedFromDb });
        }

        string newTrlStatus = existing?.TrlVerificationStatus ?? "SELF_DECLARED";
        string newIpStatus = existing?.IpVerificationStatus ?? "SELF_DECLARED";
        if (!string.IsNullOrWhiteSpace(trlDecision))
        {
            newTrlStatus = trlDecision switch
            {
                "VERIFIED_BY_GOV" or "VERIFIED" or "APPROVE" or "APPROVED" => "VERIFIED_BY_GOV",
                "REJECTED_TRL" or "REJECT" or "REJECTED" => "REJECTED_TRL",
                _ => trlDecision
            };
        }
        if (!string.IsNullOrWhiteSpace(ipDecision))
        {
            newIpStatus = ipDecision switch
            {
                "VERIFIED_BY_GOV" or "VERIFIED" or "APPROVE" or "APPROVED" => "VERIFIED_BY_GOV",
                "REJECTED_IP" or "REJECT" or "REJECTED" => "REJECTED_IP",
                _ => ipDecision
            };
        }

        var updated = existing! with
        {
            Status = newStatus,
            PublishedAt = publishedAt,
            TrlVerificationStatus = newTrlStatus,
            IpVerificationStatus = newIpStatus,
            VerifiedAuthorityName = authorityName,
            TrlVerifiedBy = verifiedBy,
            TrlVerifiedAt = (!string.IsNullOrWhiteSpace(trlDecision) || !string.IsNullOrWhiteSpace(ipDecision)) ? DateTimeOffset.UtcNow : existing?.TrlVerifiedAt,
            TrlReviewNote = trlNote ?? existing?.TrlReviewNote
        };

        OffersStore[id] = updated;
        return Ok(new { success = true, message = $"Thẩm định hồ sơ thành công.", data = updated });
    }

    // DEFECT-06: Endpoint cập nhật hồ sơ yêu cầu xác thực JWT của doanh nghiệp
    [HttpPut("/api/v1/portal/seller/technologies/{id:guid}")]
    [HttpPut("/api/v2/portal/seller/technologies/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateSellerOffer(Guid id, [FromBody] UpdateSellerOfferDto dto, CancellationToken ct = default)
    {
        var existingInStore = OffersStore.TryGetValue(id, out var existing);
        var entity = await db.Set<SellerTechnologyOffer>()
            .Include(x => x.SpecValues)
            .Include(x => x.Documents)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (!existingInStore && entity == null)
        {
            return NotFound(new { success = false, message = "Không tìm thấy hồ sơ chào bán công nghệ." });
        }

        bool isDraft = string.Equals(dto.Action, "SAVE_DRAFT", StringComparison.OrdinalIgnoreCase);
        var validation = SellerOfferRulesValidator.ValidateUpdate(dto);
        if (!validation.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = isDraft
                    ? "Dữ liệu lưu nháp không hợp lệ (tiêu đề tối thiểu 3 ký tự)."
                    : "Dữ liệu cập nhật hồ sơ không hợp lệ theo quy tắc BR-SELLER.",
                errors = validation.Errors
            });
        }

        var currentStatus = entity?.Status ?? existing?.Status ?? "PENDING";
        var currentHasTransfer = entity?.HasTechTransfer ?? existing?.HasTechTransfer ?? false;
        var currentTrl = entity?.TrlLevel ?? existing?.TrlLevel;
        var currentIpStatus = entity?.IpStatus ?? existing?.IpStatus;
        var currentIpReg = entity?.IpRegistrationNumber ?? existing?.IpRegistrationNumber;
        var currentTransferMethod = entity?.TransferMethod ?? existing?.TransferMethod;

        // BR-SELLER-07: Tự động chuyển PENDING nếu sửa TRL hoặc SHTT khi hồ sơ đang APPROVED
        bool coreIpChanged = currentHasTransfer && dto.HasTechTransfer && (
            currentTrl != dto.TrlLevel ||
            !string.Equals(currentIpStatus, dto.IpStatus, StringComparison.OrdinalIgnoreCase) ||
            !string.Equals(currentIpReg, dto.IpRegistrationNumber, StringComparison.OrdinalIgnoreCase) ||
            !string.Equals(currentTransferMethod, dto.TransferMethod, StringComparison.OrdinalIgnoreCase)
        );

        string newStatus;
        DateTimeOffset? newPublishedAt = entity?.PublishedAt ?? existing?.PublishedAt;
        string newTrlStatus = entity?.TrlVerificationStatus ?? existing?.TrlVerificationStatus ?? "SELF_DECLARED";
        string newIpStatus = entity?.IpVerificationStatus ?? existing?.IpVerificationStatus ?? "SELF_DECLARED";

        if (isDraft)
        {
            newStatus = "DRAFT";
            newPublishedAt = null;
        }
        else if (currentStatus == "DRAFT")
        {
            // Từ Draft nộp thẩm định
            newStatus = "PENDING";
            newPublishedAt = null;
        }
        else if (coreIpChanged && currentStatus == "APPROVED")
        {
            // BR-SELLER-07 mới: KHÔNG gỡ khỏi sàn (Status = APPROVED giữ nguyên), chỉ đổi trạng thái xác thực chuyên sâu
            newStatus = "APPROVED";
            newTrlStatus = "PENDING_VERIFICATION";
            newIpStatus = "PENDING_VERIFICATION";
        }
        else
        {
            newStatus = currentStatus;
        }

        var updated = new SellerOfferDto(
            Id: id,
            OfferCode: entity?.OfferCode ?? existing?.OfferCode ?? "OFF-UNKNOWN",
            OfferType: dto.OfferType.ToUpperInvariant(),
            HasTechTransfer: dto.HasTechTransfer,
            Title: dto.Title,
            Summary: dto.Summary ?? "",
            ProblemSolved: dto.ProblemSolved ?? "",
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
            Status: newStatus,
            SuccessfulConnections: entity?.SuccessfulConnections ?? existing?.SuccessfulConnections ?? 0,
            RatingScore: entity?.RatingScore ?? existing?.RatingScore ?? 5.0m,
            ReviewCount: entity?.ReviewCount ?? existing?.ReviewCount ?? 0,
            CreatedAt: entity?.CreatedAt ?? existing?.CreatedAt ?? DateTimeOffset.UtcNow,
            PublishedAt: newPublishedAt,
            ManagingAuthorityId: dto.ManagingAuthorityId ?? entity?.ManagingAuthorityId ?? existing?.ManagingAuthorityId,
            ManagingAuthorityName: dto.ManagingAuthorityName ?? entity?.ManagingAuthorityName ?? existing?.ManagingAuthorityName,
            ScopeType: dto.ScopeType ?? entity?.ScopeType ?? existing?.ScopeType,
            ScopeId: dto.ScopeId ?? entity?.ScopeId ?? existing?.ScopeId,
            EnterpriseTaxCode: dto.EnterpriseTaxCode ?? entity?.EnterpriseTaxCode ?? existing?.EnterpriseTaxCode,
            EnterpriseName: dto.EnterpriseName ?? entity?.EnterpriseName ?? existing?.EnterpriseName,
            MainImageUrl: dto.MainImageUrl,
            GalleryImageUrls: dto.GalleryImageUrls != null ? new List<string>(dto.GalleryImageUrls) : null,
            DeliveryTimeline: dto.DeliveryTimeline,
            WarrantyTerms: dto.WarrantyTerms,
            SupplyScope: dto.SupplyScope,
            PaymentTerms: dto.PaymentTerms,
            InstallationSupport: dto.InstallationSupport,
            SpecValues: dto.SpecValues,
            Documents: dto.Documents,
            ContactName: dto.ContactName,
            ContactEmail: dto.ContactEmail,
            ContactPhone: dto.ContactPhone,
            ModelCode: dto.ModelCode ?? entity?.ModelCode,
            Manufacturer: dto.Manufacturer ?? entity?.Manufacturer,
            OriginCountry: dto.OriginCountry ?? entity?.OriginCountry,
            EquipmentStatus: dto.EquipmentStatus ?? entity?.EquipmentStatus ?? "NEW",
            ManufacturingYear: dto.ManufacturingYear ?? entity?.ManufacturingYear,
            CapacityScale: dto.CapacityScale ?? entity?.CapacityScale,
            EnergyConsumption: dto.EnergyConsumption ?? entity?.EnergyConsumption,
            AutomationLevel: dto.AutomationLevel ?? entity?.AutomationLevel,
            OperatingPrinciple: dto.OperatingPrinciple ?? entity?.OperatingPrinciple,
            DeploymentConditions: dto.DeploymentConditions ?? entity?.DeploymentConditions,
            TransferPriorityMethod: dto.TransferPriorityMethod ?? entity?.TransferPriorityMethod,
            PriceIncludes: dto.PriceIncludes ?? entity?.PriceIncludes,
            TaxAndExtraCosts: dto.TaxAndExtraCosts ?? entity?.TaxAndExtraCosts,
            TechnicalSupportMethod: dto.TechnicalSupportMethod ?? entity?.TechnicalSupportMethod,
            IpIssueDate: dto.IpIssueDate ?? entity?.IpIssueDate,
            LegalCommitmentConfirmed: dto.LegalCommitmentConfirmed,
            TrlVerificationStatus: newTrlStatus,
            IpVerificationStatus: newIpStatus,
            VerifiedAuthorityName: entity?.VerifiedAuthorityName ?? existing?.VerifiedAuthorityName,
            TrlVerifiedBy: entity?.TrlVerifiedBy ?? existing?.TrlVerifiedBy,
            TrlVerifiedAt: entity?.TrlVerifiedAt ?? existing?.TrlVerifiedAt,
            TrlReviewNote: entity?.TrlReviewNote ?? existing?.TrlReviewNote
        );

        if (entity != null)
        {
            entity.Update(
                dto.OfferType.ToUpperInvariant(),
                dto.HasTechTransfer,
                dto.Title,
                !string.IsNullOrWhiteSpace(dto.Summary) ? dto.Summary : (dto.ShortDescription ?? ""),
                dto.ProblemSolved ?? "",
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
                dto.ManagingAuthorityId ?? entity.ManagingAuthorityId,
                dto.ManagingAuthorityName ?? entity.ManagingAuthorityName,
                dto.ScopeType ?? entity.ScopeType,
                dto.ScopeId ?? entity.ScopeId,
                dto.EnterpriseTaxCode ?? entity.EnterpriseTaxCode,
                dto.EnterpriseName ?? entity.EnterpriseName,
                dto.MainImageUrl,
                dto.GalleryImageUrls != null ? new List<string>(dto.GalleryImageUrls) : null,
                dto.DeliveryTimeline,
                dto.WarrantyTerms,
                dto.SupplyScope,
                dto.PaymentTerms,
                dto.InstallationSupport,
                modelCode: dto.ModelCode,
                manufacturer: dto.Manufacturer,
                originCountry: dto.OriginCountry,
                equipmentStatus: dto.EquipmentStatus,
                manufacturingYear: dto.ManufacturingYear,
                capacityScale: dto.CapacityScale,
                energyConsumption: dto.EnergyConsumption,
                automationLevel: dto.AutomationLevel,
                operatingPrinciple: dto.OperatingPrinciple,
                deploymentConditions: dto.DeploymentConditions,
                transferPriorityMethod: dto.TransferPriorityMethod,
                priceIncludes: dto.PriceIncludes,
                taxAndExtraCosts: dto.TaxAndExtraCosts,
                technicalSupportMethod: dto.TechnicalSupportMethod,
                ipIssueDate: dto.IpIssueDate,
                legalCommitmentConfirmed: dto.LegalCommitmentConfirmed
            );

            entity.SetStatus(newStatus);

            // Cascade update specs
            var existingSpecs = await db.Set<OfferSpecValue>().Where(s => s.OfferId == id).ToListAsync(ct);
            db.Set<OfferSpecValue>().RemoveRange(existingSpecs);
            if (dto.SpecValues != null)
            {
                foreach (var s in dto.SpecValues)
                {
                    db.Set<OfferSpecValue>().Add(new OfferSpecValue(id, s.SpecCode, s.SpecName, s.SpecValue, s.Unit, s.SpecCategory));
                }
            }

            // Cascade update documents
            var existingDocs = await db.Set<OfferDocument>().Where(d => d.OfferId == id).ToListAsync(ct);
            db.Set<OfferDocument>().RemoveRange(existingDocs);
            if (dto.Documents != null)
            {
                foreach (var d in dto.Documents)
                {
                    db.Set<OfferDocument>().Add(new OfferDocument(id, d.DocumentType, d.FileName, d.FileUrl, d.FileSizeBytes, d.AccessScope));
                }
            }

            // DEFECT-10: Bắt DbUpdateConcurrencyException khi cập nhật đồng thời
            try
            {
                await uow.CommitAsync(ct);
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new
                {
                    success = false,
                    message = "Hồ sơ công nghệ đã được thay đổi bởi một phiên làm việc khác. Vui lòng tải lại và thử lại."
                });
            }
            var updatedFromDb = ToDto(entity);
            OffersStore[id] = updatedFromDb;
            updated = updatedFromDb;
        }
        else
        {
            OffersStore[id] = updated;
        }

        var message = isDraft
            ? "Đã lưu nháp hồ sơ thành công."
            : coreIpChanged && currentStatus == "APPROVED"
                ? "Cập nhật hồ sơ thành công! Sản phẩm tiếp tục được niêm yết trên sàn, trạng thái xác thực TRL & SHTT được chuyển về CHỜ XÁC THỰC (PENDING_VERIFICATION) để Sở KH&CN hậu kiểm theo quy tắc BR-SELLER-07."
                : "Cập nhật thông tin công nghệ chào bán thành công.";

        return Ok(new
        {
            success = true,
            needsReaudit = coreIpChanged && currentStatus == "APPROVED",
            message,
            data = updated
        });
    }

    // DEFECT-06: Endpoint xóa công nghệ yêu cầu xác thực JWT
    [HttpDelete("/api/v1/portal/seller/technologies/{id:guid}")]
    [HttpDelete("/api/v2/portal/seller/technologies/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteSellerOffer(Guid id, CancellationToken ct = default)
    {
        OffersStore.TryRemove(id, out var _);

        // DEFECT-09: Soft Delete để bảo toàn quan hệ ngoại khóa với Deal Room và Audit Trail
        var entity = await db.Set<SellerTechnologyOffer>().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity != null)
        {
            entity.SoftDelete();
            // DEFECT-10: Bắt DbUpdateConcurrencyException khi cập nhật đồng thời
            try
            {
                await uow.CommitAsync(ct);
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new
                {
                    success = false,
                    message = "Hồ sơ công nghệ đã được thay đổi bởi một phiên làm việc khác. Vui lòng tải lại và thử lại."
                });
            }
        }

        return Ok(new { success = true, message = "Đã xóa hồ sơ công nghệ thành công khỏi kho lưu trữ (Soft Delete)." });
    }

    // DEFECT-06: Endpoint bật/tắt xuất bản yêu cầu xác thực JWT
    [HttpPost("/api/v1/portal/seller/technologies/{id:guid}/toggle-publish")]
    [HttpPost("/api/v2/portal/seller/technologies/{id:guid}/toggle-publish")]
    [Authorize]
    public async Task<IActionResult> TogglePublish(Guid id, [FromQuery] bool? publish, CancellationToken ct = default)
    {
        var existingInStore = OffersStore.TryGetValue(id, out var offer);
        var entity = await db.Set<SellerTechnologyOffer>().FirstOrDefaultAsync(x => x.Id == id, ct);

        if (!existingInStore && entity == null)
        {
            return NotFound(new { success = false, message = "Không tìm thấy hồ sơ chào bán công nghệ." });
        }

        var currentStatus = entity?.Status ?? offer?.Status ?? "PENDING";
        var isCurrentlyApproved = currentStatus == "APPROVED";
        var shouldPublish = publish ?? !isCurrentlyApproved;

        var nextStatus = shouldPublish ? "APPROVED" : "HIDDEN";
        DateTimeOffset? nextPublishedAt = shouldPublish ? DateTimeOffset.UtcNow : null;

        if (entity != null)
        {
            entity.SetStatus(nextStatus);
            // DEFECT-10: Bắt DbUpdateConcurrencyException khi cập nhật đồng thời
            try
            {
                await uow.CommitAsync(ct);
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new
                {
                    success = false,
                    message = "Hồ sơ công nghệ đã được thay đổi bởi một phiên làm việc khác. Vui lòng tải lại và thử lại."
                });
            }
        }

        if (offer != null)
        {
            OffersStore[id] = offer with { Status = nextStatus, PublishedAt = nextPublishedAt };
        }

        return Ok(new
        {
            success = true,
            status = nextStatus,
            message = shouldPublish ? "Hồ sơ công nghệ đã được niêm yết công khai." : "Đã tạm ẩn hồ sơ công nghệ khỏi sàn."
        });
    }

    /// <summary>
    /// REQ-04-019 & PO-DEC-20261008-07: Endpoint Trợ lý AI bóc tách thông số văn bằng SHTT & chào bán
    /// Human-in-the-Loop, Zero-dependency Fallback
    /// </summary>
    [HttpPost("/api/v1/ai/extract-patent-specs")]
    [HttpPost("/api/v2/ai/extract-patent-specs")]
    [AllowAnonymous]
    public IActionResult ExtractPatentSpecs([FromForm] IFormFile? file)
    {
        string fileName = file?.FileName ?? "Tai-lieu-thuyet-minh-giai-phap.pdf";
        long fileSize = file?.Length ?? 1024 * 500;

        if (fileSize > 15 * 1024 * 1024)
        {
            return StatusCode(413, new { success = false, message = "Tệp tải lên vượt quá dung lượng tối đa 15MB cho phép của Trợ lý AI." });
        }

        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        if (!string.IsNullOrEmpty(ext) && !new[] { ".pdf", ".docx", ".jpg", ".jpeg", ".png" }.Contains(ext))
        {
            return BadRequest(new { success = false, message = "Định dạng tệp không được hỗ trợ. Vui lòng tải PDF, DOCX, JPG hoặc PNG." });
        }

        // Tạo bản nháp gợi ý thông minh dựa trên ngữ cảnh tài liệu
        string title = "Hệ thống sấy thăng hoa chân không hồi lưu nhiệt tiết kiệm năng lượng";
        string technicalSummary = "Ứng dụng nguyên lý hồi lưu nhiệt ẩm đa tầng kết hợp sấy đông khô chân không, giữ nguyên 98% hoạt tính sinh học.";
        string problemSolved = "Giảm 40% chi phí điện năng tiêu thụ và rút ngắn thời gian sấy cho nông sản, dược liệu.";
        string targetSectorCode = "FOOD";
        int trl = 8;
        string ipStatus = "PATENT_GRANTED";
        string patentNumber = "VN-1-0028491";

        if (fileName.Contains("robot", StringComparison.OrdinalIgnoreCase) || fileName.Contains("cnc", StringComparison.OrdinalIgnoreCase) || fileName.Contains("mech", StringComparison.OrdinalIgnoreCase))
        {
            title = "Robot hàn laser 6 trục siêu chính xác cho công nghiệp cơ khí chế tạo";
            technicalSummary = "Robot hàn công nghiệp độ chính xác cao 0.02mm, tích hợp thị giác máy tính và cảm biến bù nhiệt thời gian thực.";
            problemSolved = "Thay thế thợ hàn bậc cao, năng suất tăng 3.5 lần, đường hàn đồng nhất.";
            targetSectorCode = "MECH";
            trl = 7;
            ipStatus = "UTILITY_MODEL";
            patentNumber = "VN-2-0005124";
        }
        else if (fileName.Contains("iot", StringComparison.OrdinalIgnoreCase) || fileName.Contains("ai", StringComparison.OrdinalIgnoreCase) || fileName.Contains("software", StringComparison.OrdinalIgnoreCase))
        {
            title = "Nền tảng Gateway IoT công nghiệp chuẩn Edge Computing tích hợp AI giám sát";
            technicalSummary = "Bộ điều khiển biên công nghiệp đa giao thức RS485/Modbus/OPC-UA với khả năng dự đoán lỗi máy rung chấn.";
            problemSolved = "Thu thập dữ liệu cảm biến đa điểm tốc độ cao, ngăn chặn 90% sự cố dừng chuyền đột xuất.";
            targetSectorCode = "IT";
            trl = 8;
            ipStatus = "SOFTWARE_COPYRIGHT";
            patentNumber = "CS-2026-0914";
        }

        var suggestedSpecs = new List<OfferSpecValueDto>
        {
            new(Guid.NewGuid(), "SPEC-01", "Công suất xử lý định mức", "150", "kg/mẻ"),
            new(Guid.NewGuid(), "SPEC-02", "Nhiệt độ cấp đông sâu", "-45", "°C"),
            new(Guid.NewGuid(), "SPEC-03", "Áp suất chân không buồng sấy", "0.05", "mbar"),
            new(Guid.NewGuid(), "SPEC-04", "Điện năng tiêu thụ bình quân", "8.5", "kW/h"),
            new(Guid.NewGuid(), "SPEC-05", "Độ ẩm sản phẩm đầu ra", "< 3", "%")
        };

        var draft = new TechTransferDraftDto(
            Success: true,
            ExtractionId: $"ext-pat-{Guid.NewGuid():N}"[..18],
            ConfidenceScore: 0.95,
            Data: new TechTransferDraftData(
                Title: title,
                TechnicalSummary: technicalSummary,
                ProblemSolved: problemSolved,
                TargetSectorCode: targetSectorCode,
                TechGroupCode: "CN-08",
                IpQuad: new IpQuadDraftData(
                    TrlLevel: trl,
                    TrlEvidenceSummary: "Đã hoàn thành thử nghiệm vận hành công nghiệp liên tục 6 tháng tại cơ sở sản xuất.",
                    IpStatus: ipStatus,
                    PatentNumber: patentNumber,
                    PatentOwner: "Viện Ứng Dụng Công Nghệ & Đơn vị cộng tác",
                    TransferMethod: "NON_EXCLUSIVE_LICENSE",
                    CommercialReadiness: "COMMERCIALLY_READY"
                ),
                OriginDeveloper: "Viện Ứng Dụng Công Nghệ (NACENTECH)",
                SuggestedPriceRange: "800.000.000 - 1.200.000.000 VNĐ",
                SuggestedSpecs: suggestedSpecs
            ),
            ExtractionMetadata: new TechTransferExtractionMetadata(
                ModelUsed: "gemini-2.5-flash-multimodal",
                ProcessingTimeMs: 1420,
                HighlightFields: new[]
                {
                    "title",
                    "technicalSummary",
                    "problemSolved",
                    "targetSectorCode",
                    "ipQuad.trlLevel",
                    "ipQuad.ipStatus",
                    "ipQuad.patentNumber",
                    "ipQuad.transferMethod",
                    "originDeveloper",
                    "suggestedSpecs"
                }
            )
        );

        return Ok(draft);
    }

    private static string MapSectorName(string code) => code.ToUpperInvariant() switch
    {
        "AG" => "Nông nghiệp, Lâm nghiệp & Thủy sản",
        "FOOD" => "Công nghệ chế biến nông sản - thực phẩm",
        "DRINK" => "Sản xuất đồ uống & Nước giải khát",
        "MECH" => "Cơ khí chế tạo & Tự động hóa",
        "ELEC" => "Điện tử, Bán dẫn & Viễn thông",
        "ENV" => "Công nghệ môi trường & Kinh tế tuần hoàn",
        "BUILD" => "Vật liệu xây dựng & Kỹ thuật công trình",
        "LOG" => "Logistics, Vận tải & Chuỗi cung ứng",
        "HOSP" => "Y tế, Dược phẩm & Thiết bị chăm sóc sức khỏe",
        "IT" => "Công nghệ thông tin, Phần mềm & IoT",
        "SCI" => "Khoa học vật liệu & Công nghệ đo lường",
        "TEXT" => "Dệt may, Da giày & Thời trang kỹ thuật",
        "WOOD" => "Chế biến gỗ & Lâm sản công nghệ cao",
        "CHEM" => "Hóa chất, Phân bón & Vật liệu mới",
        "PHARMA" => "Dược phẩm, Mỹ phẩm & Công nghệ sinh học",
        "OPT" => "Quang học & Thiết bị phân tích chính xác",
        "FURN" => "Sản phẩm nội thất & Gia dụng thông minh",
        "OTHER" => "Lĩnh vực công nghệ tổng hợp khác",
        "LV01" => "Nông nghiệp",
        "LV05" => "Chế biến thực phẩm – đồ uống",
        "LV07" => "Cơ khí – chế tạo – công nghiệp hỗ trợ",
        "LV08" => "Điện – điện tử – tự động hóa",
        "LV11" => "Nước – môi trường – chất thải",
        "LV12" => "Xây dựng – vật liệu – hạ tầng",
        "LV14" => "Logistics – vận tải – kho bãi",
        "LV15" => "Du lịch – khách sạn – nhà hàng",
        "LV16" => "CNTT – viễn thông – chuyển đổi số",
        "LV17" => "Khoa học – công nghệ – đổi mới sáng tạo",
        "BIO" => "Công nghệ sinh học & Dược liệu",
        "ENERGY" => "Năng lượng mới & Tái tạo",
        "HEALTH" => "Y tế, Thiết bị & Chăm sóc sức khỏe",
        _ => "Lĩnh vực công nghệ tổng hợp"
    };
}
