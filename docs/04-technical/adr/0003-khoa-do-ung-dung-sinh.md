# ADR-0003: Khoá chính do ứng dụng sinh phải khai báo `ValueGeneratedNever`

- Trạng thái: ACCEPTED
- Ngày: 2026-09-04 (đề xuất), 2026-09-04 (chốt và cài đặt)
- Liên quan: §7.5, MOD-01, MOD-05; sổ lỗi `docs-v2/bug-triage.md` B-32 và B-31

## Bối cảnh

`Entity.Id` được gán ngay ở khai báo thuộc tính:

```csharp
public abstract class Entity
{
    public Guid Id { get; protected set; } = Guid.CreateVersion7();
}
```

Nghĩa là mọi thực thể ra đời đã mang một khoá khác giá trị mặc định. Không cấu hình nào nói với EF rằng
khoá này do ứng dụng sinh, nên EF giữ mặc định `ValueGenerated.OnAdd` cho khoá kiểu Guid. Khi một hàng con
mới được thêm vào tập hợp của một aggregate **đang được theo dõi**, bộ theo dõi thay đổi thấy khoá đã có giá
trị và xếp nó vào nhóm "đã tồn tại" thay vì "mới thêm".

Đo trên bản chạy ngày 2026-09-04, nhật ký PostgreSQL với `log_statement='all'`, khi sửa tiêu đề một tài sản
công nghệ:

```sql
UPDATE technology.technology_assets
   SET current_version_no=$1, updated_at=$2, version=$3
 WHERE id=$4 AND version=$5          -- đúng, sẽ khớp

UPDATE technology.technology_package_versions
   SET created_at=$1, created_by_actor_ref=$2, description=$3,
       technology_asset_id=$4, title=$5, version_no=$6
 WHERE id=$7                          -- $7 là định danh MỚI; không hàng nào mang nó
```

Câu lệnh thứ hai ảnh hưởng 0 hàng. EF ném `DbUpdateConcurrencyException`, `EfUnitOfWork.CommitAsync` bắt
đúng ngoại lệ đó và đổi thành `ConcurrencyException`, nên lỗi hiện ra với người dùng là *"Bản ghi đã bị thay
đổi bởi một yêu cầu khác. Tải lại và thử lại."* — **chỉ vào một nguyên nhân sai**. Cả giao dịch bị cuộn ngược.

Ranh giới đo được rất khớp với việc tạo phiên bản: đổi trạng thái xuất bản hoặc gửi lại đúng tiêu đề cũ trả
200; đổi tiêu đề, đổi phần mô tả, hoặc đổi một đoạn nội dung mật trả 409. Lệnh **tạo mới** không hỏng, vì khi
đó cả đồ thị là mới nên trạng thái "thêm mới" lan xuống hàng con.

Phạm vi rộng hơn một module. Cùng hình dạng ở `demand_brief_versions`, `document_versions`, `case_parties`,
`case_holds`, `decision_records`, `assignments`, `access_grants`, `match_candidates` — mọi aggregate có tập
hợp con đều đang không sửa được sau khi tạo.

## Quyết định

1. Khai báo `ValueGeneratedNever()` cho khoá chính của **mọi** kiểu kế thừa `Entity`, bằng một quy ước toàn
   cục trong `NacenTechDbContext`, không rải ở từng `IEntityTypeConfiguration`.
2. Chỗ đặt là `ApplyAggregateConventions`. Lưu ý hàm đó hiện chỉ duyệt các lớp kế thừa `AggregateRoot`; quy
   ước mới phải duyệt cả `Entity`, nếu không hàng con — đúng chỗ lỗi nằm — vẫn bị bỏ sót.
3. `EfUnitOfWork.CommitAsync` phân biệt hai nguyên nhân của "0 hàng bị ảnh hưởng": lệch phiên bản thật, và
   hàng không tồn tại. Chỉ trường hợp thứ nhất được đổi thành `ConcurrencyException`. Trường hợp thứ hai là
   lỗi lập trình và phải nổi lên như vậy, không được nguỵ trang thành xung đột đồng thời.

## Hệ quả

- Sửa nội dung đề bài và tài sản công nghệ chạy được. Cơ chế phiên bản — một trong bảy thay đổi có chủ đích
  của đợt chuyển stack — lần đầu tiên thực sự hoạt động.
- **Bản vá này mở đường cho một lỗi mất dữ liệu đang bị nó che.** `IntakeFacade.ApplyConfidentialSectionsAsync`
  ghi lại cả bốn đoạn nội dung mật ở mọi lần cập nhật, lấy giá trị thẳng từ thân request; trường vắng mặt
  được hiểu là rỗng, và rỗng nghĩa là *gỡ đoạn*. Hôm nay vô hại vì giao dịch luôn cuộn ngược. Sau bản vá này
  thì không. **Hai việc phải nằm trong cùng một lần sửa** — xem B-31.
- Không cần migration. Đây là thay đổi ánh xạ, không đổi lược đồ.
- ETL vẫn dùng `OverrideId` được; `ValueGeneratedNever` chính là điều kiện để việc đó đúng về mặt ngữ nghĩa.

## Cổng done

Một **test tích hợp sửa-rồi-đọc-lại** cho cả đề bài và tài sản công nghệ, chạm PostgreSQL thật, khẳng định:
lần sửa thành công, số phiên bản tăng đúng 1, và hàng phiên bản mới tồn tại với nội dung mới.

Lý do bắt buộc: 44 test hiện có đều xanh và **không cái nào bắt được lỗi này**. Bộ test phủ dày tầng domain
(ma trận chuyển, bất biến, phân quyền, băm chuẩn hoá) nhưng không test nào ghi một lần sửa xuống cơ sở dữ
liệu rồi đọc lại. Không có test đó, cùng loại lỗi sẽ quay lại ở lần đổi ánh xạ tiếp theo và lại không ai biết.

## Đã cài đặt

Ngày 2026-09-04.

| Quyết định | Chỗ cài đặt |
|---|---|
| 1 — `ValueGeneratedNever` cho mọi `Entity` | `packages/persistence/NacenTechDbContext.cs`, `ApplyEntityKeyConventions` |
| 2 — quy ước toàn cục, duyệt cả `Entity` chứ không chỉ `AggregateRoot` | cùng chỗ, gọi trước `ApplyAggregateConventions` |
| 3 — phân biệt "lệch phiên bản" với "hàng không tồn tại" | `packages/persistence/EfUnitOfWork.cs`, `TranslateConcurrencyAsync` |
| Cổng done | `tests/integration/ContentVersioningTests.cs` (3 bài) |

Cổng done đã được kiểm chứng theo cả hai chiều: tắt `ApplyEntityKeyConventions` thì ba bài mới đỏ với đúng
`DbUpdateConcurrencyException` của B-32, bật lại thì xanh. Một test không được chứng minh là bắt được lỗi thì
không phải là cổng.

Quyết định 3 cũng đã tự chứng minh: khi quy ước bị tắt, thông điệp nổi lên là *"Ánh xạ sai: EF phát UPDATE cho
`TechnologyPackageVersion` id=… nhưng hàng đó không tồn tại. Khoá do ứng dụng sinh phải khai `ValueGeneratedNever`
(ADR-0003)"* — thay cho câu *"bản ghi đã bị thay đổi bởi một yêu cầu khác"* vốn đã che nguyên nhân thật suốt
đợt rà. Bộ test: **44 → 51**, tất cả xanh.

Hệ quả đã được xử lý cùng lần sửa, đúng như mục **Hệ quả** cảnh báo: B-31 không bao giờ có cơ hội nổ. Xem
`docs-v2/bug-triage.md` B-31, và mục nghiệm thu `LP-06` đã chạy sau bản vá và trước khi phát hành.
