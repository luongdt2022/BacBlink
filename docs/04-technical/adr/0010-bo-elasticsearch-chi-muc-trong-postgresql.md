# ADR-0010: Gỡ Elasticsearch; chỉ mục tìm kiếm nằm trong PostgreSQL

- Trạng thái: ACCEPTED
- Ngày: 2026-09-05 (đội chốt bỏ Elasticsearch; đề xuất và cài đặt cùng ngày)
- Liên quan: D2-26, D2-143, D2-146, §26.6 (đặc biệt §26.6.1, §26.6.2, §26.6.7) của `NACENTECH_ARCHITECTURE_V2.md`;
  `docs-v2/api-v2/matching.md`; `docs-v2/moi/vong-ghep-cap.md`; sổ lỗi `docs-v2/bug-triage.md` B-27

## Bối cảnh

Kiến trúc 2.20 (D2-26) nói: *mặc định giữ Elasticsearch tại cutover; chỉ hội tụ về PostgreSQL khi đạt toàn bộ
tiêu chí §26.6*, theo năm bước ở §26.6.7 — bước 4 dựng projection PostgreSQL và chạy shadow mode, bước 5 cắt và
gỡ Elasticsearch sau cửa sổ rollback. Cùng tài liệu ghi Elasticsearch là AGPL từ 8.16 (trái D2-146) và đích dài
hạn là PostgreSQL với `pgvector`, `sparsevec`, FTS, `pg_trgm`.

Ngày 2026-09-05 đội xác nhận **Elasticsearch đã bỏ**. Quyết định đó chưa được ghi ở đâu trong kho, trong khi
mã, `docker-compose.yml`, cấu hình và ba chỗ trong `docs-v2` vẫn trỏ vào nó. ADR này ghi quyết định và cài đặt.

### Sự kiện đã đo, không phải giả định

| Sự kiện | Đo ở đâu |
|---|---|
| `ISearchIndex` có đúng một cài đặt, là `ElasticsearchIndex` gọi HTTP thuần | `modules/matching/Infrastructure/`, `MatchingModule.cs:32` |
| Elasticsearch **chưa từng dựng** ở môi trường phát triển này; mọi lượt đo ghép cặp đều chèn vòng thẳng vào PostgreSQL | `docs-v2/verification/anh-chup/ui-rounds.mjs`, B-27 |
| Vector nhúng đã nằm trong PostgreSQL (`matching.content_chunks.embedding real[]`), Elasticsearch chỉ là bản chiếu | `ContentChunkConfiguration` |
| Ảnh `pgvector/pgvector:pg16` đã có trên máy dựng (dùng cho `search-bench`) | `docker images` |
| Baseline Elasticsearch trượt ca "cong nghe sinh hoc" ↔ "công nghệ sinh học" vì không có ascii-folding | §26.6.1 |

Hệ quả của sự kiện thứ hai: **các tiêu chí §26.6.4–§26.6.6 chưa bao giờ đo được** — không có golden set, không
có replay parity, không có shadow mode — vì không có engine nào chạy để đo. Lộ trình "một biến mỗi bước" giả
định có một baseline Elasticsearch đang chạy; ở đây không có. Giữ Elasticsearch để "giữ một biến" là giữ một
biến chưa từng tồn tại.

## Lựa chọn

**A. Giữ nguyên mã, chỉ ghi quyết định.** Mã tiếp tục trỏ vào một dịch vụ đã bỏ; đường ghép cặp không chạy được
ở bất kỳ môi trường nào cho tới khi có người cài đặt. Đây chính là loại lệch giữa tài liệu và mã mà bộ `docs-v2`
sinh ra để chặn.

**B. Cài đặt `ISearchIndex` bằng PostgreSQL, gỡ Elasticsearch khỏi mã và hạ tầng, giữ nguyên hợp đồng
`ISearchIndex` và hai chế độ chấm điểm.** Bất biến D2-26 — *mỗi vòng đúng một engine authoritative ghi trong
`searchEngineVersion`* — giữ nguyên bằng cách đặt nhãn mới cho engine mới.

**C. Cài đặt PostgreSQL nhưng giữ Elasticsearch song song sau cờ.** Hai cài đặt cho một hợp đồng, một trong hai
không có môi trường nào chạy. Bảo trì gấp đôi để bảo vệ một đường không ai đo.

## Quyết định

**B.** Chi tiết:

1. **Bảng chiếu `matching.search_chunks`** do migration SQL thuần tạo (không phải entity EF, không đổi model
   snapshot): `embedding vector(1024)` + chỉ mục HNSW cosine; `tsv tsvector` sinh sẵn từ tiêu đề (trọng số A) và
   đoạn (trọng số B), cả hai qua `unaccent`; các cột lọc cứng `subject_kind`, `sector_ids`, `owner_person_id`,
   `is_published`. Bảng **không chứa nội dung mật** (D2-143) — cùng luật với index cũ.
2. **`PostgresSearchIndex`** cài `ISearchIndex` bằng SQL thuần qua cùng `DbContext`, nên ghi chiếu và ghi
   `content_chunks` **cùng giao dịch** — không còn cửa sổ lệch giữa nội dung và chỉ mục, và không còn điểm thực
   thi kiểm soát truy cập thứ hai ngoài PostgreSQL (§26.6, đoạn về mức mật).
3. **Hai chế độ chấm điểm giữ hợp đồng, không giữ bit.** `LEGACY_SCORING`: một điểm = cosine **cộng** `ts_rank_cd`
   (hai đơn vị khác nhau, không trần), lọc cứng chỉ gồm kind/sector, published/owner lọc **sau** top-K ở tầng
   dịch vụ — tái tạo *hình dạng* hành vi NestJS. `CORRECTED_SCORING`: lọc cứng trước, kênh dense và kênh từ
   khoá chạy riêng, hợp nhất RRF (k = 60) — đúng §26.6.2. BM25 của Elasticsearch và `ts_rank_cd` là hai hàm
   khác nhau, nên chế độ cũ trên PostgreSQL **không phải** baseline NestJS bit-một-bit; nhãn engine khác nhau
   để không ai so hai thứ đó như một.
4. **Nhãn engine mới**: `postgres-16/pgvector-legacy`, `postgres-16/pgvector-rrf`. Hai nhãn Elasticsearch giữ
   lại như hằng số **lịch sử** — vòng nào từng mang chúng vẫn đọc được — không mã nào tạo vòng mới với chúng.
5. **Không gói NuGet mới.** Vector gửi xuống dưới dạng chữ `[…]` rồi ép `::vector` ở SQL; `unaccent` bọc trong
   hàm IMMUTABLE để dùng được trong cột sinh sẵn. Denylist §26.8.3 không đổi.
6. **Kênh sparse** không phải điều kiện để gỡ Elasticsearch — và đã làm cùng ngày, xem mục "Đã cài đặt thêm".

## Hệ quả

- Ảnh PostgreSQL phải có extension `vector`: `pgvector/pgvector:pg16` ở `docker-compose.yml` và ở fixture test.
  PostgreSQL dạng dịch vụ quản lý phải cho cài `vector`, `unaccent`, `pg_trgm` — §26.6 đã liệt kê đây là câu
  hỏi phải trả lời trước khi hội tụ, và nay nó là điều kiện triển khai.
- Dữ liệu ETL từ NestJS (`intake_chunks` → `content_chunks`) **không tự vào** `search_chunks`: cần chạy lại
  chunk-embed (job `ChunkEmbedJob`) cho từng subject sau di trú, hoặc một job dựng lại chỉ mục từ
  `content_chunks`. Job dựng lại **đã viết cùng ngày** (`RebuildSearchIndexJob`, enqueue sau ETL) — xem mục "Đã cài đặt thêm".
- Phép đo chất lượng §26.6.4–§26.6.6 vẫn còn nợ, nay đo trên **một** engine thay vì so hai engine. `search_query_log`
  vẫn ghi để dựng golden set khi có dữ liệu thật.
- `docs-v2` sửa ở: `api-v2/matching.md`, `moi/vong-ghep-cap.md`, `nen-tang/mo-hinh-du-lieu.md`, `README.md`,
  `BAN-GIAO.md`, `bug-triage.md` (B-27: chỗ chặn còn lại chỉ là sidecar nhúng 8003).

## Đã cài đặt thêm cùng ngày — ba câu hỏi mở đã đóng

1. **Job dựng lại chỉ mục** cho dữ liệu di trú: `IMatchingService.RebuildSearchIndexAsync(subject)` dựng bản chiếu
   từ `content_chunks` + summary **không gọi sidecar**; `RebuildSearchIndexJob` do `MatchingImporter.ImportChunkAsync`
   enqueue (gộp theo khoá `reindex:{subject}`) — ETL chạy xong là bản chiếu tự đầy. Test: `Rebuilds_projection_from_migrated_chunks_without_embedding`.
2. **Kênh sparse**: `Matching:UseSparse = true` → client gọi `/embed` với `return_sparse`, bản chiếu thêm cột
   `sparsevec(250002)` (migration `SparseChannel`, HNSW tích vô hướng), chế độ đã sửa hợp nhất **ba** kênh bằng RRF.
   Đúng D2-26, thêm kênh là đổi thuật toán: nhãn engine riêng `postgres-16/pgvector-rrf3`, lý do ứng viên
   `rrf_dense_lexical_sparse`. Đoạn di trú không có sparse đứng ngoài kênh này tới lần chunk-embed kế tiếp.
   Test: `Sparse_channel_finds_chunks_by_learned_vocabulary`. Trên sidecar thật (`dmst-rag:pinned`, đã vá
   `numpy.float32`): `/embed` trả dense 1024 + sparse 5–8 token cho một câu ngắn.
3. **B-45 — ngưỡng theo chế độ**: `MatchMinScoreCorrected` (mặc định 0) áp cho chế độ đã sửa bất kể người gọi gửi
   số nào theo thang cũ; chế độ cũ giữ `MatchMinScore` và số người gọi gửi. Nhật ký truy vấn ghi ngưỡng **thật**
   đã áp. Test: `Corrected_mode_ignores_legacy_scale_threshold_and_never_returns_drafts` — cùng ngưỡng 2.0, chế độ
   cũ rỗng (đúng luật thang cũ), chế độ đã sửa có kết quả.

**Đo trên bản chạy với mô hình thật** (`docs-v2/verification/anh-chup/verify-b27.sh`, 9/9): sidecar BGE-M3 ở
8003, API chạy `CORRECTED_SCORING + UseSparse`; hai bản ghi cùng nội dung (một nháp của người khác, một đã xuất
bản) vào bản chiếu sau 6 giây kèm cột sparse; `POST /api/v1/search` với ngưỡng mặc định 2.0 trả **đúng bản đã
xuất bản, không có bản nháp** (B-27 đo được lần đầu); nhật ký ghi `postgres-16/pgvector-rrf3`, `min=0`; câu
không dấu "mang loc sinh hoc nuoc thai" vẫn tìm thấy.

## Đợt ba cùng ngày — §26.6.6 đo được, rerank, cửa ghi v2

**Tám ca đúng/sai của §26.6.6** — ngưỡng tuyệt đối của quyết định hội tụ — nay có mã và có phép đo:

| Ca | Cần gì để đúng | Ở đâu |
|---|---|---|
| "công nghệ sinh học" không khớp "công nghệ … học" rời nhau | kênh từ khoá dùng `phraseto_tsquery` (cụm âm tiết có thứ tự) thay `plainto` | `PostgresSearchIndex.CorrectedAsync` |
| "cong nghe sinh hoc" khớp có dấu | trường `tsv` qua `unaccent` | đã có từ đợt 1 |
| gõ đủ dấu không mất phân biệt nghĩa | **hai trường**: `tsv_vi` giữ dấu; truy vấn có dấu tra `tsv_vi`, không dấu tra `tsv` | migration `ExactAndAccentedChannels` |
| NFC/NFD và "hòa"/"hoà" là một | `VietnameseText.Canonical` (NFC + một kiểu đặt dấu) áp cho cả văn bản vào chỉ mục lẫn truy vấn | `VietnameseText.cs`, 12 ca lý thuyết |
| từ tiếng Anh trong câu tiếng Việt | cấu hình `simple` không stem; dense/sparse | — |
| số hiệu, mã, tên tổ chức khớp chính xác | **kênh exact/trigram** (`ILIKE` + `word_similarity`, chỉ mục `gin_trgm_ops`) — kênh thứ tư | `PostgresSearchIndex`, migration |
| ứng viên hợp lệ không mất vì top-K trước lọc | lọc cứng trước thu hồi (đã có) — đo với 20–30 bản nháp chiếm chỗ | test + live |
| đoạn mức 2/3 không bao giờ xuất hiện | chỉ nội dung công khai được chunk (D2-143) — đo bằng chuỗi mật ở mức 3 | live |

Test: `SearchPassFailCasesTests` (7 bài) + `VietnameseTextTests` (12 ca). Bản chạy với mô hình thật:
`verify-search-cases.mjs` **10/10** — viết bằng Node vì `curl --form-string` trên Git Bash/Windows gửi tiếng Việt
thành `?` (bằng chứng: bản ghi tạo bằng bash không khớp `ILIKE '%công nghệ sinh học%'`); một phép đo về dấu
tiếng Việt mà dữ liệu vào đã mất dấu thì vô nghĩa.

**Cross-encoder rerank (§26.6.3).** Sidecar thêm `POST /rerank` (`BAAI/bge-reranker-v2-m3`, nạp lười ở lần gọi
đầu, ~2,2 GB); .NET có `IReranker` + `RagRerankClient`, cờ `Matching:UseRerank`, xếp lại `RerankTopN` (30) ứng
viên đầu sau RRF ở chế độ đã sửa, điểm cuối là điểm reranker (0–1). Đúng D2-26: nhãn engine mang hậu tố
`-rerank` (`postgres-16/pgvector-rrf3-rerank`), lý do ứng viên `…_rerank`. Test với reranker giả:
`Rerank_reorders_top_candidates_and_changes_the_engine_label`. Trên mô hình thật: "màng lọc sinh học" chấm
0,98 cho đoạn đúng và 0,00002 cho đoạn "hoa hồng".

**Cửa ghi v2**: `POST /api/v2/subjects/{kind}/{id}/match-rounds` và `.../index-jobs` — 202 xếp việc, chủ sở hữu
hoặc quản trị viên (`subject.compute_matches`), 422 khi chưa xuất bản / không có nội dung, 428 khi thiếu khoá
chống lặp, cùng khoá phát lại. Vòng thật đầu tiên tính bằng đường này: `ui-rounds-real.mjs` **12/12** — 10 ứng
viên, engine `postgres-16/pgvector-rrf3-rerank`, hiện trên bảng quản trị (VGC-08). Lộ ra và sửa **B-46**:
`GET .../match-rounds/latest` báo 0 ứng viên vì đếm trên navigation chưa `Include`.

## Câu hỏi còn mở

- **Chỉ còn §26.6.5** — golden set ≥ 200 truy vấn thật có broker chấm, Recall@50 và nDCG@10 so với baseline sạch. Không thể tự nghĩ ra (§26.6.5 cấm); `search_query_log` đang ghi để dựng. Mọi điều kiện tiên quyết §26.6.4 và mọi ca tuyệt đối §26.6.6 đã đạt.

## Cổng "done"

- `PostgresSearchIndexTests` (3 bài): chế độ đã sửa lọc cứng trước thu hồi, chế độ cũ không lọc; tiếng Việt không
  dấu khớp có dấu chỉ bằng kênh từ khoá; lọc lĩnh vực và ghi đè theo khoá đoạn.
- `MatchingPipelineTests` (4 bài): ngưỡng theo chế độ + không trả bản nháp qua tầng dịch vụ; dựng lại từ đoạn di
  trú; kênh sparse; rerank. `verify-b27.sh` 9/9 trên sidecar thật.
- `SearchPassFailCasesTests` (7) + `VietnameseTextTests` (12); `verify-search-cases.mjs` 10/10 và `ui-rounds-real.mjs`
  12/12 trên mô hình thật với rerank.
- `grep -rn Elasticsearch --include=*.cs --include=*.yml --include=*.json` chỉ còn hằng số nhãn lịch sử và chú thích.
- `docker compose config` không còn dịch vụ `elasticsearch`.
