import { Menu, Languages, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/core/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { PORTAL_URL } from '@/core/config';

export function Header() {
  const { language, toggleLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg border-b border-border py-4 shadow-sm'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <a href="/" className="flex items-center gap-3 group">
              <img
                src="/NACENTECH_Main-Logo-G.png"
                alt="NACENTECH Logo"
                className="h-10 w-auto group-hover:scale-105 transition-transform"
              />
              <div className="hidden sm:block h-8 w-px bg-brand-teal-green/20 ml-4 mr-4 group-hover:bg-brand-teal-green/40 transition-colors" />
              <div className="hidden sm:flex flex-col items-center justify-center transition-all duration-300">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-deep-teal leading-none mb-1">
                  Nền tảng
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-teal-green/90 leading-none">
                  Đổi mới sáng tạo
                </span>
              </div>
            </a>

            <nav className="hidden lg:block">
              <ul className="flex items-center gap-8">
                {Object.entries(t.nav).map(([key, label]) => (
                  <li key={key}>
                    <a
                      href={`#${key}`}
                      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      {label as string}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-muted transition-colors text-sm font-medium text-foreground"
            >
              <Languages className="w-4 h-4 text-primary" />
              <span className="uppercase">{language}</span>
            </button>

            <a
              href={PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5"
            >
              {t.joinNow}
              <ArrowRight className="w-4 h-4" />
            </a>

            <button className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
