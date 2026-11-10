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
  Info,
  Search,
  Loader2,
  KeyRound,
  LogIn,
  FileText,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/components/common/toast';
import TniRealtimeCalculator, { TniValues } from '@/components/demand/TniRealtimeCalculator';
import TniMethodologyModal from '@/components/common/TniMethodologyModal';
import SearchableCombobox from '@/components/ui/searchable-combobox';
import { TouchSignatureField } from '@/components/ui/signature-pad-modal';
import { SECTORS_18_CATALOG } from '@/services/api/technology-offer';
import { lookupTaxCode, fetchMyEnterpriseProfile, updateMyEnterpriseProfile } from '@/lib/enterprise-client';
import { getStoredSession } from '@/lib/auth-client';

import {
  PROVINCES_63,
  TECH_GROUP_OPTIONS,
  getTechGroupsBySector,
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

export default function DeepSurveyPage({ showDemoButton = true }: any) {
  const toast = useToast();

  // Wizard state: 1 -> 4
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLookingUpTax, setIsLookingUpTax] = useState<boolean>(false);
  const [isTniModalOpen, setIsTniModalOpen] = useState<boolean>(false);
  const [isPrefilledFromSession, setIsPrefilledFromSession] = useState<boolean>(false);
  const [initialProfile, setInitialProfile] = useState<any>(null);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [syncConfirmed, setSyncConfirmed] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<{
    surveyCode: string;
    createdTickets: string[];
    companyName: string;
    accountProvisioned?: boolean;
    account?: {
      email: string;
      temporaryPassword?: string;
      role: string;
      note: string;
    } | null;
  } | null>(null);

  // -------------------------------------------------------------
  // PHẦN A: THÔNG TIN DOANH NGHIỆP
  // -------------------------------------------------------------
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [province, setProvince] = useState('');
  const [address, setAddress] = useState('');
  const [surveySite, setSurveySite] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPosition, setContactPosition] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [mainIndustry, setMainIndustry] = useState('');
  const [mainProducts, setMainProducts] = useState('');
  const [employeeScale, setEmployeeScale] = useState('');
  const [revenueRange3y, setRevenueRange3y] = useState('');

  // -------------------------------------------------------------
  // PHẦN B: HIỆN TRẠNG & 8 TIÊU CHÍ
  // -------------------------------------------------------------
  const [equipments, setEquipments] = useState<EquipmentItem[]>([
    {
      id: 'eq-1',
      stageName: '',
      machineName: '',
      productOutput: '',
      investmentYear: new Date().getFullYear(),
      techOrigin: '',
      depreciationStatus: ''
    }
  ]);

  const [criteria8, setCriteria8] = useState<Record<number, number>>({});

  // -------------------------------------------------------------
  // PHẦN C: ĐIỂM NGHẼN SẢN XUẤT (MAX 5)
  // -------------------------------------------------------------
  const [selectedBottlenecks, setSelectedBottlenecks] = useState<string[]>([]);
  const [bottleneckSeverity, setBottleneckSeverity] = useState<Record<string, number>>({});
  const [hardestStage, setHardestStage] = useState('');
  const [primaryCause, setPrimaryCause] = useState('');

  // -------------------------------------------------------------
  // PHẦN D: NĂNG LỰC TIẾP NHẬN (TAR)
  // -------------------------------------------------------------
  const [techPersonnel, setTechPersonnel] = useState({
    technicians: 0,
    engineers: 0,
    it: 0,
    automation: 0,
    rd: 0,
    quality: 0,
    notes: ''
  });

  const [tarReadiness, setTarReadiness] = useState<Record<number, number>>({});
  const [managementStatus, setManagementStatus] = useState<Record<number, boolean>>({});

  // -------------------------------------------------------------
  // PHẦN E: BÀI TOÁN & NHU CẦU KỸ THUẬT (DEMAND ITEMS)
  // -------------------------------------------------------------
  const [fundingSourcesSelected, setFundingSourcesSelected] = useState<string[]>([]);
  const [receiptFormatsSelected, setReceiptFormatsSelected] = useState<string[]>([]);

  const [demandItems, setDemandItems] = useState<DemandItemForm[]>([
    {
      id: 'dmd-1',
      sectorCode: 'LV01',
      techGroupCode: 'CN01',
      demandTypeCode: 'NC01',
      stageName: '',
      technicalProblem: '',
      desiredSolution: '',
      solutionDetail: '',
      needConsulting: false,
      expectedGoal: '',
      budgetRange: BUDGET_RANGES_7[3] || '500 triệu–1 tỷ đồng',
      urgency: 3,
      impact: 3,
      investment: 3,
      readiness: 3
    }
  ]);

  // -------------------------------------------------------------
  // PHẦN F: ĐỊNH HƯỚNG CÔNG NGHỆ & HỖ TRỢ
  // -------------------------------------------------------------
  const [automationSelected, setAutomationSelected] = useState<string[]>([]);
  const [digitalSelected, setDigitalSelected] = useState<string[]>([]);
  const [greenSelected, setGreenSelected] = useState<string[]>([]);
  const [partnersSelected, setPartnersSelected] = useState<string[]>([]);
  const [supportRatings, setSupportRatings] = useState<Record<string, number>>({});

  // -------------------------------------------------------------
  // PHẦN G: RÀ SOÁT, XÁC NHẬN & PDPD
  // -------------------------------------------------------------
  const [confirmName, setConfirmName] = useState('');
  const [confirmPosition, setConfirmPosition] = useState('');
  const [confirmDate, setConfirmDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [signatureData, setSignatureData] = useState<string>('');
  const [signatureError, setSignatureError] = useState<string>('');
  const [pdpdConsent, setPdpdConsent] = useState(false);

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
        if (d.contactPosition) setContactPosition(d.contactPosition);
        if (d.contactPhone) setContactPhone(d.contactPhone);
        if (d.contactEmail) setContactEmail(d.contactEmail);
        if (d.province) setProvince(d.province);
        if (d.address) setAddress(d.address);
        if (d.surveySite) setSurveySite(d.surveySite);
        if (d.companyType) setCompanyType(d.companyType);
        if (d.mainIndustry) setMainIndustry(d.mainIndustry);
        if (d.mainProducts) setMainProducts(d.mainProducts);
        if (d.employeeScale) setEmployeeScale(d.employeeScale);
        if (d.revenueRange3y) setRevenueRange3y(d.revenueRange3y);
        if (d.equipments && Array.isArray(d.equipments)) setEquipments(d.equipments);
        if (d.criteria8) setCriteria8(d.criteria8);
        if (d.selectedBottlenecks) setSelectedBottlenecks(d.selectedBottlenecks);
        if (d.bottleneckSeverity) setBottleneckSeverity(d.bottleneckSeverity);
        if (d.hardestStage) setHardestStage(d.hardestStage);
        if (d.primaryCause) setPrimaryCause(d.primaryCause);
        if (d.techPersonnel) setTechPersonnel(d.techPersonnel);
        if (d.tarReadiness) setTarReadiness(d.tarReadiness);
        if (d.managementStatus) setManagementStatus(d.managementStatus);
        if (d.fundingSourcesSelected) setFundingSourcesSelected(d.fundingSourcesSelected);
        if (d.receiptFormatsSelected) setReceiptFormatsSelected(d.receiptFormatsSelected);
        if (d.demandItems && Array.isArray(d.demandItems) && d.demandItems.length > 0) setDemandItems(d.demandItems);
        if (d.automationSelected) setAutomationSelected(d.automationSelected);
        if (d.digitalSelected) setDigitalSelected(d.digitalSelected);
        if (d.greenSelected) setGreenSelected(d.greenSelected);
        if (d.partnersSelected) setPartnersSelected(d.partnersSelected);
        if (d.supportRatings) setSupportRatings(d.supportRatings);
        if (d.confirmName) setConfirmName(d.confirmName);
        if (d.confirmPosition) setConfirmPosition(d.confirmPosition);
        if (d.signatureData) setSignatureData(d.signatureData);
        toast.info('Đã khôi phục dữ liệu bản nháp từ phiên làm việc trước.', 'Khôi phục bản nháp');
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  // -------------------------------------------------------------
  // SMART PRE-FILL CHO DOANH NGHIỆP ĐÃ ĐĂNG NHẬP
  // -------------------------------------------------------------
  useEffect(() => {
    const session = getStoredSession();
    if (session?.accessToken) {
      fetchMyEnterpriseProfile()
        .then((profile) => {
          if (profile && (profile.name || profile.taxCode || profile.legalName)) {
            setInitialProfile(profile);
            setIsPrefilledFromSession(true);
            setCompanyName(profile.name || profile.legalName || '');
            setTaxCode(profile.taxCode || '');
            if (profile.provinceCity) setProvince(profile.provinceCity);
            if (profile.addressDetail) setAddress(profile.addressDetail);
            if (profile.contactPerson) setContactName(profile.contactPerson);
            if (profile.contactPhone) setContactPhone(profile.contactPhone);
            if (profile.contactEmail) setContactEmail(profile.contactEmail);
            if (profile.contactPosition) setContactPosition(profile.contactPosition);
            else setContactPosition('Đại diện Doanh nghiệp');
            if (profile.ownershipType) setCompanyType(profile.ownershipType);
            if (profile.sectorCode || profile.mainSectorName) {
              setMainIndustry(profile.sectorCode || profile.mainSectorName || '');
            }
            if (profile.workforceScale) setEmployeeScale(profile.workforceScale);
            if (profile.revenueRange && profile.revenueRange !== '[BẢO MẬT]') {
              setRevenueRange3y(profile.revenueRange);
            }
            if (profile.contactPerson) setConfirmName(profile.contactPerson);
            if (profile.contactPosition) setConfirmPosition(profile.contactPosition);
            else setConfirmPosition('Đại diện Doanh nghiệp');

            toast.success(
              `Đã tự động nạp hồ sơ doanh nghiệp "${profile.name || profile.legalName || 'Đã đăng ký'}".`,
              'Đồng bộ hồ sơ DN'
            );
          }
        })
        .catch(() => {
          // Bỏ qua nếu lỗi mạng hoặc chưa tạo hồ sơ
        });
    }
  }, []);

  // -------------------------------------------------------------
  // TRA CỨU MÃ SỐ THUẾ TỰ ĐỘNG (HYBRID LOOKUP)
  // -------------------------------------------------------------
  const handleLookupTaxCode = async () => {
    if (!taxCode.trim()) {
      toast.warning('Vui lòng nhập Mã số thuế trước khi tra cứu.', 'Chưa nhập MST');
      return;
    }

    setIsLookingUpTax(true);
    try {
      const res = await lookupTaxCode(taxCode);
      if (res && res.found && res.name) {
        setCompanyName(res.name);
        if (res.province) setProvince(res.province);
        if (res.address) setAddress(res.address);
        const sourceName = res.source === 'INTERNAL' ? 'CSDL Doanh nghiệp NacenTwin' : 'Cổng Thông tin VietQR';
        toast.success(
          `Đã tìm thấy thông tin: ${res.name} (Nguồn: ${sourceName}). Đã tự động điền vào phiếu.`,
          'Tra cứu MST thành công'
        );
      } else {
        toast.warning(
          res?.message || `Không tìm thấy thông tin cho MST ${taxCode}. Quý DN vui lòng điền thủ công.`,
          'Không tìm thấy'
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tra cứu mã số thuế từ máy chủ.', 'Lỗi tra cứu');
    } finally {
      setIsLookingUpTax(false);
    }
  };

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
        confirmPosition,
        signatureData
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      toast.success('Đã lưu bản nháp khảo sát vào trình duyệt.', 'Lưu thành công');
    } catch {
      toast.error('Không thể lưu bản nháp vào bộ nhớ trình duyệt.', 'Lỗi lưu trữ');
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep(1);
    setCompanyName('');
    setTaxCode('');
    setProvince('');
    setAddress('');
    setSurveySite('');
    setContactName('');
    setContactPosition('');
    setContactPhone('');
    setContactEmail('');
    setCompanyType('');
    setMainIndustry('');
    setMainProducts('');
    setEmployeeScale('');
    setRevenueRange3y('');
    setEquipments([
      {
        id: 'eq-1',
        stageName: '',
        machineName: '',
        productOutput: '',
        investmentYear: new Date().getFullYear(),
        techOrigin: '',
        depreciationStatus: ''
      }
    ]);
    setCriteria8({});
    setSelectedBottlenecks([]);
    setBottleneckSeverity({});
    setHardestStage('');
    setPrimaryCause('');
    setTechPersonnel({
      technicians: 0,
      engineers: 0,
      it: 0,
      automation: 0,
      rd: 0,
      quality: 0,
      notes: ''
    });
    setTarReadiness({});
    setManagementStatus({});
    setFundingSourcesSelected([]);
    setReceiptFormatsSelected([]);
    setDemandItems([
      {
        id: 'dmd-1',
        sectorCode: 'LV01',
        techGroupCode: 'CN01',
        demandTypeCode: 'NC01',
        stageName: '',
        technicalProblem: '',
        desiredSolution: '',
        solutionDetail: '',
        needConsulting: false,
        expectedGoal: '',
        budgetRange: BUDGET_RANGES_7[3] || '500 triệu–1 tỷ đồng',
        urgency: 3,
        impact: 3,
        investment: 3,
        readiness: 3
      }
    ]);
    setAutomationSelected([]);
    setDigitalSelected([]);
    setGreenSelected([]);
    setPartnersSelected([]);
    setSupportRatings({});
    setConfirmName('');
    setConfirmPosition('');
    setConfirmDate(new Date().toISOString().slice(0, 10));
    setSignatureData('');
    setSignatureError('');
    setPdpdConsent(false);
    toast.info('Đã xóa dữ liệu bản nháp và làm mới toàn bộ biểu mẫu.', 'Đã làm mới');
  };

  const handleFillSampleData = () => {
    setCompanyName('Công ty Cổ phần Chế tạo Cơ khí Chính xác Minh Anh');
    setTaxCode('0108992134');
    setProvince('Hà Nội');
    setAddress('Lô CN-08, Khu Công nghiệp vừa và nhỏ Từ Liêm, Bắc Từ Liêm, Hà Nội');
    setSurveySite('Nhà xưởng gia công chính xác số 1');
    setContactName('Nguyễn Văn Tuấn');
    setContactPosition('Phó Giám đốc Kỹ thuật');
    setContactPhone('0912345678');
    setContactEmail('tuan.nv@minhanh-mech.vn');
    setCompanyType('CO_PHAN');
    setMainIndustry('LV07');
    setMainProducts('Linh kiện dập cơ khí chính xác, vỏ tủ điện điều khiển, khung máy CNC');
    setEmployeeScale('50-199');
    setRevenueRange3y('10-50 tỷ VNĐ');
    setEquipments([
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
    setCriteria8({ 0: 4, 1: 3, 2: 4, 3: 3, 4: 3, 5: 3, 6: 4, 7: 4 });
    setSelectedBottlenecks([
      'Tỷ lệ sản phẩm lỗi / phế phẩm còn cao',
      'Thiếu tự động hóa, còn phụ thuộc nhân công thủ công',
      'Khó tiếp cận công nghệ mới, thiết bị tiên tiến'
    ]);
    setBottleneckSeverity({
      'Tỷ lệ sản phẩm lỗi / phế phẩm còn cao': 4,
      'Thiếu tự động hóa, còn phụ thuộc nhân công thủ công': 5,
      'Khó tiếp cận công nghệ mới, thiết bị tiên tiến': 4
    });
    setHardestStage('Kiểm tra chất lượng ngoại quan và đóng gói');
    setPrimaryCause('Thiếu hệ thống cảm biến quang học kiểm tra tự động và nhân lực lập trình AI.');
    setTechPersonnel({
      technicians: 12,
      engineers: 6,
      it: 2,
      automation: 3,
      rd: 2,
      quality: 4,
      notes: 'Kỹ sư cơ điện kiêm nhiệm bảo trì hệ thống điều khiển PLC.'
    });
    setManagementStatus({ 0: true, 1: true, 2: false, 3: true, 4: false, 5: true, 6: true });
    setTarReadiness({ 0: 4, 1: 4, 2: 4, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 4 });
    setFundingSourcesSelected([
      'Vốn tự có của doanh nghiệp',
      'Vay vốn ngân hàng thương mại'
    ]);
    setReceiptFormatsSelected([
      'Mua sắm thiết bị / máy móc mới trọn gói',
      'Đào tạo chuyển giao kỹ thuật chuyên sâu'
    ]);
    setDemandItems([
      {
        id: 'dmd-1',
        sectorCode: 'LV07',
        techGroupCode: 'CN01',
        demandTypeCode: 'NC01',
        stageName: 'Gia công & Lắp ráp chi tiết',
        technicalProblem: 'Tự động hóa phát hiện khuyết tật bề mặt mối hàn bằng AI Vision',
        desiredSolution: 'Cánh tay Robot gắn Camera quang học 3D kèm phần mềm AI Deep Learning',
        solutionDetail: 'Tích hợp hệ thống camera công nghiệp 3D với băng tải kiểm định tự động tốc độ cao',
        needConsulting: true,
        expectedGoal: 'Giảm tỷ lệ lỗi phế phẩm từ 4.5% xuống dưới 0.3%, tiết kiệm 3 nhân công',
        budgetRange: '1–5 tỷ đồng',
        urgency: 4,
        impact: 5,
        investment: 4,
        readiness: 4
      }
    ]);
    setAutomationSelected([
      'Tự động hóa dây chuyền sản xuất',
      'Robot công nghiệp (AGV, Robot hàn, xếp hàng)',
      'Hệ thống điều khiển tự động (PLC, SCADA)'
    ]);
    setDigitalSelected([
      'Hệ thống điều hành sản xuất tại xưởng (MES)',
      'Hệ thống quản lý kho & chuỗi cung ứng (WMS)',
      'Trí tuệ nhân tạo (AI Vision, Dự báo)'
    ]);
    setGreenSelected([
      'Giải pháp tiết kiệm & sử dụng hiệu quả năng lượng',
      'Hệ thống xử lý nước thải & tái sử dụng nước'
    ]);
    setPartnersSelected([
      'Nhà cung cấp giải pháp / thiết bị công nghệ trong nước',
      'Viện nghiên cứu, Trường đại học chuyên ngành',
      'Chuyên gia tư vấn kỹ thuật độc lập'
    ]);
    setSupportRatings({
      consulting: 5,
      matching: 5,
      finance: 4,
      training: 4,
      assessment: 4
    });
    setConfirmName('Nguyễn Văn Tuấn');
    setConfirmPosition('Phó Giám đốc Kỹ thuật');
    setSignatureData('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    setSignatureError('');
    setPdpdConsent(true);
    toast.success('Đã nạp bộ dữ liệu thử nghiệm chuẩn doanh nghiệp cơ khí.', 'Nạp dữ liệu mẫu');
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
      techOrigin: '',
      depreciationStatus: ''
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
    }
  };

  const handleAddDemandItem = () => {
    const defaultSector = mainIndustry || 'LV01';
    const { recommended } = getTechGroupsBySector(defaultSector);
    const defaultTechGroup = recommended[0]?.code || 'CN01';

    const newItem: DemandItemForm = {
      id: `dmd-${Date.now()}`,
      sectorCode: defaultSector,
      techGroupCode: defaultTechGroup,
      demandTypeCode: 'NC01',
      stageName: '',
      technicalProblem: '',
      desiredSolution: '',
      solutionDetail: '',
      needConsulting: false,
      expectedGoal: '',
      budgetRange: BUDGET_RANGES_7[3] || '500 triệu–1 tỷ đồng',
      urgency: 3,
      impact: 3,
      investment: 3,
      readiness: 3
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
    setDemandItems(demandItems.map(d => {
      if (d.id !== id) return d;
      if (field === 'sectorCode') {
        const { recommended } = getTechGroupsBySector(value);
        const isCurrentStillRecommended = recommended.some(tg => tg.code === d.techGroupCode);
        const nextTechGroup = isCurrentStillRecommended
          ? d.techGroupCode
          : (recommended[0]?.code || d.techGroupCode);
        return { ...d, sectorCode: value, techGroupCode: nextTechGroup };
      }
      return { ...d, [field]: value };
    }));
  };

  const handleUpdateDemandItemTni = (id: string, tniValues: TniValues) => {
    setDemandItems(demandItems.map(d => d.id === id ? {
      ...d,
      urgency: tniValues.urgency,
      impact: tniValues.impact,
      investment: tniValues.investment,
      readiness: tniValues.readiness
    } : d));
  };

  // -------------------------------------------------------------
  // VALIDATION TRƯỚC KHI CHUYỂN BƯỚC (BƯỚC 1 = NHU CẦU, BƯỚC 2 = DOANH NGHIỆP, BƯỚC 3 = TÙY CHỌN, BƯỚC 4 = XÁC NHẬN)
  // -------------------------------------------------------------
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (demandItems.length === 0) {
        toast.error('Phiếu khảo sát cần có ít nhất 1 bài toán kỹ thuật.', 'Thiếu bài toán');
        return false;
      }
      const hasInvalidItem = demandItems.some(d => !d.technicalProblem.trim() || !d.stageName.trim());
      if (hasInvalidItem) {
        toast.error('Vui lòng nhập Công đoạn sản xuất có sự cố và Mô tả cụ thể vấn đề kỹ thuật / điểm nghẽn.', 'Thiếu nội dung bài toán');
        return false;
      }
    }
    if (step === 2) {
      if (!companyName.trim()) {
        toast.error('Vui lòng nhập Tên Doanh nghiệp.', 'Thiếu thông tin');
        return false;
      }
      if (!province.trim()) {
        toast.error('Vui lòng chọn Tỉnh / Thành phố trụ sở chính.', 'Thiếu thông tin địa bàn');
        return false;
      }
      if (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) {
        toast.error('Vui lòng điền đầy đủ Người liên hệ, Số điện thoại và Email.', 'Thiếu thông tin liên hệ');
        return false;
      }
    }
    if (step === 3) {
      // Bước 3: Thông tin bổ sung (Phân mục B, C, D, F) là hoàn toàn tùy chọn, không chặn chuyển bước
      return true;
    }
    if (step === 4) {
      if (!confirmName.trim()) {
        toast.error('Vui lòng nhập Họ tên người đại diện xác nhận.', 'Chưa ký xác nhận');
        return false;
      }
      if (!pdpdConsent) {
        toast.error('Vui lòng tích chọn đồng ý cam kết xử lý dữ liệu PDPD để hoàn tất.', 'Cam kết bảo mật');
        return false;
      }
      if (!signatureData || !signatureData.trim()) {
        setSignatureError('Vui lòng ký tên xác nhận điện tử trước khi gửi phiếu khảo sát!');
        toast.error('Vui lòng ký tên xác nhận điện tử trước khi gửi phiếu khảo sát!', 'Chưa ký xác nhận');
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            const el = document.getElementById('signature-trigger-box');
            if (el && typeof el.scrollIntoView === 'function') {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const hasStep1Changes = useMemo(() => {
    if (!initialProfile) return false;
    return Boolean(
      (companyName && companyName !== initialProfile.name && companyName !== initialProfile.legalName) ||
      (province && province !== initialProfile.provinceCity) ||
      (address && address !== initialProfile.addressDetail) ||
      (contactName && contactName !== initialProfile.contactPerson) ||
      (contactPhone && contactPhone !== initialProfile.contactPhone) ||
      (contactEmail && contactEmail !== initialProfile.contactEmail)
    );
  }, [initialProfile, companyName, province, address, contactName, contactPhone, contactEmail]);

  // -------------------------------------------------------------
  // SUBMIT API TO BACKEND POST /api/v1/demands/surveys
  // -------------------------------------------------------------
  const executeSubmission = async () => {
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
        signatureDataUrl: signatureData,
        representativeSignatureUrl: signatureData,
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
        managementMechanisms: Object.fromEntries(
          Object.entries(managementStatus).map(([idx, val]) => [MANAGEMENT_7_LIST[Number(idx)] || `Management_${idx}`, val])
        ),

        futureDirections: [
          ...automationSelected.map(a => `[Tự động hóa] ${a}`),
          ...digitalSelected.map(d => `[Chuyển đổi số] ${d}`),
          ...greenSelected.map(g => `[Công nghệ xanh] ${g}`)
        ],

        supportNeeds: supportRatings,
        desiredPartners: partnersSelected,

        demandItems: demandItems.map(d => {
          const desiredSolutionCombined = d.solutionDetail
            ? (d.desiredSolution ? `${d.desiredSolution} — ${d.solutionDetail}` : d.solutionDetail)
            : (d.desiredSolution || undefined);
          return {
            stageName: d.stageName || 'Sản xuất chính',
            technicalProblem: d.technicalProblem,
            desiredSolution: desiredSolutionCombined,
            needConsulting: d.needConsulting,
            expectedGoal: d.expectedGoal,
            applicationScale: d.solutionDetail || 'Nhà máy sản xuất',
            sectorCode: d.sectorCode || 'LV07',
            techGroupCode: d.techGroupCode || 'CN01',
            demandTypeCode: d.demandTypeCode || 'NC01',
            budgetRange: d.budgetRange,
            urgencyScore: d.urgency,
            impactScore: d.impact,
            investmentCapacity: d.investment,
            adoptionReadiness: d.readiness
          };
        })
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
          companyName,
          accountProvisioned: Boolean(data.accountProvisioned),
          account: data.account || null
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1)) {
      setCurrentStep(1);
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }
    if (!validateStep(2)) {
      setCurrentStep(2);
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }
    if (!validateStep(4)) {
      setCurrentStep(4);
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    if (hasStep1Changes && !syncConfirmed) {
      setShowSyncModal(true);
      return;
    }

    await executeSubmission();
  };

  const handleConfirmSync = async (shouldSync: boolean) => {
    setShowSyncModal(false);
    setSyncConfirmed(true);
    if (shouldSync) {
      try {
        await updateMyEnterpriseProfile({
          name: companyName,
          provinceCity: province,
          addressDetail: address,
          contactPerson: contactName,
          contactPhone,
          contactEmail,
          ownershipType: companyType || undefined,
          sectorCode: mainIndustry || undefined,
          workforceScale: employeeScale || undefined,
          revenueRange: revenueRange3y || undefined
        });
        toast.success('Đã đồng bộ thông tin thay đổi vào Hồ sơ Doanh nghiệp gốc (SSOT).', 'Đồng bộ SSOT thành công');
      } catch (err: any) {
        toast.warning(err.message || 'Không thể đồng bộ hồ sơ gốc, vẫn tiếp tục nộp khảo sát.', 'Cảnh báo');
      }
    }
    await executeSubmission();
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
              Hệ thống NacenTwin đã lưu trữ đầy đủ dữ liệu khảo sát và tự động bóc tách thành công <strong>{submitResult.createdTickets.length} bài toán kỹ thuật (Demand Tickets)</strong> cho <strong>{submitResult.companyName}</strong>.
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
            {signatureData && (
              <div className="text-xs pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-0.5">
                    Đại diện xác nhận đã ký điện tử:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {confirmName} {confirmPosition ? `(${confirmPosition})` : ''}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-1.5 border border-slate-200 dark:border-slate-700 shadow-sm max-h-14 flex items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={signatureData}
                    alt="Chữ ký điện tử người đại diện"
                    className="max-h-10 max-w-[140px] object-contain"
                  />
                </div>
              </div>
            )}
            <div className="text-caption text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Dữ liệu đã được mã hóa PII theo Nghị định 13/2023/NĐ-CP và chuyển Cổng Thẩm định Sở KH&CN.</span>
            </div>
          </div>

          {submitResult.accountProvisioned && submitResult.account && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>TÀI KHOẢN DOANH NGHIỆP ĐÃ ĐƯỢC CẤP TỰ ĐỘNG</span>
              </div>
              <p className="text-caption text-amber-700 dark:text-amber-400">
                Hệ thống đã tự động tạo tài khoản Bên mua (Buyer) để bạn có thể theo dõi tiến độ xử lý và kết nối chuyên gia:
              </p>
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-200 dark:border-amber-900 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Tên đăng nhập (Email):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{submitResult.account.email}</span>
                </div>
                {submitResult.account.temporaryPassword && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Mật khẩu tạm thời:</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                      {submitResult.account.temporaryPassword}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Vai trò hệ thống:</span>
                  <span className="font-bold text-brand-700 dark:text-cyan-400">Doanh nghiệp tìm mua (Buyer)</span>
                </div>
              </div>
              <p className="text-caption text-slate-500 dark:text-slate-400 italic">
                * Vui lòng lưu lại thông tin trên. Bạn có thể đổi mật khẩu sau lần đăng nhập đầu tiên.
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 pt-3">
            {submitResult.accountProvisioned ? (
              <Link
                href="/login"
                className="bg-brand-700 hover:bg-brand-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Đăng Nhập Ngay Vào Hệ Thống
              </Link>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/portal/buyer/demands"
                  className="bg-brand-700 hover:bg-brand-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <Cpu className="w-4 h-4 text-brand-200" /> Đến Bàn Làm Việc Bài Toán Đổi Mới Công Nghệ <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/portal/matching/radar"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" /> Khám Phá Radar Ghép Nối AI
                </Link>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.print();
              }}
              className="border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-brand-600 dark:text-cyan-400" /> In phiếu tiếp nhận
            </button>
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
              Mẫu KS-DNNVV-2026 • Bộ Khoa Học & Công Nghệ (Hồ Sơ Sâu 4 Bước)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Khảo Sát Nhu Cầu Đổi Mới Công Nghệ & Điểm Nghẽn Kỹ Thuật
            </h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Bộ công cụ khảo sát toàn diện giúp DNNVV chuẩn hóa bài toán kỹ thuật, tính toán chỉ số cấp thiết TNI và kết nối giải pháp từ hơn 500+ Viện trường, Doanh nghiệp ĐMST.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              {showDemoButton && (
                <button
                  type="button"
                  onClick={handleFillSampleData}
                  className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-300/30 text-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  title="Điền dữ liệu mẫu demo để thử nghiệm nhanh quy trình"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Điền dữ liệu mẫu (Demo)
                </button>
              )}
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
                title="Xóa dữ liệu và làm mới form từ đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Làm mới / Xóa nháp
              </button>
            </div>
            <span className="text-caption text-white/75">
              Tự động lưu trữ trên trình duyệt
            </span>
          </div>
        </div>
      </section>

      {/* CR-020 ALIAS / CROSS-NAVIGATION BANNER */}
      <div className="bg-blue-50 dark:bg-blue-950/60 border-b border-blue-200 dark:border-blue-800 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full text-[10px]">Chuẩn mới 2026</span>
            <span>Bạn muốn làm <strong>Phiếu khảo sát năng lực ĐMST 43 câu</strong> có tính điểm 8 nhóm và xuất biểu đồ Radar Chart tức thời?</span>
          </div>
          <Link
            href="/khao-sat-dmst"
            className="font-bold text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Chuyển sang Khảo sát ĐMST 43 câu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* STEPPER NAVIGATION BAR (4 TABS TINH GỌN: NHU CẦU -> DOANH NGHIỆP -> THÔNG TIN BỔ SUNG -> XÁC NHẬN) */}
      <div className="sticky top-[68px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between mb-2 text-xs font-bold">
            <span className="text-brand-700 dark:text-cyan-400">
              Bước {currentStep}/4: {[
                'Nhu Cầu & Thuật Toán TNI (Bắt buộc)',
                'Thông Tin Doanh Nghiệp (Bắt buộc)',
                'Thông Tin Bổ Sung / Hiện Trạng & Năng Lực (Tùy chọn)',
                'Rà Soát & Xác Nhận PDPD'
              ][currentStep - 1]}
            </span>
            <span className="text-slate-500">
              {Math.round((currentStep / 4) * 100)}% Hoàn thành
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
            <div
              className="bg-brand-600 dark:bg-cyan-500 h-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>

          {/* Stepper Buttons (Responsive Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { num: 1, label: 'Nhu Cầu & TNI' },
              { num: 2, label: 'Doanh Nghiệp' },
              { num: 3, label: 'Thông Tin Bổ Sung' },
              { num: 4, label: 'Xác Nhận' }
            ].map((step) => {
              const isCurrent = currentStep === step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    setCurrentStep(step.num);
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 border cursor-pointer ${
                    isCurrent
                      ? 'bg-brand-700 text-white border-brand-800 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-black ${
                    isCurrent ? 'bg-white text-brand-700' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
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
              BƯỚC 1: PHẦN E — DÒNG NHU CẦU & THUẬT TOÁN TNI (ĐỒNG BỘ FORM ĐĂNG NHANH)
             ========================================================================= */}
          {currentStep === 1 && (
            <section className="space-y-6">
              {/* E.1: DANH SÁCH BÀI TOÁN KỸ THUẬT (ĐỒNG BỘ 10 TIÊU CHÍ + TNI REALTIME CALCULATOR TỪ QUICK DEMAND MODAL) */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                      BƯỚC 1.1 • DEMAND TICKETS & TNI ENGINE
                    </span>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      Danh Mục Bài Toán Kỹ Thuật Cần Giải Quyết ({demandItems.length} Bài toán)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Khảo sát điểm nghẽn sản xuất, tính toán chỉ số cấp thiết TNI và tự động ghép nối với bên chào bán công nghệ.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start">
                    <button
                      type="button"
                      onClick={() => setIsTniModalOpen(true)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <BookOpen className="w-4 h-4" /> Phương pháp luận TNI (K-L-N-O)
                    </button>
                    <button
                      type="button"
                      onClick={handleAddDemandItem}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Thêm bài toán kỹ thuật
                    </button>
                  </div>
                </div>

                {isPrefilledFromSession && (
                  <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="text-teal-800 dark:text-teal-200">
                        <strong>Tự động đồng bộ hồ sơ Doanh nghiệp đã đăng ký:</strong> Đã nạp sẵn thông tin <strong>{companyName}</strong> (MST: {taxCode || 'Đã liên kết'}) ở Bước 2.
                      </span>
                    </div>
                    <span className="text-teal-700 dark:text-teal-300 font-bold shrink-0 hidden sm:inline">
                      Sẵn sàng ở Bước 2 ✓
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  {demandItems.map((item, idx) => (
                    <div key={item.id} className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-5">
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

                      {/* Bố cục 2 cột giống hệt Form Đăng Nhanh Nhu Cầu (QuickDemandModal) */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                        {/* Cột trái: 1. Chi Tiết Bài Toán Kỹ Thuật (10 tiêu chí) */}
                        <div className="lg:col-span-6 space-y-3.5">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                            <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                1. Chi Tiết Bài Toán Kỹ Thuật
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Khảo sát nhu cầu công nghệ / Vấn đề cần giải quyết (10 tiêu chí)
                              </p>
                            </div>
                          </div>

                          {/* 1. Tên công nghệ / thiết bị */}
                          <div>
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              1. Tên công nghệ / thiết bị <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={item.desiredSolution}
                              onChange={e => handleUpdateDemandItem(item.id, 'desiredSolution', e.target.value)}
                              placeholder="Ví dụ: Ứng dụng KH&CN xây dựng mô hình thâm canh cây na rải vụ..."
                              className="form-control w-full text-xs font-medium"
                            />
                          </div>

                          {/* 2. Mô tả chi tiết thêm về nhu cầu */}
                          <div>
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              2. Mô tả chi tiết thêm về nhu cầu
                            </label>
                            <textarea
                              rows={2}
                              value={item.solutionDetail || ''}
                              onChange={e => handleUpdateDemandItem(item.id, 'solutionDetail', e.target.value)}
                              placeholder="Mô tả cụ thể các yêu cầu kỹ thuật, giải pháp mong muốn tiếp nhận..."
                              className="form-control w-full p-2.5 text-xs leading-relaxed"
                            />
                          </div>

                          {/* Hàng 3 trường: 3. Ngân sách - 4. Lĩnh vực - 5. Nhóm công nghệ */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {/* 3. Ngân sách */}
                            <div>
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                3. Ngân sách
                              </label>
                              <select
                                value={item.budgetRange}
                                onChange={e => handleUpdateDemandItem(item.id, 'budgetRange', e.target.value)}
                                className="form-control w-full text-xs font-medium"
                              >
                                {BUDGET_RANGES_7.map(b => (
                                  <option key={b} value={b}>
                                    {b}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* 4. Lĩnh vực */}
                            <div>
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 truncate" title="Lĩnh vực">
                                4. Lĩnh vực <span className="text-rose-500">*</span>
                              </label>
                              <SearchableCombobox
                                value={item.sectorCode}
                                onChange={(val) => handleUpdateDemandItem(item.id, 'sectorCode', val)}
                                ariaLabel="4. Lĩnh vực"
                                searchPlaceholder="Tìm lĩnh vực (VD: Cơ khí, Công nghệ thông tin...)"
                                options={SECTORS_18_CATALOG.filter(s => s.code !== 'ALL').map(sec => ({
                                  value: sec.code,
                                  code: sec.code,
                                  label: sec.name
                                }))}
                              />
                            </div>

                            {/* 5. Nhóm công nghệ (Tự động lọc ưu tiên theo Lĩnh vực) */}
                            <div>
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 truncate" title="Nhóm công nghệ">
                                5. Nhóm công nghệ
                              </label>
                              <SearchableCombobox
                                value={item.techGroupCode}
                                onChange={(val) => handleUpdateDemandItem(item.id, 'techGroupCode', val)}
                                ariaLabel="5. Nhóm công nghệ"
                                searchPlaceholder="Tìm nhóm công nghệ (VD: Robot, AI, Tự động hóa...)"
                                options={getTechGroupsBySector(item.sectorCode).allSorted.map(tg => ({
                                  value: tg.code,
                                  code: tg.code,
                                  label: tg.name,
                                  group: tg.groupLabel,
                                  recommended: tg.isRecommended,
                                  badge: tg.isRecommended ? '★ Phù hợp cao với lĩnh vực đã chọn' : undefined
                                }))}
                              />
                            </div>
                          </div>

                          {/* 6. Công đoạn sản xuất có sự cố */}
                          <div>
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              6. Công đoạn sản xuất có sự cố <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={item.stageName}
                              onChange={e => handleUpdateDemandItem(item.id, 'stageName', e.target.value)}
                              placeholder="Ví dụ: Đúc và Nhiệt luyện kim loại, Dập nguội, Thu hoạch & Đóng gói..."
                              className="form-control w-full text-xs font-medium"
                            />
                            <p className="text-xs text-slate-400 mt-0.5">
                              Chỉ rõ phân xưởng hoặc quy trình sản xuất đang gặp khó khăn.
                            </p>
                          </div>

                          {/* 7. Mô tả cụ thể vấn đề kỹ thuật / điểm nghẽn */}
                          <div>
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              7. Mô tả cụ thể vấn đề kỹ thuật / điểm nghẽn <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                              required
                              rows={2}
                              value={item.technicalProblem}
                              onChange={e => handleUpdateDemandItem(item.id, 'technicalProblem', e.target.value)}
                              placeholder="Mô tả cụ thể sự cố, tỷ lệ phế phẩm hoặc thông số kỹ thuật chưa đạt cần khắc phục..."
                              className="form-control w-full p-2.5 text-xs leading-relaxed"
                            />
                          </div>

                          {/* 8. Mục tiêu kỹ thuật và kinh tế kỳ vọng sau khi có công nghệ/ thiết bị */}
                          <div>
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              8. Mục tiêu kỹ thuật và kinh tế kỳ vọng sau khi có công nghệ/ thiết bị
                            </label>
                            <input
                              type="text"
                              value={item.expectedGoal}
                              onChange={e => handleUpdateDemandItem(item.id, 'expectedGoal', e.target.value)}
                              placeholder="Ví dụ: Giảm tỷ lệ phế phẩm đúc từ 7.5% xuống dưới 1.2%, tiết kiệm 800 triệu/năm..."
                              className="form-control w-full text-xs font-medium"
                            />
                          </div>

                          {/* Hàng 2 trường: 9. Cần chuyên gia tư vấn & 10. Loại hình tiếp nhận */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                            {/* 9. Cần chuyên gia tư vấn */}
                            <div>
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                9. Cần chuyên gia tư vấn
                              </label>
                              <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition h-11">
                                <input
                                  type="checkbox"
                                  checked={item.needConsulting}
                                  onChange={e => handleUpdateDemandItem(item.id, 'needConsulting', e.target.checked)}
                                  className="w-4 h-4 rounded accent-brand-700 cursor-pointer"
                                />
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                  Có nhu cầu tư vấn 1-1 từ chuyên gia
                                </span>
                              </label>
                            </div>

                            {/* 10. Loại hình tiếp nhận */}
                            <div>
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                10. Loại hình tiếp nhận
                              </label>
                              <SearchableCombobox
                                value={item.demandTypeCode}
                                onChange={(val) => handleUpdateDemandItem(item.id, 'demandTypeCode', val)}
                                ariaLabel="10. Loại hình tiếp nhận"
                                searchPlaceholder="Tìm loại hình tiếp nhận..."
                                options={DEMAND_TYPE_OPTIONS.map(dt => ({
                                  value: dt.code,
                                  code: dt.code,
                                  label: dt.name
                                }))}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Cột phải: 2. Chỉ Số Nhu Cầu Đổi Mới (TNI) */}
                        <div className="lg:col-span-6 space-y-4">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                                <Wrench className="w-4 h-4" />
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                2. Chỉ Số Nhu Cầu Đổi Mới (TNI)
                              </h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsTniModalOpen(true)}
                              className="inline-flex items-center gap-1 text-xs text-rose-700 dark:text-rose-400 hover:text-rose-800 font-bold bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 px-2.5 py-1 rounded-full transition"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              Cơ sở khoa học (304 DN)
                            </button>
                          </div>

                          <TniRealtimeCalculator
                            values={{
                              urgency: item.urgency || 3,
                              impact: item.impact || 3,
                              investment: item.investment || 3,
                              readiness: item.readiness || 3
                            }}
                            onChange={(newVals) => handleUpdateDemandItemTni(item.id, newVals)}
                            compact={false}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* E.2: NGUỒN VỐN & HÌNH THỨC TIẾP NHẬN */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                    BƯỚC 1.2 • NGUỒN VỐN & HÌNH THỨC (TÙY CHỌN)
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
            </section>
          )}

          {/* =========================================================================
              BƯỚC 2: PHẦN A — THÔNG TIN DOANH NGHIỆP (BẮT BUỘC)
             ========================================================================= */}
          {currentStep === 2 && (
            <section className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                    BƯỚC 2 • THÔNG TIN CHUNG
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Thông Tin Doanh Nghiệp & Quy Mô Sản Xuất
                  </h2>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> PDPD Bảo Mật
                </span>
              </div>

              {isPrefilledFromSession && (
                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wide">
                      Tự động đồng bộ hồ sơ Doanh nghiệp đã đăng ký
                    </h4>
                    <p className="text-xs text-teal-700 dark:text-teal-300 mt-0.5">
                      Hệ thống đã tự động nhận diện và điền sẵn các thông tin hồ sơ của doanh nghiệp bạn. Quý DN có thể kiểm tra nhanh hoặc bấm &quot;Bỏ qua bước tùy chọn &amp; Đến nộp phiếu&quot; để hoàn tất.
                    </p>
                  </div>
                </div>
              )}

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
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={taxCode}
                      onChange={e => setTaxCode(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleLookupTaxCode();
                        }
                      }}
                      placeholder="Ví dụ: 0108992134"
                      className="form-control flex-1 px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleLookupTaxCode}
                      disabled={isLookingUpTax || !taxCode.trim()}
                      className="px-3 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-cyan-300 dark:hover:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-xl transition shadow-sm disabled:opacity-50"
                      title="Tự động tra cứu Tên DN, Tỉnh thành và Địa chỉ theo MST"
                    >
                      {isLookingUpTax ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5" />
                      )}
                      Tra cứu MST
                    </button>
                  </div>
                  <p className="text-caption text-slate-500 dark:text-slate-400 mt-1">
                    Nhập MST và bấm Tra cứu để tự động nạp Tên DN, Tỉnh thành và Địa chỉ.
                  </p>
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
                    <option value="">-- Chọn Tỉnh / Thành phố --</option>
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
                    <option value="">-- Chọn chức vụ đại diện --</option>
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
                    <option value="">-- Chọn loại hình doanh nghiệp --</option>
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
                    <option value="">-- Chọn lĩnh vực sản xuất chính --</option>
                    {SECTORS_18_CATALOG.filter(s => s.code !== 'ALL').map(sec => (
                      <option key={sec.code} value={sec.code}>
                        {sec.name}
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
                    <option value="">-- Chọn quy mô lao động --</option>
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
                    <option value="">-- Chọn khoảng doanh thu --</option>
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
              BƯỚC 3: THÔNG TIN BỔ SUNG (TÙY CHỌN — HỢP NHẤT PHÂN MỤC B, C, D, F)
             ========================================================================= */}
          {currentStep === 3 && (
            <section className="space-y-6">
              {/* UNIFIED SUPPLEMENTARY CONTAINER BANNER */}
              <div className="surface-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-emerald-50/30 dark:from-slate-900 dark:to-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                    PHẦN BỔ SUNG (BƯỚC 3/4) • TÙY CHỌN MỞ RỘNG
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Thông Tin Bổ Sung: Hiện Trạng Dây Chuyền, Điểm Nghẽn &amp; Năng Lực TAR
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                    Các phân mục B, C, D, F dưới đây là <strong>tùy chọn</strong>. Quý doanh nghiệp có thể điền chi tiết để hệ thống phân tích sâu hơn hoặc bỏ qua và chuyển thẳng sang Bước 4 để nộp phiếu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(4);
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className="border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-cyan-400 bg-white dark:bg-slate-800 hover:bg-brand-50 px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 self-start sm:self-center shrink-0 shadow-sm cursor-pointer"
                >
                  Bỏ qua bước tùy chọn &amp; Đến nộp phiếu ⏩
                </button>
              </div>

              {/* CARD 1 — PHÂN MỤC B: HIỆN TRẠNG MÁY MÓC THIẾT BỊ & 8 TIÊU CHÍ */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-3 py-1 rounded-full border border-sky-400/30">
                      Phân mục B (Tùy chọn)
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2">
                      Hiện trạng dây chuyền, máy móc thiết bị chủ lực &amp; Tự đánh giá 8 tiêu chí
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEquipment}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 self-start shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Thêm máy móc / dây chuyền
                  </button>
                </div>

                {/* B.1: Danh mục thiết bị & Dây chuyền sản xuất chủ lực */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Danh Mục Thiết Bị &amp; Dây Chuyền Sản Xuất Chủ Lực
                  </h4>
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
                            Công đoạn sản xuất
                          </label>
                          <input
                            type="text"
                            value={eq.stageName}
                            onChange={e => handleUpdateEquipment(eq.id, 'stageName', e.target.value)}
                            placeholder="Ví dụ: Đúc phôi, Tiện CNC, Sơn tĩnh điện..."
                            className="form-control w-full px-3 py-1.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                            Tên thiết bị / máy móc chủ lực
                          </label>
                          <input
                            type="text"
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
                            <option value="">-- Chọn xuất xứ --</option>
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
                            <option value="">-- Chọn tình trạng khấu hao --</option>
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

                {/* B.2: TỰ ĐÁNH GIÁ 8 TIÊU CHÍ HIỆN TRẠNG */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Đánh Giá Hiện Trạng Trình Độ Công Nghệ (Thang 1–5)
                    </h4>
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
              </div>

              {/* CARD 2 — PHÂN MỤC C: NHẬN DIỆN ĐIỂM NGHẼN KỸ THUẬT */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-400/30">
                      Phân mục C (Tùy chọn)
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2">
                      Điểm nghẽn công nghệ &amp; Khâu sản xuất nan giải nhất
                    </h3>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mt-1">
                      Nhận Diện Điểm Nghẽn Kỹ Thuật (Chọn tối đa 5 điểm)
                    </h4>
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
                                      bottleneckSeverity[item] === lvl
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
                      Công đoạn sản xuất gây khó khăn lớn nhất (Tùy chọn)
                    </label>
                    <input
                      type="text"
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
              </div>

              {/* CARD 3 — PHÂN MỤC D: NĂNG LỰC TIẾP NHẬN (TAR) & ĐỘI NGŨ NHÂN LỰC */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full border border-teal-400/30">
                    Phân mục D (Tùy chọn)
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2">
                    Năng lực hấp thụ công nghệ &amp; Thống kê nhân lực kỹ thuật
                  </h3>
                </div>

                {/* D.1: CƠ CẤU NHÂN LỰC KỸ THUẬT */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Thống Kê Đội Ngũ Nhân Lực Kỹ Thuật
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Kỹ thuật viên / Thợ giỏi
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={techPersonnel.technicians === 0 ? '' : techPersonnel.technicians}
                        placeholder="0"
                        onChange={e => setTechPersonnel({
                          ...techPersonnel,
                          technicians: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0)
                        })}
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
                        value={techPersonnel.engineers === 0 ? '' : techPersonnel.engineers}
                        placeholder="0"
                        onChange={e => setTechPersonnel({
                          ...techPersonnel,
                          engineers: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0)
                        })}
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
                        value={techPersonnel.it === 0 ? '' : techPersonnel.it}
                        placeholder="0"
                        onChange={e => setTechPersonnel({
                          ...techPersonnel,
                          it: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0)
                        })}
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
                        value={techPersonnel.automation === 0 ? '' : techPersonnel.automation}
                        placeholder="0"
                        onChange={e => setTechPersonnel({
                          ...techPersonnel,
                          automation: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0)
                        })}
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
                        value={techPersonnel.rd === 0 ? '' : techPersonnel.rd}
                        placeholder="0"
                        onChange={e => setTechPersonnel({
                          ...techPersonnel,
                          rd: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0)
                        })}
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
                        value={techPersonnel.quality === 0 ? '' : techPersonnel.quality}
                        placeholder="0"
                        onChange={e => setTechPersonnel({
                          ...techPersonnel,
                          quality: e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0)
                        })}
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
                      placeholder="Ví dụ: Kỹ sư cơ điện kiêm nhiệm bảo trì hệ thống PLC..."
                      onChange={e => setTechPersonnel({ ...techPersonnel, notes: e.target.value })}
                      className="form-control w-full px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>

                {/* D.2: CƠ CHẾ QUẢN LÝ CÔNG NGHỆ HIỆN CÓ */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Cơ Chế Quản Lý &amp; Đổi Mới Công Nghệ Hiện Có Tại Doanh Nghiệp
                    </h4>
                    <p className="text-slate-500 text-xs mt-1">
                      Đánh giá các hoạt động quản trị, quy trình và hợp tác công nghệ tại đơn vị.
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {MANAGEMENT_7_LIST.map((item, idx) => {
                      const status = managementStatus[idx];
                      return (
                        <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 sm:max-w-md">
                            {idx + 1}. {item}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setManagementStatus({ ...managementStatus, [idx]: true })}
                              className={`px-3 py-1 rounded-xl font-bold transition border ${
                                status === true
                                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                              }`}
                            >
                              Có
                            </button>
                            <button
                              type="button"
                              onClick={() => setManagementStatus({ ...managementStatus, [idx]: false })}
                              className={`px-3 py-1 rounded-xl font-bold transition border ${
                                status === false
                                  ? 'bg-slate-700 text-white border-slate-800 shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-500'
                              }`}
                            >
                              Không
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* D.3: 9 TIÊU CHÍ NĂNG LỰC HẤP THỤ */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                      PHẦN D.3 • NĂNG LỰC HẤP THỤ CÔNG NGHỆ (TAR)
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mt-1">
                      Đánh Giá Khả Năng Tiếp Nhận &amp; Làm Chủ Công Nghệ Mới (Thang 1–5)
                    </h4>
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
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-500'
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
              </div>

              {/* CARD 4 — PHÂN MỤC F: ĐỊNH HƯỚNG CÔNG NGHỆ & NHU CẦU HỖ TRỢ */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-400/30">
                    Phân mục F (Tùy chọn)
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2">
                    Định hướng công nghệ giai đoạn 2026–2028 &amp; Đề xuất hỗ trợ từ Nhà nước
                  </h3>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mt-1">
                    Nhu Cầu Tiếp Cận Công Nghệ Tiên Tiến Trong 3 Năm Tới
                  </h4>
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
                      3. Công nghệ xanh &amp; Tuần hoàn
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
                                  supportRatings[sup.id] === score
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
              BƯỚC 4: PHẦN G — RÀ SOÁT, XÁC NHẬN & PDPD (BẮT BUỘC)
             ========================================================================= */}
          {currentStep === 4 && (
            <section className="space-y-6">
              {/* SUMMARY REVIEW CARD */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-brand-700 dark:text-cyan-400">
                      BƯỚC 4 • RÀ SOÁT TỔNG THỂ
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
                      placeholder="Chức vụ người ký"
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

                {/* KHUNG KÝ TAY CẢM ỨNG ĐIỆN TỬ (BR-SIG-01 / REQ-SIG-01) */}
                <div className="pt-2">
                  <TouchSignatureField
                    id="signature-trigger-box"
                    value={signatureData}
                    onChange={(val) => {
                      setSignatureData(val);
                      if (val) setSignatureError('');
                    }}
                    errorMessage={signatureError}
                    required
                    label="Chữ ký điện tử của người đại diện xác nhận"
                  />
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
                      <strong>Cam kết bảo vệ dữ liệu cá nhân &amp; xác thực thông tin:</strong> Tôi đã rà soát toàn bộ thông tin do doanh nghiệp cung cấp. Việc sử dụng dữ liệu sẽ tuân thủ thông báo mục đích, phạm vi và quyền truy cập theo Nghị định 13/2023/NĐ-CP (PDPD). Các thông tin liên hệ và ngân sách chi tiết sẽ được bảo mật, chỉ mở theo cơ chế kết nối có kiểm soát của Sở KH&CN.
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

              {currentStep >= 2 && currentStep < 4 && (
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 2) {
                      if (!validateStep(2)) return;
                    }
                    setCurrentStep(4);
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className="inline-flex border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-cyan-400 bg-brand-50/50 dark:bg-brand-950/30 hover:bg-brand-100/50 px-4 py-2.5 rounded-xl font-bold text-xs transition items-center gap-1.5 cursor-pointer"
                  title="Bỏ qua các bước tùy chọn và chuyển thẳng sang Bước 4 để ký & nộp"
                >
                  Bỏ qua bước tùy chọn & Đến nộp phiếu ⏩
                </button>
              )}

              {currentStep < 4 && (
                <button
                  key="btn-next"
                  type="button"
                  onClick={handleNextStep}
                  className="bg-brand-700 hover:bg-brand-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  Tiếp tục Bước {currentStep + 1} <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {currentStep === 4 && (
                <button
                  key="btn-submit"
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

        {/* MODAL XÁC NHẬN ĐỒNG BỘ NGƯỢC HỒ SƠ DOANH NGHIỆP (BR-03-006) */}
        {showSyncModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Xác Nhận Đồng Bộ Ngược Hồ Sơ (BR-03-006)
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Hệ thống phát hiện bạn đã chỉnh sửa thông tin doanh nghiệp ở Bước 2 so với hồ sơ đăng ký ban đầu. 
                Bạn có muốn cập nhật đồng bộ các thông tin này vào Hồ sơ Doanh nghiệp chính (SSOT) của bạn không?
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div><strong>Tên DN:</strong> {companyName}</div>
                <div><strong>Địa chỉ:</strong> {address}, {province}</div>
                <div><strong>Người liên hệ:</strong> {contactName} ({contactPhone} - {contactEmail})</div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleConfirmSync(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Chỉ dùng cho khảo sát này
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmSync(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/20 transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Đồng bộ & Hoàn tất
                </button>
              </div>
            </div>
          </div>
        )}

        <TniMethodologyModal
          isOpen={isTniModalOpen}
          onClose={() => setIsTniModalOpen(false)}
        />
      </main>
    </div>
  );
}
