import { motion } from 'motion/react';
import { useLanguage } from '@/core/contexts/LanguageContext';
import { Users, CheckCircle } from 'lucide-react';

export function ReferralSection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] bg-indigo-50 border border-indigo-100 overflow-hidden p-12 md:p-20 text-center"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />

          <div className="relative space-y-8 max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
              <Users className="w-8 h-8" />
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-foreground">{t.referral.title}</h2>
              <p className="text-lg text-muted-foreground">{t.referral.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {t.referral.benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white border border-indigo-100/50 shadow-sm flex flex-col items-center gap-4 group hover:shadow-lg transition-all"
                >
                  <CheckCircle className="w-6 h-6 text-indigo-500 group-hover:scale-125 transition-transform" />
                  <span className="text-sm font-bold text-foreground leading-tight">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
