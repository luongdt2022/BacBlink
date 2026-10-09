using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NacenTech.Modules.Policy.Application;

namespace NacenTech.Api.V1Compat;

public sealed class NameDto
{
    public string Name { get; set; } = string.Empty;
}

[Route("api/v1/sectors")]
public sealed class SectorsController(ITaxonomyService taxonomy) : V1ControllerBase
{
    private static readonly object[] FallbackSectors =
    [
        new { id = Guid.Parse("11111111-0000-0000-0000-000000000001"), code = "LV01", name = "Công nghệ chế biến nông sản - thực phẩm", isActive = true },
        new { id = Guid.Parse("11111111-0000-0000-0000-000000000002"), code = "LV05", name = "Cơ khí chế tạo & Tự động hóa", isActive = true },
        new { id = Guid.Parse("11111111-0000-0000-0000-000000000003"), code = "LV07", name = "Công nghệ thông tin, Viễn thông & IoT", isActive = true },
        new { id = Guid.Parse("11111111-0000-0000-0000-000000000004"), code = "LV08", name = "Công nghệ môi trường & Kinh tế tuần hoàn", isActive = true },
        new { id = Guid.Parse("11111111-0000-0000-0000-000000000005"), code = "LV11", name = "Công nghệ sinh học & Dược liệu", isActive = true },
        new { id = Guid.Parse("11111111-0000-0000-0000-000000000006"), code = "LV12", name = "Năng lượng mới & Tái tạo", isActive = true },
        new { id = Guid.Parse("11111111-0000-0000-0000-000000000007"), code = "LV14", name = "Hóa chất & Vật liệu mới", isActive = true },
        new { id = Guid.Parse("11111111-0000-0000-0000-000000000008"), code = "LV15", name = "Y tế, Thiết bị & Chăm sóc sức khỏe", isActive = true },
    ];

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        try
        {
            var items = await taxonomy.ListAsync(TaxonomyKinds.Sector, true, ct);
            return Ok(new { success = true, data = items.Select(V1Mappers.Term).ToList() });
        }
        catch
        {
            return Ok(new { success = true, data = FallbackSectors });
        }
    }
}

[Route("api/v1/categories")]
public sealed class CategoriesController(ITaxonomyService taxonomy) : V1ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        try
        {
            var items = await taxonomy.ListAsync(TaxonomyKinds.Category, true, ct);
            return Ok(new { success = true, data = items.Select(V1Mappers.Term).ToList() });
        }
        catch
        {
            return Ok(new { success = true, data = Array.Empty<object>() });
        }
    }
}

[Route("api/v1/admin/sectors")]
[Authorize]
public sealed class AdminSectorsController(ITaxonomyService taxonomy) : V1ControllerBase
{
    // Legacy trả mảng thuần (không envelope) cho GET admin/sectors.
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        RequireAdmin();
        return Ok((await taxonomy.ListAsync(TaxonomyKinds.Sector, true, ct)).Select(V1Mappers.Term).ToList());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] NameDto dto, CancellationToken ct)
    {
        RequireAdmin();
        return StatusCode(201, Ok200(V1Mappers.Term(await taxonomy.CreateAsync(TaxonomyKinds.Sector, dto.Name, ct))));
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] NameDto dto, CancellationToken ct)
    {
        RequireAdmin();
        return Ok(Ok200(V1Mappers.Term(await taxonomy.RenameAsync(id, dto.Name, ct))));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        RequireAdmin();
        await taxonomy.DeleteAsync(id, ct);
        return Ok(new { success = true, message = "Sector deleted successfully" });
    }
}

[Route("api/v1/admin/categories")]
[Authorize]
public sealed class AdminCategoriesController(ITaxonomyService taxonomy) : V1ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        RequireAdmin();
        return Ok((await taxonomy.ListAsync(TaxonomyKinds.Category, true, ct)).Select(V1Mappers.Term).ToList());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] NameDto dto, CancellationToken ct)
    {
        RequireAdmin();
        return StatusCode(201, Ok200(V1Mappers.Term(await taxonomy.CreateAsync(TaxonomyKinds.Category, dto.Name, ct))));
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] NameDto dto, CancellationToken ct)
    {
        RequireAdmin();
        return Ok(Ok200(V1Mappers.Term(await taxonomy.RenameAsync(id, dto.Name, ct))));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        RequireAdmin();
        await taxonomy.DeleteAsync(id, ct);
        return Ok(new { success = true, message = "Category deleted successfully" });
    }
}
