# DANH SÁCH ĐẦU VIỆC KỸ THUẬT (TASKS BREAKDOWN)
## PHÂN HỆ: HẠ TẦNG LIÊN THÔNG NDACHAIN (BỘ CÔNG AN) & BẢO CHỨNG MẬT MÃ ZKPROOF (TASK-11)

> **Mã Epic**: `TASK-11_HA_TANG_BLOCKCHAIN_NDACHAIN_VA_ZKPROOF`  
> **Version**: 1.1.0 | **Status**: In Implementation (CR-BACLINK-006)  
> **Tổng số tasks**: 27 tasks chia thành 5 Phases tuần tự (22/22 tasks giai đoạn 1-4 hoàn tất [x]; Phase 5 CR-BACLINK-006 đang triển khai).  
> **Căn cứ kế hoạch**: [`ADR-0017`](../../backend/docs/decisions/ADR-0017-ENTITY-AGNOSTIC-BLOCKCHAIN-AND-ZKP-ANCHORING-ENGINE.md), [`plan.md`](plan.md), [`Specification/BASIC_DESIGN_NACENTECH.md`](file:///Users/luongdt/Library/CloudStorage/GoogleDrive-luongdt.wi@gmail.com/My%20Drive/NacenTechProject/Specification/BASIC_DESIGN_NACENTECH.md) Mục 24.  

---

### PHASE 1: NỀN TẢNG KIẾN TRÚC, ĐỘNG CƠ TOÁN HỌC ZKP, DOMAIN MODEL & EF CORE MIGRATION (6 TASKS)

- [x] `T-11.01` `[Doc]`: Khởi tạo Module `modules/blockchain`, đăng ký ModuleRegistry & Thiết lập Fact-Sheet tại `.nacen/facts/FACT_TASK11_BLOCKCHAIN_SCHEMA.md`.
  - Tạo project `SourceCode/backend/modules/blockchain/NacenTech.Blockchain.csproj` và liên kết vào solution `NacenTech.slnx`.
  - Khai báo class `BlockchainModule : IModule` cấu hình Schema `blockchain`, đăng ký DI Container và ModuleRegistry.
  - Lập bản khai sự thật `FACT_TASK11_BLOCKCHAIN_SCHEMA.md` tuân thủ nghiêm ngặt kỷ luật `fact-forcing-guard.py`.
  - *Kiểm chứng*: `dotnet build SourceCode/backend/NacenTech.slnx` thành công 0 lỗi; script `python3 Agent/scripts/fact-forcing-guard.py` xác thực hợp lệ.

- [x] `T-11.02` `[BE]`: Cài đặt Công cụ Chuẩn hóa Đại số Canonical JSON theo chuẩn quốc tế RFC 8785 (JCS) trong C# .NET 10.
  - Xây dựng `CanonicalJsonSerializer` tại `Infrastructure/Cryptography/`.
  - Cưỡng chế quy tắc: Sắp xếp các khóa JSON theo thứ tự từ điển mã byte UTF-8, chuẩn hóa số thực IEEE 754, loại bỏ khoảng trắng và định dạng ký tự thoát Unicode chuẩn.
  - Đảm bảo tính tất định (Determinism): Hai đối tượng có cùng thuộc tính dù đảo thứ tự trường khi qua serializer luôn sinh chuỗi byte giống nhau 100%.
  - *Kiểm chứng*: Unit test xUnit kiểm tra băm SHA-256 của chuỗi Canonical JSON từ 5 mẫu dữ liệu payload phức tạp đạt kết quả băm trùng khớp tuyệt đối.

- [x] `T-11.03` `[BE]`: Xây dựng Động cơ Cây Merkle Nhị phân Cân bằng (Binary Merkle Tree Engine) & Sinh đường dẫn Audit Proof (`merkle_path`).
  - Xây dựng `BinaryMerkleTreeEngine` tại `Application/Services/` kế thừa port `IMerkleTreeEngine`.
  - Thuật toán dựng cây: Nếu số lá lẻ, tự động nhân đôi lá cuối; tính toán băm nút cha $H(\text{Left} \Vert \text{Right})$ bằng thuật toán SHA-256.
  - Sinh đường dẫn kiểm chứng `merkle_path` (danh sách sibling hashes và vị trí L/R) cho từng lá để người dùng có thể verify trong $O(\log N)$.
  - *Kiểm chứng*: Unit test tạo cây từ 1 lá, 2 lá, 7 lá, 100 lá; kiểm tra tính toán Merkle Root và verify đường dẫn Audit Path đạt 100% PASS.

- [x] `T-11.04` `[BE]`: Cài đặt Động cơ Mật mã học Native ZKProof Engine (Salted Commitment & Groth16 Envelope Synthesizer).
  - Xây dựng `NativeZkProofEngine` tại `Application/Services/` kế thừa port `IZkProofService`.
  - Sinh Salt mật mã học ngẫu nhiên 256-bit (`RandomNumberGenerator`) bảo vệ quyền riêng tư theo NĐ 13/2023/NĐ-CP (PDPD).
  - Tính toán Cam kết Mật mã học ZKP (Poseidon / SHA-256 salted).
  - Đóng gói cấu trúc bằng chứng chuẩn SnarkJS Groth16 Envelope (`pi_a`, `pi_b`, `pi_c`, `publicSignals`) sẵn sàng kiểm chứng tức thì $O(1)$.
  - *Kiểm chứng*: Unit test kiểm tra cam kết ZKP không thể bị giải ngược dữ liệu gốc; cấu trúc Groth16 Envelope tương thích chuẩn JSON Schema.

- [x] `T-11.05` `[BE]`: Xây dựng Tầng Domain Aggregate Roots & Bộ quy tắc bất biến `BR-BC-01..08`.
  - Xây dựng các Aggregate Roots: `AnchorPolicy`, `AnchorRecord`, `LedgerBlock`, `ZkProofVaultRecord`, `BridgeSyncLog`.
  - Cưỡng chế các quy tắc nghiệp vụ bất biến:
    * `BR-BC-01`: Chỉ cho phép neo thực thể khi trạng thái thỏa mãn `trigger_status` trong chính sách.
    * `BR-BC-02`: Mỗi thực thể chỉ có duy nhất 1 bản ghi neo active (`UNIQUE(entity_type, entity_id)`).
    * `BR-BC-03`: Khối sổ cái số #0 phải là Genesis Block với `previous_hash` là 64 ký tự `0`.
    * `BR-BC-04`: Số thứ tự khối `block_number` phải tăng tuần tự liên tục không đứt đoạn.
    * `BR-BC-05`: Khối sổ cái không bao giờ được sửa đổi (`IsImmutable`).
    * `BR-BC-06`: Bản ghi neo chỉ chuyển sang `LOCAL_LEDGER_ANCHORED` khi khối đã được ký số hợp lệ.
    * `BR-BC-07`: Mọi thay đổi dữ liệu chính sách và bản ghi phải kiểm tra Concurrency Token (`version`).
    * `BR-BC-08`: Nghiêm cấm ghi dữ liệu thô PII vào trường lưu trữ chuỗi.
  - *Kiểm chứng*: Unit test Domain Invariants bao phủ 100% các quy tắc `BR-BC-01` $\rightarrow$ `BR-BC-08`.

- [x] `T-11.06` `[BE]`: Cấu hình EF Core Fluent API cho schema `blockchain.*` và thực thi Non-Destructive Migration CSDL PostgreSQL 16 thật.
  - Tạo `BlockchainDbContextConfig.cs` và các file cấu hình Fluent API trong `Infrastructure/Persistence/`.
  - Thiết lập schema `blockchain`, khóa chính, khóa ngoại, chỉ mục hiệu năng (`ix_anchor_records_status_created_at`, `ix_ledger_blocks_block_hash`), và Concurrency Token (`version`).
  - Sinh migration `AddBlockchainModuleSchema` và chạy cập nhật CSDL PostgreSQL 16 thật.
  - *Kiểm chứng*: Kết nối PostgreSQL 16 kiểm tra đủ 5 bảng trong schema `blockchain.*` và chạy `clean-arch-guard` kiểm tra 0 lỗi rò rỉ ranh giới.

---

### PHASE 2: SỔ CÁI KHỐI NỘI BỘ, BỘ THÍCH ỨNG NDACHAIN, OUTBOX WORKER & REST APIS (6 TASKS)

- [x] `T-11.07` `[BE]`: Cài đặt `LocalSovereignLedgerAdapter` (Cơ chế đóng khối số hóa thật, xâu chuỗi PreviousHash SHA-256, ký số khối ECDSA Secp256k1).
  - Triển khai adapter tại `Infrastructure/Adapters/LocalSovereignLedgerAdapter.cs` kế thừa `IBlockchainAnchorGateway`.
  - Đọc `previous_hash` của khối cao nhất hiện tại để xâu chuỗi khối mới:
    $$\text{BlockHash}_n = \text{SHA256}\left(\text{BlockNumber}_n \mathbin{\Vert} \text{PreviousHash}_{n-1} \mathbin{\Vert} \text{MerkleRoot}_n \mathbin{\Vert} \text{Timestamp}_n \mathbin{\Vert} \text{TxCount}_n\right)$$
  - Sử dụng cặp khóa nền tảng `PlatformKeyManager` ký số ECDSA secp256k1 sinh `block_signature` và gắn `validator_address`.
  - Thực thi trong một giao dịch nguyên tử PostgreSQL ACID: Ghi `ledger_blocks` và cập nhật hàng loạt `anchor_records` sang `LOCAL_LEDGER_ANCHORED`.
  - *Kiểm chứng*: Chạy test đóng khối thử nghiệm 10 bản ghi; xác thực chữ ký ECDSA thành công với Public Key công khai.

- [x] `T-11.08` `[BE]`: Cài đặt `NdaChainGatewayAdapter` (Đầu chờ JSON-RPC 2.0 / ChainHub REST, Smart Contract ABI `anchorMerkleRoot`, định danh `did:nda`).
  - Triển khai adapter tại `Infrastructure/Adapters/NdaChainGatewayAdapter.cs` kế thừa `IBlockchainAnchorGateway`.
  - Xây dựng HTTP Client gọi JSON-RPC 2.0 theo chuẩn EVM PoA của Bộ Công An: method `eth_sendRawTransaction`, encode ABI `anchorMerkleRoot(bytes32,uint256,string,string)`.
  - Định dạng chuẩn định danh phân tán quốc gia `did:nda:<mst>:<uuid>` và mã truy xuất `NDATrace UID`.
  - Tích hợp cờ cấu hình `Blockchain:NdaChain:Enabled` và Circuit Breaker chống treo ứng dụng khi node ngoài không phản hồi.
  - *Kiểm chứng*: Unit test giả lập JSON-RPC Server phản hồi 200 OK với dummy TxHash; kiểm tra cơ chế Timeout 3000ms hoạt động chính xác.

- [x] `T-11.09` `[BE]`: Xây dựng `BlockchainAnchorJobHandler` tích hợp hàng đợi Transactional Outbox `platform.job_queue`.
  - Tạo `BlockchainAnchorJobHandler` tại `Workers/` xử lý công việc từ `JobQueueWorker`.
  - Khi có sự kiện nghiệp vụ (Chào bán công nghệ được duyệt, MOU được ký kết, Thẩm định TT17 được duyệt), handler đọc thực thể gốc, gọi `NativeZkProofEngine` tạo bản ghi neo `PENDING`.
  - Kiểm tra điều kiện gom lô: Nếu số bản ghi `PENDING` $\ge \text{batch\_size\_threshold}$ HOẶC thời gian chờ $\ge \text{batch\_timeout\_minutes}$, tự động kích hoạt `LocalSovereignLedgerService.FlushPendingRecordsToBlockAsync()`.
  - *Kiểm chứng*: Enqueue 12 jobs vào `platform.job_queue`; worker xử lý tự động đóng thành 1 Block với 10 records và 1 Block tiếp theo với 2 records.

- [x] `T-11.10` `[BE]`: Xây dựng `NdaChainBridgeSyncWorker` (Background Service đồng bộ bù Merkle Root lên NDAChain).
  - Triển khai `IHostedService` chạy định kỳ (mặc định mỗi 60 giây) quét các khối có trạng thái `LOCAL_LEDGER_ANCHORED` và `status != 'NDACHAIN_SYNCED'`.
  - Gửi Merkle Root lên `NdaChainGatewayAdapter`, ghi nhận `ndachain_tx_hash`, `ndachain_block_number`, cập nhật trạng thái sang `NDACHAIN_CONFIRMED`.
  - Ghi nhật ký chi tiết vào `blockchain.bridge_sync_logs`, có cơ chế Exponential Backoff khi gặp sự cố mạng.
  - *Kiểm chứng*: Chạy worker với mock adapter; kiểm tra các khối nội bộ được cập nhật đầy đủ `ndachain_tx_hash` và log đồng bộ được ghi vào CSDL.

- [x] `T-11.11` `[BE]`: Xây dựng `BlockchainVerificationService` (Dịch vụ kiểm chứng toán học trực tuyến và phát hiện xâm phạm dữ liệu Tamper-evidence).
  - Triển khai `BlockchainVerificationService` tại `Application/Services/`.
  - Luồng kiểm chứng toán học 4 bước độc lập:
    1. Đọc dữ liệu thực thể hiện tại từ CSDL gốc, serialize Canonical JSON RFC 8785, tính lại Hash cam kết.
    2. Đối soát Hash cam kết với `commitment_hash` trong `anchor_records`. Nếu lệch $\rightarrow$ Trả kết luận **`TAMPERED`**.
    3. Tra cứu `merkle_path` và tính toán đường dẫn băm tới `merkle_root` của khối. Nếu không khớp $\rightarrow$ Trả kết luận **`TAMPERED`**.
    4. Xác thực chữ ký số ECDSA của `block_hash` bằng Public Key của Nền tảng. Nếu chữ ký sai $\rightarrow$ Trả kết luận **`BLOCK_UNCONFIRMED`**.
  - Nếu cả 4 bước đều khớp 100% $\rightarrow$ Trả kết luận **`VERIFIED`**.
  - *Kiểm chứng*: Viết test với dữ liệu gốc toàn vẹn $\rightarrow$ `VERIFIED`; cố tình sửa 1 ký tự trong payload $\rightarrow$ Lập tức phát hiện `TAMPERED`.

- [x] `T-11.12` `[BE]`: Xây dựng REST API Controllers (`BlockchainAdminController` và `BlockchainPublicController`) kèm 3D Scoped RBAC.
  - Tạo `BlockchainAdminController` với các endpoints:
    * `/api/v1/admin/blockchain/policies` (GET, PUT)
    * `/api/v1/admin/blockchain/blocks` (GET list, GET detail, POST flush)
    * `/api/v1/admin/blockchain/records` (GET list tra cứu)
    * `/api/v1/admin/blockchain/bridge/status` (GET) & `/trigger-sync` (POST)
    * Gán chính sách RBAC: Chỉ `ADMIN`, `SUPER_ADMIN`, `OPERATOR_ADMIN` mới có quyền truy cập.
  - Tạo `BlockchainPublicController` với các endpoints:
    * `GET /api/v1/public/blockchain/verify/{entityType}/{entityId}` (Tra cứu công khai)
    * `POST /api/v1/public/blockchain/verify/live` (Kiểm chứng toán học trực tuyến cho khách vãng lai)
  - *Kiểm chứng*: Swagger UI hiển thị đủ các endpoints; kiểm thử quyền truy cập đúng ma trận phân quyền.

---

### PHASE 3: GIAO DIỆN WEB PORTAL DUAL-SURFACE & COMPONENT KIỂM CHỨNG (5 TASKS)

- [x] `T-11.13` `[FE]`: Typed API Client `src/lib/api/blockchain.ts` & Cập nhật Menu Điều hướng Quản trị (`/admin/layout.tsx`).
  - Định nghĩa đầy đủ TypeScript Interfaces và DTOs: `AnchorPolicyDto`, `LedgerBlockDto`, `AnchorRecordDto`, `LiveVerificationVerdictDto`, `BridgeStatusDto`.
  - Viết các hàm gọi API tương ứng bọc qua `fetchClient` chuẩn NacenTech.
  - Bổ sung mục điều hướng **"🛡️ Trung tâm Blockchain & ZKP"** vào Sidebar Quản trị (`/admin/layout.tsx`).
  - *Kiểm chứng*: `npm run build` hoặc `tsc --noEmit` 0 lỗi TypeScript; Sidebar hiển thị menu mới.

- [x] `T-11.14` `[FE]`: Xây dựng Bề mặt Quản trị Tab 1 — Ma Trận Chính Sách Neo Dữ Liệu (`/admin/blockchain?tab=policies`).
  - Xây dựng giao diện danh sách chính sách các thực thể: `SELLER_OFFER`, `DEAL_ROOM_MOU`, `TT17_ASSESSMENT`, `ENTERPRISE_PROFILE`...
  - Switch Toggle bật/tắt chính sách nhanh có xác nhận (Optimistic UI update).
  - Modal cấu hình chi tiết: Cho phép thay đổi `batch_size_threshold` (1–500), `batch_timeout_minutes` (1–60).
  - Bọc toàn bộ trong component `<Async>` chuẩn hóa 5 trạng thái UX (Loading, Empty, Error, Success, Updating).
  - *Kiểm chứng*: Bật/tắt chính sách trên UI cập nhật thành công vào CSDL PostgreSQL; hiển thị thông báo Toast chuẩn.

- [x] `T-11.15` `[FE]`: Xây dựng Bề mặt Quản trị Tab 2 — Sổ Cái Khối, Trình duyệt Merkle Tree & Nút Flush Block (`/admin/blockchain?tab=ledger`).
  - Thanh KPI Header: Tổng số khối, Tổng giao dịch đã neo, Khối mới nhất, Tỷ lệ toàn vẹn.
  - Nút CTA nổi bật: *"Đóng Khối Ngay (Flush Pending Records)"* với hiệu ứng loading khi worker thực thi.
  - Bảng danh sách Khối: Phân trang 10 khối/trang, hiển thị Block Number, Block Hash, Tx Count, Chữ ký số, Trạng thái.
  - Modal Chi Tiết Khối: Hiển thị danh sách các bản ghi bên trong và sơ đồ Cây Merkle trực quan (Merkle Tree Explorer).
  - Thẻ Live Verifier Tool: Form chọn loại thực thể, nhập ID hoặc chọn từ danh sách $\rightarrow$ Chạy kiểm chứng và hiển thị kết quả trực quan (Xanh: Toàn vẹn, Đỏ: Giả mạo).
  - *Kiểm chứng*: Thao tác bấm "Đóng Khối Ngay" thành công; tra cứu khối hiển thị đầy đủ chi tiết và cây Merkle.

- [x] `T-11.16` `[FE]`: Xây dựng Bề mặt Quản trị Tab 3 — Cổng Liên Thông NDAChain & Lịch Sử Đồng Bộ Bridge (`/admin/blockchain?tab=bridge`).
  - Card trạng thái kết nối Chuỗi Khối Quốc Gia Bộ Công An: Badge trạng thái (`READY` / `CONNECTED`), Endpoint, Chain ID, Địa chỉ Smart Contract.
  - Bộ đếm khối chờ đồng bộ (Unsynced Blocks Count) và Nút kích hoạt *"Đồng Bộ Bù Lên NDAChain"*.
  - Bảng nhật ký `bridge_sync_logs`: Phân trang, hiển thị TxHash, Trạng thái (Thành công/Thử lại/Lỗi), Thời gian thực hiện, Payload chi tiết khi click xem.
  - *Kiểm chứng*: Giao diện hiển thị đúng trạng thái của Bridge; kích hoạt đồng bộ hiển thị phản hồi ngay trên UI.

- [x] `T-11.17` `[FE]`: Xây dựng Component Dùng Chung `<BlockchainZkpBadge />` & Modal Kiểm chứng Công khai.
  - Tạo component `src/components/blockchain/BlockchainZkpBadge.tsx`.
  - Hiển thị huy hiệu sang trọng: **"🛡️ Bảo chứng Mật mã học ZKP & Chuỗi khối"** kèm icon khi thực thể đã được neo.
  - Nhúng vào 3 màn hình cốt lõi:
    1. Trang chi tiết Chào bán công nghệ: `/chao-ban-cong-nghe/[id]`.
    2. Trang Biên bản thỏa thuận Deal Room: `/portal/opportunities/[id]/deal-room`.
    3. Trang Báo cáo kết quả thẩm định TT17: `/portal/enterprise/assessments/[id]`.
  - Khi click vào Badge: Mở Modal Kiểm Chứng Độc Lập hiển thị Block Hash, Merkle Root, Cam kết ZKP, nút bấm *"Xác thực toán học thời gian thực"* gọi API `/verify/live` và hiển thị kết quả kiểm chứng trực tiếp cho người xem.
  - *Kiểm chứng*: Truy cập trang chi tiết công nghệ đã duyệt, thấy Badge hiển thị; click Badge mở Modal kiểm chứng hoạt động mượt mà.

---

### PHASE 4: BỘ KIỂM THỬ TOÀN DIỆN 4 TẦNG & KỊCH BẢN PHÁ HOẠI TAMPER DATA (5 TASKS)

- [x] `T-11.18` `[Test]`: Bộ Unit Tests (xUnit) cho Toán học Mật mã (Canonical JSON RFC 8785, Merkle Tree Root, ZKP Commitment Invariants).
  - Đã triển khai trong `SourceCode/backend/tests/invariants/`:
    * `BlockchainCanonicalJsonTests.cs` (Chuẩn hóa Canonical JSON RFC 8785, không đổi hash khi xáo thuộc tính)
    * `BlockchainMerkleTreeTests.cs` (Cây Merkle nhị phân cân bằng, audit proof)
    * `BlockchainZkProofEngineTests.cs` (Cam kết ZKP Salted Commitment, AES-256-GCM Vault)
    * `BlockchainDomainInvariantsTests.cs` (Bảo đảm 100% Invariants `BR-BC-01` -> `BR-BC-08`)
  - *Kiểm chứng*: 100% tests PASS.

- [x] `T-11.19` `[Test]`: Bộ Database Integration Tests trên PostgreSQL 16 thật.
  - Đã triển khai trong `BlockchainLocalSovereignLedgerTests.cs`:
    * Kiểm thử quy trình đóng khối tự động nguyên tử (Atomic Block Creation)
    * Kiểm thử tính liên tục chuỗi khối (`previous_hash` của Block #N khớp chính xác `block_hash` của Block #N-1)
    * Kiểm thử Concurrency Token trên schema `blockchain.*` thật của PostgreSQL 16.
  - *Kiểm chứng*: 100% Integration Tests PASS trên DB PostgreSQL thật.

- [x] `T-11.20` `[Test]`: Bộ Contract Tests & Fuzzing Phân quyền Scoped RBAC trên API Quản trị Blockchain.
  - Đã triển khai trong `BlockchainControllersTests.cs`:
    * Fuzzing ma trận phân quyền: `BUYER`, `SELLER`, `EXPERT` khi truy cập `/api/v1/admin/blockchain/*` nhận `403 Forbidden` (`ForbidResult`).
    * `ADMIN`, `SUPER_ADMIN` truy cập thành công `200 OK`.
    * Khách vãng lai (`GUEST`) truy cập `/api/v1/public/blockchain/verify/*` thành công `200 OK`.
  - *Kiểm chứng*: Bộ test RBAC Fuzzing đạt 100% PASS, không rò rỉ phân quyền.

- [x] `T-11.21` `[Test]`: Kịch bản Kiểm thử Khả năng Phục hồi & Hỗn loạn (Chaos & Network Dropout Resilience) trên NDAChain Bridge Sync Worker.
  - Đã triển khai trong `BlockchainNdaChainBridgeSyncTests.cs`:
    * Bơm lỗi ngắt kết nối mạng giả lập node NDAChain bị sập (Standby mode).
    * Sổ cái nội bộ an toàn, khối được giữ ở trạng thái `LOCAL_LEDGER_ANCHORED`.
    * Khôi phục kết nối: `NdaChainBridgeSyncWorker` tự động quét bù và đồng bộ thành công các khối tồn đọng.
  - *Kiểm chứng*: 100% Chaos & Resilience tests PASS.

- [x] `T-11.22` `[Test]`: Kịch bản Kiểm thử E2E & Phá hoại Dữ liệu (Tamper-Evidence Verification Test).
  - Đã triển khai trong `BlockchainVerificationServiceTests.cs` và frontend tests:
    * Test case 1: Dữ liệu nguyên vẹn -> Kết quả **`VERIFIED`** (IsSuccess = true, 4/4 bước kiểm chứng PASS).
    * Test case 2 (Phá hoại dữ liệu): Cố tình sửa đổi 1 trường dữ liệu (sửa giá tiền trong JSON) -> Kết quả lập tức bắt được và chuyển sang cảnh báo đỏ rực **`TAMPERED`** (IsSuccess = false), chỉ rõ bước ZKP Commitment phát hiện vi phạm.
  - *Kiểm chứng*: Bộ test phá hoại dữ liệu kiểm chứng tính toàn vẹn toán học tuyệt đối của hệ thống.

---

## Phase 5: BACLINK Refactor Delta (CR-BACLINK-006)

- [x] `T-11.BL.01` `[DB]` Cập nhật/bổ sung cấu hình `blockchain.anchor_policies` và liên kết bản ghi neo kiểm chứng mẫu cho 4 thực thể BACLINK (`TASK-02` `ENTERPRISE_PROFILE`, `TASK-04` `SELLER_OFFER`, `TASK-08` `DEAL_ROOM_MOU`, `TASK-09` `TT17_ASSESSMENT`) trong `SourceCode/backend/scripts/seed_baclink_demo_data.sql` (`REQ-11-BL-01`, `BR-11-BL-01`).
  - *Kiểm chứng*: Chạy `psql` idempotent vào PostgreSQL thật; xác minh 0 thay đổi phá hủy schema `blockchain.*` và bảo toàn `BlockchainBusinessRules` (`BR-BC-01`..`08`).

- [x] `T-11.BL.02` `[BE]` Kiểm tra & chuẩn hóa `SourceCode/backend/modules/blockchain/Api/BlockchainAdminController.cs` (dòng 15–16) sử dụng `PlatformRoles.NormalizeTier` cho `ADMIN` (tương thích `ADR-0018`) và trả định danh node **BACLINK Trust Node — Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh** (bảo toàn 100% `CanonicalJsonSerializer` RFC 8785, ZKP AES-256-GCM, Merkle Tree, Outbox, NDAChain `did:nda`) (`BR-11-BL-01`).
  - *Kiểm chứng*: `dotnet build SourceCode/backend/NacenTech.slnx` 0 lỗi; `dotnet test` pass các suite `BlockchainCanonicalJsonTests`, `BlockchainMerkleTreeTests`, `BlockchainZkProofEngineTests`, `BlockchainVerificationServiceTests`.

- [x] `T-11.BL.03` `[FE]` Tái định vị giao diện quản trị `SourceCode/frontend/src/app/admin/blockchain/page.tsx` (bao gồm dòng 579 `Sổ cái nội bộ NacenTech`) sang **BACLINK Trust/ZKP — Chứng thực Hồ sơ Năng lực & MOU số** và **BACLINK Trust Node — Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh** (`REQ-11-BL-01`, `BR-11-BL-01`, `AC-11-BL-01`).
  - *Kiểm chứng*: `npx tsc --noEmit` 0 lỗi; không còn chuỗi `NacenTech Node` / `Sở KH&CN` trên `/admin/blockchain`.

- [x] `T-11.BL.04` `[FE]` Cập nhật `SourceCode/frontend/src/components/blockchain/BlockchainZkpBadge.tsx` (và modal kiểm chứng `/blockchain/verify` / chứng nhận mật mã) sang thương hiệu **BACLINK Trust/ZKP** & **BACLINK Trust Node — Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh**, hiển thị trên 4 thực thể BACLINK (`TASK-02`, `TASK-04`, `TASK-08`, `TASK-09`) (`REQ-11-BL-01`, `AC-11-BL-02`).
  - *Kiểm chứng*: `npx tsc --noEmit` 0 lỗi; click `<BlockchainZkpBadge />` mở modal gọi `/api/v1/public/blockchain/verify/live` trả `VERIFIED`/`TAMPERED` chính xác.

- [x] `T-11.BL.05` `[TEST]` Kiểm thử 4 tầng cho `TASK-11` (`AC-11-BL-01`..`AC-11-BL-03`):
  - xUnit (`BlockchainCanonicalJsonTests`, `BlockchainLocalSovereignLedgerTests`, `BlockchainControllersTests`, `BlockchainVerificationServiceTests`) chứng minh RFC 8785, Tamper-Evidence (`TAMPERED`) và RBAC 3 cấp (`ENTERPRISE`/`PUBLIC_USER` bị chặn `403` trên `/api/v1/admin/blockchain/*`, `ADMIN` đạt `200`, `GUEST` kiểm chứng public `200`).
  - Vitest (`SourceCode/frontend/src/app/admin/blockchain/page.test.tsx`, `SourceCode/frontend/src/components/blockchain/BlockchainZkpBadge.test.tsx`) kiểm tra nhãn **BACLINK Trust/ZKP** và live verify interaction.
  - *Kiểm chứng*: `dotnet test` & `npx vitest run src/app/admin/blockchain/ src/components/blockchain/` pass 100%, Zero-Mock.
