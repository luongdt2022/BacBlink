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
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
        => Ok(new { success = true, data = (await taxonomy.ListAsync(TaxonomyKinds.Sector, true, ct)).Select(V1Mappers.Term).ToList() });
}

[Route("api/v1/categories")]
public sealed class CategoriesController(ITaxonomyService taxonomy) : V1ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
        => Ok(new { success = true, data = (await taxonomy.ListAsync(TaxonomyKinds.Category, true, ct)).Select(V1Mappers.Term).ToList() });
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
