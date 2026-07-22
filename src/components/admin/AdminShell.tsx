import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  ShoppingBag,
  Star,
  BarChart3,
  Settings,
  Ticket,
  User as UserIcon,
  LogOut,
  Bell,
  Menu as MenuIcon,
  X,
  ExternalLink,
} from "lucide-react";
import { useAdminAuth } from "@/lib/auth/admin-auth";
import { useOrders } from "@/lib/data/order.service";
import { useReviews } from "@/lib/data/review.service";
import { useMenu } from "@/lib/data/menu.service";
import { useCoupons } from "@/lib/data/coupon.service";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/profile", label: "Profile", icon: UserIcon },
] as const;

export function AdminShell({ children, title }: { children: ReactNode; title: string }) {
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openMobile, setOpenMobile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  const notifs = useNotifications();

  const logout = () => {
    signOut();
    navigate({ to: "/admin" });
  };

  return (
    <div className="flex min-h-screen bg-secondary/40">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background md:flex md:flex-col">
        <SidebarInner pathname={pathname} onNavigate={() => {}} />
      </aside>

      {openMobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenMobile(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-background">
            <SidebarInner pathname={pathname} onNavigate={() => setOpenMobile(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
          <button
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary md:hidden"
            onClick={() => setOpenMobile(true)}
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 hover:border-primary hover:text-primary sm:inline-flex"
            >
              View site <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <div className="relative">
              <button
                onClick={() => setOpenNotif((v) => !v)}
                className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {notifs.length > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {notifs.length}
                  </span>
                )}
              </button>
              {openNotif && (
                <div
                  className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-background"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Notifications
                  </div>
                  <ul className="max-h-80 divide-y divide-border overflow-auto">
                    {notifs.length === 0 ? (
                      <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                        You're all caught up.
                      </li>
                    ) : (
                      notifs.map((n, i) => (
                        <li key={i} className="px-4 py-3 text-sm">
                          <div className="font-medium text-foreground">{n.title}</div>
                          <div className="text-xs text-muted-foreground">{n.body}</div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {(user?.name ?? "A").slice(0, 1).toUpperCase()}
              </div>
              <div className="text-xs">
                <div className="font-semibold text-foreground">{user?.name}</div>
                <div className="text-muted-foreground">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-border p-2 text-muted-foreground hover:border-destructive hover:text-destructive"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarInner({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link to="/admin/dashboard" onClick={onNavigate} className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground font-bold"
            style={{ background: "var(--gradient-hero)" }}
          >
            SF
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-foreground">Shake N Flex</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Admin Panel
            </div>
          </div>
        </Link>
        <button
          onClick={onNavigate}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary md:hidden"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((n) => {
          const active = pathname === n.to || pathname.startsWith(n.to + "/");
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={onNavigate}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition " +
                (active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground")
              }
            >
              <Icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3 text-[11px] text-muted-foreground">
        v1.0 · Mock data · Ready to connect to Cloud
      </div>
    </>
  );
}

function useNotifications() {
  const orders = useOrders();
  const reviews = useReviews();
  const menu = useMenu();
  const coupons = useCoupons();
  const notifs: { title: string; body: string }[] = [];
  const newOrders = orders.filter((o) => o.status === "Pending");
  if (newOrders.length)
    notifs.push({ title: `${newOrders.length} new order${newOrders.length > 1 ? "s" : ""}`, body: "Awaiting confirmation." });
  const recentReviews = reviews.filter(
    (r) => Date.now() - new Date(r.createdAt).getTime() < 7 * 86400000,
  );
  if (recentReviews.length)
    notifs.push({ title: `${recentReviews.length} new review${recentReviews.length > 1 ? "s" : ""}`, body: "Check reviews page." });
  const outOfStock = menu.filter((m) => m.outOfStock);
  if (outOfStock.length)
    notifs.push({ title: `${outOfStock.length} item${outOfStock.length > 1 ? "s" : ""} out of stock`, body: outOfStock.slice(0, 3).map((m) => m.name).join(", ") });
  const expired = coupons.filter((c) => new Date(c.expiresAt).getTime() < Date.now());
  if (expired.length)
    notifs.push({ title: `${expired.length} coupon${expired.length > 1 ? "s" : ""} expired`, body: expired.slice(0, 3).map((c) => c.code).join(", ") });
  return notifs;
}