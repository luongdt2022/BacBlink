import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconBgColor = "bg-blue-50",
  iconColor = "text-brand",
}: StatsCardProps) {
  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {title}
          </p>
          <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          {change && (
            <p
              className={`mt-3 text-sm ${
                changeType === "positive"
                  ? "text-green-600"
                  : changeType === "negative"
                  ? "text-red-600"
                  : "text-slate-600"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${iconBgColor}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
