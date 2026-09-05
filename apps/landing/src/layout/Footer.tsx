import { useLanguage } from '@/core/contexts/LanguageContext';
import { Globe, MessageCircle, Share2, AtSign, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <a href="/" className="flex items-center gap-3">
              <img src="/NACENTECH_Main-Logo-G.png" alt="NACENTECH Logo" className="h-10 w-auto" />
              <div className="h-8 w-px bg-brand-teal-green/20 ml-4 mr-4" />
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-deep-teal leading-none mb-1">
                  Nền tảng
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-teal-green/90 leading-none">
                  Đổi mới sáng tạo
                </span>
              </div>
            </a>
            <p className="text-muted-foreground leading-relaxed italic">{t.footer.aboutText}</p>
            <div className="flex items-center gap-4">
              {[Globe, MessageCircle, Share2, AtSign].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-foreground">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-4">
              {Object.entries(t.nav).map(([key, label]) => (
                <li key={key}>
                  <a
                    href={`#${key}`}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {label as string}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-foreground">
              {t.footer.legal}
            </h4>
            <ul className="space-y-4">
              {['Chính Sách Bảo Mật', 'Điều Khoản Dịch Vụ', 'Chính Sách Cookie'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-foreground">
              {t.footer.contact}
            </h4>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="font-medium">{t.footer.email}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="font-medium">{t.footer.phone}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="font-medium">{t.footer.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-border text-center">
          <p className="text-sm font-medium text-muted-foreground">{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
