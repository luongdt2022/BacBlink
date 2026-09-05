import { Check } from 'lucide-react';

export interface PricingPackage {
  id: string;
  name: string;
  price: number;
  requestLimit: number;
  features: string[];
  duration: number; // in days
  isRecommended?: boolean;
}

interface PricingCardProps {
  package: PricingPackage;
  onSelect: (packageId: string) => void;
}

export function PricingCard({ package: pkg, onSelect }: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-lg ${
        pkg.isRecommended
          ? 'border-primary shadow-md ring-2 ring-primary/20'
          : 'border'
      }`}
    >
      {/* Recommended Badge */}
      {pkg.isRecommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-primary/90 px-4 py-1 text-sm font-medium text-white shadow-md">
          Phổ biến nhất
        </div>
      )}

      {/* Package Name */}
      <h3 className="mb-4 text-2xl font-bold text-foreground">{pkg.name}</h3>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-primary">
            {pkg.price.toLocaleString('vi-VN')}
          </span>
          <span className="text-lg text-muted-foreground">VNĐ</span>
        </div>
        <div className="mt-1 text-sm text-muted-foreground">Thời hạn {pkg.duration} ngày</div>
      </div>

      {/* Features */}
      <ul className="mb-8 flex-grow space-y-3">
        {pkg.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="mt-0.5 size-5 shrink-0 text-[#16a34a]" />
            <span className="text-sm leading-relaxed text-[#4b5563]">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Select Button */}
      <button
        onClick={() => onSelect(pkg.id)}
        className={`w-full rounded-lg py-3 font-medium transition-all ${
          pkg.isRecommended
            ? 'bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg'
            : 'border border bg-white text-[#4b5563] hover:bg-[#f9fafb]'
        }`}
      >
        Chọn gói
      </button>
    </div>
  );
}
