import { ReactNode } from 'react'

interface ChartSectionProps {
  title: string
  description?: string
  children: ReactNode
}

export function ChartSection({ title, description, children }: ChartSectionProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200/80 bg-slate-50/80 px-6 py-5">
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      <div className="px-4 py-5 sm:px-6">{children}</div>
    </section>
  )
}
