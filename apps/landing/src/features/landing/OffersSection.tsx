import { motion } from 'motion/react';
import { useLanguage } from '@/core/contexts/LanguageContext';
import { Crown, Gift, CheckCircle2 } from 'lucide-react';

export function OffersSection() {
  const { t } = useLanguage();

  return (
    <section id="offers" className="py-24 bg-secondary/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-black uppercase tracking-wider"
          >
            {t.offers.badge}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            {t.offers.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground"
          >
            {t.offers.subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Offer 1 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group p-10 rounded-3xl bg-white border border-border hover:border-amber-300 transition-all duration-500 hover:shadow-2xl relative"
          >
            <div className="absolute top-0 right-0 p-8 text-amber-500/10">
              <Crown className="w-32 h-32 rotate-12" />
            </div>
            <div className="relative space-y-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                <Crown className="w-8 h-8" />
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                  {t.offers.card1.tag}
                </h3>
                <h4 className="text-3xl font-bold text-foreground">
                  {t.offers.card1.title.split('MIỄN PHÍ').join('')}
                  <span className="text-primary italic">MIỄN PHÍ</span>
                </h4>
                <p className="text-muted-foreground">{t.offers.card1.sub}</p>
              </div>
              <ul className="space-y-3">
                {t.offers.card1.list.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-full bg-primary/10 text-primary font-black hover:bg-primary hover:text-white transition-all">
                {t.offers.card1.button}
              </button>
            </div>
          </motion.div>

          {/* Offer 2 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group p-10 rounded-3xl bg-white border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-2xl relative"
          >
            <div className="absolute top-0 right-0 p-8 text-primary/10">
              <Gift className="w-32 h-32 -rotate-12" />
            </div>
            <div className="relative space-y-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                <Gift className="w-8 h-8" />
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                  {t.offers.card2.tag}
                </h3>
                <h4 className="text-3xl font-bold text-foreground leading-tight">
                  {t.offers.card2.title}
                </h4>
                <p className="text-muted-foreground">{t.offers.card2.sub}</p>
              </div>
              <ul className="space-y-3">
                {t.offers.card2.list.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-full bg-primary text-white font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                {t.offers.card2.button}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
