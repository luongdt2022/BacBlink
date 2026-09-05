import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  ArrowLeft,
  Edit2,
  Download,
  Trash2,
} from 'lucide-react'
import { ConfirmModal } from '@/shared/ui/confirm-modal'
import {
  ChallengeInfoSection,
  SolutionSection,
  TimelineSection,
  ResultsSection,
} from '../components'

export function ImplementationDetailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Mock data - would fetch based on id in real app
  const implementation = {
    id: id || '1',
    // Section 1 - Challenge Info
    challengeName: 'Robot phẫu thuật vi phẫu thần kinh tự động',
    field: 'Y tế',
    company: 'Bệnh viện Đa khoa Trung ương',
    budget: '15 tỷ VNĐ',
    implementationPeriod: '01/2025 - 06/2025',
    initialDescription:
      'Bệnh viện cần giải pháp robot phẫu thuật tự động để hỗ trợ các ca mổ thần kinh phức tạp. Yêu cầu độ chính xác cao, khả năng xử lý trong môi trường phòng mổ vô trùng, và tích hợp với hệ thống hình ảnh y tế hiện có.',

    // Section 2 - Solution
    solution: {
      name: 'Hệ thống robot phẫu thuật AI NeuroCare Pro',
      provider: 'Viện Robot & AI Y tế',
      trlAtImplementation: 'TRL 7',
      technicalDescription:
        'Hệ thống robot phẫu thuật kết hợp AI và computer vision, sử dụng 6 bậc tự do với độ chính xác 0.1mm. Tích hợp thuật toán học sâu để nhận diện cấu trúc thần kinh và đưa ra khuyến nghị trong thời gian thực. Hỗ trợ phẫu thuật viên với giao diện AR/VR.',
      attachments: [
        'Tài liệu kỹ thuật chi tiết.pdf',
        'Báo cáo thử nghiệm lâm sàng.pdf',
        'Chứng nhận FDA & CE.pdf',
      ],
      media: {
        images: 3,
        videos: 2,
      },
    },

    // Section 3 - Implementation Process
    timeline: [
      {
        phase: 'Giai đoạn 1 – Phân tích',
        duration: '2 tuần',
        description:
          'Khảo sát cơ sở hạ tầng bệnh viện, đào tạo nhu cầu đội ngũ, thiết kế quy trình tích hợp với hệ thống hiện có.',
        issues: [
          'Phòng mổ hiện tại cần nâng cấp hệ thống điện',
          'Thiếu không gian lưu trữ thiết bị phụ trợ',
        ],
        status: 'completed' as const,
      },
      {
        phase: 'Giai đoạn 2 – Thử nghiệm',
        duration: '4 tuần',
        description:
          'Cài đặt hệ thống tại phòng lab, thử nghiệm trên mô hình mô phỏng, đào tạo bác sĩ phẫu thuật và kỹ thuật viên y tế.',
        issues: [
          'Độ trễ kết nối mạng ảnh hưởng đến streaming video',
          '2 bác sĩ cần thời gian thêm để làm quen với AR interface',
        ],
        status: 'completed' as const,
      },
      {
        phase: 'Giai đoạn 3 – Triển khai',
        duration: '12 tuần',
        description:
          'Triển khai 24 ca phẫu thuật thực tế với sự giám sát của chuyên gia từ Viện. Thu thập dữ liệu hiệu suất và phản hồi từ đội ngũ y tế.',
        issues: [
          'Ca mổ số 7 gặp sự cố phần mềm nhỏ, đã khắc phục trong 15 phút',
          'Cần tăng cường đào tạo về quy trình bảo trì hàng ngày',
        ],
        status: 'completed' as const,
      },
      {
        phase: 'Giai đoạn 4 – Đánh giá',
        duration: '2 tuần',
        description:
          'Tổng hợp kết quả, phân tích dữ liệu, khảo sát ý kiến bác sĩ và bệnh nhân, lập báo cáo tổng kết và khuyến nghị.',
        issues: [],
        status: 'completed' as const,
      },
    ],

    // Section 4 - Results & Lessons
    result: 'success' as const,
    results: {
      effectiveness: 'Đạt 98.5% độ chính xác, vượt mục tiêu 95%',
      userSatisfaction: '92% bác sĩ hài lòng, vượt mục tiêu 85%',
      lessons: [],
      nextSteps: [],
    },
    kpis: [
      { metric: 'Số ca phẫu thuật thành công', target: '20', achieved: '24', unit: 'ca' },
      { metric: 'Độ chính xác', target: '95%', achieved: '98.5%', unit: '' },
      {
        metric: 'Thời gian phẫu thuật trung bình',
        target: 'Giảm 30%',
        achieved: 'Giảm 35%',
        unit: '',
      },
      { metric: 'Mức độ hài lòng bác sĩ', target: '85%', achieved: '92%', unit: '' },
      { metric: 'Biến chứng sau mổ', target: '<5%', achieved: '1.8%', unit: '' },
    ],
    successAnalysis:
      'Dự án thành công vượt kỳ vọng nhờ sự chuẩn bị kỹ lưỡng, cam kết cao từ đội ngũ bệnh viện, và hỗ trợ kỹ thuật tận tâm từ Viện Robot & AI. Công nghệ đã được thử nghiệm kỹ càng trước khi triển khai, giúp giảm thiểu rủi ro. Đào tạo đầy đủ và liên tục đảm bảo đội ngũ tự tin sử dụng hệ thống.',
    lessonsLearned: [
      'Cần dành thời gian đầu tư cho khảo sát hạ tầng kỹ càng để tránh chi phí phát sinh',
      'Đào tạo nên được thực hiện theo nhiều giai đoạn với hands-on practice',
      'Quan trọng có technical support on-site trong 2 tháng đầu triển khai',
      'Quy trình bảo trì định kỳ cần được chuẩn hóa và đào tạo từ đầu',
    ],
    recommendations: [
      'Mở rộng ứng dụng sang các chuyên khoa khác như tim mạch, tiêu hóa',
      'Đầu tư thêm vào hệ thống backup để đảm bảo uptime 99.9%',
      'Xây dựng chương trình đào tạo chuẩn cho các bệnh viện khác muốn áp dụng',
      'Nghiên cứu tích hợp với hệ thống hồ sơ bệnh án điện tử để tối ưu quy trình',
    ],
  }

  const handleEdit = () => {}

  const handleExportPDF = () => {}

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    navigate('/implementations')
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-6">
          <button
            onClick={() => navigate('/implementations')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại danh sách</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Chi tiết Hồ sơ triển khai
              </h1>
              <p className="text-sm text-gray-600">
                Thông tin đầy đủ về quá trình triển khai giải pháp công nghệ
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Xuất PDF
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Xóa hồ sơ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <ChallengeInfoSection implementation={implementation} />
        <SolutionSection solution={implementation.solution} />
        <TimelineSection timeline={implementation.timeline} />
        <ResultsSection
          result={implementation.result}
          kpis={implementation.kpis}
          successAnalysis={implementation.successAnalysis}
          lessonsLearned={implementation.lessonsLearned}
          recommendations={implementation.recommendations}
        />
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Xóa hồ sơ triển khai"
        description="Bạn có chắc chắn muốn xóa hồ sơ triển khai này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </div>
  )
}
