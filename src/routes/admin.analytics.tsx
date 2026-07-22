import { createFileRoute } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import {
  useRevenueBreakdown, useSalesSeries, useTopProducts,
} from "@/lib/data/analytics.service";
import { CalendarDays, TrendingUp, Wallet } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const rev = useRevenueBreakdown();
  const sales30 = useSalesSeries(30);
  const sales7 = useSalesSeries(7);
  const top = useTopProducts(6);

  return (
    <AdminShell title="Analytics">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Today" value={`Rs. ${rev.today.toLocaleString()}`} icon={CalendarDays} />
        <StatCard label="This week" value={`Rs. ${rev.week.toLocaleString()}`} icon={TrendingUp} tint="success" />
        <StatCard label="This month" value={`Rs. ${rev.month.toLocaleString()}`} icon={Wallet} />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <h3 className="font-bold text-foreground">Monthly revenue (30d)</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sales30}>
              <defs>
                <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, borderColor: "var(--border)" }} />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#a1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="font-bold text-foreground">Daily orders (last 7 days)</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sales7}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: "var(--border)" }} />
                <Line type="monotone" dataKey="orders" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="font-bold text-foreground">Best sellers</h3>
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
      </div>
    </AdminShell>
  );
}