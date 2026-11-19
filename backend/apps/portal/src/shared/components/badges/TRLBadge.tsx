interface TRLBadgeProps {
  level: string;
}

export function TRLBadge({ level }: TRLBadgeProps) {
  return (
    <span className="inline-flex rounded-full bg-[#dbeafe] px-3 py-1 text-[#1e40af]">
      {level}
    </span>
  );
}
