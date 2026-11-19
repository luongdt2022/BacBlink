"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "./utils";

function TooltipProvider({
  delayDuration = 300,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-xs rounded-lg px-3 py-1.5 text-xs font-medium leading-relaxed",
          "bg-slate-900/95 text-slate-50 shadow-lg shadow-black/20",
          "animate-in fade-in-0 zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1",
          "data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
          className,
        )}
        {...props}
      >
        {children}
        {/* Let Radix handle arrow positioning — only set fill color */}
        <TooltipPrimitive.Arrow className="fill-slate-900/95" width={10} height={5} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

/**
 * Convenience wrapper that only shows a tooltip when the child element
 * is actually overflowing (truncated). Uses a ResizeObserver to re-check.
 *
 * @example
 * <Tip content="Full long title here">
 *   <span className="truncate">Long title…</span>
 * </Tip>
 */
function Tip({
  content,
  side = "bottom",
  children,
  disabled,
}: {
  content: React.ReactNode;
  side?: React.ComponentProps<typeof TooltipPrimitive.Content>["side"];
  children: React.ReactElement;
  disabled?: boolean;
}) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  // Inject a ref into children to measure overflow
  const child = React.cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      ref.current = node;
      // Forward original ref if present
      const orig = (children as { ref?: React.Ref<HTMLElement> }).ref;
      if (typeof orig === "function") orig(node);
      else if (orig && "current" in orig) (orig as React.MutableRefObject<HTMLElement | null>).current = node;
    },
  } as React.HTMLAttributes<HTMLElement> & { ref: (node: HTMLElement | null) => void });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => setIsOverflowing(el.scrollWidth > el.clientWidth);
    check();

    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  // Re-run when content changes (title text may change)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!content || disabled || !isOverflowing) return child;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{child}</TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </Tooltip>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, Tip };
