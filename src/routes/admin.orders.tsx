import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Trash2, MapPin, Phone, X } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  deleteOrder,
  updateOrderStatus,
  useOrders,
} from "@/lib/data/order.service";
import type { Order, OrderStatus } from "@/lib/data/types";

const STATUSES: OrderStatus[] = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"];

export const Route = createFileRoute("/admin/orders")({
  component: OrdersAdmin,
});

function OrdersAdmin() {
  const orders = useOrders();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | OrderStatus>("All");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (status !== "All" && o.status !== status) return false;
      if (q) {
        const s = q.toLowerCase();
        return (
          o.id.toLowerCase().includes(s) ||
          o.customer.name.toLowerCase().includes(s) ||
          o.customer.phone.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [orders, q, status]);

  return (
    <AdminShell title="Orders">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order id, name, phone…"
            className="w-full rounded-xl border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option>All</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Placed</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(o)} className="font-semibold text-primary hover:underline">{o.id}</button>
                  </td>
                  <td className="px-4 py-3 text-foreground">{o.customer.name}<div className="text-xs text-muted-foreground">{o.customer.phone}</div></td>
                  <td className="px-4 py-3 text-muted-foreground">{o.lines.reduce((s, l) => s + l.qty, 0)}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">Rs. {o.total}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
                    >
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { if (confirm(`Delete order ${o.id}?`)) deleteOrder(o.id); }}
                      className="rounded-lg border border-border p-1.5 text-muted-foreground hover:border-destructive hover:text-destructive"
                      aria-label="Delete"
                    ><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No orders match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <OrderDrawer order={selected} onClose={() => setSelected(null)} />}
    </AdminShell>
  );
}

function OrderDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-hidden bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Order</div>
            <div className="font-bold text-foreground">{order.id}</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-auto p-4 text-sm">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</h3>
            <div className="rounded-xl border border-border p-3">
              <div className="font-semibold text-foreground">{order.customer.name}</div>
              <a href={`tel:${order.customer.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-primary hover:underline">
                <Phone className="h-3.5 w-3.5" /> {order.customer.phone}
              </a>
              <div className="mt-2 text-muted-foreground">{order.customer.address}</div>
              {order.coords && (
                <a
                  href={`https://maps.google.com/?q=${order.coords.lat},${order.coords.lng}`}
                  target="_blank" rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <MapPin className="h-3.5 w-3.5" /> Open GPS location
                </a>
              )}
              {order.notes && <div className="mt-2 rounded-lg bg-secondary p-2 text-xs text-muted-foreground">Notes: {order.notes}</div>}
            </div>
          </section>
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</h3>
            <ul className="divide-y divide-border rounded-xl border border-border">
              {order.lines.map((l, i) => (
                <li key={i} className="flex items-center justify-between p-3">
                  <div>
                    <div className="font-medium text-foreground">{l.qty}× {l.name}</div>
                    <div className="text-xs text-muted-foreground">Rs. {l.price} each</div>
                  </div>
                  <div className="font-semibold">Rs. {l.qty * l.price}</div>
                </li>
              ))}
            </ul>
          </section>
          <section className="space-y-1 text-sm">
            <Row label="Subtotal" value={`Rs. ${order.subtotal}`} />
            <Row label="Delivery" value={`Rs. ${order.deliveryFee}`} />
            {order.discount > 0 && <Row label="Discount" value={`- Rs. ${order.discount}`} />}
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-bold">
              <span>Total</span><span>Rs. {order.total}</span>
            </div>
            <Row label="Payment" value={order.payment === "cod" ? "Cash on delivery" : "Online"} />
            <Row label="Status" value={order.status} />
          </section>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}