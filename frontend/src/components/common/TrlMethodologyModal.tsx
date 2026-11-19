"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  BookOpen,
  ShieldCheck,
  Award,
  FileCheck2,
  ExternalLink,
  Layers,
  HelpCircle,
  Building,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Code2,
  Calculator,
  ArrowRight
} from "lucide-react";

interface TrlMethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLevel?: number;
}

export interface TrlLevelDetail {
  level: number;
  stage: "LAB" | "PILOT" | "COMMERCIAL";
  stageName: string;
  stageColor: string;
  title: string;
  definition: string;
  hardwareDescription: string;
  softwareDescription: string;
  exitCriteria: string;
  evidenceRequirements: string[];
  commercialFeasibility: string;
}

export const TRL_LEVEL_DETAILS: TrlLevelDetail[] = [
  {
    level: 1,
    stage: "LAB",
    stageName: "Nghiên cứu cơ bản & Phòng Lab (TRL 1-3)",
    stageColor: "blue",
    title: "Quan sát và báo cáo nguyên lý cơ bản",
    definition: "Các nguyên lý cơ bản đã được quan sát và báo cáo.",
    hardwareDescription: "Đã hình thành tri thức khoa học làm nền tảng cho các khái niệm hoặc ứng dụng công nghệ phần cứng.",
    softwareDescription: "Đã hình thành tri thức khoa học làm nền tảng cho các đặc tính cơ bản của kiến trúc phần mềm và cách biểu diễn bằng toán học.",
    exitCriteria: "Nghiên cứu làm cơ sở cho khái niệm hoặc ứng dụng được đề xuất đã được công bố qua phản biện khoa học.",
    evidenceRequirements: [
      "Báo cáo kết quả nghiên cứu khoa học cấp cơ sở/đề tài nghiên cứu",
      "Bài báo khoa học xuất bản trên tạp chí chuyên ngành",
      "Biên bản họp hội đồng khoa học nghiệm thu ý tưởng sơ khởi"
    ],
    commercialFeasibility: "Chưa thể thương mại hóa; cần tiếp tục đầu tư R&D"
  },
  {
    level: 2,
    stage: "LAB",
    stageName: "Nghiên cứu cơ bản & Phòng Lab (TRL 1-3)",
    stageColor: "blue",
    title: "Hình thành khái niệm hoặc ứng dụng",
    definition: "Khái niệm công nghệ và/hoặc ứng dụng đã được hình thành.",
    hardwareDescription: "Hoạt động sáng chế bắt đầu. Ứng dụng thực tiễn đã được xác định nhưng mới ở mức giả định. Chưa có bằng chứng thực nghiệm hoặc phân tích chi tiết để củng cố giả định đó.",
    softwareDescription: "Ứng dụng thực tiễn đã được xác định nhưng mới ở mức giả định. Chưa có bằng chứng thực nghiệm hoặc phân tích chi tiết để củng cố giả định đó. Các đặc tính cơ bản của thuật toán, các cách biểu diễn và các khái niệm đã được xác định. Các nguyên lý cơ bản đã được hiện thực hóa bằng mã. Các thí nghiệm đã được thực hiện với dữ liệu tổng hợp.",
    exitCriteria: "Có tài liệu mô tả ứng dụng hoặc khái niệm, trong đó đề cập đến tính khả thi và lợi ích.",
    evidenceRequirements: [
      "Tài liệu mô tả kiến trúc/sơ đồ khối giải pháp công nghệ",
      "Báo cáo tính khả thi sơ bộ (Preliminary Feasibility Study)",
      "Đơn đề xuất sáng chế hoặc giải pháp hữu ích (dự thảo)"
    ],
    commercialFeasibility: "Giai đoạn ý tưởng giải pháp; cần tài trợ ươm tạo"
  },
  {
    level: 3,
    stage: "LAB",
    stageName: "Nghiên cứu cơ bản & Phòng Lab (TRL 1-3)",
    stageColor: "blue",
    title: "Chứng minh khái niệm bằng phân tích và thực nghiệm",
    definition: "Tính khả thi của khái niệm đối với chức năng và/hoặc đặc tính then chốt được chứng minh bằng phân tích và thực nghiệm.",
    hardwareDescription: "Các nghiên cứu phân tích đặt công nghệ vào bối cảnh phù hợp. Các hoạt động trình diễn trong phòng thí nghiệm, mô hình hóa và mô phỏng xác nhận dự đoán từ phân tích.",
    softwareDescription: "Một số chức năng được phát triển để xác nhận các đặc tính then chốt và các dự đoán, bằng cách sử dụng các thành phần phần mềm chưa tích hợp.",
    exitCriteria: "Có tài liệu ghi lại kết quả phân tích hoặc thực nghiệm xác nhận các dự đoán về những thông số chủ chốt.",
    evidenceRequirements: [
      "Biên bản đo kiểm thực nghiệm trong phòng thí nghiệm",
      "Báo cáo kết quả PoC (Proof of Concept Report) có số liệu đối chứng",
      "Video hoặc log dữ liệu vận hành mô hình lab thu nhỏ"
    ],
    commercialFeasibility: "Đã vượt qua rủi ro nguyên lý; tìm kiếm đối tác đồng nghiên cứu"
  },
  {
    level: 4,
    stage: "PILOT",
    stageName: "Thử nghiệm Pilot & Mô phỏng (TRL 4-6)",
    stageColor: "amber",
    title: "Xác nhận trong phòng thí nghiệm (Breadboard)",
    definition: "Linh kiện và/hoặc mô hình thử nghiệm sơ bộ (breadboard) được xác nhận trong môi trường phòng thí nghiệm.",
    hardwareDescription: "Một mô hình thử nghiệm sơ bộ của hệ thống hoặc linh kiện, có độ trung thực thấp, được chế tạo và vận hành để trình diễn chức năng cơ bản và các môi trường thử nghiệm then chốt. Các dự đoán hiệu năng tương ứng được xác lập theo môi trường vận hành cuối cùng.",
    softwareDescription: "Các thành phần phần mềm đảm nhiệm chức năng then chốt được tích hợp và xác nhận về chức năng để xác lập khả năng tương tác và bắt đầu phát triển kiến trúc. Các môi trường phù hợp được xác định và hiệu năng trong các môi trường đó được dự đoán.",
    exitCriteria: "Có tài liệu ghi lại kết quả thử nghiệm cho thấy hiệu năng phù hợp với dự đoán từ phân tích. Có tài liệu xác định môi trường phù hợp.",
    evidenceRequirements: [
      "Báo cáo tích hợp hệ thống phần cứng / phần mềm trong phòng lab",
      "Bảng thông số kỹ thuật sơ bộ (Preliminary Data Sheet)",
      "Biên bản thử nghiệm độ tương thích giữa các module cốt lõi"
    ],
    commercialFeasibility: "Cần tối ưu hóa quy trình chế tạo mẫu thử pilot"
  },
  {
    level: 5,
    stage: "PILOT",
    stageName: "Thử nghiệm Pilot & Mô phỏng (TRL 4-6)",
    stageColor: "amber",
    title: "Xác nhận trong môi trường phù hợp (Brassboard)",
    definition: "Linh kiện và/hoặc mô hình thử nghiệm sơ bộ (breadboard/brassboard) được xác nhận trong môi trường phù hợp.",
    hardwareDescription: "Một mô hình thử nghiệm trung gian (brassboard) của hệ thống hoặc linh kiện, có độ trung thực trung bình, được chế tạo và vận hành. Mô hình được dùng để chứng minh hiệu năng tổng thể trong môi trường vận hành mô phỏng với các thành phần hỗ trợ sát thực tế, qua đó thể hiện hiệu năng tổng thể ở các khía cạnh then chốt. Hiệu năng được dự đoán cho các giai đoạn phát triển tiếp theo.",
    softwareDescription: "Các thành phần phần mềm đầu cuối được triển khai và kết nối với các hệ thống hoặc mô phỏng hiện có phù hợp với môi trường mục tiêu. Hệ thống phần mềm đầu cuối được thử nghiệm trong môi trường phù hợp và đạt hiệu năng dự đoán. Hiệu năng trong môi trường vận hành được dự đoán. Các bản triển khai nguyên mẫu được phát triển.",
    exitCriteria: "Có tài liệu ghi lại kết quả thử nghiệm cho thấy hiệu năng phù hợp với dự đoán từ phân tích. Có tài liệu xác định các yêu cầu khi thay đổi quy mô.",
    evidenceRequirements: [
      "Báo cáo mô phỏng điều kiện làm việc (CAD/CAE/Thermal/Stress)",
      "Mô hình bán công nghiệp (Breadboard / Sub-scale Model)",
      "Giấy chấp nhận đơn hợp lệ về Sở hữu trí tuệ (Cục SHTT)"
    ],
    commercialFeasibility: "Đánh giá nhu cầu thị trường và chuẩn bị chuyển giao công nghiệp"
  },
  {
    level: 6,
    stage: "PILOT",
    stageName: "Thử nghiệm Pilot & Mô phỏng (TRL 4-6)",
    stageColor: "amber",
    title: "Trình diễn mô hình hoặc nguyên mẫu trong môi trường vận hành",
    definition: "Mô hình hoặc nguyên mẫu của hệ thống hay phân hệ được trình diễn trong môi trường vận hành / môi trường phù hợp.",
    hardwareDescription: "Một nguyên mẫu hệ thống hoặc linh kiện có độ trung thực cao, xử lý thỏa đáng mọi vấn đề then chốt khi thay đổi quy mô, được chế tạo và vận hành trong môi trường phù hợp để chứng minh khả năng hoạt động dưới các điều kiện môi trường then chốt.",
    softwareDescription: "Các bản triển khai nguyên mẫu của phần mềm được trình diễn trên các bài toán sát thực tế ở quy mô đầy đủ. Phần mềm được tích hợp một phần với các hệ thống phần cứng hoặc phần mềm hiện có. Mới có một phần tài liệu. Tính khả thi về kỹ thuật đã được chứng minh đầy đủ.",
    exitCriteria: "Có tài liệu ghi lại kết quả thử nghiệm cho thấy hiệu năng phù hợp với dự đoán từ phân tích.",
    evidenceRequirements: [
      "Biên bản nghiệm thu chạy thử nghiệm Pilot dây chuyền bán công nghiệp",
      "Báo cáo phân tích rủi ro kỹ thuật (FMEA - Failure Mode Effects Analysis)",
      "Hồ sơ bản vẽ chế tạo thử nghiệm có xác nhận của đơn vị kiểm định độc lập"
    ],
    commercialFeasibility: "Sẵn sàng cho việc đầu tư nguyên mẫu thương mại quy mô lớn"
  },
  {
    level: 7,
    stage: "COMMERCIAL",
    stageName: "Thương mại hóa & Sản xuất đại trà (TRL 7-9)",
    stageColor: "emerald",
    title: "Trình diễn nguyên mẫu trong môi trường vận hành",
    definition: "Nguyên mẫu hệ thống được trình diễn trong môi trường vận hành.",
    hardwareDescription: "Một mẫu kỹ thuật có độ trung thực cao, xử lý thỏa đáng mọi vấn đề then chốt khi thay đổi quy mô, được chế tạo và vận hành trong môi trường phù hợp để chứng minh hiệu năng trong môi trường và trên nền tảng vận hành thực tế (mặt đất, trên không hoặc trong không gian).",
    softwareDescription: "Đã có nguyên mẫu phần mềm với đầy đủ các chức năng chủ chốt để trình diễn và thử nghiệm. Nguyên mẫu được tích hợp tốt với các hệ thống phần cứng và phần mềm đang vận hành, qua đó chứng minh tính khả thi khi vận hành. Phần lớn lỗi phần mềm đã được khắc phục. Mới có một phần tài liệu.",
    exitCriteria: "Có tài liệu ghi lại kết quả thử nghiệm cho thấy hiệu năng phù hợp với dự đoán từ phân tích.",
    evidenceRequirements: [
      "Bằng độc quyền Sáng chế hoặc Bằng độc quyền Giải pháp Hữu ích (hoặc Quyết định cấp bằng)",
      "Biên bản thử nghiệm hiện trường (Field Test Report) có xác nhận của bên tiếp nhận",
      "Hồ sơ kiểm định an toàn và tiêu chuẩn kỹ thuật từ tổ chức thử nghiệm được cấp phép"
    ],
    commercialFeasibility: "Sẵn sàng chuyển giao công nghệ hoặc cấp phép li-xăng (Licensing)"
  },
  {
    level: 8,
    stage: "COMMERCIAL",
    stageName: "Thương mại hóa & Sản xuất đại trà (TRL 7-9)",
    stageColor: "emerald",
    title: "Hệ thống thực tế hoàn thiện và đủ điều kiện vận hành",
    definition: "Hệ thống thực tế đã hoàn thiện và được xác nhận đủ điều kiện vận hành / đủ điều kiện bay (flight qualified) qua thử nghiệm và trình diễn.",
    hardwareDescription: "Sản phẩm hoàn chỉnh ở cấu hình cuối cùng đã được trình diễn thành công thông qua thử nghiệm và phân tích đối với môi trường và nền tảng vận hành dự kiến (mặt đất, trên không hoặc trong không gian).",
    softwareDescription: "Toàn bộ phần mềm đã được rà soát và sửa lỗi kỹ lưỡng, đồng thời được tích hợp đầy đủ với tất cả hệ thống phần cứng và phần mềm vận hành. Toàn bộ tài liệu dành cho người dùng, tài liệu đào tạo và tài liệu bảo trì đã hoàn thành. Mọi chức năng đã được trình diễn thành công trong các kịch bản vận hành mô phỏng. Công tác kiểm chứng và xác nhận (Verification and Validation, V&V) đã hoàn tất.",
    exitCriteria: "Có tài liệu ghi lại kết quả thử nghiệm kiểm chứng các dự đoán từ phân tích.",
    evidenceRequirements: [
      "Chứng nhận hợp chuẩn/hợp quy (TCVN, QCVN, ISO 9001, CE, FDA...)",
      "Bộ quy trình công nghệ chế tạo chuẩn (Standard Operating Procedures - SOP)",
      "Báo cáo đánh giá sự phù hợp của cơ quan quản lý nhà nước có thẩm quyền"
    ],
    commercialFeasibility: "Thương mại hóa diện rộng; chào bán cạnh tranh trên thị trường"
  },
  {
    level: 9,
    stage: "COMMERCIAL",
    stageName: "Thương mại hóa & Sản xuất đại trà (TRL 7-9)",
    stageColor: "emerald",
    title: "Chứng minh qua vận hành thực tế trong nhiệm vụ",
    definition: "Hệ thống thực tế đã được chứng minh qua chuyến bay / vận hành thực tế (flight proven) nhờ vận hành thành công trong nhiệm vụ.",
    hardwareDescription: "Sản phẩm hoàn chỉnh đã được vận hành thành công trong một nhiệm vụ thực tế.",
    softwareDescription: "Toàn bộ phần mềm đã được rà soát và sửa lỗi kỹ lưỡng, đồng thời được tích hợp đầy đủ với tất cả hệ thống phần cứng và phần mềm vận hành. Toàn bộ tài liệu đã hoàn thành. Đã bố trí hỗ trợ kỹ thuật để duy trì phần mềm. Hệ thống đã được vận hành thành công trong môi trường vận hành.",
    exitCriteria: "Có tài liệu ghi lại kết quả vận hành trong nhiệm vụ.",
    evidenceRequirements: [
      "Hợp đồng chuyển giao công nghệ / Mua bán thiết bị đã ký kết và thanh lý",
      "Hóa đơn giá trị gia tăng chứng minh hoạt động thương mại thực tế",
      "Báo cáo phản hồi và xác nhận hiệu quả kinh tế của doanh nghiệp ứng dụng"
    ],
    commercialFeasibility: "Dây chuyền đang vận hành ổn định; chuyển giao theo phương thức chìa khóa trao tay"
  }
];

export function TrlMethodologyModal({
  isOpen,
  onClose,
  initialLevel
}: TrlMethodologyModalProps) {
  const [selectedTab, setSelectedTab] = useState<"ALL" | "LAB" | "PILOT" | "COMMERCIAL" | "SCORING">("ALL");
  const [activeLevel, setActiveLevel] = useState<number>(initialLevel || 7);
  const [viewTrack, setViewTrack] = useState<"ALL_TRACKS" | "HARDWARE" | "SOFTWARE">("ALL_TRACKS");

  if (!isOpen) return null;

  const filteredLevels = TRL_LEVEL_DETAILS.filter((item) => {
    if (selectedTab === "ALL" || selectedTab === "SCORING") return true;
    return item.stage === selectedTab;
  });

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 z-10 transition-all transform animate-in zoom-in-95 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Phương Pháp Luận Cấp Độ Sẵn Sàng Công Nghệ (TRL 1–9)
                </h2>
                <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs px-2.5 py-0.5 font-bold border border-amber-300 dark:border-amber-700">
                  Chuẩn NASA TRL 1–9
                </span>
                <span className="rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs px-2.5 py-0.5 font-bold border border-blue-300 dark:border-blue-700">
                  ISO 16290:2013
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Trích dẫn chính thức theo tài liệu <em>Technology Readiness Level Definitions</em> của NASA và tiêu chuẩn quốc tế ISO 16290:2013
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm">
          {/* Căn cứ chuẩn quốc tế NASA & ISO */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/30 p-4 space-y-2">
            <h3 className="font-extrabold text-blue-950 dark:text-blue-300 flex items-center gap-2 text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Khung Tiêu Chuẩn Kỹ Thuật Công Nghiệp Quốc Tế (NASA TRL &amp; ISO 16290)
            </h3>
            <ul className="text-xs text-blue-900 dark:text-blue-200/90 space-y-1.5 list-disc list-inside">
              <li>
                <strong>NASA TRL (1974 / 1989):</strong> Khung đo lường 9 cấp độ do Stan Sadin khởi xướng và John Mankins chuẩn hóa năm 1989 cho Cơ quan Hàng không Vũ trụ Hoa Kỳ. Định nghĩa đầy đủ cho cả <strong>Phần cứng</strong> và <strong>Phần mềm</strong> kèm tiêu chí hoàn thành cấp độ (Exit Criteria).
              </li>
              <li>
                <strong>ISO 16290:2013:</strong> Tiêu chuẩn quốc tế về định nghĩa cấp độ sẵn sàng công nghệ (TRL) và tiêu chí đánh giá trong hệ thống công nghiệp chế tạo và công nghệ cao.
              </li>
              <li>
                <strong>ISO 9001 &amp; IATF 16949:</strong> Hệ tiêu chuẩn quản lý chất lượng dây chuyền sản xuất công nghiệp và phê duyệt chi tiết sản xuất hàng loạt (PPAP) trong chuỗi cung ứng FDI.
              </li>
              <li>
                <strong>Hội đồng Thẩm định Kỹ thuật BACLINK:</strong> Quy chuẩn đối soát hồ sơ minh chứng kỹ thuật, bản vẽ chế tạo và năng lực vận hành thực tế của nhà máy hội viên tại Bắc Ninh.
              </li>
            </ul>
          </div>

          {/* Cơ chế Tính Điểm TRL & Brokerage Matching */}
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-indigo-950/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-indigo-950 dark:text-indigo-200 text-xs uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Cách Tính Điểm Sẵn Sàng Công Nghệ (TRL Score) & Khớp Nối Sàn Giao Dịch
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-200/80 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                Trọng số TRL: 30% tổng điểm Matching
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Theo quy chuẩn kiến trúc sàn BACLINK (<code>BrokerageMatchingEngineService</code>), điểm sẵn sàng công nghệ <span className="font-mono font-bold">S_trl</span> của mỗi hồ sơ chào bán được xác định dựa trên tiêu chuẩn NASA:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900">
                <div className="font-bold text-emerald-700 dark:text-emerald-400">TRL ≥ 7: Đạt 100 Điểm Tối Đa</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Đã chứng minh trong môi trường vận hành thực tế theo chuẩn NASA, ưu tiên hàng đầu trên sàn giao dịch.
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900">
                <div className="font-bold text-amber-700 dark:text-amber-400">TRL 4–6: Đạt 65 – 85 Điểm</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Giai đoạn Pilot/Thử nghiệm bán công nghiệp; điểm số khớp nối phụ thuộc vào yêu cầu của Bên mua.
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900">
                <div className="font-bold text-blue-700 dark:text-blue-400">TRL 1–3: Đạt 40 – 60 Điểm</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Nghiên cứu cơ bản trong Lab; cần thêm nguồn vốn ươm tạo hoặc tài trợ R&D trước khi chuyển giao.
                </div>
              </div>
            </div>
          </div>

          {/* Quy định 2 Tầng Xác Thực (Two-Tier Verification) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 p-4">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-xs mb-1">
                <Layers className="w-4 h-4 text-amber-600" />
                TẦNG 1: TỰ KÊ KHAI (SELF_DECLARED)
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Người bán tự công bố mức TRL dựa trên tài liệu nội bộ. Sản phẩm được niêm yết thương mại trên sàn với huy hiệu <strong>"Tự kê khai (Chưa kiểm định)"</strong> để tối ưu hóa thời gian đưa sản phẩm ra thị trường (Time-to-Market).
              </p>
            </div>
            <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 p-4">
              <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300 text-xs mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                TẦNG 2: THẨM ĐỊNH CHUYÊN SÂU (VERIFIED_BY_GOV)
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Hội đồng thẩm định Kỹ thuật BACLINK hoặc đối tác kiểm định độc lập đối soát hồ sơ gốc (Bằng Sáng chế, Test Report, Hợp đồng thực tế). Sản phẩm đạt chuẩn nhận huy hiệu vàng <strong>"Đã thẩm định chuẩn hóa"</strong> kèm định danh cơ quan duyệt.
              </p>
            </div>
          </div>

          {/* Bộ lọc Dải TRL và Bộ chọn Góc nhìn (Hardware vs Software) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedTab("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedTab === "ALL"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                Tất cả (1–9)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab("LAB")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedTab === "LAB"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300"
                }`}
              >
                TRL 1–3: Lab & Khái niệm
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab("PILOT")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedTab === "PILOT"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300"
                }`}
              >
                TRL 4–6: Pilot & Mô phỏng
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab("COMMERCIAL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedTab === "COMMERCIAL"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                }`}
              >
                TRL 7–9: Thương mại hóa
              </button>
            </div>

            {/* Chế độ xem Phần cứng vs Phần mềm */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 px-2">Góc nhìn:</span>
              <button
                type="button"
                onClick={() => setViewTrack("ALL_TRACKS")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  viewTrack === "ALL_TRACKS"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setViewTrack("HARDWARE")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  viewTrack === "HARDWARE"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Phần cứng
              </button>
              <button
                type="button"
                onClick={() => setViewTrack("SOFTWARE")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  viewTrack === "SOFTWARE"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Phần mềm
              </button>
            </div>
          </div>

          {/* Danh sách 9 Cấp độ TRL chuẩn NASA */}
          <div className="space-y-4">
            {filteredLevels.map((item) => {
              const isSelected = activeLevel === item.level;
              return (
                <div
                  key={item.level}
                  onClick={() => setActiveLevel(item.level)}
                  className={`cursor-pointer rounded-2xl border p-4 sm:p-5 transition ${
                    isSelected
                      ? "border-amber-400 bg-amber-50/40 dark:border-amber-600 dark:bg-amber-950/20 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center justify-center h-8 w-8 rounded-xl text-xs font-black shadow-xs ${
                          item.stage === "COMMERCIAL"
                            ? "bg-emerald-600 text-white"
                            : item.stage === "PILOT"
                            ? "bg-amber-500 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {item.level}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                          TRL {item.level}: {item.title}
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {item.stageName}
                        </span>
                      </div>
                    </div>
                    {item.level >= 7 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 border border-emerald-300 dark:border-emerald-700 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Cần Bằng SHTT / Test Report
                      </span>
                    )}
                  </div>

                  {/* Định nghĩa chính thức của NASA */}
                  <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Định nghĩa chính thức (NASA Definition):
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {item.definition}
                    </p>
                  </div>

                  {/* Khối mô tả song song Phần cứng & Phần mềm chuẩn NASA */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(viewTrack === "ALL_TRACKS" || viewTrack === "HARDWARE") && (
                      <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 text-xs">
                          <Cpu className="w-4 h-4 text-amber-600 shrink-0" />
                          Mô tả phần cứng (Hardware):
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {item.hardwareDescription}
                        </p>
                      </div>
                    )}

                    {(viewTrack === "ALL_TRACKS" || viewTrack === "SOFTWARE") && (
                      <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 text-xs">
                          <Code2 className="w-4 h-4 text-blue-600 shrink-0" />
                          Mô tả phần mềm (Software):
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {item.softwareDescription}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tiêu chí hoàn thành cấp độ chuẩn NASA */}
                  <div className="mt-3 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-300">
                        Tiêu chí hoàn thành cấp độ (NASA Exit Criteria):
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                        {item.exitCriteria}
                      </p>
                    </div>
                  </div>

                  {/* Danh mục hồ sơ minh chứng sàn BACLINK */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-amber-600" />
                      Danh mục hồ sơ minh chứng đề xuất cho sàn giao dịch:
                    </div>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside pl-1">
                      {item.evidenceRequirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                    <div className="mt-2 text-[11px] text-slate-500 italic">
                      Khả năng thương mại &amp; chuyển giao: {item.commercialFeasibility}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            BACLINK · Chuẩn quốc tế NASA TRL 1–9 &amp; ISO 16290 · Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-xs"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default TrlMethodologyModal;
