import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2, MapPin, Loader2, CheckCircle2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useSettings } from "@/lib/data/settings.service";
import { createOrder } from "@/lib/data/order.service";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Shake N Flex" },
      {
        name: "description",
        content:
          "Complete your Shake N Flex order. Fast home delivery across Nazimabad, Karachi with GPS location for accurate drop-off.",
      },
    ],
  }),
  component: Checkout,
});

type Coords = { lat: number; lng: number } | null;

function Checkout() {
  const { lines, setQty, remove, total, clear, count } = useCart();
  const settings = useSettings();
  const DELIVERY_FEE = settings.deliveryFee;
  const WHATSAPP = settings.whatsapp;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"cod" | "online">("cod");
  const [coords, setCoords] = useState<Coords>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string>("");

  const grand = total + (count > 0 ? DELIVERY_FEE : 0);

  const useCurrentLocation = () => {
    setLocError(null);
    if (!("geolocation" in navigator)) {
      setLocError("Geolocation is not supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Please allow location access."
            : "Could not fetch your location. Please try again.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (count === 0) return;
    const id = "SNF-" + Date.now().toString(36).toUpperCase();
    const mapLink = coords
      ? `https://maps.google.com/?q=${coords.lat},${coords.lng}`
      : "";
    createOrder({
      id,
      createdAt: new Date().toISOString(),
      status: "Pending",
      customer: { name, phone, address },
      coords,
      notes,
      payment,
      lines: lines.map((l) => ({ itemId: l.item.id, name: l.item.name, qty: l.qty, price: l.item.price })),
      subtotal: total,
      deliveryFee: DELIVERY_FEE,
      discount: 0,
      total: grand,
    });
    const orderText =
      `*New Order — Shake N Flex*\n\n` +
      `Order #: ${id}\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Address: ${address}\n` +
      (mapLink ? `GPS: ${mapLink}\n` : "") +
      (notes ? `Notes: ${notes}\n` : "") +
      `Payment: ${payment === "cod" ? "Cash on Delivery" : "Online"}\n\n` +
      `*Items:*\n` +
      lines.map((l) => `• ${l.qty}× ${l.item.name} — Rs. ${l.qty * l.item.price}`).join("\n") +
      `\n\nSubtotal: Rs. ${total}\nDelivery: Rs. ${DELIVERY_FEE}\n*Total: Rs. ${grand}*`;
    const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(orderText)}`;
    setOrderId(id);
    setPlaced(true);
    clear();
    // Open WhatsApp so the customer can send the order to the shop.
    window.open(wa, "_blank", "noopener,noreferrer");
  };

  if (placed) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-primary-foreground"
          style={{ background: "var(--gradient-hero)" }}
        >
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-black text-foreground">Order placed!</h1>
        <p className="mt-3 text-muted-foreground">
          Your order <span className="font-semibold text-foreground">{orderId}</span> has been sent
          to our team on WhatsApp. We'll call you shortly to confirm.
        </p>
        <Link
          to="/menu"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Order more
        </Link>
      </section>
    );
  }

  if (count === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-black text-foreground">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Browse the menu and add your favourite shakes.</p>
        <Link
          to="/menu"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Go to menu
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">Checkout</h1>
      <p className="mt-2 text-muted-foreground">Review your order and enter delivery details.</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Form */}
        <form onSubmit={submit} className="space-y-8">
          <div className="rounded-2xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <h2 className="text-lg font-bold text-foreground">Contact</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="e.g. Ahmed Khan"
                />
              </Field>
              <Field label="Phone" required>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                  placeholder="03XX XXXXXXX"
                />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-foreground">Delivery address</h2>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-60"
              >
                {locating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MapPin className="h-3.5 w-3.5" />
                )}
                {locating ? "Locating…" : "Use current location"}
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <Field label="Street address" required>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input min-h-[90px] resize-y"
                  placeholder="House / Flat #, Street, Block, Area, City"
                />
              </Field>

              {coords && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 text-primary">
                    <MapPin className="h-4 w-4" />
                    <div>
                      <div className="font-semibold">GPS location attached</div>
                      <div className="text-xs text-primary/80">
                        {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                      </div>
                    </div>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-primary underline"
                  >
                    Preview
                  </a>
                </div>
              )}
              {locError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {locError}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Sharing your GPS location helps our rider reach you faster and avoids delivery mix-ups.
              </p>

              <Field label="Delivery notes (optional)">
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input"
                  placeholder="Landmark, gate colour, extra instructions"
                />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <h2 className="text-lg font-bold text-foreground">Payment method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                [
                  { id: "cod", label: "Cash on Delivery", desc: "Pay the rider on arrival." },
                  { id: "online", label: "Online / Bank Transfer", desc: "We'll share details on WhatsApp." },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.id}
                  className={
                    "cursor-pointer rounded-xl border p-4 transition " +
                    (payment === opt.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40")
                  }
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={payment === opt.id}
                    onChange={() => setPayment(opt.id)}
                    className="sr-only"
                  />
                  <div className="font-semibold text-foreground">{opt.label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-primary py-4 text-base font-bold text-primary-foreground transition hover:opacity-90"
            style={{ boxShadow: "var(--shadow-brand)" }}
          >
            Place Order · Rs. {grand}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Order will be sent to our team on WhatsApp for confirmation.
          </p>
        </form>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24" style={{ boxShadow: "var(--shadow-card)" }}>
          <h2 className="text-lg font-bold text-foreground">Your order</h2>
          <ul className="mt-4 divide-y divide-border">
            {lines.map((l) => (
              <li key={l.item.id} className="flex items-start gap-3 py-3">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{l.item.name}</div>
                  <div className="text-xs text-muted-foreground">Rs. {l.item.price} each</div>
                  <div className="mt-2 inline-flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      onClick={() => setQty(l.item.id, l.qty - 1)}
                      className="p-1.5 text-foreground/70 hover:text-primary"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{l.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(l.item.id, l.qty + 1)}
                      className="p-1.5 text-foreground/70 hover:text-primary"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">Rs. {l.qty * l.item.price}</div>
                  <button
                    type="button"
                    onClick={() => remove(l.item.id)}
                    className="mt-2 text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            <Row label="Subtotal" value={`Rs. ${total}`} />
            <Row label="Delivery" value={`Rs. ${DELIVERY_FEE}`} />
            <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-base font-bold text-foreground">
              <span>Total</span>
              <span>Rs. {grand}</span>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0.65rem 0.85rem;
          font-size: 0.9rem;
          color: var(--foreground);
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 20%, transparent);
        }
      `}</style>
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      {children}
    </label>
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
