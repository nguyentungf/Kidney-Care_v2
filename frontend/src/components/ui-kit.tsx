import { AlertCircle, Check, CircleAlert, LoaderCircle, SearchX } from 'lucide-react';
import { type ReactNode } from 'react';

export function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <div className="eyebrow mb-2">{eyebrow}</div>
        <h1 className="text-[clamp(1.65rem,3vw,2.25rem)] font-extrabold tracking-[-.04em] text-foreground">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ title, label, action }: { title: string; label?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        {label && <div className="eyebrow mb-1">{label}</div>}
        <h2 className="text-base font-extrabold tracking-[-.02em]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ value, tone }: { value: string; tone?: 'stable' | 'watch' | 'critical' | 'high' | 'medium' | 'low' | 'scheduled' | 'completed' | 'cancelled' }) {
  const key = tone ?? value.toLowerCase();
  const styles = {
    stable: 'bg-[hsl(155_45%_91%)] text-[hsl(156_48%_26%)] border-[hsl(155_35%_81%)]',
    watch: 'bg-[hsl(42_90%_91%)] text-[hsl(30_63%_32%)] border-[hsl(42_65%_77%)]',
    critical: 'bg-[hsl(5_78%_93%)] text-[hsl(0_59%_37%)] border-[hsl(5_60%_82%)]',
    high: 'bg-[hsl(5_78%_93%)] text-[hsl(0_59%_37%)] border-[hsl(5_60%_82%)]',
    medium: 'bg-[hsl(42_90%_91%)] text-[hsl(30_63%_32%)] border-[hsl(42_65%_77%)]',
    low: 'bg-[hsl(190_42%_91%)] text-[hsl(190_52%_28%)] border-[hsl(190_35%_79%)]',
    scheduled: 'bg-[hsl(190_42%_91%)] text-[hsl(190_52%_28%)] border-[hsl(190_35%_79%)]',
    completed: 'bg-[hsl(155_45%_91%)] text-[hsl(156_48%_26%)] border-[hsl(155_35%_81%)]',
    cancelled: 'bg-muted text-muted-foreground border-border',
  } as const;
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] ${styles[key as keyof typeof styles] ?? 'bg-muted text-muted-foreground border-border'}`}>{value}</span>;
}

export function StateBlock({ kind, title, detail, action }: { kind: 'loading' | 'error' | 'empty'; title: string; detail: string; action?: ReactNode }) {
  const Icon = kind === 'loading' ? LoaderCircle : kind === 'error' ? AlertCircle : SearchX;
  return (
    <div className="clinical-card flex min-h-[190px] flex-col items-center justify-center rounded-xl p-8 text-center">
      <div className={`mb-3 rounded-full p-3 ${kind === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-primary'}`}>
        <Icon className={`h-5 w-5 ${kind === 'loading' ? 'animate-spin' : ''}`} />
      </div>
      <p className="font-bold">{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{detail}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function MetricCard({ label, value, detail, accent = 'teal', icon }: { label: string; value: string | number; detail: string; accent?: 'teal' | 'coral' | 'gold' | 'ink'; icon: ReactNode }) {
  const colors = { teal: 'bg-[hsl(190_42%_91%)] text-[hsl(183_52%_25%)]', coral: 'bg-[hsl(13_75%_92%)] text-[hsl(13_64%_39%)]', gold: 'bg-[hsl(42_90%_91%)] text-[hsl(30_63%_32%)]', ink: 'bg-[hsl(209_25%_91%)] text-[hsl(209_35%_25%)]' };
  return (
    <div className="clinical-card rounded-xl p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between">
        <span className="eyebrow">{label}</span>
        <span className={`rounded-lg p-2 ${colors[accent]}`}>{icon}</span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <span className="text-3xl font-extrabold tracking-[-.06em]">{value}</span>
        <span className="pb-1 text-right text-[11px] leading-4 text-muted-foreground">{detail}</span>
      </div>
    </div>
  );
}

export function SearchField({ value, onChange, placeholder, testId = 'input-search' }: { value: string; onChange: (value: string) => void; placeholder: string; testId?: string }) {
  return (
    <div className="relative">
      <SearchX className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input data-testid={testId} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10" />
    </div>
  );
}

export function FormField({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-foreground/80">{label}</span>{children}{hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}</label>;
}

export function Modal({ open, title, description, onClose, children }: { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(var(--foreground)/.38)] p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:rounded-2xl sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div><h2 className="text-xl font-extrabold tracking-[-.03em]">{title}</h2>{description && <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>}</div>
          <button onClick={onClose} data-testid="button-close-modal" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><span className="sr-only">Close</span>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ToastMessage({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) {
  return <div className={`fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold shadow-xl ${type === 'success' ? 'border-[hsl(155_35%_81%)] bg-[hsl(155_45%_91%)] text-[hsl(156_48%_26%)]' : 'border-destructive/20 bg-destructive/10 text-destructive'}`}><span className="rounded-full bg-current/10 p-1">{type === 'success' ? <Check className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}</span>{message}</div>;
}

export function dateLabel(value: string | null | undefined, withTime = false) {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', withTime ? { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' } : { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}