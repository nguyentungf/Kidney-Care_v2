import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CircleAlert, Clock3, ExternalLink, ShieldAlert } from 'lucide-react';
import { Link } from 'wouter';
import { getListAlertsQueryKey, useListAlerts, useMarkAlertRead } from '@workspace/api-client-react';
import { PageIntro, SectionTitle, StateBlock, StatusBadge, ToastMessage, dateLabel } from '@/components/ui-kit';

export default function Alerts() {
  const client = useQueryClient();
  const query = useListAlerts();
  const markRead = useMarkAlertRead();
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [toast, setToast] = useState('');
  const alerts = query.data ?? [];
  const filtered = useMemo(() => alerts.filter((alert) => filter === 'all' ? true : filter === 'unread' ? !alert.read : alert.severity === 'high'), [alerts, filter]);
  const mark = (id: number) => markRead.mutate({ id }, { onSuccess: () => { client.invalidateQueries({ queryKey: getListAlertsQueryKey() }); setToast('Alert marked as read'); setTimeout(() => setToast(''), 2400); } });
  const unread = alerts.filter((alert) => !alert.read).length;
  return (
    <div className="page-enter">
      <PageIntro eyebrow="Đợi tín hiệu lâm sàng" title="Cảnh báo lâm sàng" description="Review new signals, close the loop, and keep high-risk patients visible." action={<div className="flex items-center gap-2 rounded-lg bg-[hsl(13_75%_92%)] px-3 py-2 text-xs font-bold text-[hsl(13_64%_39%)]"><Bell className="h-4 w-4" /> {unread} chưa đọc</div>} />
      <div className="clinical-card rounded-xl p-4 sm:p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><SectionTitle title="Active queue" label="Triage board" action={<span className="mono text-[11px] text-muted-foreground">{filtered.length} shown</span>} /><div className="flex gap-1 rounded-lg bg-muted p-1"><FilterButton value="all" active={filter === 'all'} onClick={() => setFilter('all')} label="Tất cả" /><FilterButton value="unread" active={filter === 'unread'} onClick={() => setFilter('unread')} label="Chưa đọc" /><FilterButton value="high" active={filter === 'high'} onClick={() => setFilter('high')} label="Mức độ cao" /></div></div></div>
      <div className="mt-5">
        {query.isLoading ? <StateBlock kind="loading" title="Loading clinical alerts" detail="Checking the signal queue for new events." /> : query.isError ? <StateBlock kind="error" title="Alerts unavailable" detail="We couldn't retrieve the current clinical alert queue." action={<button onClick={() => query.refetch()} data-testid="button-retry-alerts" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Retry</button>} /> : filtered.length === 0 ? <StateBlock kind="empty" title={filter === 'unread' ? 'No unread alerts' : 'No alerts in this view'} detail={filter === 'unread' ? 'The team has reviewed every alert in the queue.' : 'No clinical signals require attention right now.'} /> : <div className="space-y-3">{filtered.map((alert) => <AlertCard key={alert.id} alert={alert} onRead={mark} pending={markRead.isPending} />)}</div>}
      </div>
      {toast && <ToastMessage message={toast} />}
    </div>
  );
}

function FilterButton({ value, active, onClick, label }: { value: string; active: boolean; onClick: () => void; label: string }) {
  return <button onClick={onClick} data-testid={`button-alert-filter-${value}`} className={`rounded-md px-3 py-2 text-xs font-bold transition ${active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{label}</button>;
}

function AlertCard({ alert, onRead, pending }: { alert: { id: number; patientId: number; patientName: string; severity: 'high' | 'medium' | 'low'; title: string; detail: string; createdAt: string; read: boolean }; onRead: (id: number) => void; pending: boolean }) {
  return <article data-testid={`card-alert-${alert.id}`} className={`clinical-card rounded-xl border-l-[3px] p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${alert.severity === 'high' ? 'border-l-[hsl(5_72%_57%)]' : alert.severity === 'medium' ? 'border-l-[hsl(42_76%_49%)]' : 'border-l-[hsl(190_52%_42%)]'} ${!alert.read ? 'bg-card' : 'bg-card/70'}`}><div className="flex items-start gap-3"><div className={`mt-0.5 rounded-lg p-2 ${alert.severity === 'high' ? 'bg-[hsl(5_78%_93%)] text-destructive' : alert.severity === 'medium' ? 'bg-[hsl(42_90%_91%)] text-[hsl(30_63%_32%)]' : 'bg-secondary text-primary'}`}>{alert.severity === 'high' ? <ShieldAlert className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><div className="flex flex-col justify-between gap-2 sm:flex-row"><div className="flex flex-wrap items-center gap-2"><StatusBadge value={alert.severity} /><h3 className={`text-sm font-extrabold ${alert.read ? 'text-foreground/75' : ''}`}>{alert.title}</h3></div><div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><Clock3 className="h-3 w-3" /> {dateLabel(alert.createdAt, true)}</div></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{alert.detail}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3"><Link href={`/patients/${alert.patientId}`} data-testid={`link-alert-patient-${alert.id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">{alert.patientName}<ExternalLink className="h-3 w-3" /></Link>{alert.read ? <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground"><Check className="h-3.5 w-3.5 text-primary" /> Đã xem</span> : <button disabled={pending} onClick={() => onRead(alert.id)} data-testid={`button-mark-alert-${alert.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"><Check className="h-3.5 w-3.5" /> Đánh dấu là đã xem</button>}</div></div></div></article>;
}