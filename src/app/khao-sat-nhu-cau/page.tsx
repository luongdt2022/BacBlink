'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  CheckCircle2,
  Building2,
  Cpu,
  Flame,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Layers,
  Wrench,
  Users,
  Target,
  Compass,
  FileCheck2,
  Info
} from 'lucide-react';
import { useToast } from '@/components/common/toast';
import { SECTORS_18_CATALOG } from '@/services/api/technology-offer';

import {
  PROVINCES_63,
  TECH_GROUP_OPTIONS,
  DEMAND_TYPE_OPTIONS,
  BUDGET_RANGES_7,
  CRITERIA_8_LIST,
  BOTTLENECK_17_LIST,
  TAR_READINESS_9_LIST,
  MANAGEMENT_7_LIST,
  FUNDING_SOURCES,
  RECEIPT_FORMATS,
  AUTOMATION_TECH,
  DIGITAL_TECH,
  GREEN_TECH,
  DESIRED_PARTNERS,
  SUPPORT_NEEDS_LIST,
  calculateTniScore,
  getTniBadge,
  type EquipmentItem,
  type DemandItemForm
} from './types';

const STORAGE_KEY = 'nacentwin_deep_survey_draft_v2';

export default function DeepSurveyPage() {
  const toast = useToast();

  // Wizard state: 1 -> 7
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<{
    surveyCode: string;
    createdTickets: string[];
    companyName: string;
  } | null>(null);

  // -------------------------------------------------------------
  // PHẦN A: THÔNG TIN DOANH NGHIỆP
  // -------------------------------------------------------------
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [province, setProvince] = useState('Hà Nội');
  const [address, setAddress] = useState('');
  const [surveySite, setSurveySite] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPosition, setContactPosition] = useState('Giám đốc điều hành');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [companyType, setCompanyType] = useState('CO_PHAN');
  const [mainIndustry, setMainIndustry] = useState('LV07');
  const [mainProducts, setMainProducts] = useState('');
  const [employeeScale, setEmployeeScale] = useState('50-199');
  const [revenueRange3y, setRevenueRange3y] = useState('10-50 tỷ VNĐ');

  // -------------------------------------------------------------
  // PHẦN B: HIỆN TRẠNG & 8 TIÊU CHÍ
  // -------------------------------------------------------------
  const [equipments, setEquipments] = useState<EquipmentItem[]>([
    {
      id: 'eq-1',
      stageName: 'Đúc phôi & gia công tinh',
      machineName: 'Máy đúc áp lực buồng lạnh 650 tấn',
      productOutput: 'Phôi nhôm chi tiết máy',
      investmentYear: 2021,
      techOrigin: 'Nhật Bản / G7',
      depreciationStatus: 'Đang hoạt động tốt (50–80%)'
    }
  ]);

  const [criteria8, setCriteria8] = useState<Record<number, number>>({
    0: 4, 1: 3, 2: 4, 3: 3, 4: 3, 5: 3, 6: 4, 7: 4
  });

  // -------------------------------------------------------------
  // PHẦN C: ĐIỂM NGHẼN SẢN XUẤT (MAX 5)
  // -------------------------------------------------------------
  const [selectedBottlenecks, setSelectedBottlenecks] = useState<string[]>([
    'Tỷ lệ sản phẩm lỗi / phế phẩm còn cao',
    'Thiếu tự động hóa, còn phụ thuộc nhân công thủ công',
    'Khó tiếp cận công nghệ mới, thiết bị tiên tiến'
  ]);
  const [bottleneckSeverity, setBottleneckSeverity] = useState<Record<string, number>>({
    'Tỷ lệ sản phẩm lỗi / phế phẩm còn cao': 4,
    'Thiếu tự động hóa, còn phụ thuộc nhân công thủ công': 5,
    'Khó tiếp cận công nghệ mới, thiết bị tiên tiến': 4
  });
  const [hardestStage, setHardestStage] = useState('Kiểm tra chất lượng ngoại quan và đóng gói');
  const [primaryCause, setPrimaryCause] = useState('Thiếu hệ thống cảm biến quang học kiểm tra tự động và nhân lực lập trình AI.');

  // -------------------------------------------------------------
  // PHẦN D: NĂNG LỰC TIẾP NHẬN (TAR)
  // -------------------------------------------------------------
  const [techPersonnel, setTechPersonnel] = useState({
    technicians: 12,
    engineers: 6,
    it: 2,
    automation: 3,
    rd: 2,
    quality: 4,
    notes: 'Kỹ sư cơ điện kiêm nhiệm bảo trì hệ thống điều khiển PLC.'
  });

  const [tarReadiness, setTarReadiness] = useState<Record<number, number>>({
    0: 4, 1: 4, 2: 4, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 4
  });

  const [managementStatus, setManagementStatus] = useState<Record<number, boolean>>({
    0: true, 1: true, 2: false, 3: true, 4: false, 5: true, 6: true
  });

  // -------------------------------------------------------------
  // PHẦN E: BÀI TOÁN & NHU CẦU KỸ THUẬT (DEMAND ITEMS)
  // -------------------------------------------------------------
  const [fundingSourcesSelected, setFundingSourcesSelected] = useState<string[]>([
    'Vốn tự có của doanh nghiệp',
    'Vay vốn ngân hàng thương mại'
  ]);
  const [receiptFormatsSelected, setReceiptFormatsSelected] = useState<string[]>([
    'Mua sắm thiết bị / máy móc mới trọn gói',
    'Đào tạo chuyển giao kỹ thuật chuyên sâu'
  ]);

  const [demandItems, setDemandItems] = useState<DemandItemForm[]>([
    {
      id: 'dmd-1',
      sectorCode: 'LV07',
      techGroupCode: 'CN01',
      demandTypeCode: 'NC01',
      stageName: 'Gia công & Lắp ráp chi tiết',
      technicalProblem: 'Tự động hóa phát hiện khuyết tật bề mặt mối hàn bằng AI Vision',
      desiredSolution: 'Cánh tay Robot gắn Camera quang học 3D kèm phần mềm AI Deep Learning',
      needConsulting: true,
      expectedGoal: 'Giảm tỷ lệ lỗi phế phẩm từ 4.5% xuống dưới 0.3%, tiết kiệm 3 nhân công',
      budgetRange: '1–5 tỷ đồng',
      urgency: 4,
      impact: 5,
      investment: 4,
      readiness: 4
    }
  ]);

  // -------------------------------------------------------------
  // PHẦN F: ĐỊNH HƯỚNG CÔNG NGHỆ & HỖ TRỢ
  // -------------------------------------------------------------
  const [automationSelected, setAutomationSelected] = useState<string[]>([
    'Tự động hóa dây chuyền sản xuất',
    'Robot công nghiệp (AGV, Robot hàn, xếp hàng)',
    'Hệ thống điều khiển tự động (PLC, SCADA)'
  ]);
  const [digitalSelected, setDigitalSelected] = useState<string[]>([
    'Hệ thống điều hành sản xuất tại xưởng (MES)',
    'Hệ thống quản lý kho & chuỗi cung ứng (WMS)',
    'Trí tuệ nhân tạo (AI Vision, Dự báo)'
  ]);
  const [greenSelected, setGreenSelected] = useState<string[]>([
    'Giải pháp tiết kiệm & sử dụng hiệu quả năng lượng',
    'Hệ thống xử lý nước thải & tái sử dụng nước'
  ]);
  const [partnersSelected, setPartnersSelected] = useState<string[]>([
    'Nhà cung cấp giải pháp / thiết bị công nghệ trong nước',
    'Viện nghiên cứu, Trường đại học chuyên ngành',
    'Chuyên gia tư vấn kỹ thuật độc lập'
  ]);
  const [supportRatings, setSupportRatings] = useState<Record<string, number>>({
    consulting: 5,
    matching: 5,
    finance: 4,
    training: 4,
    assessment: 4
  });

  // -------------------------------------------------------------
  // PHẦN G: RÀ SOÁT, XÁC NHẬN & PDPD
  // -------------------------------------------------------------
  const [confirmName, setConfirmName] = useState('');
  const [confirmPosition, setConfirmPosition] = useState('Giám đốc điều hành');
  const [confirmDate, setConfirmDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [pdpdConsent, setPdpdConsent] = useState(true);

  // -------------------------------------------------------------
  // LOCALSTORAGE DRAFT MANAGEMENT
  // -------------------------------------------------------------
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.companyName) setCompanyName(d.companyName);
        if (d.taxCode) setTaxCode(d.taxCode);
        if (d.contactName) setContactName(d.contactName);
        if (d.contactPhone) setContactPhone(d.contactPhone);
        if (d.contactEmail) setContactEmail(d.contactEmail);
        if (d.province) setProvince(d.province);
        if (d.address) setAddress(d.address);
        if (d.mainIndustry) setMainIndustry(d.mainIndustry);
        if (d.mainProducts) setMainProducts(d.mainProducts);
        if (d.equipments && Array.isArray(d.equipments)) setEquipments(d.equipments);
        if (d.selectedBottlenecks) setSelectedBottlenecks(d.selectedBottlenecks);
        if (d.hardestStage) setHardestStage(d.hardestStage);
        if (d.primaryCause) setPrimaryCause(d.primaryCause);
        if (d.demandItems && Array.isArray(d.demandItems) && d.demandItems.length > 0) setDemandItems(d.demandItems);
        toast.info('Đã khôi phục dữ liệu bản nháp từ phiên làm việc trước.', 'Khôi phục bản nháp');
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  const handleSaveDraft = () => {
    try {
      const draft = {
        companyName,
        taxCode,
        province,
        address,
        surveySite,
        contactName,
        contactPosition,
        contactPhone,
        contactEmail,
        companyType,
        mainIndustry,
        mainProducts,
        employeeScale,
        revenueRange3y,
        equipments,
        criteria8,
        selectedBottlenecks,
        bottleneckSeverity,
        hardestStage,
        primaryCause,
        techPersonnel,
        tarReadiness,
        managementStatus,
        fundingSourcesSelected,
        receiptFormatsSelected,
        demandItems,
        automationSelected,
        digitalSelected,
        greenSelected,
        partnersSelected,
        supportRatings,
        confirmName,
        confirmPosition
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      toast.success('Đã lưu bản nháp khảo sát vào trình duyệt.', 'Lưu thành công');
    } catch {
      toast.error('Không thể lưu bản nháp vào bộ nhớ trình duyệt.', 'Lỗi lưu trữ');
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    toast.info('Đã xóa dữ liệu bản nháp.', 'Đã xóa');
  };

  // -------------------------------------------------------------
  // HELPER ACTIONS: EQUIPMENTS & DEMAND ITEMS
  // -------------------------------------------------------------
  const handleAddEquipment = () => {
    const newEq: EquipmentItem = {
      id: `eq-${Date.now()}`,
      stageName: '',
      machineName: '',
      productOutput: '',
      investmentYear: new Date().getFullYear(),
      techOrigin: 'Việt Nam',
      depreciationStatus: 'Đang hoạt động tốt (50–80%)'
    };
    setEquipments([...equipments, newEq]);
  };

  const handleRemoveEquipment = (id: string) => {
    if (equipments.length === 1) {
      toast.warning('Cần giữ ít nhất 1 dòng máy móc / thiết bị.', 'Không thể xóa');
      return;
    }
    setEquipments(equipments.filter(e => e.id !== id));
  };

  const handleUpdateEquipment = (id: string, field: keyof EquipmentItem, value: any) => {
    setEquipments(equipments.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleToggleBottleneck = (item: string) => {
    if (selectedBottlenecks.includes(item)) {
      setSelectedBottlenecks(selectedBottlenecks.filter(b => b !== item));
    } else {
      if (selectedBottlenecks.length >= 5) {
        toast.warning('Doanh nghiệp chỉ được chọn tối đa 5 điểm nghẽn nghiêm trọng nhất.', 'Đã đủ 5 điểm nghẽn');
        return;
      }
      setSelectedBottlenecks([...selectedBottlenecks, item]);
      if (!bottleneckSeverity[item]) {
        setBottleneckSeverity({ ...bottleneckSeverity, [item]: 4 });
      }
    }
  };

  const handleAddDemandItem = () => {
    const newItem: DemandItemForm = {
      id: `dmd-${Date.now()}`,
      sectorCode: mainIndustry || 'LV07',
      techGroupCode: 'CN01',
      demandTypeCode: 'NC01',
      stageName: '',
      technicalProblem: '',
      desiredSolution: '',
      needConsulting: true,
      expectedGoal: '',
      budgetRange: '500 triệu–1 tỷ đồng',
      urgency: 4,
      impact: 4,
      investment: 3,
      readiness: 4
    };
    setDemandItems([...demandItems, newItem]);
    toast.success(`Đã thêm bài toán kỹ thuật #${demandItems.length + 1}.`, 'Thêm bài toán');
  };

  const handleRemoveDemandItem = (id: string) => {
    if (demandItems.length === 1) {
      toast.warning('Phiếu khảo sát cần có ít nhất 1 bài toán kỹ thuật.', 'Không thể xóa');
      return;
    }
    setDemandItems(demandItems.filter(d => d.id !== id));
  };

  const handleUpdateDemandItem = (id: string, field: keyof DemandItemForm, value: any) => {
    setDemandItems(demandItems.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  // -------------------------------------------------------------
  // VALIDATION TRƯỚC KHI CHUYỂN BƯỚC
  // -------------------------------------------------------------
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!companyName.trim()) {
        toast.error('Vui lòng nhập Tên Doanh nghiệp.', 'Thiếu thông tin');
        return false;
      }
      if (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) {
        toast.error('Vui lòng điền đầy đủ Người liên hệ, Số điện thoại và Email.', 'Thiếu thông tin liên hệ');
        return false;
      }
    }
    if (step === 2) {
      const hasEmptyEq = equipments.some(e => !e.machineName.trim() || !e.stageName.trim());
      if (hasEmptyEq) {
        toast.error('Vui lòng điền đầy đủ Tên máy móc và Công đoạn cho tất cả các thiết bị.', 'Thiếu thông tin thiết bị');
        return false;
      }
    }
    if (step === 3) {
      if (selectedBottlenecks.length === 0) {
        toast.error('Vui lòng chọn ít nhất 1 điểm nghẽn kỹ thuật (tối đa 5).', 'Chưa chọn điểm nghẽn');
        return false;
      }
      if (!hardestStage.trim()) {
        toast.error('Vui lòng nêu rõ công đoạn gây khó khăn lớn nhất.', 'Thiếu công đoạn khó nhất');
        return false;
      }
    }
    if (step === 5) {
      const hasInvalidItem = demandItems.some(d => !d.technicalProblem.trim() || !d.expectedGoal.trim());
      if (hasInvalidItem) {
        toast.error('Vui lòng mô tả cụ thể Vấn đề kỹ thuật và Mục tiêu kỳ vọng cho từng bài toán.', 'Thiếu nội dung bài toán');
        return false;
      }
    }
    if (step === 7) {
      if (!confirmName.trim()) {
        toast.error('Vui lòng nhập Họ tên người đại diện xác nhận.', 'Chưa ký xác nhận');
        return false;
      }
      if (!pdpdConsent) {
        toast.error('Vui lòng tích chọn đồng ý cam kết xử lý dữ liệu PDPD để hoàn tất.', 'Cam kết bảo mật');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  // -------------------------------------------------------------
  // SUBMIT API TO BACKEND POST /api/v1/demands/surveys
  // -------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(7)) return;

    setIsSubmitting(true);
    try {
      const payload = {
        companyName,
        taxCode: taxCode || undefined,
        province,
        headquartersAddress: address,
        surveyedFacility: surveySite,
        contactName,
        contactTitle: contactPosition,
        contactPhone,
        contactEmail,
        businessType: companyType,
        mainIndustry,
        mainProducts,
        enterpriseSize: employeeScale === '50-199' ? 'MEDIUM' : (employeeScale === '10-49' ? 'SMALL' : 'MICRO'),
        employeeScale,
        revenueRange3y,
        topBottlenecks: selectedBottlenecks,
        confirmedByName: confirmName,
        confirmedByTitle: confirmPosition,
        pdpdConsentAt: new Date().toISOString(),

        currentEquipments: equipments.map(e => ({
          stageName: e.stageName,
          machineName: e.machineName,
          investmentYear: Number(e.investmentYear) || 2020,
          techOrigin: e.techOrigin,
          depreciationStatus: e.depreciationStatus
        })),

        criteria8: Object.fromEntries(
          Object.entries(criteria8).map(([idx, val]) => [CRITERIA_8_LIST[Number(idx)] || `Criterion_${idx}`, val])
        ),

        bottlenecksDetail: Object.fromEntries(
          selectedBottlenecks.map(b => [b, bottleneckSeverity[b] || 4])
        ),
        hardestStage,
        primaryCause,

        technicalPersonnel: {
          technicians: techPersonnel.technicians,
          engineers: techPersonnel.engineers,
          it: techPersonnel.it,
          automation: techPersonnel.automation,
          rd: techPersonnel.rd,
          quality: techPersonnel.quality
        },

        adoptionCapacity: Object.fromEntries(
          Object.entries(tarReadiness).map(([idx, val]) => [TAR_READINESS_9_LIST[Number(idx)] || `TAR_${idx}`, val])
        ),

        futureDirections: [
          ...automationSelected.map(a => `[Tự động hóa] ${a}`),
          ...digitalSelected.map(d => `[Chuyển đổi số] ${d}`),
          ...greenSelected.map(g => `[Công nghệ xanh] ${g}`)
        ],

        supportNeeds: supportRatings,
        desiredPartners: partnersSelected,

        demandItems: demandItems.map(d => ({
          stageName: d.stageName || 'Sản xuất chính',
          technicalProblem: d.technicalProblem,
          desiredSolution: d.desiredSolution || undefined,
          needConsulting: d.needConsulting,
          expectedGoal: d.expectedGoal,
          applicationScale: 'Nhà máy sản xuất',
          sectorCode: d.sectorCode || 'LV07',
          techGroupCode: d.techGroupCode || 'CN01',
          demandTypeCode: d.demandTypeCode || 'NC01',
          budgetRange: d.budgetRange,
          urgencyScore: d.urgency,
          impactScore: d.impact,
          investmentCapacity: d.investment,
          adoptionReadiness: d.readiness
        }))
      };

      const res = await fetch('/api/v1/demands/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSubmitResult({
          surveyCode: data.surveyCode || `SUR-${Date.now()}`,
          createdTickets: data.createdTickets || ['DMD-202610-01'],
          companyName
        });
        localStorage.removeItem(STORAGE_KEY);
        toast.success('Đã tiếp nhận hồ sơ khảo sát và khởi tạo Demand Tickets thành công!', 'Nộp phiếu thành công');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Lỗi khi nộp phiếu khảo sát đến máy chủ.', 'Nộp phiếu thất bại');
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể kết nối đến máy chủ Backend.', 'Lỗi kết nối');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // MÀN HÌNH NỘP THÀNH CÔNG (SUCCESS VIEW)
  // -------------------------------------------------------------
  if (submitResult) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="surface-card max-w-3xl mx-auto p-8 sm:p-10 text-center space-y-6 shadow-xl rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-sm">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-400/30">
              HỒ SƠ KHẢO SÁT CHUYÊN SÂU ĐÃ TIẾP NHẬN
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
              Nộp Phiếu Khảo Sát Nhu Cầu Thành Công!
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-2 max-w-lg mx-auto leading-relaxed">
              Hệ thống NacenTwin đã lưu trữ đầy đủ 7 phần dữ liệu khảo sát và tự động bóc tách thành công <strong>{submitResult.createdTickets.length} bài toán kỹ thuật (Demand Tickets)</strong> cho <strong>{submitResult.companyName}</strong>.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-left max-w-lg mx-auto space-y-3.5 shadow-inner">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Mã hồ sơ khảo sát:</span>
              <span className="font-mono font-black text-brand-700 dark:text-cyan-400 text-sm">
                {submitResult.surveyCode}
              </span>
            </div>
            <div className="text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1.5">
                Các mã vé nhu cầu đã tạo (Demand Tickets):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {submitResult.createdTickets.map((t, idx) => (
                  <span key={idx} className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-teal-300 border border-brand-200 dark:border-brand-800">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-caption text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Dữ liệu đã được mã hóa PII theo Nghị định 13/2023/NĐ-CP và chuyển Cổng Thẩm định Sở KH&CN.</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <Link
              href="/portal/buyer/demands"
              className="bg-brand-700 hover:bg-brand-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              Đến Bàn Làm Việc Buyer Workspace <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setSubmitResult(null);
                setCurrentStep(1);
              }}
              className="border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold text-xs transition"
            >
              Kê khai phiếu khảo sát khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER STEP CONTENT
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-24">
      {/* HERO BANNER SECTION (ĐỒNG BỘ 100% BRAND-700 VÀ INNOVATION ART) */}
      <section className="relative overflow-hidden bg-brand-700 text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-brand-800 shadow-md">
        <div aria-hidden="true" className="innovation-hero-art pointer-events-none absolute inset-0 opacity-80" />
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold backdrop-blur-sm border border-white/20">
              <ClipboardCheck className="w-3.5 h-3.5 text-teal-300" />
              Mẫu KS-DNNVV-2026 • Bộ Khoa Học & Công Nghệ (Hồ Sơ Sâu 7 Phần)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Khảo Sát Nhu Cầu Đổi Mới Công Nghệ & Điểm Nghẽn Kỹ Thuật
            </h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Bộ công cụ khảo sát toàn diện giúp DNNVV chuẩn hóa bài toán kỹ thuật, tính toán chỉ số cấp thiết TNI và kết nối giải pháp từ hơn 500+ Viện trường, Doanh nghiệp ĐMST.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" /> Lưu bản nháp
              </button>
              <button
                type="button"
                onClick={handleClearDraft}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-300/30 text-red-200 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
                title="Xóa bản nháp trên máy này"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Xóa nháp
              </button>
            </div>
            <span className="text-caption text-white/75">
              Tự động lưu trữ trên trình duyệt
            </span>
          </div>
        </div>
      </section>

      {/* STEPPER NAVIGATION BAR (7 PHẦN A -> G) */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between mb-2 text-xs font-bold">
            <span className="text-brand-700 dark:text-cyan-400">
              Bước {currentStep}/7: {[
                'A. Thông Tin Doanh Nghiệp',
                'B. Hiện Trạng & 8 Tiêu Chí',
                'C. Điểm Nghẽn Kỹ Thuật',
                'D. Năng Lực Tiếp Nhận (TAR)',
                'E. Dòng Nhu Cầu & Thuật Toán TNI',
                'F. Định Hướng & Hỗ Trợ',
                'G. Rà Soát & Xác Nhận PDPD'
              ][currentStep - 1]}
            </span>
            <span className="text-slate-500">
              {Math.round((currentStep / 7) * 100)}% Hoàn thành
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
            <div
              className="bg-brand-600 dark:bg-cyan-500 h-full transition-all duration-300"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>

          {/* Stepper Buttons (Responsive Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { num: 1, label: 'A. Doanh Nghiệp' },
              { num: 2, label: 'B. Hiện Trạng' },
              { num: 3, label: 'C. Điểm Nghẽn' },
              { num: 4, label: 'D. Năng Lực TAR' },
              { num: 5, label: 'E. Nhu Cầu & TNI' },
              { num: 6, label: 'F. Định Hướng' },
              { num: 7, label: 'G. Xác Nhận' }
            ].map((step) => {
              const isCurrent = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (step.num < currentStep || validateStep(currentStep)) {
                      setCurrentStep(step.num);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 border ${
                    isCurrent
                      ? 'bg-brand-700 text-white border-brand-800 shadow-sm'
                      : isPast
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300/40'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-transparent hover:border-slate-300'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-black ${
                    isCurrent ? 'bg-white text-brand-700' : isPast ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {step.num}
                  </span>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN FORM CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* =========================================================================
              BƯỚC 1: PHẦN A — THÔNG TIN DOANH NGHIỆP
             ========================================================================= */}
          {currentStep === 1 && (
            <section className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                    PHẦN A • THÔNG TIN CHUNG
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Thông Tin Doanh Nghiệp & Quy Mô Sản Xuất
                  </h2>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> PDPD Bảo Mật
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tên Doanh nghiệp / Tổ chức <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="Ví dụ: Công ty Cổ phần Cơ điện & Tự động hóa Tân Tiến"
                    className="form-control w-full px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mã số thuế (MST) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={taxCode}
                    onChange={e => setTaxCode(e.target.value)}
                    placeholder="Ví dụ: 0108992134"
                    className="form-control w-full px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tỉnh / Thành phố trụ sở chính <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    className="form-control w-full px-3 py-2 text-xs"
                  >
                    {PROVINCES_63.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Địa chỉ trụ sở chính chi tiết
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                    className="form-control w-full px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Cơ sở / Nhà máy sản xuất được khảo sát (nếu khác trụ sở)
                  </label>
                  <input
                    type="text"
                    value={surveySite}
                    onChange={e => setSurveySite(e.target.value)}
                    placeholder="Ví dụ: Nhà máy số 2, KCN Tiên Sơn, Bắc Ninh"
                    className="form-control w-full px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Người cung cấp thông tin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="Họ và tên người đại diện liên hệ"
                    className="form-control w-full px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Chức vụ đại diện <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={contactPosition}
                    onChange={e => setContactPosition(e.target.value)}
                    className="form-control w-full px-3 py-2 text-xs"
                  >
                    <option value="Giám đốc điều hành">Giám đốc điều hành / Chủ tịch</option>
                    <option value="Phó Giám đốc Kỹ thuật">Phó Giám đốc Kỹ thuật / Công nghệ</option>
                    <option value="Trưởng phòng R&D">Trưởng phòng R&D / Đổi mới sáng tạo</option>
                    <option value="Quản đốc phân xưởng">Quản đốc phân xưởng / Trưởng ban sản xuất</option>
                    <option value="Cán bộ kỹ thuật">Cán bộ kỹ thuật / Thư ký dự án</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Điện thoại di động liên hệ trực tiếp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="0912 xxx xxx"
                    className="form-control w-full px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Email tiếp nhận kết quả tư vấn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="contact@company.com.vn"
                    className="form-control w-full px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Loại hình doanh nghiệp
                  </label>
                  <select
                    value={companyType}
                    onChange={e => setCompanyType(e.target.value)}
                    className="form-control w-full px-3 py-2 text-xs"
                  >
                    <option value="CO_PHAN">Công ty Cổ phần</option>
                    <option value="TNHH">Công ty TNHH</option>
                    <option value="TU_NHAN">Doanh nghiệp Tư nhân</option>
                    <option value="HOP_TAC_XA">Hợp tác xã</option>
                    <option value="FDI">Doanh nghiệp FDI</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Lĩnh vực sản xuất chính (Thông tư 17)
                  </label>
                  <select
                    value={mainIndustry}
                    onChange={e => setMainIndustry(e.target.value)}
                    className="form-control w-full px-3 py-2 text-xs"
                  >
                    {SECTORS_18_CATALOG.filter(s => s.code !== 'ALL').map(sec => (
                      <option key={sec.code} value={sec.code}>
                        [{sec.code}] {sec.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sản phẩm / Dịch vụ chủ lực hiện nay
                  </label>
                  <input
                    type="text"
                    value={mainProducts}
                    onChange={e => setMainProducts(e.target.value)}
                    placeholder="Ví dụ: Linh kiện dập cơ khí chính xác, vỏ tủ điện..."
                    className="form-control w-full px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Quy mô lao động hiện tại
                  </label>
                  <select
                    value={employeeScale}
                    onChange={e => setEmployeeScale(e.target.value)}
                    className="form-control w-full px-3 py-2 text-xs"
                  >
                    <option value="UNDER_10">Dưới 10 người (Siêu nhỏ)</option>
                    <option value="10-49">10 – 49 người (Nhỏ)</option>
                    <option value="50-199">50 – 199 người (Vừa)</option>
                    <option value="OVER_200">Từ 200 người trở lên (Lớn)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Doanh thu bình quân 3 năm gần nhất (khoảng giá trị)
                  </label>
                  <select
                    value={revenueRange3y}
                    onChange={e => setRevenueRange3y(e.target.value)}
                    className="form-control w-full px-3 py-2 text-xs"
                  >
                    <option value="Dưới 10 tỷ VNĐ">Dưới 10 tỷ VNĐ</option>
                    <option value="10-50 tỷ VNĐ">10 – 50 tỷ VNĐ</option>
                    <option value="50-100 tỷ VNĐ">50 – 100 tỷ VNĐ</option>
                    <option value="100-300 tỷ VNĐ">100 – 300 tỷ VNĐ</option>
                    <option value="Trên 300 tỷ VNĐ">Trên 300 tỷ VNĐ</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* =========================================================================
              BƯỚC 2: PHẦN B — HIỆN TRẠNG & 8 TIÊU CHÍ
             ========================================================================= */}
          {currentStep === 2 && (
            <section className="space-y-6">
              {/* B.1: DANH MỤC DÂY CHUYỀN / MÁY MÓC */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                      PHẦN B.1 • THIẾT BỊ SẢN XUẤT
                    </span>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      Danh Mục Thiết Bị & Dây Chuyền Sản Xuất Chủ Lực
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEquipment}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 self-start"
                  >
                    <Plus className="w-4 h-4" /> Thêm máy móc / dây chuyền
                  </button>
                </div>

                <div className="space-y-3">
                  {equipments.map((eq, idx) => (
                    <div key={eq.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 relative space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-brand-700 dark:text-cyan-400 font-mono">
                          #Thiết bị {idx + 1}
                        </span>
                        {equipments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEquipment(eq.id)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa dòng
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                            Công đoạn sản xuất <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={eq.stageName}
                            onChange={e => handleUpdateEquipment(eq.id, 'stageName', e.target.value)}
                            placeholder="Ví dụ: Đúc phôi, Tiện CNC, Sơn tĩnh điện..."
                            className="form-control w-full px-3 py-1.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                            Tên thiết bị / máy móc chủ lực <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={eq.machineName}
                            onChange={e => handleUpdateEquipment(eq.id, 'machineName', e.target.value)}
                            placeholder="Tên máy, model..."
                            className="form-control w-full px-3 py-1.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                            Sản phẩm đầu ra
                          </label>
                          <input
                            type="text"
                            value={eq.productOutput}
                            onChange={e => handleUpdateEquipment(eq.id, 'productOutput', e.target.value)}
                            placeholder="Sản phẩm làm ra..."
                            className="form-control w-full px-3 py-1.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                            Năm đầu tư vận hành
                          </label>
                          <input
                            type="number"
                            value={eq.investmentYear}
                            onChange={e => handleUpdateEquipment(eq.id, 'investmentYear', Number(e.target.value))}
                            className="form-control w-full px-3 py-1.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                            Xuất xứ công nghệ
                          </label>
                          <select
                            value={eq.techOrigin}
                            onChange={e => handleUpdateEquipment(eq.id, 'techOrigin', e.target.value)}
                            className="form-control w-full px-3 py-1.5 text-xs"
                          >
                            <option value="Việt Nam">Việt Nam</option>
                            <option value="Nhật Bản / G7">Nhật Bản / G7 / EU</option>
                            <option value="Hàn Quốc / Đài Loan">Hàn Quốc / Đài Loan</option>
                            <option value="Trung Quốc">Trung Quốc</option>
                            <option value="Khác">Khác</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                            Tình trạng khấu hao / vận hành
                          </label>
                          <select
                            value={eq.depreciationStatus}
                            onChange={e => handleUpdateEquipment(eq.id, 'depreciationStatus', e.target.value)}
                            className="form-control w-full px-3 py-1.5 text-xs"
                          >
                            <option value="Mới >80%">Mới &gt;80% (Vận hành tối ưu)</option>
                            <option value="Đang hoạt động tốt (50–80%)">Đang hoạt động tốt (50–80%)</option>
                            <option value="Hao mòn nhiều (<50%)">Hao mòn nhiều (&lt;50%)</option>
                            <option value="Cũ, hay hỏng, cần thay thế">Cũ, hay hỏng, cần thay thế</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* B.2: TỰ ĐÁNH GIÁ 8 TIÊU CHÍ HIỆN TRẠNG */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                    PHẦN B.2 • TỰ ĐÁNH GIÁ 8 TIÊU CHÍ
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Đánh Giá Hiện Trạng Trình Độ Công Nghệ (Thang 1–5)
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    (1 = Rất lạc hậu / Chưa có; 3 = Trung bình so với ngành; 5 = Tiên tiến, hiện đại hàng đầu)
                  </p>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {CRITERIA_8_LIST.map((crit, idx) => (
                    <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 sm:max-w-md">
                        {idx + 1}. {crit}
                      </span>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(score => (
                          <label
                            key={score}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer font-bold border transition text-xs ${
                              criteria8[idx] === score
                                ? 'bg-brand-700 text-white border-brand-800 shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-500'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`criteria_${idx}`}
                              value={score}
                              checked={criteria8[idx] === score}
                              onChange={() => setCriteria8({ ...criteria8, [idx]: score })}
                              className="sr-only"
                            />
                            {score}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* =========================================================================
              BƯỚC 3: PHẦN C — ĐIỂM NGHẼN SẢN XUẤT (MAX 5)
             ========================================================================= */}
          {currentStep === 3 && (
            <section className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                    PHẦN C • VẤN ĐỀ & ĐIỂM NGHẼN
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Nhận Diện Điểm Nghẽn Kỹ Thuật (Chọn tối đa 5 điểm)
                  </h2>
                </div>
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                  selectedBottlenecks.length === 5
                    ? 'bg-amber-500/15 text-amber-600 border-amber-400/40'
                    : 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-cyan-300 border-brand-200'
                }`}>
                  Đã chọn: {selectedBottlenecks.length}/5 điểm nghẽn
                </span>
              </div>

              {/* Lưới 17 điểm nghẽn */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                {BOTTLENECK_17_LIST.map((item, idx) => {
                  const isChecked = selectedBottlenecks.includes(item);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border transition flex items-start gap-3 ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-400/50 dark:bg-amber-950/20'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleBottleneck(item)}
                        className="w-4 h-4 mt-0.5 text-brand-600 rounded focus:ring-brand-500 shrink-0 cursor-pointer"
                      />
                      <div className="flex-1 space-y-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {idx + 1}. {item}
                        </span>

                        {isChecked && (
                          <div className="flex items-center gap-2 pt-1 border-t border-amber-200 dark:border-amber-900/40">
                            <span className="text-xs text-slate-500">Mức độ nghiêm trọng:</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(lvl => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => setBottleneckSeverity({ ...bottleneckSeverity, [item]: lvl })}
                                  className={`w-5 h-5 rounded-md text-xs font-black transition ${
                                    (bottleneckSeverity[item] || 4) === lvl
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2 trường công đoạn khó nhất & nguyên nhân */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Công đoạn sản xuất gây khó khăn lớn nhất <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={hardestStage}
                    onChange={e => setHardestStage(e.target.value)}
                    placeholder="Ví dụ: Kiểm tra chất lượng (QC), Ép khuôn, Gia công bề mặt..."
                    className="form-control w-full px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nguyên nhân chủ yếu được xác định
                  </label>
                  <input
                    type="text"
                    value={primaryCause}
                    onChange={e => setPrimaryCause(e.target.value)}
                    placeholder="Ví dụ: Thiếu thiết bị đo lường chuẩn, thợ phụ thuộc kinh nghiệm..."
                    className="form-control w-full px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </section>
          )}

          {/* =========================================================================
              BƯỚC 4: PHẦN D — NĂNG LỰC TIẾP NHẬN (TAR)
             ========================================================================= */}
          {currentStep === 4 && (
            <section className="space-y-6">
              {/* D.1: CƠ CẤU NHÂN LỰC KỸ THUẬT */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                    PHẦN D.1 • CƠ CẤU NHÂN LỰC
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Thống Kê Đội Ngũ Nhân Lực Kỹ Thuật
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Kỹ thuật viên / Thợ giỏi
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={techPersonnel.technicians}
                      onChange={e => setTechPersonnel({ ...techPersonnel, technicians: Number(e.target.value) })}
                      className="form-control w-full px-3 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Kỹ sư / Cử nhân kỹ thuật
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={techPersonnel.engineers}
                      onChange={e => setTechPersonnel({ ...techPersonnel, engineers: Number(e.target.value) })}
                      className="form-control w-full px-3 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Nhân sự CNTT
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={techPersonnel.it}
                      onChange={e => setTechPersonnel({ ...techPersonnel, it: Number(e.target.value) })}
                      className="form-control w-full px-3 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Nhân sự Tự động hóa
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={techPersonnel.automation}
                      onChange={e => setTechPersonnel({ ...techPersonnel, automation: Number(e.target.value) })}
                      className="form-control w-full px-3 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Nhân sự R&D
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={techPersonnel.rd}
                      onChange={e => setTechPersonnel({ ...techPersonnel, rd: Number(e.target.value) })}
                      className="form-control w-full px-3 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Quản lý chất lượng (QA/QC)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={techPersonnel.quality}
                      onChange={e => setTechPersonnel({ ...techPersonnel, quality: Number(e.target.value) })}
                      className="form-control w-full px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 text-xs">
                  <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Ghi chú người kiêm nhiệm / cách tính nhân sự
                  </label>
                  <input
                    type="text"
                    value={techPersonnel.notes}
                    onChange={e => setTechPersonnel({ ...techPersonnel, notes: e.target.value })}
                    className="form-control w-full px-3 py-1.5 text-xs"
                  />
                </div>
              </div>

              {/* D.2: 9 TIÊU CHÍ NĂNG LỰC HẤP THỤ */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                    PHẦN D.2 • NĂNG LỰC HẤP THỤ CÔNG NGHỆ (TAR)
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Đánh Giá Khả Năng Tiếp Nhận & Làm Chủ Công Nghệ Mới (1–5)
                  </h2>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {TAR_READINESS_9_LIST.map((crit, idx) => (
                    <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 sm:max-w-md">
                        {idx + 1}. {crit}
                      </span>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(score => (
                          <label
                            key={score}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center cursor-pointer font-bold border transition text-xs ${
                              tarReadiness[idx] === score
                                ? 'bg-brand-700 text-white border-brand-800 shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`tar_${idx}`}
                              value={score}
                              checked={tarReadiness[idx] === score}
                              onChange={() => setTarReadiness({ ...tarReadiness, [idx]: score })}
                              className="sr-only"
                            />
                            {score}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* =========================================================================
              BƯỚC 5: PHẦN E — DÒNG NHU CẦU & THUẬT TOÁN TNI
             ========================================================================= */}
          {currentStep === 5 && (
            <section className="space-y-6">
              {/* E.1: NGUỒN VỐN & HÌNH THỨC TIẾP NHẬN */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                    PHẦN E.1 • NGUỒN VỐN & HÌNH THỨC
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Phương Thức Tiếp Nhận & Cơ Cấu Vốn Dự Kiến
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
                      Nguồn vốn dự kiến đầu tư cho đổi mới công nghệ:
                    </label>
                    <div className="space-y-2">
                      {FUNDING_SOURCES.map((f, idx) => {
                        const checked = fundingSourcesSelected.includes(f);
                        return (
                          <label key={idx} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setFundingSourcesSelected(
                                  checked ? fundingSourcesSelected.filter(x => x !== f) : [...fundingSourcesSelected, f]
                                );
                              }}
                              className="w-4 h-4 text-brand-600 rounded"
                            />
                            <span>{f}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
                      Hình thức tiếp nhận công nghệ mong muốn:
                    </label>
                    <div className="space-y-2">
                      {RECEIPT_FORMATS.slice(0, 6).map((r, idx) => {
                        const checked = receiptFormatsSelected.includes(r);
                        return (
                          <label key={idx} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setReceiptFormatsSelected(
                                  checked ? receiptFormatsSelected.filter(x => x !== r) : [...receiptFormatsSelected, r]
                                );
                              }}
                              className="w-4 h-4 text-brand-600 rounded"
                            />
                            <span>{r}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* E.2: DANH SÁCH BÀI TOÁN KỸ THUẬT (DEMAND ITEMS) */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                      PHẦN E.2 • DEMAND TICKETS & TNI ENGINE
                    </span>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      Danh Mục Bài Toán Kỹ Thuật Cần Giải Quyết ({demandItems.length} Bài toán)
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDemandItem}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 self-start"
                  >
                    <Plus className="w-4 h-4" /> Thêm bài toán kỹ thuật
                  </button>
                </div>

                <div className="space-y-6">
                  {demandItems.map((item, idx) => {
                    const score = calculateTniScore(item.urgency, item.impact, item.investment, item.readiness);
                    const badge = getTniBadge(score);

                    return (
                      <div key={item.id} className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-brand-700 text-white text-xs font-black flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-black text-sm text-slate-900 dark:text-white">
                              Bài Toán Nhu Cầu #{idx + 1} (Demand Ticket)
                            </span>
                          </div>

                          {demandItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDemandItem(item.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Xóa bài toán này
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                              Lĩnh vực ứng dụng (Thông tư 17) <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={item.sectorCode}
                              onChange={e => handleUpdateDemandItem(item.id, 'sectorCode', e.target.value)}
                              className="form-control w-full px-3 py-1.5 text-xs"
                            >
                              {SECTORS_18_CATALOG.filter(s => s.code !== 'ALL').map(sec => (
                                <option key={sec.code} value={sec.code}>
                                  [{sec.code}] {sec.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                              Nhóm công nghệ kỹ thuật <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={item.techGroupCode}
                              onChange={e => handleUpdateDemandItem(item.id, 'techGroupCode', e.target.value)}
                              className="form-control w-full px-3 py-1.5 text-xs"
                            >
                              {TECH_GROUP_OPTIONS.map(tg => (
                                <option key={tg.code} value={tg.code}>
                                  [{tg.code}] {tg.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                              Loại hình nhu cầu tiếp nhận <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={item.demandTypeCode}
                              onChange={e => handleUpdateDemandItem(item.id, 'demandTypeCode', e.target.value)}
                              className="form-control w-full px-3 py-1.5 text-xs"
                            >
                              {DEMAND_TYPE_OPTIONS.map(dt => (
                                <option key={dt.code} value={dt.code}>
                                  [{dt.code}] {dt.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-full">
                            <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                              Công đoạn sản xuất có nhu cầu <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={item.stageName}
                              onChange={e => handleUpdateDemandItem(item.id, 'stageName', e.target.value)}
                              placeholder="Ví dụ: Đóng gói dán nhãn, Hàn cấu kiện, Kiểm định chất lượng..."
                              className="form-control w-full px-3 py-1.5 text-xs"
                            />
                          </div>

                          <div className="col-span-full">
                            <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                              Mô tả cụ thể vấn đề kỹ thuật / điểm nghẽn <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              rows={2}
                              required
                              value={item.technicalProblem}
                              onChange={e => handleUpdateDemandItem(item.id, 'technicalProblem', e.target.value)}
                              placeholder="Mô tả cụ thể sự cố, tỷ lệ khuyết tật hoặc hao phí hiện tại cần khắc phục..."
                              className="form-control w-full p-2.5 text-xs"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                              Công nghệ / Thiết bị tìm mua mong muốn
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={item.desiredSolution}
                                onChange={e => handleUpdateDemandItem(item.id, 'desiredSolution', e.target.value)}
                                placeholder="Tên công nghệ, giải pháp..."
                                className="form-control flex-1 px-3 py-1.5 text-xs"
                              />
                              <label className="flex items-center gap-1.5 shrink-0 px-3 bg-slate-200 dark:bg-slate-800 rounded-xl cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={item.needConsulting}
                                  onChange={e => handleUpdateDemandItem(item.id, 'needConsulting', e.target.checked)}
                                  className="w-3.5 h-3.5"
                                />
                                <span className="text-xs font-bold">Cần tư vấn</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                              Dự toán ngân sách đầu tư
                            </label>
                            <select
                              value={item.budgetRange}
                              onChange={e => handleUpdateDemandItem(item.id, 'budgetRange', e.target.value)}
                              className="form-control w-full px-3 py-1.5 text-xs"
                            >
                              {BUDGET_RANGES_7.map(b => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-full">
                            <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                              Mục tiêu kỹ thuật & kinh tế kỳ vọng sau khi đổi mới <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={item.expectedGoal}
                              onChange={e => handleUpdateDemandItem(item.id, 'expectedGoal', e.target.value)}
                              placeholder="Ví dụ: Giảm 40% chi phí điện năng, tăng 50% sản lượng xuất khẩu..."
                              className="form-control w-full px-3 py-1.5 text-xs"
                            />
                          </div>
                        </div>

                        {/* WIDGET CHẤM ĐIỂM TNI 4 CHIỀU CHO TỪNG BÀI TOÁN */}
                        <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-black">
                              <Flame className="w-4 h-4 text-amber-500" />
                              <span>Thuật Toán TNI (Technology Need Index) — Quyết định PO-DEC-20261008-01</span>
                            </div>
                            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${badge.className}`}>
                              TNI: {score}/100 • {badge.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                              <span className="block text-xs font-semibold text-slate-500 mb-1">
                                K — Cấp thiết (35%)
                              </span>
                              <select
                                value={item.urgency}
                                onChange={e => handleUpdateDemandItem(item.id, 'urgency', Number(e.target.value))}
                                className="form-control w-full px-2 py-1 text-xs font-bold"
                              >
                                <option value={1}>1: Sau &gt;= 36 tháng</option>
                                <option value={2}>2: Trong 24-36 tháng</option>
                                <option value={3}>3: Trong 12-24 tháng</option>
                                <option value={4}>4: Trong 6-12 tháng</option>
                                <option value={5}>5: Khẩn cấp &lt;= 6 tháng</option>
                              </select>
                            </div>

                            <div>
                              <span className="block text-xs font-semibold text-slate-500 mb-1">
                                L — Tác động (30%)
                              </span>
                              <select
                                value={item.impact}
                                onChange={e => handleUpdateDemandItem(item.id, 'impact', Number(e.target.value))}
                                className="form-control w-full px-2 py-1 text-xs font-bold"
                              >
                                <option value={1}>1: Cải thiện nhỏ</option>
                                <option value={2}>2: Cải thiện rõ rệt</option>
                                <option value={3}>3: Tác động đáng kể</option>
                                <option value={4}>4: Chuyển biến lớn</option>
                                <option value={5}>5: Bước nhảy vọt cạnh tranh</option>
                              </select>
                            </div>

                            <div>
                              <span className="block text-xs font-semibold text-slate-500 mb-1">
                                N — Vốn đầu tư (20%)
                              </span>
                              <select
                                value={item.investment}
                                onChange={e => handleUpdateDemandItem(item.id, 'investment', Number(e.target.value))}
                                className="form-control w-full px-2 py-1 text-xs font-bold"
                              >
                                <option value={1}>1: Cần hỗ trợ 100%</option>
                                <option value={2}>2: Tự bố trí &lt; 30%</option>
                                <option value={3}>3: Tự bố trí 30-50%</option>
                                <option value={4}>4: Tự bố trí 50-80%</option>
                                <option value={5}>5: Chủ động &gt;= 80% vốn</option>
                              </select>
                            </div>

                            <div>
                              <span className="block text-xs font-semibold text-slate-500 mb-1">
                                O — Sẵn sàng TAR (15%)
                              </span>
                              <select
                                value={item.readiness}
                                onChange={e => handleUpdateDemandItem(item.id, 'readiness', Number(e.target.value))}
                                className="form-control w-full px-2 py-1 text-xs font-bold"
                              >
                                <option value={1}>1: Chưa có kế hoạch</option>
                                <option value={2}>2: Tìm hiểu sơ bộ</option>
                                <option value={3}>3: Đang chuẩn bị nhân lực</option>
                                <option value={4}>4: Đã có kế hoạch chi tiết</option>
                                <option value={5}>5: Sẵn sàng triển khai ngay</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* =========================================================================
              BƯỚC 6: PHẦN F — ĐỊNH HƯỚNG & HỖ TRỢ
             ========================================================================= */}
          {currentStep === 6 && (
            <section className="space-y-6">
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                    PHẦN F • ĐỊNH HƯỚNG CÔNG NGHỆ MỚI
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Nhu Cầu Tiếp Cận Công Nghệ Tiên Tiến Trong 3 Năm Tới
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* F.1: Tự động hóa */}
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2 text-sm text-brand-700 dark:text-cyan-400">
                      1. Tự động hóa sản xuất
                    </span>
                    <div className="space-y-2">
                      {AUTOMATION_TECH.map((item, idx) => {
                        const checked = automationSelected.includes(item);
                        return (
                          <label key={idx} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => setAutomationSelected(
                                checked ? automationSelected.filter(x => x !== item) : [...automationSelected, item]
                              )}
                              className="w-4 h-4 mt-0.5 text-brand-600 rounded"
                            />
                            <span>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* F.2: Chuyển đổi số */}
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2 text-sm text-emerald-600 dark:text-emerald-400">
                      2. Chuyển đổi số quản trị
                    </span>
                    <div className="space-y-2">
                      {DIGITAL_TECH.slice(0, 7).map((item, idx) => {
                        const checked = digitalSelected.includes(item);
                        return (
                          <label key={idx} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => setDigitalSelected(
                                checked ? digitalSelected.filter(x => x !== item) : [...digitalSelected, item]
                              )}
                              className="w-4 h-4 mt-0.5 text-brand-600 rounded"
                            />
                            <span>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* F.3: Công nghệ xanh */}
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2 text-sm text-teal-600 dark:text-teal-400">
                      3. Công nghệ xanh & Tuần hoàn
                    </span>
                    <div className="space-y-2">
                      {GREEN_TECH.map((item, idx) => {
                        const checked = greenSelected.includes(item);
                        return (
                          <label key={idx} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => setGreenSelected(
                                checked ? greenSelected.filter(x => x !== item) : [...greenSelected, item]
                              )}
                              className="w-4 h-4 mt-0.5 text-brand-600 rounded"
                            />
                            <span>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* HỖ TRỢ CHUYÊN MÔN & ĐỐI TÁC */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
                      Mức độ mong muốn hỗ trợ từ Sở KH&CN / Viện trường (1–5):
                    </span>
                    <div className="space-y-2.5">
                      {SUPPORT_NEEDS_LIST.map(sup => (
                        <div key={sup.id} className="flex items-center justify-between gap-2">
                          <span className="text-slate-600 dark:text-slate-400 max-w-xs">{sup.label}</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(score => (
                              <button
                                key={score}
                                type="button"
                                onClick={() => setSupportRatings({ ...supportRatings, [sup.id]: score })}
                                className={`w-6 h-6 rounded-md text-xs font-bold transition ${
                                  (supportRatings[sup.id] || 4) === score
                                    ? 'bg-brand-700 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
                      Đối tác mong muốn kết nối giải quyết bài toán:
                    </span>
                    <div className="space-y-2">
                      {DESIRED_PARTNERS.map((p, idx) => {
                        const checked = partnersSelected.includes(p);
                        return (
                          <label key={idx} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => setPartnersSelected(
                                checked ? partnersSelected.filter(x => x !== p) : [...partnersSelected, p]
                              )}
                              className="w-4 h-4 text-brand-600 rounded"
                            />
                            <span>{p}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* =========================================================================
              BƯỚC 7: PHẦN G — RÀ SOÁT, XÁC NHẬN & PDPD
             ========================================================================= */}
          {currentStep === 7 && (
            <section className="space-y-6">
              {/* SUMMARY REVIEW CARD */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                      PHẦN G • RÀ SOÁT TỔNG THỂ
                    </span>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      Bản Tóm Tắt Phiếu Khảo Sát Nhu Cầu DNNVV
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-400/30">
                    Sẵn sàng nộp
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Doanh nghiệp:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{companyName || 'Chưa nhập'}</span>
                    <span className="text-slate-400 block text-xs">MST: {taxCode || 'Chưa nhập'} • {province}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Đại diện liên hệ:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{contactName} ({contactPosition})</span>
                    <span className="text-slate-400 block text-xs">{contactPhone} • {contactEmail}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Hiện trạng máy móc:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{equipments.length} thiết bị chủ lực</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Điểm nghẽn kỹ thuật đã chọn:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{selectedBottlenecks.length} điểm nghẽn</span>
                  </div>

                  <div className="col-span-full pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block mb-1">Danh mục bài toán kỹ thuật (Demand Tickets):</span>
                    <div className="space-y-1.5">
                      {demandItems.map((item, idx) => {
                        const score = calculateTniScore(item.urgency, item.impact, item.investment, item.readiness);
                        const badge = getTniBadge(score);
                        return (
                          <div key={item.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              #{idx + 1}: {item.technicalProblem || 'Chưa mô tả'}
                            </span>
                            <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${badge.className}`}>
                              TNI: {score}/100
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* THÔNG TIN NGƯỜI XÁC NHẬN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Họ và tên người đại diện xác nhận <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={confirmName}
                      onChange={e => setConfirmName(e.target.value)}
                      placeholder="Người ký xác nhận"
                      className="form-control w-full px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Chức vụ đại diện xác nhận <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={confirmPosition}
                      onChange={e => setConfirmPosition(e.target.value)}
                      className="form-control w-full px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Ngày xác nhận nộp phiếu
                    </label>
                    <input
                      type="date"
                      value={confirmDate}
                      onChange={e => setConfirmDate(e.target.value)}
                      className="form-control w-full px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                {/* CHECKBOX CAM KẾT PDPD BẮT BUỘC (BR-Delta-05) */}
                <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-xs text-brand-900 dark:text-brand-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pdpdConsent}
                      onChange={e => setPdpdConsent(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-brand-700 rounded focus:ring-brand-500 shrink-0 cursor-pointer"
                    />
                    <span className="leading-relaxed">
                      <strong>Cam kết bảo vệ dữ liệu cá nhân & xác thực thông tin:</strong> Tôi đã rà soát toàn bộ thông tin do doanh nghiệp cung cấp. Việc sử dụng dữ liệu sẽ tuân thủ thông báo mục đích, phạm vi và quyền truy cập theo Nghị định 13/2023/NĐ-CP (PDPD). Các thông tin liên hệ và ngân sách chi tiết sẽ được bảo mật, chỉ mở theo cơ chế kết nối có kiểm soát của Sở KH&CN.
                    </span>
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* =========================================================================
              NAVIGATION CONTROLS (QUAY LẠI / TIẾP TỤC / NỘP PHIẾU)
             ========================================================================= */}
          <div className="flex items-center justify-between gap-4 p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại Bước {currentStep - 1}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="hidden sm:inline-flex border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Lưu nháp
              </button>

              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-brand-700 hover:bg-brand-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  Tiếp tục Bước {currentStep + 1} <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !pdpdConsent}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-black text-xs shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý & lưu CSDL...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Hoàn Tất & Nộp Khảo Sát
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
