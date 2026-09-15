import { Activity, AlertTriangle, CalendarClock, ChevronRight, CircleCheck, Droplets, UsersRound } from 'lucide-react';
import { Link } from 'wouter';
import { useGetDashboard } from '@workspace/api-client-react';
import { MetricCard, PageIntro, SectionTitle, StateBlock, StatusBadge, dateLabel } from '@/components/ui-kit';

export default function Dashboard() {
  const query = useGetDashboard();
  const summary = query.data;
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
  if (query.isLoading) return <><PageIntro eyebrow="Good morning, Dr. Sen" title="Tổng quan lâm sàng" description={`Your renal care workspace for ${today}.`} /><StateBlock kind="loading" title="Loading the census" detail="Pulling the latest care activity and risk distribution." /></>;
  if (query.isError || !summary) return <><PageIntro eyebrow="Good morning, Dr. Sen" title="Clinical overview" description={`Your renal care workspace for ${today}.`} /><StateBlock kind="error" title="Overview unavailable" detail="We couldn't load the latest census. Please try again." action={<button onClick={() => query.refetch()} data-testid="button-retry-dashboard" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Retry</button>} /></>;
  const maxStage = Math.max(...summary.stageBreakdown.map((item) => item.count), 1);
  return (
    <div className="page-enter">
      <PageIntro eyebrow={today} title="Good morning, Dr. Sen" description="A concise view of the patients and decisions needing your attention today." action={<Link href="/patients" data-testid="link-dashboard-patients" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90"><UsersRound className="h-4 w-4" /> Xem danh sách</Link>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="soft-rise"><MetricCard label="Đang theo dõi" value={summary.totalPatients} detail="active patients" accent="teal" icon={<UsersRound className="h-4 w-4" />} /></div>
        <div className="soft-rise delay-1"><MetricCard label="Ca nguy kịch" value={summary.criticalPatients} detail="need attention" accent="coral" icon={<AlertTriangle className="h-4 w-4" />} /></div>
        <div className="soft-rise delay-2"><MetricCard label="Ca đã xếp lịch" value={summary.dialysisToday} detail="sessions booked" accent="gold" icon={<CalendarClock className="h-4 w-4" />} /></div>
        <div className="soft-rise delay-3"><MetricCard label="Thông báo chưa đọc" value={summary.unreadAlerts} detail="clinical signals" accent="ink" icon={<Activity className="h-4 w-4" />} /></div>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <section className="clinical-card rounded-xl p-5 sm:p-6">
          <SectionTitle label="Phân bố nguy cơ" title="Giai đoạn CDK" action={<span className="mono text-[11px] text-muted-foreground">n = {summary.totalPatients}</span>} />
          <div className="mt-6 space-y-4">
            {summary.stageBreakdown.map((item, index) => (
              <div key={item.stage} data-testid={`stage-row-${item.stage}`}>
                <div className="mb-1.5 flex items-center justify-between text-sm"><span className="font-semibold">{item.stage}</span><span className="mono text-xs text-muted-foreground">{item.count} <span className="text-[10px]">patients</span></span></div>
                <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full transition-all duration-700 ${index === 0 ? 'bg-[hsl(var(--accent))]' : index === 1 ? 'bg-primary/80' : index === 2 ? 'bg-primary/55' : 'bg-primary/35'}`} style={{ width: `${Math.max((item.count / maxStage) * 100, 4)}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-7 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground"><InfoIcon /> Stages reflect the most recent documented eGFR.</div>
        </section>
        <section className="clinical-card rounded-xl p-5 sm:p-6">
          <SectionTitle label="Tình trạng" title="Lọc máu hôm nay" action={<Link href="/dialysis" data-testid="link-dashboard-dialysis" className="text-xs font-bold text-primary hover:underline">Xem chi tiết lịch <ChevronRight className="ml-0.5 inline h-3 w-3" /></Link>} />
          <div className="mt-5 rounded-lg bg-secondary/65 p-4">
            <div className="flex items-center gap-3"><div className="rounded-lg bg-card p-2 text-primary"><Droplets className="h-4 w-4" /></div><div><p className="text-sm font-bold">{summary.dialysisToday} sessions on the board</p><p className="mt-0.5 text-xs text-muted-foreground">Keep station turnover visible across the unit.</p></div></div>
            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-card"><span className="w-[42%] bg-primary" /><span className="w-[26%] bg-[hsl(var(--accent))]" /><span className="w-[32%] bg-primary/20" /></div>
            <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"><span>Completed 42%</span><span>In progress 26%</span><span>Upcoming 32%</span></div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center"><MiniStat value="08:00" label="first chair" /><MiniStat value="14" label="stations" /><MiniStat value="4h" label="avg duration" /></div>
        </section>
      </div>
      <section className="clinical-card mt-6 rounded-xl p-5 sm:p-6">
        <SectionTitle label="Nhật ký theo dõi" title="Hoạt động gần đây" action={<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><CircleCheck className="h-3.5 w-3.5 text-primary" /> Cập nhật trực tiếp</span>} />
        {summary.recentActivity.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No activity has been recorded recently.</div> : <div className="divide-y divide-border">{summary.recentActivity.map((item) => <div className="flex items-start gap-3 py-3 first:pt-1 last:pb-0" key={item.id} data-testid={`activity-${item.id}`}><div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--accent))]" /><div className="min-w-0 flex-1"><div className="flex flex-col justify-between gap-1 sm:flex-row"><p className="text-sm font-bold">{item.title}</p><span className="mono text-[10px] text-muted-foreground">{dateLabel(item.timestamp, true)}</span></div><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.detail}</p></div></div>)}</div>}
      </section>
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return <div className="rounded-lg border border-border/80 bg-background/45 px-2 py-3"><div className="mono text-sm font-bold">{value}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div></div>;
}

function InfoIcon() {
  return <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary/30 text-[10px] font-bold text-primary">i</span>;
}