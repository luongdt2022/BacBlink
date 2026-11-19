import React from "react";

type Icon = React.ComponentType<{ className?: string }>;

/** Banner đầu trang dùng chung cho các trang công khai (nền xanh, lưới mờ, vầng sáng vàng, chip số liệu). */
export function PageHero({
  eyebrow,
  title,
  desc,
  chips,
  children,
}: {
  eyebrow?: string;
  title: string;
  desc?: React.ReactNode;
  chips?: { icon?: Icon; label: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#031e3d] via-[#053567] to-[#0a488f] px-4 py-10 text-white sm:px-6 sm:py-14 lg:px-8">
      <div aria-hidden="true" className="baclink-hero-art pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl space-y-4">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            <span aria-hidden="true">★</span> {eyebrow}
          </span>
        )}
        <h1 className="type-page-title max-w-4xl text-white sm:text-4xl">{title}</h1>
        {desc && <p className="max-w-3xl text-sm text-white/85 sm:text-base">{desc}</p>}
        {chips && chips.length > 0 && (
          <ul className="flex flex-wrap gap-2 pt-1">
            {chips.map((c) => {
              const Ic = c.icon;
              return (
                <li key={c.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  {Ic && <Ic className="size-3.5 text-amber-300" aria-hidden="true" />}
                  {c.label}
                </li>
              );
            })}
          </ul>
        )}
        {children}
      </div>
    </section>
  );
}

/** Bảng màu nhấn xoay vòng cho thẻ/biểu tượng. */
export const ACCENTS = [
  { chip: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300", bar: "from-blue-500 to-cyan-400", ring: "hover:border-blue-300 dark:hover:border-blue-700" },
  { chip: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300", bar: "from-amber-400 to-orange-400", ring: "hover:border-amber-300 dark:hover:border-amber-700" },
  { chip: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300", bar: "from-violet-500 to-fuchsia-400", ring: "hover:border-violet-300 dark:hover:border-violet-700" },
  { chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300", bar: "from-emerald-500 to-teal-400", ring: "hover:border-emerald-300 dark:hover:border-emerald-700" },
  { chip: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300", bar: "from-rose-500 to-pink-400", ring: "hover:border-rose-300 dark:hover:border-rose-700" },
  { chip: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300", bar: "from-cyan-500 to-sky-400", ring: "hover:border-cyan-300 dark:hover:border-cyan-700" },
] as const;
