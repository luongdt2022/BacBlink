export const AUTH_UI_CLASS = {
  page: 'relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 selection:bg-primary/10',
  background:
    'pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-slate-50',
  backgroundGlow:
    'absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]',
  backgroundGlowSecondary:
    'absolute -right-[5%] bottom-[5%] h-[35%] w-[35%] rounded-full bg-emerald-500/5 blur-[100px]',
  backgroundGrid:
    'absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] [background-image:linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:24px_24px]',
  shell: 'relative z-10 w-full max-w-[540px]',
  card:
    'overflow-hidden rounded-[2.5rem] border border-white bg-white/80 p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] backdrop-blur-xl md:p-10',
  intro: 'relative mb-8 overflow-hidden rounded-3xl border border-primary/5 bg-gradient-to-br from-primary/[0.05] to-transparent p-6 text-center',
  brandBadge: 'inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary/70',
  brandTitle: 'mt-4 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl',
  brandText: 'mt-2 text-sm leading-relaxed text-muted-foreground/70',
  logoBrand: 'mb-8 flex flex-col items-center gap-2',
  logoImg: 'h-20 w-auto object-contain',
  logoTagline: 'text-xs font-medium text-muted-foreground/60 tracking-wide',
  brandCard:
    'mt-4 rounded-xl border border-border/60 bg-white/90 p-3 text-sm leading-6 text-muted-foreground',
  formTitle: 'text-xl font-bold tracking-tight text-foreground',
  formSubtitle: 'mt-1 text-sm text-muted-foreground/80',
  formStack: 'mt-8 space-y-5',
  fieldLabel: 'mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-foreground/70',
  fieldError: 'mt-1.5 text-xs font-medium text-destructive',
  fieldHint: 'ml-1 text-[10px] font-normal lowercase text-muted-foreground/50',
  inputWrapper: 'relative',
  inputIcon: 'absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 transition-colors',
  actionLink: 'text-sm font-semibold text-primary transition-all hover:text-primary/80 hover:underline underline-offset-4',
  submitButton:
    'group relative mt-2 w-full overflow-hidden rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_4px_12px_rgba(var(--primary),0.2)] transition-all hover:shadow-[0_8px_20px_rgba(var(--primary),0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70',
  submitButtonGradient: 'absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/80 opacity-0 transition-opacity group-hover:opacity-100',
  bottomText: 'mt-8 text-center text-sm font-medium text-muted-foreground',
  successIconWrap:
    'mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm',
} as const;

const BASE_INPUT_CLASS =
  'w-full rounded-lg border border-border/60 bg-white px-4 py-2.5 text-sm text-foreground shadow-none outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/15';

export function getAuthInputClass(hasError: boolean, hasIcon: boolean = false): string {
  let classes = BASE_INPUT_CLASS;
  if (hasIcon) {
    classes += ' pl-11';
  }
  if (hasError) {
    return `${classes} border-destructive/60 focus:border-destructive focus:ring-destructive/15`;
  }
  return classes;
}
