import { motion } from 'motion/react';
import { useLanguage } from '@/core/contexts/LanguageContext';
import {
  ShieldCheck,
  Warehouse,
  UserRoundCheck,
  Box,
  GraduationCap,
  Gavel,
  PieChart,
  FileCode2,
} from 'lucide-react';

const icons = [
  ShieldCheck,
  Warehouse,
  UserRoundCheck,
  Box,
  GraduationCap,
  Gavel,
  PieChart,
  FileCode2,
];

export function CoreServicesSection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background text */}
      <div className="absolute top-0 right-0 py-20 opacity-[0.03] select-none pointer-events-none">
        <span className="text-[20rem] font-black leading-none font-sans text-primary">
          SERVICES
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl border-l-8 border-primary pl-8 font-sans"
          >
            {t.services.title}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.services.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group p-8 rounded-3xl bg-muted/20 border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors font-sans">
                  {item}
                </h3>
                <div className="mt-4 w-10 h-1 bg-primary/20 group-hover:w-20 group-hover:bg-primary transition-all duration-500" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
