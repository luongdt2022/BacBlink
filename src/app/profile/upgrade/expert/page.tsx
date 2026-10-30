"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { AppButton } from "@/components/ui/design-system";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { API_BASE } from "@/lib/api-client";
import { getActiveSectors, SectorOption } from "@/lib/master-data-client";
import { Async, UXState } from "@/components/ui/async";
import {
  GraduationCap,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Building,
  ShieldCheck,
  Plus,
  Trash2,
  Clock,
  Send,
  HelpCircle,
} from "lucide-react";

interface Publication {
  title: string;
  year: number;
  journalOrConference: string;
  doiOrUrl?: string;
}

interface Patent {
  title: string;
  patentNumber?: string;
  year: number;
  status: string;
}

const SAMPLE_CV_TEXT = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc

LÝ LỊCH KHOA HỌC CỦA CHUYÊN GIA KH&CN
(Kèm theo Thông tư số 17/2021/TT-BKHCN)

I. THÔNG TIN CHUNG
1. Họ và tên: Nguyễn Văn Đức
2. Email liên hệ: duc.nv@nacentech.vn
3. Số điện thoại: 0912888999
4. Năm sinh: 1980
5. Giới tính: Nam
6. Học hàm, học vị: Tiến sĩ (TS)
   Năm đạt học vị: 2015
5. Chức danh nghiên cứu / Chức vụ hiện tại: Trưởng phòng R&D, Nghiên cứu viên cao cấp
6. Cơ quan công tác chính: Viện Ứng dụng Công nghệ NacenTech
7. Địa chỉ cơ quan: 25 Lê Thánh Tông, Hoàn Kiếm, Hà Nội
8. Số năm kinh nghiệm nghiên cứu, chuyển giao: 16 năm
9. Định danh khoa học:
   - Google Scholar: https://scholar.google.com/citations?user=nacentech_duc
   - ORCID: 0000-0002-1823-9214
   - Scopus ID: 57219842100

II. NĂNG LỰC CHUYÊN MÔN VÀ HOẠT ĐỘNG KH&CN
1. Lĩnh vực chuyên môn chính: Khoa học – công nghệ – đổi mới sáng tạo (LV17)
2. Từ khóa chuyên sâu: Trí tuệ nhân tạo, Vật liệu bán dẫn, Quang điện tử, IoT công nghiệp
3. Tóm tắt tiểu sử và năng lực thế mạnh:
   Chuyên gia cao cấp có 16 năm kinh nghiệm trong lĩnh vực quang điện tử và vật liệu bán dẫn. Đã chủ trì và tham gia nhiều đề tài cấp Quốc gia, chuyển giao hơn 10 giải pháp công nghệ cho các doanh nghiệp sản xuất trong và ngoài nước.

III. CÔNG BỐ KHOA HỌC TIÊU BIỂU VÀ SÁNG CHẾ
1. Công bố khoa học tiêu biểu:
   - "Advanced Nano Semiconductor Materials for Smart IoT Sensors", Tạp chí Khoa học & Công nghệ Việt Nam, Năm 2024, DOI: 10.1234/nano.semicon.2024
   - "Deep Learning Applications in Industrial Quality Control", Kỷ yếu Hội nghị Quốc gia VAST, Năm 2023, DOI: 10.5678/qc.dl.2023
2. Bằng sáng chế và Giải pháp hữu ích:
   - "Hệ thống cảm biến quang điện tử đo độ ẩm nano nhúng", Số bằng: VN-1-002891, Năm cấp: 2023, Tình trạng: GRANTED
   - "Mô-đun AI xử lý ảnh công nghiệp thời gian thực", Số bằng: VN-2-001245, Năm cấp: 2022, Tình trạng: GRANTED`;

function ExpertUpgradeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftToken = searchParams?.get("draftToken");
  const [isDraftPrefilled, setIsDraftPrefilled] = useState(false);
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());

  const renderAiBadge = (fieldName: string) => {
    if (!aiFilledFields.has(fieldName)) return null;
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 ml-1.5">
        ✨ AI Bóc tách
      </span>
    );
  };

  // Authentication & UX States
  const [uxState, setUxState] = useState<UXState>("empty");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null);

  // Wizard Step (1, 2, 3)
  const [currentStep, setCurrentStep] = useState(1);
  const [fullNameError, setFullNameError] = useState("");
  const [birthYearError, setBirthYearError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [pubYearError, setPubYearError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleStep1Next = () => {
    let hasError = false;

    // 1. Validate & Sanitize Họ và tên (XSS protection)
    const cleanedName = fullName.replace(/[<>]/g, "").trim();
    if (!cleanedName) {
      setFullNameError("Vui lòng nhập họ và tên đầy đủ.");
      hasError = true;
    } else {
      setFullName(cleanedName);
      setFullNameError("");
    }

    // 2. Validate Năm sinh (1940 đến năm hiện tại)
    const currentYear = new Date().getFullYear();
    const bYear = Number(birthYear);
    if (!birthYear || isNaN(bYear) || bYear < 1940 || bYear > currentYear) {
      setBirthYearError(`Năm sinh không hợp lệ (phải từ 1940 đến ${currentYear}).`);
      hasError = true;
    } else {
      setBirthYearError("");
    }

    // 3. Validate Số điện thoại (10 chữ số chuẩn VN)
    const phoneClean = phone.trim();
    const phoneRegex = /^(0|84)(3|5|7|8|9)[0-9]{8}$/;
    if (phoneClean && !phoneRegex.test(phoneClean)) {
      setPhoneError("Số điện thoại không hợp lệ (phải gồm 10 chữ số chuẩn di động Việt Nam, ví dụ: 0912345678).");
      hasError = true;
    } else {
      setPhoneError("");
    }

    if (hasError) return;
    setCurrentStep(2);
  };

  const handleGoToStep = (step: number) => {
    if (step > 1 && !fullName.trim()) {
      setFullNameError("Vui lòng nhập họ và tên đầy đủ.");
      setCurrentStep(1);
      return;
    }
    setFullNameError("");
    setCurrentStep(step);
  };

  // Step 1: Identity & Degrees
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthYear, setBirthYear] = useState(1985);
  const [gender, setGender] = useState("male");
  const [degreeYear, setDegreeYear] = useState(new Date().getFullYear());
  const [academicDegree, setAcademicDegree] = useState("TS");
  const [primaryInstitution, setPrimaryInstitution] = useState("");
  const [workAddress, setWorkAddress] = useState("");
  const [receivingUnit, setReceivingUnit] = useState("HP");
  const [receivingScopeType, setReceivingScopeType] = useState("PROVINCE");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [googleScholarUrl, setGoogleScholarUrl] = useState("");
  const [orcidId, setOrcidId] = useState("");
  const [scopusAuthorId, setScopusAuthorId] = useState("");

  // Step 2: Competency & AI Scan
  const [primaryDomain, setPrimaryDomain] = useState("");
  const [sectorOptions, setSectorOptions] = useState<SectorOption[]>([]);
  const [sectorLoadError, setSectorLoadError] = useState(false);
  const [sectorLoading, setSectorLoading] = useState(true);
  const [specializedKeywords, setSpecializedKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState(5);
  const [bioSummary, setBioSummary] = useState("");
  const [aiParsing, setAiParsing] = useState(false);

  const loadSectors = async () => {
    setSectorLoading(true);
    setSectorLoadError(false);
    try { setSectorOptions(await getActiveSectors()); }
    catch { setSectorLoadError(true); }
    finally { setSectorLoading(false); }
  };
  useEffect(() => { void loadSectors(); }, []);

  // CV Upload & AI Parse states
  const [cvFile, setCvFile] = useState<{ name: string; size: string; rawFile?: File; sampleText?: string } | null>(null);
  const [scanModelUsed, setScanModelUsed] = useState<string>("");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusMessage, setScanStatusMessage] = useState("");
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Scientific Portfolio & Undertaking
  const [publications, setPublications] = useState<Publication[]>([]);
  const [newPubTitle, setNewPubTitle] = useState("");
  const [newPubYear, setNewPubYear] = useState(2025);
  const [newPubJournal, setNewPubJournal] = useState("");
  const [newPubDoi, setNewPubDoi] = useState("");

  const [patents, setPatents] = useState<Patent[]>([]);
  const [newPatentTitle, setNewPatentTitle] = useState("");
  const [newPatentNumber, setNewPatentNumber] = useState("");
  const [newPatentYear, setNewPatentYear] = useState(2024);

  const [consultationFeeRange, setConsultationFeeRange] = useState("Thỏa thuận");
  const [preferredConsultationMode, setPreferredConsultationMode] = useState("HYBRID");
  const [pdpdConsentAcknowledged, setPdpdConsentAcknowledged] = useState(false);
  const [legalOathAcknowledged, setLegalOathAcknowledged] = useState(false);

  // Check auth and current profile status on mount
  useEffect(() => {
    const user = authClient.getUser();
    if (!user) {
      // Allow testing demo mode or prompt login
      return;
    }

    if (user.fullName && !fullName) {
      setFullName(user.fullName);
    }
    if (user.email && !email) {
      setEmail(user.email);
    }
    const userPhone = user.phone || user.phoneNumber;
    if (userPhone && !phone) {
      setPhone(userPhone);
    }

    // Fetch existing profile if available
    const fetchStatus = async () => {
      setUxState("loading");
      try {
        const res = await fetch(`${API_BASE}/api/v1/experts/my-profile`, {
          headers: authClient.getAuthHeaders(),
        });

        if (res.status === 404) {
          // No profile yet, show empty wizard
          setUxState("empty");
        } else if (res.ok) {
          const json = await res.json();
          const data = json.data ?? json;
          setExistingProfile(data);

          // Populate wizard form fields so edit mode has all data!
          if (data.fullName) setFullName(data.fullName);
          if (data.phone) setPhone(data.phone);
          if (data.email) setEmail(data.email);
          if (data.birthYear) setBirthYear(Number(data.birthYear));
          if (data.gender) {
            const g = String(data.gender).toLowerCase();
            if (g.includes("nam")) setGender("male");
            else if (g.includes("nữ") || g.includes("nu")) setGender("female");
            else setGender("other");
          }
          if (data.academicDegree) setAcademicDegree(data.academicDegree);
          if (data.degreeYear) setDegreeYear(Number(data.degreeYear));
          if (data.primaryInstitution) setPrimaryInstitution(data.primaryInstitution);
          if (data.workAddress) setWorkAddress(data.workAddress);
          if (data.professionalTitle) setProfessionalTitle(data.professionalTitle);
          if (data.googleScholarUrl) setGoogleScholarUrl(data.googleScholarUrl);
          if (data.orcidId) setOrcidId(data.orcidId);
          if (data.scopusAuthorId) setScopusAuthorId(data.scopusAuthorId);
          if (data.primaryDomain) setPrimaryDomain(data.primaryDomain);
          if (Array.isArray(data.specializedKeywords)) {
            setSpecializedKeywords(data.specializedKeywords);
          } else if (typeof data.specializedKeywords === "string") {
            try {
              const kws = JSON.parse(data.specializedKeywords);
              if (Array.isArray(kws)) setSpecializedKeywords(kws);
            } catch {}
          }
          if (data.yearsOfExperience) setYearsOfExperience(Number(data.yearsOfExperience));
          if (data.bioSummary || data.consultingSummary) setBioSummary(data.bioSummary || data.consultingSummary);
          if (data.publicationsJson) {
            try {
              const pubs = JSON.parse(data.publicationsJson);
              if (Array.isArray(pubs)) setPublications(pubs);
            } catch {}
          } else if (Array.isArray(data.publications)) {
            setPublications(data.publications);
          }
          if (data.patentsJson) {
            try {
              const pats = JSON.parse(data.patentsJson);
              if (Array.isArray(pats)) setPatents(pats);
            } catch {}
          } else if (Array.isArray(data.patents)) {
            setPatents(data.patents);
          }
          if (data.scopeId) setReceivingUnit(data.scopeId);
          if (data.scopeType) setReceivingScopeType(data.scopeType);

          const isEditParam = searchParams?.get("edit") === "true";
          if (isEditParam) {
            setUxState("empty");
          } else if (data.status === "APPROVED") {
            setUxState("success");
          } else if (data.status === "PENDING_APPROVAL" || data.status === "PENDING_REVIEW") {
            setUxState("success");
          } else if (data.status === "CHANGES_REQUESTED") {
            setUxState("partial");
          } else {
            setUxState("empty");
          }
        } else {
          setUxState("empty");
        }
      } catch (err) {
        setUxState("empty");
      }
    };

    fetchStatus();
  }, []);

  // Handle Zalo draftToken handoff prefill (BR-EXP-009, US-06)
  useEffect(() => {
    if (!draftToken) return;

    const resolveDraftToken = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/experts/draft?token=${encodeURIComponent(draftToken)}`);
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          if (data.fullName) setFullName(data.fullName);
          if (data.phone) setPhone(data.phone);
          if (data.email) setEmail(data.email);
          if (data.academicDegree || data.degree) {
            const degree = data.academicDegree || data.degree;
            setAcademicDegree(({ DOCTOR: "TS", MASTER: "ThS", ENGINEER_BACHELOR: "KySu" } as Record<string, string>)[degree] || degree);
          }
          if (data.primaryInstitution || data.organization) setPrimaryInstitution(data.primaryInstitution || data.organization);
          if (data.primaryDomain || data.sectorCode) setPrimaryDomain(data.primaryDomain || data.sectorCode);
          if (Array.isArray(data.specializedKeywords)) setSpecializedKeywords(data.specializedKeywords);
          setIsDraftPrefilled(true);
          return;
        }
        setErrorMessage("Không tải được hồ sơ sơ bộ. Vui lòng kiểm tra liên kết hoặc nhập hồ sơ của bạn.");
      } catch {
        setErrorMessage("Không kết nối được dịch vụ hồ sơ sơ bộ. Vui lòng thử lại.");
      }
    };

    resolveDraftToken();
  }, [draftToken]);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !specializedKeywords.includes(keywordInput.trim())) {
      setSpecializedKeywords([...specializedKeywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (tag: string) => {
    setSpecializedKeywords(specializedKeywords.filter((k) => k !== tag));
  };

  const handleAddPublication = () => {
    if (Number(newPubYear) > 2026) {
      setPubYearError("Năm công bố không được lớn hơn năm 2026.");
      return;
    }
    if (newPubTitle.trim() && newPubJournal.trim()) {
      setPubYearError("");
      setPublications([
        ...publications,
        {
          title: newPubTitle.trim(),
          year: Number(newPubYear),
          journalOrConference: newPubJournal.trim(),
          doiOrUrl: newPubDoi.trim() || undefined,
        },
      ]);
      setNewPubTitle("");
      setNewPubJournal("");
      setNewPubDoi("");
    }
  };

  const handleRemovePublication = (idx: number) => {
    setPublications(publications.filter((_, i) => i !== idx));
  };

  const handleAddPatent = () => {
    if (newPatentTitle.trim()) {
      setPatents([
        ...patents,
        {
          title: newPatentTitle.trim(),
          patentNumber: newPatentNumber.trim() || undefined,
          year: Number(newPatentYear),
          status: "GRANTED",
        },
      ]);
      setNewPatentTitle("");
      setNewPatentNumber("");
    }
  };

  const handleRemovePatent = (idx: number) => {
    setPatents(patents.filter((_, i) => i !== idx));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setCvFile({ name: file.name, size: `${sizeMB} MB`, rawFile: file });
      setScanSuccess(false);
      setScanProgress(0);
      setScanModelUsed("");
    }
  };

  const handleUseSampleCv = () => {
    setCvFile({
      name: "Ly_Lich_Khoa_Hoc_TS_NguyenVanDuc.pdf",
      size: "2.4 MB",
      sampleText: SAMPLE_CV_TEXT,
    });
    setScanSuccess(false);
    setScanProgress(0);
    setScanModelUsed("");
  };

  const handleRemoveCvFile = () => {
    setCvFile(null);
    setScanSuccess(false);
    setScanProgress(0);
    setScanModelUsed("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAiCvScan = async () => {
    setAiParsing(true);
    setScanSuccess(false);
    setScanProgress(20);
    setScanStatusMessage("Đang chuẩn bị tệp và xác thực bảo mật chuẩn PDPD...");

    if (!cvFile?.rawFile && !cvFile?.sampleText) {
      setScanStatusMessage("Vui lòng tải lên tệp CV hoặc chọn tệp mẫu để phân tích.");
      setAiParsing(false);
      return;
    }

    try {
      setScanProgress(35);
      setScanStatusMessage(`Đang tải tệp "${cvFile.name}" lên cổng bóc tách Google Gemini API...`);

      let reqBody: Record<string, unknown>;
      if (cvFile.rawFile) {
        // Đọc file thành chuỗi Base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const res = reader.result as string;
            const base64Data = res.split(",")[1] || res;
            resolve(base64Data);
          };
          reader.onerror = (err) => reject(err);
        });
        reader.readAsDataURL(cvFile.rawFile);
        const base64Data = await base64Promise;
        reqBody = {
          fileBase64: base64Data,
          mimeType: cvFile.rawFile.type || "application/pdf",
          fileName: cvFile.rawFile.name,
        };
      } else {
        reqBody = {
          textContent: cvFile.sampleText,
          fileName: cvFile.name,
        };
      }

      setScanProgress(60);
      setScanStatusMessage("Google Gemini AI đang bóc tách 94 trường theo chuẩn Thông tư 17/2021...");

      const response = await fetch("/api/cv-parser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || "Không nhận được dữ liệu cấu trúc từ Gemini.");
      }

      const d = result.data;
      setScanProgress(85);
      setScanStatusMessage("Đang đối soát và tự động điền các trường hồ sơ...");

      // Non-destructive Auto-fill: Điền trước vào các trường và đánh dấu trạng thái AI Pre-fill
      const newlyFilled = new Set(aiFilledFields);

      // 1. Họ và tên: điền nếu trường chưa có hoặc mang giá trị mặc định
      if (d.fullName && (!fullName.trim() || fullName === "Chuyên gia NacenTech")) {
        setFullName(d.fullName);
        newlyFilled.add("fullName");
      }

      // 1b. Email: nếu CV bóc tách được email -> điền email và đánh dấu AI; nếu không có -> fallback từ User context
      const currentUser = authClient.getUser();
      if (d.email && typeof d.email === "string" && d.email.trim()) {
        setEmail(d.email.trim());
        newlyFilled.add("email");
      } else if (!email.trim() && currentUser?.email) {
        setEmail(currentUser.email);
      }

      // 1c. Số điện thoại: nếu CV bóc tách được SĐT -> điền phone và đánh dấu AI; nếu không có -> fallback từ User context
      const currentUserPhone = currentUser?.phone || currentUser?.phoneNumber;
      if (d.phone && typeof d.phone === "string" && d.phone.trim()) {
        setPhone(d.phone.trim());
        newlyFilled.add("phone");
      } else if (!phone.trim() && currentUserPhone) {
        setPhone(currentUserPhone);
      }

      // 2. Năm sinh
      if (d.birthYear) {
        setBirthYear(Number(d.birthYear));
        newlyFilled.add("birthYear");
      }
      // 3. Giới tính
      if (d.gender) {
        const g = String(d.gender).toLowerCase();
        if (g.includes("nam")) setGender("male");
        else if (g.includes("nữ") || g.includes("nu")) setGender("female");
        else setGender("other");
        newlyFilled.add("gender");
      }
      // 4. Học vị / Học hàm
      if (d.academicDegree) {
        const deg = String(d.academicDegree).toUpperCase();
        if (deg.includes("GS") && !deg.includes("PGS")) setAcademicDegree("GS");
        else if (deg.includes("PGS")) setAcademicDegree("PGS");
        else if (deg.includes("TS") || deg.includes("TIẾN SĨ")) setAcademicDegree("TS");
        else if (deg.includes("THS") || deg.includes("THẠC SĨ")) setAcademicDegree("ThS");
        else if (deg.includes("KS") || deg.includes("KỸ SƯ") || deg.includes("KYSU")) setAcademicDegree("KySu");
        else setAcademicDegree("Cử nhân");
        newlyFilled.add("academicDegree");
      }
      // 5. Cơ quan công tác
      if (d.primaryInstitution && !primaryInstitution.trim()) {
        setPrimaryInstitution(d.primaryInstitution);
        newlyFilled.add("primaryInstitution");
      }
      // 6. Địa chỉ cơ quan
      if (d.workAddress && !workAddress.trim()) {
        setWorkAddress(d.workAddress);
        newlyFilled.add("workAddress");
      }
      // 7. Chức vụ chuyên môn
      if (d.professionalTitle && !professionalTitle.trim()) {
        setProfessionalTitle(d.professionalTitle);
        newlyFilled.add("professionalTitle");
      }
      // 8. Định danh nghiên cứu quốc tế
      if (d.googleScholarUrl && !googleScholarUrl.trim()) {
        setGoogleScholarUrl(d.googleScholarUrl);
        newlyFilled.add("googleScholarUrl");
      }
      if (d.orcidId && !orcidId.trim()) {
        setOrcidId(d.orcidId);
        newlyFilled.add("orcidId");
      }
      if (d.scopusAuthorId && !scopusAuthorId.trim()) {
        setScopusAuthorId(d.scopusAuthorId);
        newlyFilled.add("scopusAuthorId");
      }

      // 9. Lĩnh vực trụ cột (Bước 2)
      if (d.primaryDomain && !primaryDomain) {
        setPrimaryDomain(d.primaryDomain);
        newlyFilled.add("primaryDomain");
      }
      // 10. Từ khóa chuyên sâu (Bước 2)
      if (d.specializedKeywords && Array.isArray(d.specializedKeywords) && d.specializedKeywords.length > 0) {
        if (specializedKeywords.length === 0) {
          setSpecializedKeywords(d.specializedKeywords);
          newlyFilled.add("specializedKeywords");
        }
      }
      // 11. Số năm kinh nghiệm (Bước 2)
      if (d.yearsOfExperience) {
        setYearsOfExperience(Number(d.yearsOfExperience));
        newlyFilled.add("yearsOfExperience");
      }
      // 12. Bio summary (Bước 2)
      if (d.bioSummary && !bioSummary.trim()) {
        setBioSummary(d.bioSummary);
        newlyFilled.add("bioSummary");
      }

      // 13. Công bố khoa học (Bước 3)
      if (d.publications && Array.isArray(d.publications) && d.publications.length > 0) {
        if (publications.length === 0) {
          setPublications(
            d.publications.slice(0, 5).map((p: { title?: string; year?: number; journalOrConference?: string; doiOrUrl?: string }) => ({
              title: p.title || "Công trình khoa học",
              year: Number(p.year) || 2024,
              journalOrConference: p.journalOrConference || "Tạp chí KH&CN",
              doiOrUrl: p.doiOrUrl || undefined,
            }))
          );
          newlyFilled.add("publications");
        }
      }

      // 14. Bằng độc quyền sáng chế / GPHI (Bước 3)
      if (d.patents && Array.isArray(d.patents) && d.patents.length > 0) {
        if (patents.length === 0) {
          setPatents(
            d.patents.map((p: { title?: string; patentNumber?: string; year?: number; status?: string }) => ({
              title: p.title || "Bằng sáng chế",
              patentNumber: p.patentNumber || undefined,
              year: Number(p.year) || 2023,
              status: p.status || "GRANTED",
            }))
          );
          newlyFilled.add("patents");
        }
      }

      setAiFilledFields(newlyFilled);

      setScanModelUsed(result.model || "Gemini Flash");
      setScanProgress(100);
      setScanStatusMessage(`Bóc tách thành công qua Google Gemini AI (${result.model || "Flash"})! Đã tự động điền ${newlyFilled.size} trường trên cả 3 bước.`);
      setScanSuccess(true);
      setAiParsing(false);
    } catch (err: unknown) {
      setScanStatusMessage(err instanceof Error ? err.message : "Không phân tích được CV. Bạn có thể tiếp tục nhập liệu thủ công.");
      setScanSuccess(false);
      setAiParsing(false);
    }
  };

  const handleSubmitUpgrade = async () => {
    if (!primaryDomain || !sectorOptions.some((sector) => sector.code === primaryDomain)) {
      setErrorMessage("Vui lòng chọn lĩnh vực đang hoạt động trong danh mục hiện hành.");
      setCurrentStep(2);
      return;
    }
    if (!pdpdConsentAcknowledged || !legalOathAcknowledged) {
      alert("Vui lòng xác nhận riêng cam kết PDPD và cam kết tính chính xác của hồ sơ.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    const payload = {
      fullName: fullName.trim() || "Chuyên gia NacenTech",
      phone: phone.trim() || null,
      email: email.trim() || null,
      birthYear: Number(birthYear),
      gender,
      academicRank: ["GS", "PGS"].includes(academicDegree) ? academicDegree : "NONE",
      academicRankYear: ["GS", "PGS"].includes(academicDegree) ? Number(degreeYear) : null,
      degree: ["GS", "PGS", "TS"].includes(academicDegree) ? "DOCTOR" : academicDegree === "ThS" ? "MASTER" : "ENGINEER_BACHELOR",
      degreeYear: Number(degreeYear),
      organizationName: primaryInstitution.trim(),
      organizationAddress: workAddress.trim() || null,
      researchTitle: professionalTitle.trim() || null,
      positionTitle: null,
      expertiseSectors: [primaryDomain],
      specializedKeywords,
      draftToken: draftToken || null,
      trainingHistoryJson: null,
      employmentHistoryJson: null,
      publicationsJson: JSON.stringify(publications),
      consultingSummary: bioSummary.trim() || null,
      isProjectLeader: false,
      isMainContributor: false,
      pdpdConsent: true,
      legalOath: true,
      scopeType: receivingScopeType,
      scopeId: receivingUnit === "GLOBAL" ? null : receivingUnit,
    };

    try {
      const res = await fetch(`${API_BASE}/api/v1/experts/upgrade-request`, {
        method: "POST",
        headers: {
          ...authClient.getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Không thể gửi hồ sơ nâng hạng.");
      }

      const data = await res.json();
      setExistingProfile(data);
      setUxState("success");
    } catch (err: any) {
      // Tuân thủ triệt để BR-EXP-016: Tuyệt đối không fallback sang success khi API lỗi!
      console.error("[TASK-05 Upgrade Request Error]:", err);
      setSubmitError(err.message || "Không thể kết nối máy chủ hoặc nộp hồ sơ thất bại. Vui lòng kiểm tra lại kết nối và thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-label text-slate-500 mb-6 dark:text-slate-300">
          <Link href="/" className="hover:text-brand-800 transition focus-ring dark:text-brand-200">Trang chủ</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium dark:text-slate-100">Nâng hạng Chuyên gia KH&CN</span>
        </div>

        {/* Header Banner */}
        <div className="workspace-banner rounded-surface p-5 sm:p-8 text-white shadow-sm shadow-brand-950/10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-700/30 text-brand-100 text-label font-semibold backdrop-blur-sm border border-brand-500/30">
                <Sparkles className="w-3.5 h-3.5 text-brand-200" />
                <span>Quy chuẩn TASK-05 & Nghị định 13/2023/NĐ-CP</span>
              </div>
              <h1 className="font-bold tracking-tight type-page-title">Hồ Sơ Nâng Hạng Chuyên Gia KH&CN</h1>
              <p className="text-brand-100 text-body max-w-xl leading-relaxed">
                Đăng ký trở thành Chuyên gia thẩm định, Tư vấn công nghệ và Nhà sáng chế thuộc Mạng lưới Đổi mới sáng tạo NacenTech.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                <span className="block text-2xl font-bold">94</span>
                <span className="text-label text-brand-200">Trường chuẩn hóa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Multi-Step Progress Indicator */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-8 dark:bg-slate-900 dark:border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
            <AppButton variant="ghost"
              onClick={() => handleGoToStep(1)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-control text-label font-semibold transition ${
                currentStep === 1
                  ? "bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950 dark:text-brand-200"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-100"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-label ${
                currentStep === 1 ? "bg-brand-700 text-white" : "bg-slate-200 text-slate-600 dark:text-slate-300"
              }`}>1</div>
              <span className="text-label">Quét CV & Định danh</span>
            </AppButton>

            <AppButton variant="ghost"
              onClick={() => handleGoToStep(2)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-control text-label font-semibold transition ${
                currentStep === 2
                  ? "bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950 dark:text-brand-200"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-100"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-label ${
                currentStep === 2 ? "bg-brand-700 text-white" : "bg-slate-200 text-slate-600 dark:text-slate-300"
              }`}>2</div>
              <span className="text-label">Năng lực Chuyên môn</span>
            </AppButton>

            <AppButton variant="ghost"
              onClick={() => handleGoToStep(3)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-control text-label font-semibold transition ${
                currentStep === 3
                  ? "bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950 dark:text-brand-200"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-100"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-label ${
                currentStep === 3 ? "bg-brand-700 text-white" : "bg-slate-200 text-slate-600 dark:text-slate-300"
              }`}>3</div>
              <span className="text-label">Công bố & Cam kết</span>
            </AppButton>
          </div>
        </div>

        {/* 5 UX States Container */}
        <Async
          state={uxState}
          loadingText="Đang xác thực thông tin hồ sơ chuyên gia..."
          successContent={
            <div className="bg-white rounded-surface p-8 border border-emerald-200 shadow-lg text-center space-y-4 dark:bg-slate-900 dark:border-emerald-900">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto dark:bg-emerald-950/60">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="font-bold text-slate-900 text-card-title dark:text-slate-100">Hồ Sơ Đã Được Gửi Thành Công!</h2>
              <p className="text-slate-600 max-w-lg mx-auto text-body leading-relaxed dark:text-slate-300">
                Hồ sơ nâng hạng Chuyên gia KH&CN của <strong>{existingProfile?.fullName || fullName}</strong> đã được chuyển sang Hàng đợi Thẩm định (Approval Queue) thuộc Phân hệ Quản trị <strong>TASK-07</strong>.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-label text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-brand-700 dark:text-brand-300">Cơ quan tiếp nhận thẩm định (Cấp 2):</span>
                <span className="px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-900">
                  {receivingUnit === "GLOBAL" ? "NacenTech Trung Ương (Toàn quốc)" : `Sở KH&CN (${receivingUnit})`}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-label font-semibold dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-900">
                <Clock className="w-4 h-4" />
                <span>Trạng thái: Đang chờ Hội đồng Thẩm định xét duyệt (SLA &le; 48 giờ)</span>
              </div>
              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <Link
                  href="/profile/upgrade"
                  className="px-5 py-2.5 rounded-control border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition text-label focus-ring min-h-11 inline-flex items-center justify-center dark:text-slate-100 dark:border-slate-700 dark:bg-slate-800"
                >
                  Quay lại Cổng Nâng hạng
                </Link>
                <AppButton variant="primary"
                  onClick={() => setUxState("empty")}
                  className="px-5 py-2.5 rounded-control font-medium transition text-label focus-ring"
                >
                  Chỉnh sửa / Cập nhật hồ sơ
                </AppButton>
              </div>
            </div>
          }
          partialContent={
            <div className="bg-white rounded-surface p-6 border border-amber-300 shadow-md mb-6 dark:bg-slate-900 dark:border-amber-900">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-card-title dark:text-slate-100">Hội đồng yêu cầu bổ sung thông tin (CHANGES_REQUESTED)</h3>
                  <p className="text-body text-slate-600 dark:text-slate-300">
                    Hồ sơ của bạn cần bổ sung minh chứng về Văn bằng / Công bố khoa học. Vui lòng rà soát lại Step 3 bên dưới.
                  </p>
                </div>
              </div>
            </div>
          }
          errorContent={
            <div className="bg-white rounded-surface p-6 border border-rose-200 shadow-md text-center dark:bg-slate-900 dark:border-rose-900">
              <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 text-card-title dark:text-slate-100">Không thể tải thông tin hồ sơ</h3>
              <p className="text-body text-slate-600 mt-1 dark:text-slate-300">{errorMessage}</p>
            </div>
          }
        >
          {/* Main Wizard Form Container */}
          <div className="bg-white rounded-surface shadow-xl shadow-slate-200/50 border border-slate-200 p-6 sm:p-8 dark:bg-slate-900 dark:border-slate-700">
            {/* STEP 1: IDENTITY & DEGREES */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-card-title dark:text-slate-100">
                    <GraduationCap className="w-5 h-5 text-brand-700 dark:text-brand-200" />
                    <span>Bước 1: Thông tin Định danh & Học vị Khoa học</span>
                  </h3>
                  <p className="text-body text-slate-500 mt-1 dark:text-slate-300">
                    Chuẩn hóa thông tin cá nhân theo hồ sơ nghiên cứu chuẩn Quốc gia và Quốc tế.
                  </p>
                </div>

                {isDraftPrefilled && (
                  <div data-testid="zalo-draft-banner" className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-brand-900 dark:bg-brand-950/60 dark:text-brand-200 dark:border-brand-900">
                    <div className="flex items-center gap-2 font-semibold">
                      <Sparkles className="h-5 w-5 text-brand-700 dark:text-brand-300" />
                      <span>Đã tiếp nhận và tự động điền dữ liệu sơ bộ từ Zalo Mini App (BR-EXP-009). Vui lòng rà soát trước khi tiếp tục.</span>
                    </div>
                  </div>
                )}

                {/* AI CV Parser Feature Box (Hero Dropzone - Bước 1) */}
                <div className="bg-brand-50/70 border border-brand-200 rounded-2xl p-6 dark:bg-brand-950/40 dark:border-brand-900 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-control bg-brand-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <UploadCloud className="w-5 h-5 text-teal-300" />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-950 text-card-title dark:text-brand-100 flex items-center gap-2">
                          <span>AI Trích Xuất Dữ Liệu Hồ Sơ Tự Động (AI CV Scan)</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-200/60 text-brand-900 dark:bg-brand-900 dark:text-brand-200">
                            Chuẩn Bộ KH&CN
                          </span>
                        </h4>
                        <p className="text-body text-brand-800 dark:text-brand-300">
                          Tải lên tệp Lý lịch khoa học (PDF hoặc Word) để AI tự động bóc tách và Pre-fill đầy đủ thông tin vào cả 3 bước.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileChange}
                    className="hidden"
                    id="cv-file-upload"
                  />

                  {!cvFile ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
                          setCvFile({ name: file.name, size: `${sizeMB} MB`, rawFile: file });
                          setScanSuccess(false);
                          setScanProgress(0);
                          setScanModelUsed("");
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                        isDragOver
                          ? "border-brand-600 bg-brand-100/60 dark:bg-brand-900/50"
                          : "border-brand-300 hover:border-brand-500 bg-white/80 dark:bg-slate-900 dark:border-slate-700 hover:bg-brand-50/50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/80 flex items-center justify-center text-brand-700 dark:text-brand-300 mb-1">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100 text-label">
                        Kéo thả tệp CV / Lý lịch khoa học vào đây hoặc <span className="text-brand-700 dark:text-teal-300 underline underline-offset-2">chọn từ thiết bị</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Định dạng hỗ trợ: PDF, DOCX, DOC (Tối đa 20MB)
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 w-full max-w-sm flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseSampleCv();
                          }}
                          className="text-xs text-brand-700 hover:text-brand-800 dark:text-teal-300 font-medium underline underline-offset-2 inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Dùng tệp CV mẫu để thử nghiệm nhanh (PDF, 2.4 MB)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-brand-200 dark:border-brand-900 shadow-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-200 dark:border-teal-800">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white text-label truncate">
                              {cvFile.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <span>{cvFile.size}</span>
                              <span>•</span>
                              <span className="text-emerald-700 dark:text-emerald-300 font-medium">Sẵn sàng phân tích</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleRemoveCvFile}
                            disabled={aiParsing}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                            title="Xóa tệp"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <AppButton
                            variant="primary"
                            type="button"
                            disabled={aiParsing}
                            onClick={handleAiCvScan}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-control text-label font-semibold shadow-sm transition disabled:opacity-50 focus-ring"
                          >
                            {aiParsing ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Đang quét ({scanProgress}%)...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-teal-300" />
                                <span>{scanSuccess ? "Quét lại CV" : "Bắt đầu Quét & Bóc Tách AI"}</span>
                              </>
                            )}
                          </AppButton>
                        </div>
                      </div>

                      {/* AI Parsing Progress */}
                      {aiParsing && (
                        <div className="p-4 bg-teal-50/70 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900 space-y-2">
                          <div className="flex justify-between text-xs font-semibold text-teal-900 dark:text-teal-200">
                            <span>{scanStatusMessage}</span>
                            <span>{scanProgress}%</span>
                          </div>
                          <div className="w-full bg-teal-200/60 dark:bg-teal-900/60 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-brand-700 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${scanProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Scan Success Notice */}
                      {scanSuccess && !aiParsing && (
                        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                            <strong className="font-bold">Trích xuất thành công{scanModelUsed ? ` (${scanModelUsed})` : ""}!</strong>{" "}
                            Đã tự động đối soát và điền trước thông tin vào cả 3 bước (Định danh, Năng lực chuyên môn, Công bố khoa học & Bằng sáng chế). Vui lòng rà soát lại thông tin bên dưới trước khi tiếp tục.
                          </div>
                        </div>
                      )}

                      {/* Scan Error Notice (Zero-Lock Fallback) */}
                      {!scanSuccess && !aiParsing && scanStatusMessage && (
                        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200 dark:border-amber-900 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                            <strong className="font-bold">Lưu ý:</strong> {scanStatusMessage} Bạn có thể tiếp tục nhập liệu thủ công từng bước bên dưới mà không bị gián đoạn.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Divider phân tách rõ ràng */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-slate-900 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                      Hoặc nhập liệu thủ công từng bước bên dưới
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-label font-medium text-slate-700 dark:text-slate-100 flex items-center">
                      <span>Họ và tên đầy đủ *</span>
                      {renderAiBadge("fullName")}
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (e.target.value.trim()) setFullNameError("");
                      }}
                      placeholder="TS. Nguyễn Văn An"
                      className={`mt-1 block w-full px-3 py-2.5 border rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 ${
                        fullNameError ? "border-rose-500 ring-1 ring-rose-500" : aiFilledFields.has("fullName") ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/20" : "border-slate-300 dark:border-slate-700"
                      }`}
                    />
                    {fullNameError && (
                      <p className="mt-1 text-label text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{fullNameError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-label font-medium text-slate-700 dark:text-slate-100 flex items-center">
                      <span>Số điện thoại liên hệ *</span>
                      {renderAiBadge("phone")}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) setPhoneError("");
                      }}
                      placeholder="0912345678"
                      className={`mt-1 block w-full px-3 py-2.5 border rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 ${
                        phoneError ? "border-rose-500 ring-1 ring-rose-500" : aiFilledFields.has("phone") ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/20" : "border-slate-300 dark:border-slate-700"
                      }`}
                    />
                    {phoneError && (
                      <p className="mt-1 text-label text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{phoneError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-label font-medium text-slate-700 dark:text-slate-100 flex items-center">
                      <span>Email công tác *</span>
                      {renderAiBadge("email")}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="chuyengia@nacentech.vn"
                      className={`mt-1 block w-full px-3 py-2.5 border rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 ${
                        aiFilledFields.has("email") ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/20" : "border-slate-300 dark:border-slate-700"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-label font-medium text-slate-700 dark:text-slate-100 flex items-center">
                      <span>Năm sinh *</span>
                      {renderAiBadge("birthYear")}
                    </label>
                    <input
                      type="number"
                      min={1940}
                      max={new Date().getFullYear()}
                      value={birthYear}
                      onChange={(e) => {
                        setBirthYear(Number(e.target.value));
                        if (birthYearError) setBirthYearError("");
                      }}
                      className={`mt-1 block w-full px-3 py-2.5 border rounded-control text-body form-control dark:border-slate-700 ${
                        birthYearError ? "border-rose-500 ring-1 ring-rose-500" : aiFilledFields.has("birthYear") ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/20" : "border-slate-300"
                      }`}
                    />
                    {birthYearError && (
                      <p className="mt-1 text-label text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{birthYearError}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-label font-medium text-slate-700 dark:text-slate-100 flex items-center">
                      <span>Giới tính *</span>
                      {renderAiBadge("gender")}
                    </label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className={`mt-1 block w-full px-3 py-2.5 border rounded-control text-body bg-white form-control dark:bg-slate-900 dark:border-slate-700 ${aiFilledFields.has("gender") ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/20" : "border-slate-300"}`}><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option></select>
                  </div>
                  <div>
                    <label className="block text-label font-medium text-slate-700 dark:text-slate-100">Năm đạt học vị *</label>
                    <input required type="number" min={1950} max={new Date().getFullYear()} value={degreeYear} onChange={(e) => setDegreeYear(Number(e.target.value))} className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-control text-body form-control dark:border-slate-700" />
                  </div>

                  <div>
                    <label className="block text-label font-medium text-slate-700 dark:text-slate-100 flex items-center">
                      <span>Học vị / Học hàm cao nhất *</span>
                      {renderAiBadge("academicDegree")}
                    </label>
                    <select
                      value={academicDegree}
                      onChange={(e) => setAcademicDegree(e.target.value)}
                      className={`mt-1 block w-full px-3 py-2.5 border rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none bg-white form-control dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 ${aiFilledFields.has("academicDegree") ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/20" : "border-slate-300"}`}
                    >
                      <option value="GS">Giáo sư (GS)</option>
                      <option value="PGS">Phó Giáo sư (PGS)</option>
                      <option value="TS">Tiến sĩ (TS)</option>
                      <option value="ThS">Thạc sĩ (ThS)</option>
                      <option value="KySu">Kỹ sư / Cử nhân tài năng</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-label font-medium text-slate-700 dark:text-slate-100 flex items-center">
                      <span>Cơ quan / Viện nghiên cứu công tác *</span>
                      {renderAiBadge("primaryInstitution")}
                    </label>
                    <div className="mt-1 relative rounded-control">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-300">
                        <Building className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={primaryInstitution}
                        onChange={(e) => setPrimaryInstitution(e.target.value)}
                        placeholder="Viện Đổi Mới Sáng Tạo Quốc Gia (NacenTech)"
                        className={`block w-full pl-9 pr-3 py-2.5 border rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 dark:border-slate-700 ${aiFilledFields.has("primaryInstitution") ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/20" : "border-slate-300"}`}
                      />
                    </div>
                  </div>

                  {/* Phân cấp Cấp 2: Chọn Cơ quan / Sở KH&CN tiếp nhận thẩm định (Basic Design v2.6 & FR-ADM-007) */}
                  <div className="bg-brand-50/50 dark:bg-slate-800/60 p-4 rounded-surface border border-brand-200 dark:border-brand-900/50">
                    <label className="block text-label font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-brand-700 dark:text-brand-300" />
                        <span>Cơ quan / Sở KH&CN tiếp nhận thẩm định hồ sơ *</span>
                      </span>
                      <span className="text-caption text-brand-700 dark:text-brand-300 font-semibold bg-brand-100 dark:bg-brand-950 px-2 py-0.5 rounded-full">
                        Phân cấp Cấp 2
                      </span>
                    </label>
                    <p className="text-caption text-slate-500 dark:text-slate-400 mb-2">
                      Theo cơ chế phân cấp quản lý đa cấp, hồ sơ của bạn sẽ được chuyển thẳng về Lãnh đạo Sở KH&CN hoặc Đơn vị chủ quản đã chọn để thẩm định trực tiếp (SLA &le; 48 giờ).
                    </p>
                    <select
                      value={receivingUnit}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReceivingUnit(val);
                        setReceivingScopeType(val === "GLOBAL" ? "GLOBAL" : "PROVINCE");
                      }}
                      className="block w-full px-3 py-2.5 border border-brand-300 rounded-control text-slate-900 text-body font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none form-control dark:text-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <optgroup label="Cấp Trung Ương (Hội đồng Toàn quốc)">
                        <option value="GLOBAL">NacenTech Trung Ương (Bộ KH&CN - Toàn quốc)</option>
                      </optgroup>
                      <optgroup label="Sở KH&CN Miền Bắc (12 Tỉnh Trọng Điểm)">
                        <option value="HN">Sở KH&CN Hà Nội</option>
                        <option value="HP">Sở KH&CN Hải Phòng</option>
                        <option value="QN">Sở KH&CN Quảng Ninh</option>
                        <option value="BN">Sở KH&CN Bắc Ninh</option>
                        <option value="HD">Sở KH&CN Hải Dương</option>
                        <option value="TN">Sở KH&CN Thái Nguyên</option>
                        <option value="VP">Sở KH&CN Vĩnh Phúc</option>
                        <option value="ND">Sở KH&CN Nam Định</option>
                        <option value="TB">Sở KH&CN Thái Bình</option>
                        <option value="PT">Sở KH&CN Phú Thọ</option>
                        <option value="TH">Sở KH&CN Thanh Hóa</option>
                        <option value="NA">Sở KH&CN Nghệ An</option>
                      </optgroup>
                      <optgroup label="Sở KH&CN Miền Trung & Tây Nguyên (10 Tỉnh Trọng Điểm)">
                        <option value="DN">Sở KH&CN Đà Nẵng</option>
                        <option value="QNA">Sở KH&CN Quảng Nam</option>
                        <option value="QNG">Sở KH&CN Quảng Ngãi</option>
                        <option value="BD">Sở KH&CN Bình Định</option>
                        <option value="PY">Sở KH&CN Phú Yên</option>
                        <option value="KH">Sở KH&CN Khánh Hòa</option>
                        <option value="GL">Sở KH&CN Gia Lai</option>
                        <option value="DL">Sở KH&CN Đắk Lắk</option>
                        <option value="KT">Sở KH&CN Kon Tum</option>
                        <option value="LD">Sở KH&CN Lâm Đồng</option>
                      </optgroup>
                      <optgroup label="Sở KH&CN Miền Nam (12 Tỉnh Trọng Điểm)">
                        <option value="HCM">Sở KH&CN TP. Hồ Chí Minh</option>
                        <option value="BDG">Sở KH&CN Bình Dương</option>
                        <option value="DNA">Sở KH&CN Đồng Nai</option>
                        <option value="BRVT">Sở KH&CN Bà Rịa - Vũng Tàu</option>
                        <option value="CT">Sở KH&CN Cần Thơ</option>
                        <option value="AG">Sở KH&CN An Giang</option>
                        <option value="TG">Sở KH&CN Tiền Giang</option>
                        <option value="LA">Sở KH&CN Long An</option>
                        <option value="DT">Sở KH&CN Đồng Tháp</option>
                        <option value="BL">Sở KH&CN Bạc Liêu</option>
                        <option value="CM">Sở KH&CN Cà Mau</option>
                        <option value="KG">Sở KH&CN Kiên Giang</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-label font-medium text-slate-700 dark:text-slate-100 flex items-center">
                      <span>Chức vụ chuyên môn / Nghiên cứu</span>
                      {renderAiBadge("professionalTitle")}
                    </label>
                    <input
                      type="text"
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      placeholder="Nghiên cứu viên chính / Trưởng nhóm Lab"
                      className={`mt-1 block w-full px-3 py-2.5 border rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 dark:border-slate-700 ${aiFilledFields.has("professionalTitle") ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/20" : "border-slate-300"}`}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 mb-3 text-card-title dark:text-slate-100">Liên kết Định danh Quốc tế (Tăng điểm tín nhiệm hồ sơ)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-label font-medium text-slate-600 mb-1 dark:text-slate-300 flex items-center">
                        <span>Google Scholar URL</span>
                        {renderAiBadge("googleScholarUrl")}
                      </label>
                      <input
                        type="url"
                        value={googleScholarUrl}
                        onChange={(e) => setGoogleScholarUrl(e.target.value)}
                        placeholder="https://scholar.google.com/..."
                        className={`w-full px-3 py-2 border rounded-control text-body text-slate-900 focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 dark:border-slate-700 ${aiFilledFields.has("googleScholarUrl") ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/20" : "border-slate-300"}`}
                      />
                    </div>
                    <div>
                      <label className="block text-label font-medium text-slate-600 mb-1 dark:text-slate-300 flex items-center">
                        <span>ORCID iD</span>
                        {renderAiBadge("orcidId")}
                      </label>
                      <input
                        type="text"
                        value={orcidId}
                        onChange={(e) => setOrcidId(e.target.value)}
                        placeholder="0000-0002-1825-0097"
                        className={`w-full px-3 py-2 border rounded-control text-body text-slate-900 focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 dark:border-slate-700 ${aiFilledFields.has("orcidId") ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/20" : "border-slate-300"}`}
                      />
                    </div>
                    <div>
                      <label className="block text-label font-medium text-slate-600 mb-1 dark:text-slate-300 flex items-center">
                        <span>Scopus Author ID</span>
                        {renderAiBadge("scopusAuthorId")}
                      </label>
                      <input
                        type="text"
                        value={scopusAuthorId}
                        onChange={(e) => setScopusAuthorId(e.target.value)}
                        placeholder="57201234567"
                        className={`w-full px-3 py-2 border rounded-control text-body text-slate-900 focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 dark:border-slate-700 ${aiFilledFields.has("scopusAuthorId") ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/20" : "border-slate-300"}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <AppButton variant="primary"
                    type="button"
                    onClick={handleStep1Next}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-control font-medium transition shadow-sm text-label focus-ring"
                  >
                    <span>Tiếp tục: Năng lực Chuyên môn</span>
                    <ChevronRight className="w-4 h-4" />
                  </AppButton>
                </div>
              </div>
            )}

            {/* STEP 2: COMPETENCY */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-card-title dark:text-slate-100">
                    <Sparkles className="w-5 h-5 text-brand-700 dark:text-brand-200" />
                    <span>Bước 2: Năng lực Chuyên môn</span>
                  </h3>
                  <p className="text-body text-slate-500 mt-1 dark:text-slate-300">
                    Khai báo lĩnh vực công nghệ trụ cột, từ khóa chuyên sâu và số năm kinh nghiệm thực tiễn (đã được tự động điền sẵn từ CV nếu đã quét).
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-label font-medium text-slate-700 dark:text-slate-100 flex items-center">
                      <span>Lĩnh vực Trụ cột Công nghệ *</span>
                      {renderAiBadge("primaryDomain")}
                    </label>
                    <select
                      value={primaryDomain}
                      disabled={sectorLoading || sectorLoadError || sectorOptions.length === 0}
                      onChange={(e) => setPrimaryDomain(e.target.value)}
                      className={`mt-1 block w-full px-3 py-2.5 border rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none bg-white font-medium form-control dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 ${aiFilledFields.has("primaryDomain") ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/20" : "border-slate-300"}`}
                    >
                      <option value="">Chọn lĩnh vực từ danh mục hiện hành</option>
                      {sectorOptions.map((sector) => <option key={sector.code} value={sector.code}>{sector.name}</option>)}
                    </select>
                    {!sectorLoading && !sectorLoadError && primaryDomain && !sectorOptions.some(x => x.code === primaryDomain) && <p role="alert" className="mt-1 text-caption text-amber-800">Ngành trong hồ sơ sơ bộ không còn trong danh mục hiện hành. Vui lòng chọn ngành đang hoạt động trước khi nộp.</p>}
                    {sectorLoading && <p role="status" className="mt-1 text-caption text-slate-600">Đang tải danh mục ngành…</p>}
                    {sectorLoadError && <div role="alert" className="mt-1 text-caption text-red-700">Không tải được danh mục ngành. <button type="button" onClick={() => void loadSectors()} className="min-h-11 underline font-semibold">Thử lại</button></div>}
                    {!sectorLoading && !sectorLoadError && sectorOptions.length === 0 && <p role="status" className="mt-1 text-caption text-slate-600">Chưa có ngành đang hoạt động. Vui lòng thử lại sau.</p>}
                  </div>

                  <div>
                    <label className="block text-label font-medium text-slate-700 dark:text-slate-100 flex items-center">
                      <span>Từ khóa chuyên sâu (Tags)</span>
                      {renderAiBadge("specializedKeywords")}
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                        placeholder="Nhập từ khóa (vd: LLM, Phân tích dữ liệu lớn) và ấn Thêm"
                        className="min-w-0 flex-1 px-3 py-2 border border-slate-300 rounded-control text-body text-slate-900 focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 dark:border-slate-700"
                      />
                      <AppButton variant="primary"
                        type="button"
                        onClick={handleAddKeyword}
                        className="px-4 py-2 rounded-control text-label font-semibold transition focus-ring"
                      >
                        Thêm
                      </AppButton>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {specializedKeywords.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-label font-medium dark:bg-brand-950 dark:text-brand-200"
                        >
                          <span>{tag}</span>
                          <AppButton variant="ghost"
                            type="button"
                            onClick={() => handleRemoveKeyword(tag)}
                            className="hover:text-rose-600 transition focus-ring"
                          >
                            ×
                          </AppButton>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label font-medium text-slate-700 dark:text-slate-100 flex items-center">
                        <span>Số năm kinh nghiệm nghiên cứu/thực tiễn *</span>
                        {renderAiBadge("yearsOfExperience")}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                        className={`mt-1 block w-full px-3 py-2 border rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 dark:border-slate-700 ${aiFilledFields.has("yearsOfExperience") ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/20" : "border-slate-300"}`}
                      />
                    </div>
                    <div>
                      <label className="block text-label font-medium text-slate-700 dark:text-slate-100">Hình thức tư vấn ưu tiên</label>
                      <select
                        value={preferredConsultationMode}
                        onChange={(e) => setPreferredConsultationMode(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none bg-white form-control dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
                      >
                        <option value="HYBRID">Linh hoạt (Trực tiếp & Online)</option>
                        <option value="ONLINE">Trực tuyến từ xa</option>
                        <option value="ONSITE">Trực tiếp tại Hiện trường / Lab</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-label font-medium text-slate-700 dark:text-slate-100 flex items-center">
                      <span>Tóm tắt tiểu sử chuyên môn (Bio Summary)</span>
                      {renderAiBadge("bioSummary")}
                    </label>
                    <textarea
                      rows={3}
                      value={bioSummary}
                      onChange={(e) => setBioSummary(e.target.value)}
                      placeholder="Mô tả ngắn gọn về quá trình nghiên cứu, thành tựu tiêu biểu và thế mạnh thẩm định chuyển giao công nghệ..."
                      className={`mt-1 block w-full p-3 border rounded-control text-slate-900 text-body focus:ring-2 focus:ring-innovation-500 focus:outline-none form-control dark:text-slate-100 dark:border-slate-700 ${aiFilledFields.has("bioSummary") ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/20" : "border-slate-300"}`}
                    />
                  </div>
                </div>

                {submitError && (
                  <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-label font-medium flex items-center gap-2 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-200">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex flex-wrap justify-between gap-3 pt-4">
                  <AppButton variant="outline"
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-control border font-medium transition text-label focus-ring"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay lại Bước 1</span>
                  </AppButton>
                  <AppButton variant="primary"
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-control font-medium transition shadow-sm text-label focus-ring"
                  >
                    <span>Tiếp tục: Công bố & Cam kết</span>
                    <ChevronRight className="w-4 h-4" />
                  </AppButton>
                </div>
              </div>
            )}

            {/* STEP 3: SCIENTIFIC PORTFOLIO & LEGAL UNDERTAKING */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-card-title dark:text-slate-100">
                    <Award className="w-5 h-5 text-brand-700 dark:text-brand-200" />
                    <span>Bước 3: Công bố & Cam kết</span>
                  </h3>
                  <p className="text-body text-slate-500 mt-1 dark:text-slate-300">
                    Khai báo công bố khoa học tiêu biểu, bằng sáng chế (đã được tự động điền sẵn từ CV nếu đã quét) và xác nhận cam kết theo Nghị định 13/2023/NĐ-CP.
                  </p>
                </div>

                {/* Publications Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900 text-card-title dark:text-slate-100 flex items-center">
                      <span>Công bố Khoa học Tiêu biểu ({publications.length})</span>
                      {renderAiBadge("publications")}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {publications.map((pub, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-control flex items-center justify-between text-label dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{pub.title}</p>
                          <p className="text-slate-500 dark:text-slate-300">
                            {pub.journalOrConference} ({pub.year}) {pub.doiOrUrl && `— ${pub.doiOrUrl}`}
                          </p>
                        </div>
                        <AppButton variant="ghost"
                          type="button"
                          onClick={() => handleRemovePublication(idx)}
                          className="text-slate-400 hover:text-rose-600 transition p-1 focus-ring dark:text-slate-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </AppButton>
                      </div>
                    ))}
                  </div>

                  {/* Add New Publication Form */}
                  <div className="p-4 bg-slate-50/50 border border-dashed border-slate-300 rounded-xl space-y-3 dark:border-slate-700 dark:bg-slate-800">
                    <div className="text-label font-semibold text-slate-700 dark:text-slate-100">Thêm công bố mới</div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Tên bài báo khoa học"
                        value={newPubTitle}
                        onChange={(e) => setNewPubTitle(e.target.value)}
                        className="sm:col-span-2 px-3 py-1.5 border border-slate-300 rounded-control text-body form-control dark:border-slate-700"
                      />
                      <input
                        type="text"
                        placeholder="Tạp chí / Kỷ yếu hội thảo"
                        value={newPubJournal}
                        onChange={(e) => setNewPubJournal(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 rounded-control text-body form-control dark:border-slate-700"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1950}
                          max={2026}
                          value={newPubYear}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setNewPubYear(val);
                            if (val > 2026) {
                              setPubYearError("Năm công bố không được lớn hơn năm 2026.");
                            } else {
                              setPubYearError("");
                            }
                          }}
                          className={`w-20 px-2 py-1.5 border rounded-control text-body form-control dark:border-slate-700 ${
                            pubYearError ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-300"
                          }`}
                        />
                        <AppButton variant="primary"
                          type="button"
                          aria-label="Thêm công bố"
                          onClick={handleAddPublication}
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-control text-label font-medium focus-ring"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm</span>
                        </AppButton>
                      </div>
                    </div>
                    {pubYearError && (
                      <p className="text-label text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{pubYearError}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Patents & Utility Solutions Table */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900 text-card-title dark:text-slate-100 flex items-center">
                      <span>Bằng Độc Quyền Sáng Chế & Giải Pháp Hữu Ích ({patents.length})</span>
                      {renderAiBadge("patents")}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {patents.map((pat, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-control flex items-center justify-between text-label dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{pat.title}</p>
                          <p className="text-slate-500 dark:text-slate-300">
                            {pat.patentNumber ? `Số văn bằng: ${pat.patentNumber} — ` : ""}Năm cấp: {pat.year} — Trạng thái: {pat.status === "GRANTED" ? "Đã cấp bằng" : pat.status}
                          </p>
                        </div>
                        <AppButton variant="ghost"
                          type="button"
                          onClick={() => handleRemovePatent(idx)}
                          className="text-slate-400 hover:text-rose-600 transition p-1 focus-ring dark:text-slate-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </AppButton>
                      </div>
                    ))}
                  </div>

                  {/* Add New Patent Form */}
                  <div className="p-4 bg-slate-50/50 border border-dashed border-slate-300 rounded-xl space-y-3 dark:border-slate-700 dark:bg-slate-800">
                    <div className="text-label font-semibold text-slate-700 dark:text-slate-100">Thêm bằng sáng chế / giải pháp hữu ích</div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Tên sáng chế / giải pháp hữu ích"
                        value={newPatentTitle}
                        onChange={(e) => setNewPatentTitle(e.target.value)}
                        className="sm:col-span-2 px-3 py-1.5 border border-slate-300 rounded-control text-body form-control dark:border-slate-700"
                      />
                      <input
                        type="text"
                        placeholder="Số văn bằng (nếu có)"
                        value={newPatentNumber}
                        onChange={(e) => setNewPatentNumber(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 rounded-control text-body form-control dark:border-slate-700"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1950}
                          max={new Date().getFullYear()}
                          value={newPatentYear}
                          onChange={(e) => setNewPatentYear(Number(e.target.value))}
                          className="w-20 px-2 py-1.5 border border-slate-300 rounded-control text-body form-control dark:border-slate-700"
                        />
                        <AppButton variant="primary"
                          type="button"
                          aria-label="Thêm sáng chế"
                          onClick={handleAddPatent}
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-control text-label font-medium focus-ring"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm</span>
                        </AppButton>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Undertaking & PDPD Consent */}
                <div className="p-4 bg-brand-50/60 border border-brand-200 rounded-xl space-y-3 dark:bg-brand-950">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-brand-700 shrink-0 mt-0.5 dark:text-brand-200" />
                    <div>
                      <h4 className="font-bold text-brand-950 text-card-title dark:text-brand-200">Cam kết Trung thực & Bảo vệ Dữ liệu Cá nhân (Nghị định 13/2023/NĐ-CP)</h4>
                      <p className="text-body text-brand-800 mt-1 leading-relaxed dark:text-brand-200">
                        Tôi xin cam đoan các thông tin khai báo trong hồ sơ khoa học trên là hoàn toàn chính xác và trung thực. Tôi chịu trách nhiệm trước pháp luật về văn bằng, chứng chỉ và quyền tác giả công bố. Tôi đồng ý để Hệ thống NacenTech số hóa và chuyển tiếp hồ sơ này cho Hội đồng Thẩm định theo quy trình phân quyền bảo mật 3 chiều.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center">
                    <input
                      id="pdpdConsent"
                      type="checkbox"
                      checked={pdpdConsentAcknowledged}
                      onChange={(e) => setPdpdConsentAcknowledged(e.target.checked)}
                      className="h-4 w-4 text-brand-700 focus:ring-innovation-500 border-slate-300 rounded focus-ring accent-brand-700 dark:border-slate-700 dark:text-brand-200"
                    />
                    <label htmlFor="pdpdConsent" className="ml-2 block text-label font-semibold text-slate-800 dark:text-slate-100">
                      Tôi đồng ý xử lý dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP *
                    </label>
                  </div>
                  <div className="pt-2 flex items-center">
                    <input
                      id="legalOath"
                      type="checkbox"
                      checked={legalOathAcknowledged}
                      onChange={(e) => setLegalOathAcknowledged(e.target.checked)}
                      className="h-4 w-4 text-brand-700 focus:ring-innovation-500 border-slate-300 rounded focus-ring accent-brand-700 dark:border-slate-700 dark:text-brand-200"
                    />
                    <label htmlFor="legalOath" className="ml-2 block text-label font-semibold text-slate-800 dark:text-slate-100">
                      Tôi cam kết thông tin và chứng từ khai báo là chính xác, trung thực *
                    </label>
                  </div>
                </div>

                {submitError && (
                  <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-label font-medium flex items-center gap-2 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-200">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex flex-wrap justify-between gap-3 pt-4">
                  <AppButton variant="outline"
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-control border font-medium transition text-label focus-ring"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay lại Bước 2</span>
                  </AppButton>

                  <AppButton variant="cta"
                    type="button"
                    disabled={submitting || !pdpdConsentAcknowledged || !legalOathAcknowledged}
                    onClick={handleSubmitUpgrade}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-control font-bold shadow-lg transition text-label disabled:opacity-50 focus-ring"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Đang gửi hồ sơ...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Nộp Hồ Sơ Xét Duyệt Nâng Hạng</span>
                      </>
                    )}
                  </AppButton>
                </div>
              </div>
            )}
          </div>
        </Async>
      </div>
    </div>
  );
}

export default function ExpertUpgradePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải hồ sơ...</div>}>
      <ExpertUpgradeForm />
    </Suspense>
  );
}
