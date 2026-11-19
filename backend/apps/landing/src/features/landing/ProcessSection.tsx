import { motion } from 'motion/react';
import { useLanguage } from '@/core/contexts/LanguageContext';
import { ClipboardList, Cpu, Settings2, ArrowRight } from 'lucide-react';

const icons = [ClipboardList, Cpu, Settings2];

export function ProcessSection() {
  const { t } = useLanguage();

  return (
    <section id="howItWorks" className="py-24 bg-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-xs font-black uppercase tracking-wider"
          >
            {t.process.badge}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            {t.process.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            {t.process.subtitle}
          </motion.p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-8">
            {t.process.steps.map((step, i) => {
              const Icon = icons[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative group text-center"
                >
                  <div className="relative mb-8 inline-block">
                    <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center text-primary shadow-xl shadow-primary/5 border border-border group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-500">
                      <Icon className="w-10 h-10" />
                    </div>
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm border-4 border-white shadow-lg">
                      {step.id}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>

                  {/* Flow arrow (Desktop) */}
                  {i < 2 && (
                    <div className="hidden lg:block absolute top-1/2 right-0 translate-x-1/2 -translate-y-[150%]">
                      <ArrowRight className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
