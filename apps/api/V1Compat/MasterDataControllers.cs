using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Identity.Application;
using NacenTech.Modules.Policy.Application;

namespace NacenTech.Api.V1Compat;

public sealed class CreateSectorDto
{
    [Required] public string Code { get; set; } = string.Empty;
    [Required] public string Name { get; set; } = string.Empty;
    public string? Tt17Code { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class SectorItemDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Tt17Code { get; set; }
    public string? Description { get; set; }
    public int FilterRuleCount { get; set; }
    public bool IsActive { get; set; }
}

public sealed class Tt17SubsectorDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string ElectricityNorm { get; set; } = string.Empty;
    public double? ProfitMargin { get; set; }
    public double? ValueAddedRatio { get; set; }
    public int? InvestmentRateBillionVnd { get; set; }
}

public sealed class MatrixPairDto
{
    public string FieldCode { get; set; } = string.Empty;
    public string FieldName { get; set; } = string.Empty;
    public string TechCode { get; set; } = string.Empty;
    public string TechName { get; set; } = string.Empty;
    public int RatingStars { get; set; }
    public double Weight { get; set; }
}

public sealed class UpdateMatrixPairDto
{
    [Required] public string FieldCode { get; set; } = string.Empty;
    [Required] public string TechCode { get; set; } = string.Empty;
    [Range(1, 5)] public int RatingStars { get; set; } = 5;
    [Range(0.1, 1.0)] public double Weight { get; set; } = 1.0;
}

public sealed class TaxonomyTreeNodeDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public List<TaxonomyTreeNodeDto> Children { get; set; } = new();
}

public sealed class ExhibitionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FocusArea { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
}

[Route("api/v1/master-data")]
public sealed class MasterDataControllers(ITaxonomyService taxonomy) : V1ControllerBase
{
    private static readonly List<MatrixPairDto> StaticMatrix = new()
    {
        new MatrixPairDto { FieldCode = "LV01", TechCode = "CN05", TechName = "IoT và cảm biến độ ẩm đất", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV01", TechCode = "CN06", TechName = "Trí tuệ nhân tạo – Dự báo sâu bệnh", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV01", TechCode = "CN13", TechName = "GIS – Bản đồ số đất đai", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV01", TechCode = "CN14", TechName = "UAV – Drone phun thuốc", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV01", TechCode = "CN17", TechName = "Công nghệ sau thu hoạch", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV01", TechCode = "CN18", TechName = "Công nghệ bảo quản lạnh CAS", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV01", TechCode = "CN25", TechName = "Năng lượng tái tạo sinh khối", RatingStars = 4, Weight = 0.8 },
        new MatrixPairDto { FieldCode = "LV01", TechCode = "CN28", TechName = "Công nghệ phân bón hữu cơ nano", RatingStars = 5, Weight = 1.0 },

        new MatrixPairDto { FieldCode = "LV05", TechCode = "CN02", TechName = "Tự động hóa dây chuyền đóng gói", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV05", TechCode = "CN05", TechName = "IoT giám sát nhiệt độ kho lạnh", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV05", TechCode = "CN12", TechName = "Truy xuất nguồn gốc Blockchain", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV05", TechCode = "CN16", TechName = "Công nghệ thực phẩm sinh học", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV05", TechCode = "CN17", TechName = "Công nghệ chế biến sau thu hoạch", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV05", TechCode = "CN18", TechName = "Công nghệ sấy thăng hoa chân không", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV05", TechCode = "CN27", TechName = "Tiết kiệm năng lượng chế biến", RatingStars = 4, Weight = 0.8 },
        new MatrixPairDto { FieldCode = "LV05", TechCode = "CN30", TechName = "Sản xuất sạch hơn trong chế biến", RatingStars = 5, Weight = 1.0 },

        new MatrixPairDto { FieldCode = "LV07", TechCode = "CN01", TechName = "Robot công nghiệp & Cánh tay robot", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV07", TechCode = "CN02", TechName = "Tự động hóa gia công cơ khí", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV07", TechCode = "CN03", TechName = "Robot hàn và cắt thông minh", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV07", TechCode = "CN04", TechName = "Điện – điện tử trong chế tạo máy", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV07", TechCode = "CN36", TechName = "Công nghệ in 3D kim loại", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV07", TechCode = "CN38", TechName = "Đo lường – kiểm định chính xác", RatingStars = 5, Weight = 1.0 },

        new MatrixPairDto { FieldCode = "LV08", TechCode = "CN02", TechName = "Hệ thống điều khiển SCADA / PLC", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV08", TechCode = "CN03", TechName = "Robot điều khiển tự động", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV08", TechCode = "CN04", TechName = "Vi mạch và linh kiện điện tử", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV08", TechCode = "CN05", TechName = "IoT và cảm biến công nghiệp", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV08", TechCode = "CN06", TechName = "AI thị giác máy tính công nghiệp", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV08", TechCode = "CN33", TechName = "An toàn an ninh mạng công nghiệp", RatingStars = 5, Weight = 1.0 },

        new MatrixPairDto { FieldCode = "LV11", TechCode = "CN05", TechName = "Cảm biến quan trắc môi trường", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV11", TechCode = "CN22", TechName = "Công nghệ môi trường tiên tiến", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV11", TechCode = "CN23", TechName = "Xử lý nước thải sinh học & màng MBR", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV11", TechCode = "CN24", TechName = "Xử lý chất thải rắn & điện rác", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV11", TechCode = "CN27", TechName = "Thu hồi nhiệt và tiết kiệm năng lượng", RatingStars = 4, Weight = 0.8 },
        new MatrixPairDto { FieldCode = "LV11", TechCode = "CN39", TechName = "Quan trắc tự động liên tục", RatingStars = 5, Weight = 1.0 },

        new MatrixPairDto { FieldCode = "LV12", TechCode = "CN13", TechName = "GIS – Bản đồ số hạ tầng đô thị", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV12", TechCode = "CN14", TechName = "UAV khảo sát địa hình xây dựng", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV12", TechCode = "CN35", TechName = "Mô hình thông tin công trình BIM", RatingStars = 5, Weight = 1.0 },

        new MatrixPairDto { FieldCode = "LV14", TechCode = "CN05", TechName = "IoT định vị và giám sát phương tiện", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV14", TechCode = "CN06", TechName = "AI tối ưu hóa lộ trình vận chuyển", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV14", TechCode = "CN10", TechName = "Hạ tầng thương mại điện tử chuỗi cung ứng", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV14", TechCode = "CN34", TechName = "Hệ thống quản lý kho thông minh WMS", RatingStars = 5, Weight = 1.0 },

        new MatrixPairDto { FieldCode = "LV15", TechCode = "CN06", TechName = "AI chatbot hỗ trợ trải nghiệm khách", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV15", TechCode = "CN10", TechName = "Thương mại điện tử & Đặt dịch vụ trực tuyến", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV15", TechCode = "CN13", TechName = "Bản đồ số du lịch thông minh", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV15", TechCode = "CN14", TechName = "UAV quay phim và quảng bá điểm đến", RatingStars = 4, Weight = 0.8 },

        new MatrixPairDto { FieldCode = "LV16", TechCode = "CN05", TechName = "IoT và thiết bị kết nối mạng", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV16", TechCode = "CN06", TechName = "Trí tuệ nhân tạo – AI Platform", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV16", TechCode = "CN07", TechName = "Dữ liệu lớn – Big Data Analytics", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV16", TechCode = "CN08", TechName = "Điện toán đám mây Cloud Computing", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV16", TechCode = "CN09", TechName = "Phần mềm quản trị doanh nghiệp ERP/MES", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV16", TechCode = "CN10", TechName = "Thương mại điện tử & Thanh toán số", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV16", TechCode = "CN11", TechName = "Công nghệ chuỗi khối Blockchain", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV16", TechCode = "CN33", TechName = "An toàn thông tin và an ninh mạng", RatingStars = 5, Weight = 1.0 },

        new MatrixPairDto { FieldCode = "LV17", TechCode = "CN06", TechName = "AI phục vụ nghiên cứu khoa học", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV17", TechCode = "CN08", TechName = "Nền tảng tính toán hiệu năng cao", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV17", TechCode = "CN15", TechName = "Công nghệ sinh học vi sinh & gen", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV17", TechCode = "CN19", TechName = "Vật liệu mới siêu nhẹ & nanocomposite", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV17", TechCode = "CN20", TechName = "Công nghệ nano chế tạo", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "LV17", TechCode = "CN36", TechName = "In 3D chế tạo nguyên mẫu R&D", RatingStars = 5, Weight = 1.0 }
    };

    private static readonly List<ExhibitionDto> StaticExhibitions = new()
    {
        new ExhibitionDto { Id = 1, Name = "Triển lãm Viễn thông, CNTT & Truyền thông (Vietnam Telecomp)", FocusArea = "Viễn thông, CNTT, Phần mềm", Location = "Hà Nội & TP.HCM", Frequency = "Thường niên 2026" },
        new ExhibitionDto { Id = 2, Name = "Triển lãm Công nghiệp In ấn & Bao bì tại Hà Nội (HanoiPrintPack)", FocusArea = "In ấn, Đóng gói bao bì", Location = "Hà Nội", Frequency = "2026" },
        new ExhibitionDto { Id = 3, Name = "Triển lãm Quốc tế Ngành nhựa và Cao su (HanoiPlas)", FocusArea = "Vật liệu polymer, khuôn đúc", Location = "Hà Nội", Frequency = "2026" },
        new ExhibitionDto { Id = 4, Name = "Triển lãm Quốc tế Logistics Việt Nam (VILOG)", FocusArea = "Chuỗi cung ứng, kho bãi thông minh", Location = "TP.HCM", Frequency = "2026" },
        new ExhibitionDto { Id = 5, Name = "Triển lãm Quốc tế Thủy sản Việt Nam (Vietfish)", FocusArea = "Thủy sản, Công nghệ chế biến lạnh", Location = "TP.HCM", Frequency = "2026" },
        new ExhibitionDto { Id = 6, Name = "Triển lãm Công nghệ Chế biến Thực phẩm (Foodtech)", FocusArea = "Thực phẩm đóng hộp, đồ uống", Location = "Hà Nội", Frequency = "2026" },
        new ExhibitionDto { Id = 7, Name = "Triển lãm Quốc tế Công nghiệp Hóa chất lần thứ 22 (Vinachem)", FocusArea = "Hóa chất công nghiệp, phân bón", Location = "TP.HCM", Frequency = "2026" },
        new ExhibitionDto { Id = 8, Name = "Triển lãm Quốc tế Thực phẩm và Đồ uống 2026 (Vietfood & Beverage)", FocusArea = "Thực phẩm, Đồ uống đóng chai", Location = "Hà Nội", Frequency = "2026" },
        new ExhibitionDto { Id = 9, Name = "Triển lãm Máy móc, Thiết bị, Nguyên phụ liệu Dệt may (VTG)", FocusArea = "Dệt may, Máy may công nghiệp", Location = "TP.HCM", Frequency = "2026" },
        new ExhibitionDto { Id = 10, Name = "Triển lãm Nội thất & Xây dựng Việt Nam (Vietbuild)", FocusArea = "Vật liệu xây dựng, Kiến trúc", Location = "Hà Nội & TP.HCM", Frequency = "2026" },
        new ExhibitionDto { Id = 11, Name = "Triển lãm Quốc tế PCCC & Cứu nạn (Fire Safety & Rescue)", FocusArea = "Phòng cháy chữa cháy, Cứu hộ", Location = "Hà Nội", Frequency = "2026" },
        new ExhibitionDto { Id = 12, Name = "Triển lãm Công nghệ Dệt may Quốc tế (Textile Expo)", FocusArea = "Dệt may, Phụ liệu kỹ thuật", Location = "Hà Nội", Frequency = "2026" },
        new ExhibitionDto { Id = 13, Name = "Triển lãm Nông nghiệp Công nghệ cao (Growtech Vietnam)", FocusArea = "Cơ giới hóa nông nghiệp, Smart Farm", Location = "Hà Nội", Frequency = "2026" },
        new ExhibitionDto { Id = 14, Name = "Triển lãm Thang máy & Giải pháp Tòa nhà Thông minh (Vietnam Elevator Expo)", FocusArea = "Thang máy, Tự động hóa tòa nhà", Location = "TP.HCM", Frequency = "2026" },
        new ExhibitionDto { Id = 15, Name = "Triển lãm Quốc tế Năng lượng Tái tạo & Tiết kiệm Điện (Entech Vietnam)", FocusArea = "Năng lượng mặt trời, Pin lưu trữ", Location = "Hà Nội", Frequency = "2026" }
    };

    [HttpGet("sectors")]
    public async Task<IActionResult> GetSectors([FromQuery] bool activeOnly = false, CancellationToken ct = default)
    {
        var terms = await taxonomy.ListAsync(TaxonomyKinds.Sector, activeOnly, ct);
        var dbSectors = terms.Where(t => !string.IsNullOrEmpty(t.Code)).Select(t =>
        {
            string tt17 = string.Empty;
            string description = string.Empty;
            int filterCount = 0;
            try
            {
                if (!string.IsNullOrEmpty(t.MetadataJson))
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(t.MetadataJson);
                    if (doc.RootElement.TryGetProperty("tt17Code", out var ttProp)) tt17 = ttProp.GetString() ?? tt17;
                    if (doc.RootElement.TryGetProperty("description", out var descriptionProp)) description = descriptionProp.GetString() ?? string.Empty;
                    if (doc.RootElement.TryGetProperty("matrixPairsCount", out var countProp)) filterCount = countProp.GetInt32();
                }
            }
            catch { }
            return new SectorItemDto
            {
                Id = t.Id,
                Code = t.Code!,
                Name = t.Name,
                Tt17Code = tt17,
                Description = description,
                FilterRuleCount = filterCount,
                IsActive = t.IsActive
            };
        }).ToList();

        var list = dbSectors;
        return Ok(new { success = true, data = list, total = list.Count });
    }

    [HttpPost("sectors")]
    [Authorize]
    public async Task<IActionResult> CreateSector([FromBody] CreateSectorDto dto, CancellationToken ct = default)
    {
        RequireAdmin();

        var normalizedCode = dto.Code.Trim().ToUpperInvariant();
        if (!normalizedCode.StartsWith("LV"))
        {
            return BadRequest(new { success = false, error = "Mã ngành chuẩn phải bắt đầu bằng tiền tố 'LV' (Ví dụ: LV01, LV05...)." });
        }

        var metaJson = System.Text.Json.JsonSerializer.Serialize(new { tt17Code = dto.Tt17Code, description = dto.Description });
        var created = await taxonomy.CreateAsync(TaxonomyKinds.Sector, dto.Name, normalizedCode, metaJson, ct);

        var newSector = new SectorItemDto
        {
            Id = created.Id,
            Code = created.Code!,
            Name = created.Name,
            Tt17Code = dto.Tt17Code,
            Description = dto.Description,
            FilterRuleCount = 0,
            IsActive = created.IsActive
        };
        return StatusCode(201, new { success = true, data = newSector, message = "Đã tạo nhóm ngành chuẩn LV thành công." });
    }

    [HttpGet("tt17")]
    public async Task<IActionResult> GetTt17Subsectors(CancellationToken ct)
    {
        var terms = await taxonomy.ListAsync(TaxonomyKinds.Category, true, ct);
        var list = terms.Where(t => t.Code?.StartsWith("C.", StringComparison.Ordinal) == true).Select(t => new Tt17SubsectorDto { Code = t.Code!, Name = t.Name }).ToList();
        return Ok(new { success = true, data = list, total = list.Count });
    }

    [HttpGet("matrix")]
    public async Task<IActionResult> GetMatrix([FromQuery] string? fieldCode, [FromQuery] int minRating = 1, CancellationToken ct = default)
    {
        var sectorNames = (await taxonomy.ListAsync(TaxonomyKinds.Sector, true, ct)).Where(t => !string.IsNullOrWhiteSpace(t.Code)).ToDictionary(t => t.Code!, t => t.Name, StringComparer.OrdinalIgnoreCase);
        var q = StaticMatrix.Where(m => sectorNames.ContainsKey(m.FieldCode)).AsQueryable();
        if (!string.IsNullOrWhiteSpace(fieldCode))
        {
            var code = fieldCode.Trim().ToUpperInvariant();
            q = q.Where(m => m.FieldCode == code);
        }
        if (minRating > 1)
        {
            q = q.Where(m => m.RatingStars >= minRating);
        }
        var list = q.Select(m => new MatrixPairDto { FieldCode = m.FieldCode, FieldName = sectorNames.GetValueOrDefault(m.FieldCode, m.FieldCode), TechCode = m.TechCode, TechName = m.TechName, RatingStars = m.RatingStars, Weight = m.Weight }).ToList();
        return Ok(new { success = true, data = list, total = list.Count });
    }

    [HttpGet("exhibitions")]
    public IActionResult GetExhibitions()
    {
        return Ok(new { success = true, data = StaticExhibitions, total = StaticExhibitions.Count });
    }

    [HttpPut("matrix")]
    [Authorize]
    public IActionResult UpdateMatrixPair([FromBody] UpdateMatrixPairDto dto)
    {
        RequireAdmin();

        var existing = StaticMatrix.FirstOrDefault(m =>
            string.Equals(m.FieldCode, dto.FieldCode, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(m.TechCode, dto.TechCode, StringComparison.OrdinalIgnoreCase));

        if (existing is null)
        {
            var newPair = new MatrixPairDto
            {
                FieldCode = dto.FieldCode.Trim().ToUpperInvariant(),
                TechCode = dto.TechCode.Trim().ToUpperInvariant(),
                RatingStars = dto.RatingStars,
                Weight = dto.Weight
            };
            StaticMatrix.Add(newPair);
            return StatusCode(201, new { success = true, data = newPair, message = "Đã tạo mới cặp quan hệ ma trận thành công." });
        }

        existing.RatingStars = dto.RatingStars;
        existing.Weight = dto.Weight;
        return Ok(new { success = true, data = existing, message = "Đã cập nhật trọng số cặp quan hệ ma trận thành công." });
    }

    [HttpGet("taxonomy-tree")]
    public async Task<IActionResult> GetTaxonomyTree(CancellationToken ct = default)
    {
        var sectors = await taxonomy.ListAsync(TaxonomyKinds.Sector, true, ct);
        var tree = sectors.Where(s => !string.IsNullOrEmpty(s.Code)).Select(s =>
        {
            var node = new TaxonomyTreeNodeDto
            {
                Code = s.Code!,
                Name = s.Name,
                Level = "SECTOR"
            };

            var pairs = StaticMatrix.Where(m => string.Equals(m.FieldCode, s.Code, StringComparison.OrdinalIgnoreCase)).ToList();
            node.Children = pairs.Select(p => new TaxonomyTreeNodeDto
            {
                Code = p.TechCode,
                Name = p.TechName,
                Level = "TECH_GROUP",
                Children = new List<TaxonomyTreeNodeDto>
                {
                    new() { Code = $"{p.TechCode}-ITEM01", Name = $"{p.TechName} TRL 7-9 (Sẵn sàng CG)", Level = "TECH_ITEM" }
                }
            }).ToList();

            return node;
        }).ToList();

        return Ok(new { success = true, data = tree, total = tree.Count });
    }
}
