import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: typeof translations.en;
}

const translations = {
  en: {
    // Header
    nav: {
      challenges: 'Challenges',
      howItWorks: 'How it works',
      successStories: 'Success Stories',
      offers: 'Offers',
    },
    joinNow: 'Start Now',

    // Hero Section
    hero: {
      tag: 'GREEN INNOVATION ECOSYSTEM',
      title: 'Technology Challenges Meet Smart Solutions',
      subtitle:
        "Connecting Businesses, Experts, and Investors in Vietnam's Leading ESG Tech Marketplace",
      cta1: 'Post Your Challenge',
      cta2: 'Become an Expert',
      stats: [
        { value: '60-70%', label: 'Revenue for Lab' },
        { value: '0%', label: 'Fee if unsuccessful' },
        { value: '24/7', label: 'AI Smart Matching' },
      ],
    },

    // Pain Points
    painPoints: {
      title: 'Your Pain, Our Solution',
      subtitle: 'We deeply understand the real challenges of the Vietnamese technology ecosystem',
      cards: [
        {
          title: 'FOR LABS & RESEARCH INSTITUTES',
          pain: 'Your million-dollar machinery is operating under 30% capacity?',
          solution: 'A platform helping you rent shared infrastructure and receive 60-70% revenue',
        },
        {
          title: 'FOR BUSINESSES',
          pain: 'Need technology but afraid of high costs and implementation risks?',
          solution: 'Sandbox environment for safe testing with "No success - No fee" mechanism',
        },
        {
          title: 'FOR INVESTORS',
          pain: 'Difficulty finding verified green technology projects?',
          solution:
            'Access projects verified by leading IP appraisal experts and certification bodies',
        },
      ],
    },

    // Process
    process: {
      badge: 'SIMPLE PROCESS',
      title: 'From Challenge to Solution in 3 Steps',
      subtitle: 'Our AI-powered ecosystem optimizes your entire innovation journey',
      steps: [
        {
          id: '01',
          title: 'Post Challenge or Solution',
          description:
            'Businesses post technology needs. Experts and labs list capabilities and equipment.',
        },
        {
          id: '02',
          title: 'AI Smart Matching',
          description:
            'Intelligent systems automatically match supply and demand with top accuracy.',
        },
        {
          id: '03',
          title: 'Execute with 8 Services',
          description:
            'IP appraisal, Infrastructure rental, Expert guidance, PoC support, and more.',
        },
      ],
    },

    // Services
    services: {
      title: '8 Core Services',
      items: [
        'IP Appraisal & Protection',
        'Shared Infrastructure Rental',
        'Expert Guidance',
        'Sandbox Testing Environment',
        'Training & Scaling',
        'Legal Transaction Support',
        'Investment Matching',
        'Technology Transfer',
      ],
    },

    // Success Stories
    success: {
      badge: 'PRACTICAL IMPACT',
      title: 'Success Stories From The Ecosystem',
      subtitle: 'See how we have helped businesses and experts achieve breakthrough results',
      items: [
        {
          name: 'Green Tech Startup A',
          challenge: 'Need to test water treatment technology but lack equipment budget',
          solution: 'Paired with University Lab, tested in Sandbox environment',
          result: 'Reduce 90% cost, successful PoC in 3 months, raised Series A capital',
        },
        {
          name: 'Research Lab B',
          challenge: 'Advanced sensors idle 70% of the time',
          solution: 'Listed on platform, matched with 5 SMEs',
          result: 'Increase 65% revenue, 3 new research partnerships',
        },
        {
          name: 'Manufacturing Co. C',
          challenge: 'Need experts to evaluate carbon footprint',
          solution: 'AI matched with ESG expert team',
          result: 'Achieved ISO 14001, reduced 40% emissions, received government support',
        },
      ],
      more: 'View More Success Stories',
    },

    // Offers
    offers: {
      badge: 'LIMITED TIME OFFERS',
      title: 'Exclusive Offers For Pioneers',
      subtitle: 'Join now and unlock premium advantages to accelerate your success',
      card1: {
        tag: 'FOR EXPERTS & LABS',
        title: 'FREE Verified Profile Badge',
        sub: 'Lifetime verification for the first 30 experts/labs registered',
        list: [
          'High-end profile visibility',
          'Priority in AI matching',
          'Highlighted on the exchange',
          'Access to exclusive projects',
        ],
        button: 'Get Verified Badge',
      },
      card2: {
        tag: 'FOR BUSINESSES',
        title: 'National Innovation Voucher',
        sub: 'Free expert consultation and equipment rental when posting your first challenge today',
        list: [
          'Voucher worth up to 50 million VND',
          'Free Sandbox testing',
          'Priority support',
          'Risk-free PoC guarantee',
        ],
        button: 'Get Your Voucher',
      },
    },

    // Referral
    referral: {
      title: 'Referral Rewards Program',
      subtitle: 'Invite experts or businesses and receive lifetime commission',
      benefits: [
        '10% commission on every transaction',
        'Additional rewards for quality referrals',
        'Exclusive partner opportunities',
      ],
    },

    // CTA
    cta: {
      badge: 'READY TO START?',
      title: 'Ready To Transform Your Innovation Journey?',
      subtitle: "Join Vietnam's leading green tech ecosystem today",
      button1: 'Post Your Challenge',
      button2: 'Become an Expert',
    },

    // Footer
    footer: {
      about: 'Nacentech',
      aboutText:
        "Vietnam's leading ESG technology marketplace, connecting experts, businesses and investors for sustainable innovation.",
      quickLinks: 'Quick Links',
      legal: 'Legal',
      contact: 'Contact',
      address: 'House C6, Thanh Xuan Ward, Hanoi City',
      email: 'nacentech@mst.gov.vn',
      phone: '(024) 39330313',
      copyright: '© 2026 Nacentech. All rights reserved.',
    },
  },
  vi: {
    // Header
    nav: {
      challenges: 'Thách Thức',
      howItWorks: 'Cách Hoạt Động',
      successStories: 'Câu Chuyện Thành Công',
      offers: 'Ưu Đãi',
    },
    joinNow: 'Bắt Đầu Ngay',

    // Hero Section
    hero: {
      tag: 'HỆ SINH THÁI ĐỔI MỚI XANH',
      title: 'Bài Toán Công Nghệ Gặp Giải Pháp Thông Minh',
      subtitle:
        'Kết nối Doanh nghiệp, Chuyên gia và Nhà đầu tư trong Sàn Công nghệ ESG Hàng đầu Việt Nam',
      cta1: 'Đăng bài toán của bạn',
      cta2: 'Trở thành chuyên gia',
      stats: [
        { value: '60-70%', label: 'Doanh thu cho Lab' },
        { value: '0%', label: 'Phí nếu không thành công' },
        { value: '24/7', label: 'Ghép nối AI' },
      ],
    },

    // Pain Points
    painPoints: {
      title: 'Nỗi Đau Của Bạn, Giải Pháp Của Chúng Tôi',
      subtitle: 'Chúng tôi thấu hiểu những thách thức thực sự của hệ sinh thái công nghệ Việt Nam',
      cards: [
        {
          title: 'DÀNH CHO LAB & VIỆN NGHIÊN CỨU',
          pain: 'Máy móc triệu đô của bạn đang hoạt động dưới 30% công suất?',
          solution: 'Nền tảng giúp bạn cho thuê hạ tầng dùng chung và nhận 60-70% doanh thu',
        },
        {
          title: 'DÀNH CHO DOANH NGHIỆP',
          pain: 'Cần công nghệ nhưng sợ chi phí đắt đỏ và rủi ro triển khai?',
          solution:
            'Môi trường Sandbox thử nghiệm an toàn và cơ chế "Không thành công - Không thu phí"',
        },
        {
          title: 'DÀNH CHO NHÀ ĐẦU TƯ',
          pain: 'Khó khăn tìm kiếm dự án công nghệ xanh chất lượng?',
          solution: 'Tiếp cận dự án đã xác minh với thẩm định IP và chứng thực chuyên gia',
        },
      ],
    },

    // Process
    process: {
      badge: 'QUY TRÌNH ĐƠN GIẢN',
      title: 'Từ Bài Toán Đến Giải Pháp Trong 3 Bước',
      subtitle: 'Hệ sinh thái hỗ trợ AI của chúng tôi tối ưu hóa toàn bộ hành trình đổi mới',
      steps: [
        {
          id: '01',
          title: 'Đăng tải Bài toán hoặc Giải pháp',
          description:
            'Doanh nghiệp đăng nhu cầu công nghệ. Chuyên gia và lab liệt kê năng lực và thiết bị.',
        },
        {
          id: '02',
          title: 'AI Smart Matching Tự Động',
          description:
            'Hệ thống thông minh tự động ghép nối cung - cầu với tỷ lệ chính xác cao nhất.',
        },
        {
          id: '03',
          title: 'Thực Thi với 8 Dịch vụ Chuyên Sâu',
          description:
            'Thẩm định IP, Cho thuê hạ tầng, Chuyên gia dẫn dắt, Hỗ trợ PoC, và nhiều hơn nữa.',
        },
      ],
    },

    // Services
    services: {
      title: '8 Dịch Vụ Cốt Lõi',
      items: [
        'Thẩm định & Bảo vệ IP',
        'Cho thuê hạ tầng dùng chung',
        'Chuyên gia dẫn dắt',
        'Môi trường Sandbox thử nghiệm',
        'Đào tạo & Nhân rộng',
        'Hỗ trợ giao dịch pháp lý',
        'Ghép nối đầu tư',
        'Chuyển giao công nghệ',
      ],
    },

    // Success Stories
    success: {
      badge: 'TÁC ĐỘNG THỰC TẾ',
      title: 'Câu Chuyện Thành Công Từ Hệ Sinh Thái',
      subtitle: 'Xem cách chúng tôi đã giúp doanh nghiệp và chuyên gia đạt kết quả đột phá',
      items: [
        {
          name: 'Startup Công Nghệ Xanh A',
          challenge: 'Cần thử nghiệm xử lý nước nhưng không đủ khả năng mua thiết bị',
          solution: 'Ghép nối với lab đại học, thử nghiệm trong môi trường Sandbox',
          result: 'Giảm 90% chi phí, PoC thành công trong 3 tháng, gọi vốn Series A thành công',
        },
        {
          name: 'Phòng Lab Nghiên Cứu B',
          challenge: 'Cảm biến tiên tiến nhàn rỗi 70% thời gian',
          solution: 'Đưa thiết bị lên nền tảng, ghép nối với 5 DN vừa và nhỏ',
          result: 'Tăng 65% doanh thu, 3 quan hệ đối tác nghiên cứu mới',
        },
        {
          name: 'DN Sản Xuất C',
          challenge: 'Cần chuyên gia đánh giá dấu chân carbon',
          solution: 'AI ghép nối với chuyên gia ESG được chứng nhận',
          result: 'Đạt ISO 14001, giảm 40% phát thải, nhận hỗ trợ từ chính phủ',
        },
      ],
      more: 'Xem thêm Câu chuyện thành công',
    },

    // Offers
    offers: {
      badge: 'ƯU ĐÃI CÓ THỜI HẠN',
      title: 'Ưu Đãi Độc Quyền Cho Người Tiên Phong',
      subtitle: 'Tham gia ngay và mở khóa lợi thế cao cấp để tăng tốc thành công của bạn',
      card1: {
        tag: 'DÀNH CHO CHUYÊN GIA & LAB',
        title: 'Huy Hiệu Verified Profile MIỄN PHÍ',
        sub: 'Xác minh trọn đời cho 30 chuyên gia/lab đầu tiên đăng ký',
        list: [
          'Hiển thị hồ sơ cao cấp',
          'Ưu tiên trong ghép nối AI',
          'Nổi bật trên sàn giao dịch',
          'Tiếp cận dự án độc quyền',
        ],
        button: 'Nhận Huy Hiệu Verified',
      },
      card2: {
        tag: 'DÀNH CHO DOANH NGHIỆP',
        title: 'Voucher Đổi Mới Sáng Tạo Quốc Gia',
        sub: 'Tư vấn chuyên gia và thuê thiết bị miễn phí khi đăng bài toán đầu tiên',
        list: [
          'Voucher trị giá tới 50 triệu VND',
          'Thử nghiệm Sandbox miễn phí',
          'Hỗ trợ ưu tiên',
          'Bảo đảm PoC không rủi ro',
        ],
        button: 'Nhận Voucher Của Bạn',
      },
    },

    // Referral
    referral: {
      title: 'Chương Trình Thưởng Giới Thiệu',
      subtitle: 'Mời chuyên gia hoặc doanh nghiệp và nhận hoa hồng trọn đời',
      benefits: [
        'Hoa hồng 10% trên mọi giao dịch',
        'Thưởng bổ sung cho giới thiệu chất lượng',
        'Cơ hội đối tác độc quyền',
      ],
    },

    // CTA
    cta: {
      badge: 'SẴN SÀNG BẮT ĐẦU?',
      title: 'Sẵn Sàng Chuyển Đổi Hành Trình Đổi Mới Của Bạn?',
      subtitle: 'Tham gia hệ sinh thái công nghệ xanh hàng đầu Việt Nam ngay hôm nay',
      button1: 'Đăng bài toán của bạn',
      button2: 'Trở thành chuyên gia',
    },

    // Footer
    footer: {
      about: 'Nacentech',
      aboutText:
        'Sàn công nghệ ESG hàng đầu Việt Nam, kết nối chuyên gia, doanh nghiệp và nhà đầu tư cho đổi mới bền vững.',
      quickLinks: 'Liên Kết Nhanh',
      legal: 'Pháp Lý',
      contact: 'Liên Hệ',
      address: 'Nhà C6, Phường Thanh Xuân, TP. Hà Nội',
      email: 'nacentech@mst.gov.vn',
      phone: '(024) 39330313',
      copyright: '© 2026 Nacentech. Đã đăng ký bản quyền.',
    },
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('vi'); // Default to VI for this specific site

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'vi' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
