import { motion } from 'motion/react';
import { useLanguage } from '@/core/contexts/LanguageContext';
import { Microscope, Building2, TrendingUp, CheckCircle2 } from 'lucide-react';

const iconMap = {
  0: Microscope,
  1: Building2,
  2: TrendingUp,
};

export function ProblemSolutionSection() {
  const { t } = useLanguage();

  return (
    <section id="challenges" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            {t.painPoints.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            {t.painPoints.subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.painPoints.cards.map((card, i) => {
            const Icon = iconMap[i as keyof typeof iconMap];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group p-8 rounded-3xl bg-primary/5 border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* Decorative background number */}
                <div className="absolute top-4 right-8 text-8xl font-black text-primary/10 select-none transition-transform group-hover:scale-125">
                  {i + 1}
                </div>

                <div className="relative space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-border group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    <Icon className="w-7 h-7" />
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4">
                      {card.title}
                    </h3>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                          </div>
                          <p className="text-foreground font-semibold leading-snug">{card.pain}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <p className="text-muted-foreground text-sm italic">{card.solution}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
