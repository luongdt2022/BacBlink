# THIẾT KẾ CHI TIẾT HỢP ĐỒNG API (DD-02): TRỢ LÝ AI TRÍCH XUẤT TÀI LIỆU (AI EXTRACTOR CONTRACTS)

> **Mã tài liệu**: `DD-02-AI-EXTRACTOR-CONTRACTS-v1.0`  
> **Căn cứ pháp lý & kỹ thuật**: Quyết định PO `PO-DEC-20261008-07`, Kiến trúc Clean Architecture .NET Core 8 & Next.js 14  
> **Phạm vi áp dụng**: `TASK-05` (Lý lịch khoa học Chuyên gia) & `TASK-04` (Văn bằng SHTT & Thông số Kỹ thuật Chào bán)  
> **Phân kỳ phát triển**: **P2 (Giai đoạn 1.5)** — Thiết kế sẵn Contract DTO mở, CRUD Form nhập tay hoạt động độc lập trước  
> **Trạng thái**: 🟢 APPROVED BY PO (Chuẩn Hóa Open DTO Contract & Human-in-the-Loop)

---

## 1. NGUYÊN TẮC THIẾT KẾ KIẾN TRÚC BẤT BIẾN (NON-NEGOTIABLE PRINCIPLES)

1. **Human-in-the-Loop (Người dùng là trung tâm kiểm chứng)**:
   - Dịch vụ AI Extractor **TUYỆT ĐỐI KHÔNG ghi trực tiếp vào Database**.
   - AI chỉ tiếp nhận tệp (PDF/Word/Ảnh/Voice) và trả về một **Bản nháp DTO (Draft Payload)** cho Client/Frontend.
   - Frontend đổ Draft DTO vào Form Wizard, đánh dấu màu nổi bật (Highlight) các ô do AI gợi ý để Chuyên gia/Doanh nghiệp tự tay rà soát, chỉnh sửa và bấm "Lưu/Nộp hồ sơ" qua Endpoint CRUD chuẩn.
2. **Cơ chế Dự phòng Hoàn hảo (Zero-Dependency Fallback)**:
   - Nếu dịch vụ AI gặp sự cố (hết Quota, timeout mạng, file quá mờ), hệ thống vẫn vận hành 100% bình thường bằng Form nhập tay chuẩn.
3. **Phân tầng Clean Architecture**:
   - Giao diện `IAiResumeExtractor` và `IAiPatentExtractor` nằm ở tầng **Application / Core Interfaces**.
   - Việc gọi API LLM (Google Gemini Multimodal / Claude / Local OCR) được đóng gói hoàn toàn trong tầng **Infrastructure** (`NacenTech.Infrastructure.AI`). Thay đổi nhà cung cấp AI không làm thay đổi Domain Logic.

---

## 2. CONTRACT 1: TRÍCH XUẤT LÝ LỊCH KHOA HỌC CHUYÊN GIA (`TASK-05`)

### 2.1. Endpoint Khái niệm
- **Method**: `POST`
- **Path**: `/api/v1/ai/extract-expert-cv`
- **Content-Type**: `multipart/form-data`
- **Rate Limit**: 10 requests / phút / user
- **Timeout**: 30 giây

### 2.2. Request Payload (Multipart Form)
| Trường | Kiểu | Bắt buộc | Mô tả |
| :--- | :---: | :---: | :--- |
| `file` | `Binary File` | Có (hoặc `voice_file`) | Tệp PDF, DOCX, hoặc JPG/PNG chụp LLKH, CV, bằng Tiến sĩ. Tối đa 15MB. |
| `voice_file` | `Binary Audio` | Tùy chọn | Tệp âm thanh ghi âm giọng nói (m4a, mp3, wav) giới thiệu bản thân. |
| `source_format` | `String` | Có | `STANDARD_MOST_LLKH` (chuẩn Bộ KH&CN), `FREE_FORM_CV`, `GOV_PROFILE` |

### 2.3. Response DTO (`ExpertProfileDraftDto` - Khớp 94 trường `TASK-05`)
```json
{
  "success": true,
  "extraction_id": "ext-7f9a12b4-5c3d",
  "confidence_score": 0.94,
  "data": {
    "personal_info": {
      "full_name": "GS. TSKH. Nguyễn Văn An",
      "birth_year": 1965,
      "gender": "MALE",
      "academic_title": "GIÁO_SƯ",
      "academic_degree": "TIẾN_SĨ_KHOA_HỌC",
      "id_number": "001065******",
      "phone": "0912******",
      "email": "an.nv@hust.edu.vn",
      "workplace": "Đại học Bách Khoa Hà Nội",
      "position": "Trưởng phòng Thí nghiệm Trọng điểm Điện tử Y sinh"
    },
    "expertise": {
      "main_sector_codes": ["LV01", "LV08"],
      "sub_sector_names": ["Công nghệ sinh học y dược", "Vật liệu bán dẫn"],
      "keywords": ["Perovskite", "Biosensor", "Nano y sinh", "Màng mỏng quang điện"],
      "bio_summary": "Hơn 30 năm nghiên cứu trong lĩnh vực cảm biến sinh học và vật liệu quang điện..."
    },
    "research_projects": [
      {
        "project_name": "Nghiên cứu chế tạo cảm biến sinh học nano phát hiện sớm tế bào ung thư",
        "level": "CẤP_NHÀ_NƯỚC",
        "role": "CHỦ_NHIỆM",
        "year_completed": 2023,
        "result_rating": "XUẤT_SẮC"
      }
    ],
    "publications": [
      {
        "title": "High-efficiency Perovskite solar cells via interface engineering",
        "journal": "Nature Energy",
        "year": 2022,
        "doi": "10.1038/s41560-022-01000-x",
        "is_isi_scopus": true
      }
    ],
    "patents": [
      {
        "patent_name": "Quy trình chế tạo đầu dò cảm biến nano plasmonic",
        "patent_number": "VN-1-0028491",
        "granted_year": 2021,
        "country": "VIETNAM"
      }
    ]
  },
  "extraction_metadata": {
    "model_used": "gemini-2.0-flash-multimodal",
    "processing_time_ms": 2340,
    "highlight_fields": [
      "personal_info.full_name",
      "personal_info.academic_title",
      "expertise.main_sector_codes",
      "patents[0].patent_number"
    ]
  }
}
```

---

## 3. CONTRACT 2: TRÍCH XUẤT VĂN BẰNG SHTT & THÔNG SỐ CHÀO BÁN (`TASK-04`)

### 3.1. Endpoint Khái niệm
- **Method**: `POST`
- **Path**: `/api/v1/ai/extract-patent-specs`
- **Content-Type**: `multipart/form-data`
- **Rate Limit**: 10 requests / phút / user

### 3.2. Response DTO (`TechTransferDraftDto` - Khớp Bộ Tứ SHTT & TRL `PO-DEC-20261008-04`)
```json
{
  "success": true,
  "extraction_id": "ext-pat-8a21cd-43ef",
  "confidence_score": 0.96,
  "data": {
    "title": "Hệ thống sấy tháp tầng sôi tuần hoàn tiết kiệm năng lượng cho nông sản",
    "technical_summary": "Ứng dụng nguyên lý hồi lưu nhiệt ẩm đa tầng, giảm 40% tiêu hao điện năng so với máy sấy vỉ ngang truyền thống.",
    "target_sector_code": "LV03",
    "tech_group_code": "CN08",
    "ip_quad": {
      "trl_level": 8,
      "trl_evidence_summary": "Hệ thống đã chế tạo mẫu công nghiệp hoàn chỉnh và vận hành liên tục 6 tháng tại Nhà máy chế biến gạo Lạng Sơn.",
      "ip_status": "PATENT_GRANTED",
      "patent_number": "VN-1-0031892",
      "patent_owner": "Viện Cơ điện Nông nghiệp và Công nghệ sau thu hoạch",
      "transfer_method": "NON_EXCLUSIVE_LICENSE",
      "commercial_readiness": "COMMERCIALLY_READY"
    },
    "origin_developer": "Viện Cơ điện Nông nghiệp và Công nghệ sau thu hoạch (VIAEP)",
    "suggested_price_range": "Từ 800 triệu đến 1.5 tỷ VNĐ (tùy công suất tấn/mẻ)"
  },
  "extraction_metadata": {
    "model_used": "gemini-2.0-flash-multimodal",
    "processing_time_ms": 1890,
    "highlight_fields": [
      "title",
      "ip_quad.trl_level",
      "ip_quad.ip_status",
      "ip_quad.patent_number",
      "ip_quad.transfer_method"
    ]
  }
}
```

---

## 4. CHIẾN LƯỢC XỬ LÝ LỖI & BẢO MẬT (RESILIENCE & SECURITY)

1. **Bảo mật Dữ liệu Riêng tư (Data Privacy Guard)**:
   - Các tệp đính kèm được lưu tạm thời trong Bucket lưu trữ ngắn hạn (`temp-ai-uploads/`), tự động dọn dẹp sau 24 giờ.
   - Không dùng dữ liệu tải lên của người dùng để huấn luyện model công cộng.
2. **Quy định Mã Lỗi**:
   - `400 BAD_REQUEST`: Định dạng file không hỗ trợ hoặc tệp bị hỏng.
   - `413 PAYLOAD_TOO_LARGE`: Tệp vượt quá 15MB.
   - `422 UNPROCESSABLE_ENTITY`: Tệp tài liệu mờ, không trích xuất được văn bản $\rightarrow$ *Thông báo Client tự động kích hoạt Form nhập tay*.
   - `429 TOO_MANY_REQUESTS`: Vượt hạn mức gọi AI trong phút.
   - `504 GATEWAY_TIMEOUT`: Quá thời gian phản hồi AI $\rightarrow$ *Graceful Degradation: Đề xuất người dùng nhập tay*.
