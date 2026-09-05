import * as React from "react";
import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Layout & sizing
        "flex h-10 w-full min-w-0 px-3 py-2",
        // Shape
        "rounded-lg border border-border/70",
        // Colors
        "bg-white text-sm text-foreground",
        "placeholder:text-muted-foreground/50",
        "selection:bg-primary/15 selection:text-primary",
        // No shadow, clean look
        "shadow-none outline-none",
        // Transition
        "transition-colors duration-150",
        // Focus — border thickens via ring inset trick, no outer glow
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15",
        // File input
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "file:inline-flex file:h-7 file:cursor-pointer",
        // Invalid state
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
