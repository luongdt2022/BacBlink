using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
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

public sealed class LocationItemDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "AREA";
    public string? AreaCode { get; set; }
    public string? Province { get; set; }
    public string? Region { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

[Route("api/v1/master-data")]
public sealed class MasterDataControllers(ITaxonomyService taxonomy) : V1ControllerBase
{
    private static readonly Regex IndSectorCodeRegex = new("^IND_[A-Z0-9_]+$", RegexOptions.Compiled);

    private static readonly List<MatrixPairDto> StaticMatrix = new()
    {
        new MatrixPairDto { FieldCode = "IND_ELEC", TechCode = "CN04", TechName = "Vi mạch, bán dẫn và linh kiện điện tử chính xác", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_ELEC", TechCode = "CN05", TechName = "IoT và cảm biến giám sát dây chuyền SMT", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_ELEC", TechCode = "CN06", TechName = "AI thị giác máy tính kiểm tra lỗi bản mạch (AOI)", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_ELEC", TechCode = "CN38", TechName = "Đo lường – kiểm định phòng sạch & EMC", RatingStars = 4, Weight = 0.8 },

        new MatrixPairDto { FieldCode = "IND_MECH", TechCode = "CN01", TechName = "Gia công CNC 5 trục & Robot cấp phôi", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_MECH", TechCode = "CN02", TechName = "Tự động hóa chế tạo khuôn mẫu chính xác", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_MECH", TechCode = "CN36", TechName = "Công nghệ in 3D kim loại & tạo mẫu nhanh", RatingStars = 4, Weight = 0.8 },
        new MatrixPairDto { FieldCode = "IND_MECH", TechCode = "CN38", TechName = "Đo lường CMM & kiểm định dung sai chính xác", RatingStars = 5, Weight = 1.0 },

        new MatrixPairDto { FieldCode = "IND_AUTO", TechCode = "CN01", TechName = "Robot công nghiệp & Cánh tay gắp đa trục", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_AUTO", TechCode = "CN02", TechName = "Hệ thống điều khiển SCADA / PLC / DCS", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_AUTO", TechCode = "CN03", TechName = "Robot hàn, lắp ráp và AGV/AMR nội xưởng", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_AUTO", TechCode = "CN06", TechName = "AI điều phối dây chuyền Smart Factory", RatingStars = 4, Weight = 0.8 },

        new MatrixPairDto { FieldCode = "IND_PLAS", TechCode = "CN02", TechName = "Tự động hóa dây chuyền ép phun & thổi màng", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_PLAS", TechCode = "CN19", TechName = "Vật liệu polymer kỹ thuật & phụ gia chịu nhiệt", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_PLAS", TechCode = "CN27", TechName = "Tiết kiệm năng lượng gia nhiệt & làm mát khuôn", RatingStars = 4, Weight = 0.8 },
        new MatrixPairDto { FieldCode = "IND_PLAS", TechCode = "CN30", TechName = "Công nghệ tái chế nhựa & sản xuất sạch hơn", RatingStars = 5, Weight = 1.0 },

        new MatrixPairDto { FieldCode = "IND_MAT", TechCode = "CN19", TechName = "Vật liệu mới siêu nhẹ, hợp kim & nanocomposite", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_MAT", TechCode = "CN20", TechName = "Công nghệ nano & xử lý bề mặt kim loại", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_MAT", TechCode = "CN36", TechName = "Chế tạo vật liệu phụ trợ & linh kiện nội địa hóa", RatingStars = 4, Weight = 0.8 },
        new MatrixPairDto { FieldCode = "IND_MAT", TechCode = "CN38", TechName = "Thử nghiệm cơ lý & kiểm định chất lượng vật liệu", RatingStars = 5, Weight = 1.0 },

        new MatrixPairDto { FieldCode = "IND_IT", TechCode = "CN06", TechName = "Trí tuệ nhân tạo – AI Platform công nghiệp", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_IT", TechCode = "CN07", TechName = "Dữ liệu lớn – Big Data & phân tích vận hành", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_IT", TechCode = "CN09", TechName = "Phần mềm quản trị sản xuất MES / ERP / QMS", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_IT", TechCode = "CN33", TechName = "An toàn thông tin & an ninh mạng OT/IT", RatingStars = 5, Weight = 1.0 },

        new MatrixPairDto { FieldCode = "IND_GREEN", TechCode = "CN22", TechName = "Công nghệ xử lý khí thải & môi trường công nghiệp", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_GREEN", TechCode = "CN23", TechName = "Xử lý nước thải tuần hoàn & màng lọc MBR", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_GREEN", TechCode = "CN25", TechName = "Điện mặt trời áp mái & lưu trữ năng lượng sạch", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_GREEN", TechCode = "CN39", TechName = "Quan trắc phát thải tự động & kiểm kê carbon ESG", RatingStars = 5, Weight = 1.0 },

        new MatrixPairDto { FieldCode = "IND_LOG", TechCode = "CN05", TechName = "IoT định vị, giám sát đội xe & container lạnh", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_LOG", TechCode = "CN06", TechName = "AI tối ưu hóa tuyến đường & điều phối chuỗi cung ứng", RatingStars = 5, Weight = 1.0 },
        new MatrixPairDto { FieldCode = "IND_LOG", TechCode = "CN12", TechName = "Truy xuất nguồn gốc & chứng từ số chuỗi cung ứng", RatingStars = 4, Weight = 0.8 },
        new MatrixPairDto { FieldCode = "IND_LOG", TechCode = "CN34", TechName = "Hệ thống quản lý kho thông minh WMS / AS-RS", RatingStars = 5, Weight = 1.0 }
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

    [HttpGet("locations")]
    [AllowAnonymous]
    public async Task<IActionResult> GetLocations([FromQuery] string? type = null, CancellationToken ct = default)
    {
        var terms = await taxonomy.ListAsync(TaxonomyKinds.Location, true, ct);
        var normalizedType = string.IsNullOrWhiteSpace(type) ? null : type.Trim().ToUpperInvariant();

        var locations = terms
            .Where(t => !string.IsNullOrWhiteSpace(t.Code))
            .Select(t =>
            {
                string locType = "AREA";
                string? areaCode = null;
                string? province = "Bắc Ninh";
                string? region = "Bắc Ninh";
                int sortOrder = 999;
                try
                {
                    if (!string.IsNullOrEmpty(t.MetadataJson))
                    {
                        using var doc = System.Text.Json.JsonDocument.Parse(t.MetadataJson);
                        if (doc.RootElement.TryGetProperty("type", out var pType)) locType = (pType.GetString() ?? "AREA").ToUpperInvariant();
                        if (doc.RootElement.TryGetProperty("areaCode", out var pArea)) areaCode = pArea.GetString();
                        if (doc.RootElement.TryGetProperty("province", out var pProv)) province = pProv.GetString();
                        if (doc.RootElement.TryGetProperty("region", out var pReg)) region = pReg.GetString();
                        if (doc.RootElement.TryGetProperty("sortOrder", out var pSort) && pSort.TryGetInt32(out var sVal)) sortOrder = sVal;
                    }
                }
                catch { }

                return new LocationItemDto
                {
                    Id = t.Id,
                    Code = t.Code!,
                    Name = t.Name,
                    Type = locType,
                    AreaCode = areaCode,
                    Province = province,
                    Region = region ?? province,
                    SortOrder = sortOrder,
                    IsActive = t.IsActive
                };
            })
            .Where(l => normalizedType is null || string.Equals(l.Type, normalizedType, StringComparison.OrdinalIgnoreCase))
            .OrderBy(l => l.SortOrder)
            .ThenBy(l => l.Code, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return Ok(new { success = true, data = locations, total = locations.Count });
    }

    [HttpGet("sectors")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSectors(
        [FromQuery] bool includeInactive = false,
        [FromQuery] bool? activeOnly = null,
        CancellationToken ct = default)
    {
        var onlyActive = !includeInactive && (activeOnly ?? true);
        var terms = await taxonomy.ListAsync(TaxonomyKinds.Sector, onlyActive, ct);
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
        if (!IndSectorCodeRegex.IsMatch(normalizedCode))
        {
            return BadRequest(new { success = false, error = "Mã ngành công nghiệp chuẩn BACLINK phải theo định dạng 'IND_*' (Ví dụ: IND_ELEC, IND_MECH...)." });
        }

        var existingSectors = await taxonomy.ListAsync(TaxonomyKinds.Sector, false, ct);
        if (existingSectors.Any(s => string.Equals(s.Code, normalizedCode, StringComparison.OrdinalIgnoreCase)))
        {
            return Conflict(new { success = false, error = $"Mã lĩnh vực '{normalizedCode}' đã tồn tại trong hệ thống. Không thể tạo trùng lặp." });
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
        return StatusCode(201, new { success = true, data = newSector, message = "Đã tạo nhóm ngành công nghiệp BACLINK thành công." });
    }

    [HttpGet("tt17")]
    public async Task<IActionResult> GetTt17Subsectors(CancellationToken ct)
    {
        var terms = await taxonomy.ListAsync(TaxonomyKinds.Category, true, ct);
        var list = terms.Where(t => t.Code?.StartsWith("C.", StringComparison.Ordinal) == true).Select(t =>
        {
            string norm = string.Empty;
            double? profit = null;
            double? va = null;
            int? invest = null;
            try
            {
                if (!string.IsNullOrEmpty(t.MetadataJson))
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(t.MetadataJson);
                    if (doc.RootElement.TryGetProperty("electricityNorm", out var p1)) norm = p1.GetString() ?? string.Empty;
                    if (doc.RootElement.TryGetProperty("profitMargin", out var p2)) profit = p2.GetDouble();
                    if (doc.RootElement.TryGetProperty("valueAddedRatio", out var p3)) va = p3.GetDouble();
                    if (doc.RootElement.TryGetProperty("investmentRateBillionVnd", out var p4)) invest = p4.GetInt32();
                }
            }
            catch { }

            return new Tt17SubsectorDto
            {
                Code = t.Code!,
                Name = t.Name,
                ElectricityNorm = norm,
                ProfitMargin = profit,
                ValueAddedRatio = va,
                InvestmentRateBillionVnd = invest
            };
        }).ToList();
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
    [HttpPost("matrix")]
    [Authorize]
    public IActionResult UpdateMatrixPair([FromBody] UpdateMatrixPairDto dto)
    {
        RequireAdmin();

        if (dto.RatingStars < 1 || dto.RatingStars > 5)
        {
            return BadRequest(new { success = false, error = "Mức độ tương thích (RatingStars) phải từ 1 đến 5 sao." });
        }

        if (dto.Weight < 0.1 || dto.Weight > 1.0)
        {
            return BadRequest(new { success = false, error = "Trọng số thuật toán (Weight) phải nằm trong khoảng từ 0.1 đến 1.0." });
        }

        var normalizedFieldCode = dto.FieldCode?.Trim().ToUpperInvariant() ?? string.Empty;
        var normalizedTechCode = dto.TechCode?.Trim().ToUpperInvariant() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(normalizedFieldCode) || !IndSectorCodeRegex.IsMatch(normalizedFieldCode))
        {
            return BadRequest(new { success = false, error = "Mã ngành (FieldCode) không hợp lệ (phải theo định dạng 'IND_*', ví dụ: IND_ELEC)." });
        }

        if (string.IsNullOrWhiteSpace(normalizedTechCode) || !normalizedTechCode.StartsWith("CN"))
        {
            return BadRequest(new { success = false, error = "Mã nhóm công nghệ (TechCode) không hợp lệ (phải bắt đầu bằng tiền tố 'CN')." });
        }

        var existing = StaticMatrix.FirstOrDefault(m =>
            string.Equals(m.FieldCode, normalizedFieldCode, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(m.TechCode, normalizedTechCode, StringComparison.OrdinalIgnoreCase));

        if (existing is null)
        {
            var newPair = new MatrixPairDto
            {
                FieldCode = normalizedFieldCode,
                TechCode = normalizedTechCode,
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
