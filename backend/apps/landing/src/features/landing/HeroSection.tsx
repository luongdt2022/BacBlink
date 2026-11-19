import { motion } from 'motion/react';
import { useLanguage } from '@/core/contexts/LanguageContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PORTAL_URL } from '@/core/config';

export function HeroSection() {
  const { t } = useLanguage();
  const easing = [0.16, 1, 0.3, 1] as const;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } },
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-gradient blur-[120px] rounded-full opacity-20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-gradient blur-[120px] rounded-full opacity-20 rotate-180" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center space-y-8"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-4 h-4" />
              {t.hero.tag}
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-x-[0.3em] gap-y-2 text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.2] py-2 font-sans"
          >
            {t.hero.title.split(' ').map((word, i) => (
              <span
                key={i}
                className={
                  (word === 'Thông' || word === 'Minh' || word === 'Smart' || word === 'Solutions'
                    ? 'text-transparent bg-clip-text bg-brand-gradient'
                    : '') + ' pb-2'
                }
              >
                {word}
              </span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="max-w-3xl mx-auto text-xl text-muted-foreground leading-relaxed"
          >
            {t.hero.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <a
              href={PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full bg-primary text-white font-bold shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all hover:-translate-y-1 flex items-center gap-2 group"
            >
              {t.hero.cta1}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href={PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full bg-white text-foreground font-bold border border-border hover:bg-muted transition-all flex items-center gap-2"
            >
              {t.hero.cta2}
            </a>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16"
          >
            {t.hero.stats.map((stat, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-white border border-border hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-default"
              >
                <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
