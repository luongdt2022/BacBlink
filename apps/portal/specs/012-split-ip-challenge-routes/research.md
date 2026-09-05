# Research: Bỏ Route Intake Và Tách Route IP/Challenge

**Branch**: `012-split-ip-challenge-routes` | **Date**: 2026-04-09

## Finding 1 - Chuẩn hóa route mới theo resource type

**Decision**: Dùng route tách theo resource type, bỏ route thao tác cũ dưới `/intakes/*`.

**Rationale**: User đã xác nhận "bỏ route intake"; tách route rõ nghĩa giúp URL phản ánh đúng loại nghiệp vụ (`ip` hoặc `challenge`) và loại bỏ ambiguity do query string.

**Alternatives considered**:
- Giữ `/intakes/create|edit|detail` và thêm redirect: rejected vì không đáp ứng yêu cầu bỏ route intake.
- Giữ một route động `/intakes/:type/...`: rejected vì vẫn neo vào namespace `intakes` cho thao tác chi tiết.

## Finding 2 - Khóa loại intake bằng wrapper thay vì tách logic form

**Decision**: Dùng wrapper pages cho create/edit IP/Challenge và truyền type cố định vào `IntakeFormPage`.

**Rationale**: Tránh duplicate logic form lớn, giữ một nguồn xử lý validation/submission, giảm risk regression.

**Alternatives considered**:
- Clone form thành `IpFormPage` và `ChallengeFormPage`: rejected do duplicate code và chi phí bảo trì cao.
- Parse type trực tiếp từ pathname trong form: rejected vì coupling giữa UI logic và router string.

## Finding 3 - Chuẩn hóa detail/edit navigation theo `intake.type`

**Decision**: Từ `IntakesPage`, route row-click và edit-action được quyết định bằng `intake.type` đã có trong list item.

**Rationale**: Type đã available ở dataset list, không cần gọi thêm API để xác định đích route.

**Alternatives considered**:
- Resolve type bằng API call trước khi navigate: rejected vì tăng latency và phức tạp luồng click.
- Dẫn tất cả về một route trung gian để phân loại: rejected vì thêm tầng redirect không cần thiết.

## Finding 4 - Loại bỏ query-param route cho detail/edit

**Decision**: Chuyển detail/edit sang path param (`/:id`) cho cả IP và Challenge.

**Rationale**: Path param là contract chuẩn cho resource detail/edit, dễ deep-link và tracking hơn query dạng `?id=`.

**Alternatives considered**:
- Tiếp tục dùng query `?id=` cho route mới: rejected vì không giải quyết tận gốc vấn đề route cũ.

## Finding 5 - Hành vi route cũ sau khi bỏ khỏi router

**Decision**: Không khai báo explicit các route cũ `intakes/create`, `intakes/edit`, `intakes/detail`; xử lý truy cập cũ qua fallback route hiện có.

**Rationale**: Phù hợp yêu cầu "bỏ route intake" và tránh duy trì compatibility surface không cần thiết.

**Alternatives considered**:
- Redirect route cũ sang route mới bằng Navigate tường minh: rejected do mâu thuẫn với yêu cầu loại bỏ route intake.
