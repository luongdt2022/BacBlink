"use client";

import React, { useState } from "react";
import { RadarAxis } from "@/lib/enterprise-client";

interface RadarChartProps {
  data: RadarAxis[];
  size?: number;
  className?: string;
}

export default function RadarChart({ data, className = "" }: RadarChartProps) {
  const [hoveredAxis, setHoveredAxis] = useState<number | null>(null);

  const totalAxes = data.length || 8;
  const cx = 250;
  const cy = 250;
  const radius = 150;
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Helper tính toạ độ góc quay
  const getCoordinates = (angleIndex: number, r: number) => {
    // Góc bắt đầu từ 12 giờ (-PI / 2) và quay theo chiều kim đồng hồ
    const angle = -Math.PI / 2 + (angleIndex * 2 * Math.PI) / totalAxes;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Tính đa giác dữ liệu
  const polygonPoints = data.map((d, i) => {
    const ratio = d.maxValue > 0 ? Math.min(1.0, Math.max(0.0, d.value / d.maxValue)) : 0;
    const { x, y } = getCoordinates(i, radius * ratio);
    return { x, y, ...d };
  });

  const polygonPathString = polygonPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 500 500"
        className="w-full max-w-[480px] h-auto overflow-visible"
        role="img"
        aria-label="Biểu đồ Radar Năng Lực Sản Xuất Doanh Nghiệp"
      >
        <defs>
          <radialGradient id="radarRadialBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
          </radialGradient>
          <linearGradient id="radarFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.40" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.30" />
          </linearGradient>
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Vòng nền ngoài cùng */}
        <circle cx={cx} cy={cy} r={radius} fill="url(#radarRadialBg)" />

        {/* Các vòng lưới đa giác đều (Concentric Regular Octagons) */}
        {levels.map((lvl, lvlIdx) => {
          const ringPoints = Array.from({ length: totalAxes }).map((_, i) => {
            const { x, y } = getCoordinates(i, radius * lvl);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(" ");

          const isOuter = lvlIdx === levels.length - 1;

          return (
            <g key={`level-${lvlIdx}`}>
              <polygon
                points={ringPoints}
                fill={lvlIdx % 2 === 1 ? "rgba(241, 245, 249, 0.4)" : "transparent"}
                stroke={isOuter ? "#94a3b8" : "#e2e8f0"}
                strokeWidth={isOuter ? 1.5 : 1}
                strokeDasharray={isOuter ? undefined : "3 3"}
              />
              {/* Nhãn % mức độ */}
              <text
                x={cx + 6}
                y={cy - radius * lvl + 11}
                className="text-xs font-semibold fill-slate-400 dark:fill-slate-500"
              >
                {Math.round(lvl * 100)}%
              </text>
            </g>
          );
        })}

        {/* Các trục nan hoa từ tâm ra 8 đỉnh */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(i, radius);
          const isHighlighted = hoveredAxis === i;
          return (
            <line
              key={`axis-line-${i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={isHighlighted ? "#2563eb" : "#cbd5e1"}
              strokeWidth={isHighlighted ? 2 : 1}
              strokeDasharray={isHighlighted ? undefined : "2 2"}
              className="transition-colors duration-150"
            />
          );
        })}

        {/* Đa giác dữ liệu điểm số (Score Polygon Area) */}
        {polygonPathString && (
          <polygon
            points={polygonPathString}
            fill="url(#radarFillGradient)"
            stroke="#2563eb"
            strokeWidth={2.5}
            strokeLinejoin="round"
            filter="url(#radarGlow)"
            className="transition-all duration-300"
          />
        )}

        {/* Các điểm nút đỉnh dữ liệu (Vertex Points) */}
        {polygonPoints.map((pt, i) => {
          const isHovered = hoveredAxis === i;
          return (
            <g
              key={`point-${i}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredAxis(i)}
              onMouseLeave={() => setHoveredAxis(null)}
            >
              {/* Hit area lớn hơn để dễ hover */}
              <circle cx={pt.x} cy={pt.y} r={14} fill="transparent" />
              {/* Vòng ngoài hiệu ứng hover */}
              {isHovered && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={10}
                  fill="#93c5fd"
                  fillOpacity={0.6}
                  className="animate-ping"
                />
              )}
              {/* Điểm nút chính */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 6 : 4.5}
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth={2}
                className="transition-all duration-150"
              />
            </g>
          );
        })}

        {/* Nhãn trục văn bản quanh chu vi ngoài */}
        {data.map((axis, i) => {
          const labelDist = radius + 36;
          const { x, y, angle } = getCoordinates(i, labelDist);
          const isHovered = hoveredAxis === i;

          // Căn chỉnh chữ theo vị trí góc
          const cos = Math.cos(angle);
          let textAnchor: "start" | "middle" | "end" = "middle";
          if (cos > 0.3) textAnchor = "start";
          else if (cos < -0.3) textAnchor = "end";

          return (
            <g
              key={`label-${i}`}
              className="cursor-pointer transition-transform duration-150"
              onMouseEnter={() => setHoveredAxis(i)}
              onMouseLeave={() => setHoveredAxis(null)}
            >
              <text
                x={x}
                y={y - 6}
                textAnchor={textAnchor}
                className={`text-[12px] font-bold transition-colors duration-150 ${
                  isHovered
                    ? "fill-brand-600 dark:fill-brand-400 font-extrabold"
                    : "fill-slate-700 dark:fill-slate-200"
                }`}
              >
                {axis.axis}
              </text>
              <text
                x={x}
                y={y + 10}
                textAnchor={textAnchor}
                className={`text-xs font-semibold transition-colors duration-150 ${
                  isHovered
                    ? "fill-brand-700 dark:fill-brand-300 font-extrabold"
                    : "fill-brand-600 dark:fill-brand-400"
                }`}
              >
                {axis.value.toFixed(1)} / {axis.maxValue}đ
              </text>
            </g>
          );
        })}
      </svg>

      {/* Chú giải tương tác khi hover */}
      {hoveredAxis !== null && data[hoveredAxis] && (
        <div className="mt-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-lg animate-fade-in flex items-center gap-2">
          <span className="font-bold text-sky-400">{data[hoveredAxis].axis}:</span>
          <span>
            {data[hoveredAxis].value.toFixed(1)} / {data[hoveredAxis].maxValue} điểm (
            {Math.round((data[hoveredAxis].value / data[hoveredAxis].maxValue) * 100)}%)
          </span>
        </div>
      )}
    </div>
  );
}
