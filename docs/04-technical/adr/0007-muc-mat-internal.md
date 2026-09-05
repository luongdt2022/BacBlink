# ADR-0007: Mức mật `Internal` — bỏ khỏi mô hình

- Trạng thái: ACCEPTED
- Ngày: 2026-09-04 (đề xuất), 2026-09-05 (chốt và cài đặt)
- Liên quan: §16.1, §16.2, §30.1; sổ lỗi `docs-v2/bug-triage.md` B-28

## Bối cảnh

`DataClassification` có bốn mức theo thứ tự: `Public` < `Internal` < `Confidential` < `HighlyConfidential`.

Phép kiểm "có phải mật không" chỉ tính từ `Confidential` trở lên:

```csharp
public static bool IsConfidential(this DataClassification c) => c >= DataClassification.Confidential;
```

`DataRoomService.ListReadableAsync` dùng đúng phép kiểm đó làm cửa đầu tiên và thêm thẳng tài liệu vào danh
sách đọc được **trước cả khi biết người xem là ai**:

```csharp
if (!doc.Classification.IsConfidential()) { readable.Add(ToDto(doc)); continue; }
```

Nghĩa là tài liệu mức `Internal` đi vào cùng nhóm với `Public`: hiện cho mọi người, kể cả khách chưa đăng
nhập. Cái tên gợi ý ngược lại.

Hôm nay chưa lộ gì, vì không đường nào tạo được tài liệu mức này. Ánh xạ từ hệ cũ (§30.1) chỉ sinh ba mức
còn lại: không mức → `Public`, `level2` → `Confidential`, `level3` → `HighlyConfidential`. `Internal` là một
mức tồn tại trong kiểu dữ liệu và không có đường nào đi tới.

### Hai tầng đang nói ngược nhau về cùng một mức — điều bản đề xuất chưa nêu

Đo ngày 2026-09-05: bảng quyết định `authorization-rules.v1.json` **không có luật nào nhắc tới `INTERNAL`**.
`PUBLIC_DOCUMENT_READ` chỉ khớp `PUBLIC`; `DENY_CONFIDENTIAL_WITHOUT_GRANT` chỉ khớp `CONFIDENTIAL` và
`HIGHLY_CONFIDENTIAL`. Một yêu cầu đọc tài liệu `Internal` từ người không phải chủ sở hữu rơi vào
**`DEFAULT_DENY`** — bảng chưa từng nghĩ tới mức này.

Hệ quả là hai đường đọc **mâu thuẫn nhau**:

| Đường | Cửa | Với tài liệu `Internal`, người không phải chủ sở hữu |
|---|---|---|
| Liệt kê (`ListReadableAsync`) | `IsConfidential()` — tắt cho `Internal` | **Hiện ra** trong danh sách |
| Mở (`OpenAsync`) | Bảng quyết định — không luật nào khớp | **Từ chối** với `DEFAULT_DENY` |

Người dùng thấy tài liệu trong danh sách, bấm vào, và bị từ chối bằng một mã quy tắc nói "không luật nào áp
dụng". Đó không phải một mức mật hoạt động sai — đó là một mức mật mà **hai tầng của hệ thống hiểu theo hai
cách khác nhau**, và không tầng nào đúng theo nghĩa cái tên hứa.

Riêng phát hiện này đã đủ để quyết: giữ `Internal` không chỉ là giữ một mức "chưa dùng", mà là giữ một chỗ
lệch giữa mã dịch vụ và bảng quyết định — chỗ lệch mà bộ test vét cạn hiện tại **không quét tới**, vì mảng
`Confidential` trong `DecisionTableTests` chỉ liệt kê hai mức trên.

### Cửa sổ rẻ vẫn còn mở

`Classification` lưu dưới dạng **chuỗi** (`HasConversion<string>()`), nên bỏ một thành viên enum không để lại
khoảng trống số trong dữ liệu. Đo ngày 2026-09-05: bảng `dataroom.documents` có `Confidential` và
`HighlyConfidential`, **không hàng nào mang `Internal`**. Ba frontend không tham chiếu tên mức mật nào. Bỏ nó
hôm nay là xoá một dòng; bỏ sau khi có dữ liệu là một cuộc di trú trên dữ liệu mật.

## Hai lựa chọn

**A. Đưa `Internal` vào nhóm cần kiểm quyền.** Đổi `IsConfidential` thành `>= Internal`, hoặc thêm một phép
kiểm riêng cho "cần kiểm quyền". Câu hỏi kèm theo: *nội bộ với ai?* Cơ chế cấp quyền đọc hiện gắn phiếu vào
một subject và một người cụ thể; "nội bộ" thường có nghĩa là một tổ chức, và mô hình chưa có khái niệm đó.
Chọn A mà không trả lời được câu này sẽ cho ra một mức mật chỉ chủ sở hữu đọc được — tức là trùng nghĩa với
`Confidential`. Và A còn phải thêm luật cho `INTERNAL` vào bảng quyết định, nếu không đường mở vẫn từ chối.

**B. Bỏ `Internal` khỏi mô hình.** Ba mức: công khai, mật, rất mật. Đơn giản, khớp đúng cái ánh xạ từ hệ cũ
đang sinh ra, khớp đúng những luật bảng quyết định đang có, và không có gì để hiểu nhầm.

## Quyết định

**Chọn B.** Bỏ `Internal` khỏi `DataClassification`. Ba mức.

Ba lý do, theo thứ tự sức nặng:

1. **Một mức mật mà tên nói một đằng, hành vi nói một nẻo, và hai tầng nói hai nẻo khác nhau — là thứ tệ hơn
   không có mức đó.** Nó mời người dùng gắn nhãn `Internal` cho thứ họ không muốn công khai, rồi im lặng liệt
   kê nó ra, rồi từ chối mở nó bằng một mã không giải thích gì.
2. **A đòi trả lời "nội bộ với ai", và câu trả lời cần một chiều tổ chức mới trong bảng quyết định.** Đó là
   một thay đổi mô hình có thật, và không có nhu cầu cụ thể nào đang đòi nó. Xây một chiều mới cho một mức
   chưa ai dùng là xây trước nhu cầu — rồi phải nuôi nó mãi.
3. **B là xoá một dòng hôm nay và là một cuộc di trú vào ngày mai.** Không có dữ liệu, không có tham chiếu ở
   client, lưu dạng chuỗi. Không còn lúc nào rẻ hơn.

Nếu sau này có nhu cầu thật cho mức thứ tư, nó phải đến kèm câu trả lời cho "nội bộ với ai" — và khi đó nó là
một ADR mới, không phải hoàn lại ADR này.

## Hệ quả

- `DataClassification` còn ba thành viên. `IsConfidential` giữ nguyên `>= Confidential`; với ba mức nó đồng
  nghĩa với "không phải `Public`", và đó là đúng nghĩa cần có.
- Ánh xạ mức → mã (`PUBLIC` / `CONFIDENTIAL` / `HIGHLY_CONFIDENTIAL`) dời từ `DataRoomService` về kernel, cạnh
  `ToLegacyLevel`, để có **một** ánh xạ và kiểm được từ bộ test bảng quyết định. Bảng quyết định không đổi:
  nó đã đúng với ba mức từ đầu, chỉ có kiểu dữ liệu là thừa.
- **Không cần migration.** Cột là chuỗi, không hàng nào mang giá trị bị bỏ.
- Đặc tả [`docs-v2/api-v2/dataroom-va-cap-quyen.md`](../../../docs-v2/api-v2/dataroom-va-cap-quyen.md), màn hình
  [`docs-v2/moi/phong-du-lieu-va-cap-quyen.md`](../../../docs-v2/moi/phong-du-lieu-va-cap-quyen.md), bảng
  thuật ngữ và `goal.md` cập nhật từ bốn mức sang ba. Mục nghiệm thu `DROOM-01` — "tài liệu `Internal` không
  còn hiện cho mọi người" — được thoả bằng cách **không còn tài liệu `Internal` nào có thể tồn tại**.

## Cổng done

1. **Một bài khẳng định kiểu liệt kê có đúng ba thành viên**, và tên của chúng. Bài này đỏ ngay khi ai đó
   thêm lại `Internal` — hoặc thêm một mức thứ tư mà chưa có ADR.
2. **Một bài vét cạn: mọi mức mật đều có luật gọi tên nó trong bảng quyết định.** Với từng giá trị của
   `DataClassification`, một yêu cầu đọc từ người không phải chủ sở hữu và không có phiếu phải kết thúc ở một
   **quy tắc có tên** — `PUBLIC_DOCUMENT_READ` cho mức công khai, `DENY_CONFIDENTIAL_WITHOUT_GRANT` cho hai mức
   mật — **không bao giờ** ở `DEFAULT_DENY`. `DEFAULT_DENY` nghĩa là "bảng chưa nghĩ tới trường hợp này", và
   đó chính là lỗ mà `Internal` từng rơi vào mà không ai thấy. Bài này là thứ lẽ ra đã bắt được B-28 từ đầu.
3. Chứng minh test bắt được lỗi: thêm lại `Internal` thì cả hai bài phải đỏ.

## Đã cài đặt

Ngày 2026-09-05, cùng ngày chốt.

| Quyết định | Chỗ cài đặt |
|---|---|
| Bỏ `Internal`; ba mức | `packages/kernel/Domain/DataClassification.cs` |
| Một ánh xạ mức → mã, không nhánh mặc định | `DataClassificationExtensions.ToCode` (kernel); `DataRoomService.ClassificationCode` uỷ quyền sang đó |
| Cổng done 1, 2 | `tests/authorization/ClassificationCoverageTests.cs` (4 bài) |

Bộ phân quyền đi từ **10 lên 16** bài; toàn solution **100 → 106**, tất cả xanh. Không cần migration; không
frontend nào phải sửa.

Cổng done kiểm chứng theo cả hai chiều: thêm lại `Internal = 1` vào kiểu liệt kê thì **đúng ba bài đỏ** —
đếm thành viên, vét cạn `DEFAULT_DENY`, và bài đối chiếu mã với phép kiểm mật — trong khi 13 bài còn lại của
bộ phân quyền vẫn xanh. Khôi phục thì 16/16.

Một hệ quả nhỏ mà bản đề xuất chưa nêu và đáng giữ: ánh xạ cũ trong `DataRoomService` có nhánh mặc định
`_ => "PUBLIC"`. Nghĩa là **bất kỳ mức mật nào chưa được ánh xạ đều âm thầm thành công khai** — đúng hướng
sai nguy hiểm nhất. Ánh xạ mới ném `ArgumentOutOfRangeException`: một mức mới mà quên mã nay là lỗi biên
dịch, không phải một rò rỉ im lặng.
