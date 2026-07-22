import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShoppingBag,
  CalendarDays,
  Wallet,
  Clock,
  CheckCircle2,
  Crown,
  Star,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import {
  useDashboardStats,
  useOrdersByStatus,
  useSalesSeries,
  useTopProducts,
} from "@/lib/data/analytics.service";
import { useOrders } from "@/lib/data/order.service";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const stats = useDashboardStats();
  const sales = useSalesSeries(14);
  const top = useTopProducts(5);
  const byStatus = useOrdersByStatus();
  const orders = useOrders();
  const recent = orders.slice(0, 5);

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingBag} />
        <StatCard label="Today's Orders" value={stats.todayOrders} icon={CalendarDays} tint="success" />
        <StatCard label="Revenue" value={`Rs. ${stats.revenue.toLocaleString()}`} icon={Wallet} />
        <StatCard label="Pending" value={stats.pending} icon={Clock} tint="warning" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} tint="success" />
        <StatCard label="Best Seller" value={stats.bestSeller} icon={Crown} tint="primary" />
        <StatCard label="Avg. Rating" value={stats.avgRating} icon={Star} hint={`${stats.reviewsCount} reviews`} />
        <StatCard label="Reviews" value={stats.reviewsCount} icon={Star} tint="muted" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">Sales — last 14 days</h3>
            <span className="text-xs text-muted-foreground">Rs.</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sales}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: "var(--border)" }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#revFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="font-bold text-foreground">Orders by status</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: "var(--border)" }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="font-bold text-foreground">Top products</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: "var(--border)" }} />
                <Bar dataKey="qty" fill="var(--primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">Recent orders</h3>
            <Link to="/admin/orders" className="text-xs font-semibold text-primary hover:underline">View all →</Link>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">{o.id}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.customer.name} · {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">Rs. {o.total}</div>
                  <StatusPill status={o.status} />
                </div>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">No orders yet.</li>
            )}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-amber-500/10 text-amber-600",
    Preparing: "bg-blue-500/10 text-blue-600",
    Ready: "bg-indigo-500/10 text-indigo-600",
    Completed: "bg-emerald-500/10 text-emerald-600",
    Cancelled: "bg-red-500/10 text-red-600",
  };
  return (
    <span className={"mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold " + (map[status] ?? "bg-muted text-muted-foreground")}>
      {status}
    </span>
  );
}