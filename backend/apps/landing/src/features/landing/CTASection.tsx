import { motion } from 'motion/react';
import { useLanguage } from '@/core/contexts/LanguageContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PORTAL_URL } from '@/core/config';

export function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] bg-brand-gradient overflow-hidden p-12 md:p-24 text-center text-white shadow-2xl shadow-primary/30"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[40%] h-[150%] bg-white/5 rotate-12 -translate-y-1/2 translate-x-1/2 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[150%] bg-black/5 -rotate-12 translate-y-1/2 -translate-x-1/2 blur-[80px]" />

          <div className="relative space-y-10 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-widest"
            >
              <Sparkles className="w-4 h-4" />
              {t.cta.badge}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]"
            >
              {t.cta.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/80"
            >
              {t.cta.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6 pt-4"
            >
              <a
                href={PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-5 rounded-full bg-white text-primary font-black shadow-xl hover:bg-muted-foreground/10 hover:text-white border-2 border-transparent hover:border-white transition-all flex items-center gap-3 group"
              >
                {t.cta.button1}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </a>
              <a
                href={PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-5 rounded-full bg-transparent text-white font-black border-2 border-white/30 hover:border-white hover:bg-white/5 transition-all"
              >
                {t.cta.button2}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-8 pt-8 text-sm font-medium text-white/60"
            >
              <span className="flex items-center gap-2">✓ Không cần thẻ tín dụng</span>
              <span className="flex items-center gap-2">✓ Miễn phí để bắt đầu</span>
              <span className="flex items-center gap-2">✓ Hủy bất cứ lúc nào</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
