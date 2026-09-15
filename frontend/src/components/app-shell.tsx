import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Bell, CalendarDays, ChevronRight, Command, LayoutDashboard, Menu, Search, UserRound, UsersRound, X } from 'lucide-react';

const navigation = [
  { href: '/', label: 'Trang chủ', icon: LayoutDashboard },
  { href: '/patients', label: 'Danh sách bệnh nhân', icon: UsersRound },
  { href: '/dialysis', label: 'Lịch lọc máu', icon: CalendarDays },
  { href: '/alerts', label: 'Cảnh báo lâm sàng', icon: Bell },
];

function NavContent({ location, onNavigate }: { location: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] shadow-lg shadow-[hsl(var(--accent)/.16)]">
          <Command className="h-5 w-5" strokeWidth={2.4} />
        </div>
        <div>
          <div className="text-[15px] font-extrabold tracking-tight text-[hsl(var(--sidebar-foreground))]">RenalCare</div>
          <div className="eyebrow !text-[hsl(var(--sidebar-foreground)/.48)]">Hệ thống quản lý bệnh nhân CKD</div>
        </div>
      </div>
      <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.4)]">Workspace</div>
      <nav className="space-y-1" aria-label="Primary navigation">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? location === '/' : location.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-[hsl(var(--sidebar-foreground)/.11)] text-[hsl(var(--sidebar-foreground))] shadow-inner'
                  : 'text-[hsl(var(--sidebar-foreground)/.62)] hover:bg-[hsl(var(--sidebar-foreground)/.07)] hover:text-[hsl(var(--sidebar-foreground))]'
              }`}
            >
              <Icon className={`h-[17px] w-[17px] ${active ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--sidebar-foreground)/.52)] group-hover:text-[hsl(var(--accent))]'}`} />
              <span>{label}</span>
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-[hsl(var(--sidebar-foreground)/.4)]" />}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-foreground)/.045)] p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow !text-[hsl(var(--sidebar-foreground)/.45)]">Online</span>
          <span className="h-2 w-2 rounded-full bg-[hsl(155_55%_54%)] shadow-[0_0_0_4px_hsl(155_55%_54%/.1)]" />
        </div>
        <p className="text-sm font-semibold text-[hsl(var(--sidebar-foreground)/.88)]">Bác sĩ Nguyễn Văn A</p>
        <p className="mt-0.5 text-xs text-[hsl(var(--sidebar-foreground)/.48)]">Khoa thận · until 19:00</p>
      </div>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-[100dvh] bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[242px] flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] px-4 py-6 lg:flex">
        <NavContent location={location} />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[hsl(var(--foreground)/.32)] lg:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="flex h-full w-[270px] flex-col bg-[hsl(var(--sidebar))] px-4 py-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation" className="absolute right-4 top-4 rounded-md p-1 text-[hsl(var(--sidebar-foreground)/.7)] hover:bg-[hsl(var(--sidebar-foreground)/.08)]">
              <X className="h-5 w-5" />
            </button>
            <NavContent location={location} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
      <main className="min-h-[100dvh] lg:pl-[242px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation" className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <span className="font-semibold text-foreground">RenalCare</span>
              <span>/</span>
              <span>{navigation.find((item) => item.href === '/' ? location === '/' : location.startsWith(item.href))?.label ?? 'Workspace'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/alerts" data-testid="link-header-alerts" className="relative rounded-lg border border-border bg-card p-2.5 text-muted-foreground transition hover:border-primary/30 hover:text-primary">
              <Bell className="h-[17px] w-[17px]" />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--accent))] px-1 font-mono text-[9px] font-bold text-foreground">4</span>
            </Link>
            <div className="hidden h-7 w-px bg-border sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">NA</div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-bold leading-tight">Nguyễn Văn A</p>
                <p className="text-[11px] text-muted-foreground">Khoa thận</p>
              </div>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}