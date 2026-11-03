using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using NacenTech.Modules.Blockchain.Infrastructure.Cryptography;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

public class BlockchainCanonicalJsonTests
{
    [Fact]
    public void Reordered_keys_produce_identical_canonical_json_and_sha256()
    {
        // Payload 1
        var json1 = """
        {
            "zeta": 100,
            "alpha": "hello",
            "beta": true
        }
        """;

        // Payload 2 với thứ tự key đảo lộn và khoảng trắng khác nhau
        var json2 = """{"beta":true,"zeta":100,"alpha":"hello"}""";

        var canonical1 = CanonicalJsonSerializer.Serialize(json1);
        var canonical2 = CanonicalJsonSerializer.Serialize(json2);

        canonical1.ShouldBe("""{"alpha":"hello","beta":true,"zeta":100}""");
        canonical2.ShouldBe(canonical1);

        var hash1 = CanonicalJsonSerializer.ComputeSha256Hex(json1);
        var hash2 = CanonicalJsonSerializer.ComputeSha256Hex(json2);

        hash1.ShouldBe(hash2);
    }

    [Fact]
    public void Nested_objects_and_arrays_are_canonically_sorted()
    {
        var complex1 = """
        {
            "details": {
                "score": 85.5,
                "author": "Dr. Nguyen",
                "active": true
            },
            "tags": ["ai", "iot", "biotech"],
            "code": "TECH-001"
        }
        """;

        var complex2 = """
        {
            "code": "TECH-001",
            "tags": ["ai", "iot", "biotech"],
            "details": {
                "active": true,
                "score": 85.5,
                "author": "Dr. Nguyen"
            }
        }
        """;

        var c1 = CanonicalJsonSerializer.Serialize(complex1);
        var c2 = CanonicalJsonSerializer.Serialize(complex2);

        c1.ShouldBe(c2);
        c1.ShouldBe("""{"code":"TECH-001","details":{"active":true,"author":"Dr. Nguyen","score":85.5},"tags":["ai","iot","biotech"]}""");
    }

    [Fact]
    public void Vietnamese_unicode_characters_are_preserved_without_unnecessary_escapes()
    {
        var viJson = """
        {
            "tieuDe": "Hệ thống Cảm biến Quang học NacenTech",
            "moTa": "Độ chính xác cao, ứng dụng cho Nông nghiệp công nghệ cao",
            "tacGia": "PGS. TS. Trần Văn Bình"
        }
        """;

        var canonical = CanonicalJsonSerializer.Serialize(viJson);
        canonical.ShouldContain("Hệ thống Cảm biến Quang học NacenTech");
        canonical.ShouldContain("PGS. TS. Trần Văn Bình");
        canonical.ShouldStartWith("{\"moTa\":");
    }

    [Fact]
    public void Control_characters_and_quotes_are_properly_escaped()
    {
        var jsonWithEscapes = new
        {
            notes = "Dòng 1\nDòng 2\tCách tab và \"ngoặc kép\" kèm dấu gạch chéo \\"
        };

        var canonical = CanonicalJsonSerializer.Serialize(jsonWithEscapes);
        canonical.ShouldContain("\\n");
        canonical.ShouldContain("\\t");
        canonical.ShouldContain("\\\"");
        canonical.ShouldContain("\\\\");
    }

    [Fact]
    public void Five_complex_business_payloads_have_deterministic_sha256()
    {
        // 1. Chào bán công nghệ (Technology Offer)
        var offerA = new
        {
            offerId = "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            code = "TECH-AI-2026",
            title = "Hệ thống AI Phân tích Ảnh vệ tinh",
            price = 500000000m,
            owner = "Viện Công nghệ Vũ trụ",
            currency = "VND"
        };
        var offerB = new
        {
            currency = "VND",
            title = "Hệ thống AI Phân tích Ảnh vệ tinh",
            price = 500000000m,
            owner = "Viện Công nghệ Vũ trụ",
            code = "TECH-AI-2026",
            offerId = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
        };
        CanonicalJsonSerializer.ComputeSha256Hex(offerA).ShouldBe(CanonicalJsonSerializer.ComputeSha256Hex(offerB));

        // 2. Biên bản ghi nhớ phòng giao dịch (Deal Room MOU)
        var mouA = new
        {
            mouCode = "MOU-2026-0042",
            parties = new[] { "Doanh nghiệp A", "Viện B" },
            depositAmount = 50000000m,
            effectiveDate = "2026-11-01T00:00:00Z"
        };
        var mouB = new
        {
            effectiveDate = "2026-11-01T00:00:00Z",
            depositAmount = 50000000m,
            parties = new[] { "Doanh nghiệp A", "Viện B" },
            mouCode = "MOU-2026-0042"
        };
        CanonicalJsonSerializer.ComputeSha256Hex(mouA).ShouldBe(CanonicalJsonSerializer.ComputeSha256Hex(mouB));

        // 3. Kết quả thẩm định TT17 (Assessment Score)
        var tt17A = new
        {
            assessmentCode = "TT17-2026-001",
            totalScore = 88.5,
            criteria = new[] { 20, 25, 23.5, 20 },
            verdict = "QUALIFIED"
        };
        var tt17B = new
        {
            verdict = "QUALIFIED",
            criteria = new[] { 20, 25, 23.5, 20 },
            totalScore = 88.5,
            assessmentCode = "TT17-2026-001"
        };
        CanonicalJsonSerializer.ComputeSha256Hex(tt17A).ShouldBe(CanonicalJsonSerializer.ComputeSha256Hex(tt17B));

        // 4. Bằng sáng chế sở hữu trí tuệ (Patent IP)
        var patentA = new
        {
            patentNumber = "VN-PAT-2026-99",
            ipcClasses = new[] { "G06F", "H04L" },
            inventors = new[] { "Nguyen Van A", "Tran Thi B" },
            grantedYear = 2026
        };
        var patentB = new
        {
            grantedYear = 2026,
            inventors = new[] { "Nguyen Van A", "Tran Thi B" },
            ipcClasses = new[] { "G06F", "H04L" },
            patentNumber = "VN-PAT-2026-99"
        };
        CanonicalJsonSerializer.ComputeSha256Hex(patentA).ShouldBe(CanonicalJsonSerializer.ComputeSha256Hex(patentB));

        // 5. Nhật ký giám sát & kiểm toán bảo chứng
        var auditA = new
        {
            action = "ANCHOR_REQUEST",
            actorId = "usr-01",
            metadata = new { ip = "127.0.0.1", node = "node-hanoi-01" },
            timestamp = 1793664000
        };
        var auditB = new
        {
            timestamp = 1793664000,
            metadata = new { node = "node-hanoi-01", ip = "127.0.0.1" },
            actorId = "usr-01",
            action = "ANCHOR_REQUEST"
        };
        CanonicalJsonSerializer.ComputeSha256Hex(auditA).ShouldBe(CanonicalJsonSerializer.ComputeSha256Hex(auditB));
    }
}
