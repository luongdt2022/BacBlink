import React from "react";
import { cn } from "@/lib/utils";

export interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  elevation?: 0 | 1 | 2 | 3 | 4;
}

const elevationClasses: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "shadow-none",
  1: "shadow-sm",
  2: "shadow-md",
  3: "shadow-lg",
  4: "shadow-2xl",
};

export const AppCard = React.forwardRef<HTMLDivElement, AppCardProps>(
  ({ className, interactive = false, elevation = 1, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-slate-200 bg-white p-5 md:p-6 transition-all dark:bg-slate-900 dark:border-slate-800",
          elevationClasses[elevation],
          interactive &&
            "cursor-pointer hover:border-brand-500 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] focus-ring",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AppCard.displayName = "AppCard";

export const AppCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-4", className)}
    {...props}
  />
));
AppCardHeader.displayName = "AppCardHeader";

export const AppCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-card-title font-bold text-text-primary dark:text-white font-sans", className)}
    {...props}
  />
));
AppCardTitle.displayName = "AppCardTitle";

export const AppCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-text-secondary dark:text-slate-400 font-sans", className)}
    {...props}
  />
));
AppCardDescription.displayName = "AppCardDescription";

export const AppCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-3", className)} {...props} />
));
AppCardContent.displayName = "AppCardContent";

export const AppCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80",
      className
    )}
    {...props}
  />
));
AppCardFooter.displayName = "AppCardFooter";
