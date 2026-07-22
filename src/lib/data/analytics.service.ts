import { useAppState } from "./store";
import type { Order } from "./types";

function isToday(d: string) {
  const now = new Date();
  const dt = new Date(d);
  return (
    dt.getFullYear() === now.getFullYear() &&
    dt.getMonth() === now.getMonth() &&
    dt.getDate() === now.getDate()
  );
}

function isThisWeek(d: string) {
  const dt = new Date(d).getTime();
  return Date.now() - dt <= 7 * 86400000;
}

function isThisMonth(d: string) {
  const dt = new Date(d);
  const now = new Date();
  return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
}

export function useDashboardStats() {
  return useAppState((s) => {
    const orders = s.orders;
    const revenue = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + o.total, 0);
    const todayOrders = orders.filter((o) => isToday(o.createdAt));
    const pending = orders.filter((o) => o.status === "Pending").length;
    const completed = orders.filter((o) => o.status === "Completed").length;
    const counts = new Map<string, number>();
    for (const o of orders) {
      if (o.status === "Cancelled") continue;
      for (const l of o.lines) {
        counts.set(l.name, (counts.get(l.name) ?? 0) + l.qty);
      }
    }
    const bestSeller =
      [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const avgRating =
      s.reviews.length > 0
        ? Math.round(
            (s.reviews.reduce((r, x) => r + x.rating, 0) / s.reviews.length) * 10,
          ) / 10
        : 0;
    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      revenue,
      pending,
      completed,
      bestSeller,
      avgRating,
      reviewsCount: s.reviews.length,
    };
  });
}

export function useSalesSeries(days = 14) {
  return useAppState((s) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const buckets: { date: string; revenue: number; orders: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      buckets.push({
        date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        revenue: 0,
        orders: 0,
      });
    }
    for (const o of s.orders) {
      if (o.status === "Cancelled") continue;
      const d = new Date(o.createdAt);
      d.setHours(0, 0, 0, 0);
      const idx = days - 1 - Math.floor((now.getTime() - d.getTime()) / 86400000);
      if (idx >= 0 && idx < days) {
        buckets[idx].revenue += o.total;
        buckets[idx].orders += 1;
      }
    }
    return buckets;
  });
}

export function useTopProducts(limit = 5) {
  return useAppState((s) => {
    const counts = new Map<string, number>();
    for (const o of s.orders) {
      if (o.status === "Cancelled") continue;
      for (const l of o.lines) {
        counts.set(l.name, (counts.get(l.name) ?? 0) + l.qty);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, qty]) => ({ name, qty }));
  });
}

export function useOrdersByStatus() {
  return useAppState((s) => {
    const statuses = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"] as const;
    return statuses.map((status) => ({
      status,
      count: s.orders.filter((o) => o.status === status).length,
    }));
  });
}

export function useRevenueBreakdown() {
  return useAppState((s) => {
    const notCancelled = (o: Order) => o.status !== "Cancelled";
    return {
      today: s.orders.filter((o) => notCancelled(o) && isToday(o.createdAt)).reduce((r, o) => r + o.total, 0),
      week: s.orders.filter((o) => notCancelled(o) && isThisWeek(o.createdAt)).reduce((r, o) => r + o.total, 0),
      month: s.orders.filter((o) => notCancelled(o) && isThisMonth(o.createdAt)).reduce((r, o) => r + o.total, 0),
    };
  });
}