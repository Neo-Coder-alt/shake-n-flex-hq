import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import { MENU, CATEGORIES } from "@/lib/menu";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Shake N Flex | Fresh Juices, Shakes & Coffee" },
      {
        name: "description",
        content:
          "Explore the full Shake N Flex menu — signature shakes, fresh juices, coffees, smoothies and lemonades. Order online for delivery in Karachi.",
      },
      { property: "og:title", content: "Shake N Flex Menu" },
      {
        property: "og:description",
        content: "Signature shakes, fresh juices, coffees and more. Order online.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { add, count, total } = useCart();
  const [active, setActive] = useState<string>("All");

  const filtered = useMemo(
    () => (active === "All" ? MENU : MENU.filter((m) => m.category === active)),
    [active],
  );

  const tabs = ["All", ...CATEGORIES];

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
            Our Menu
          </h1>
          <p className="mt-2 text-muted-foreground">
            Blended fresh to order. Prices in Pakistani Rupees.
          </p>
        </div>
        {count > 0 && (
          <Link
            to="/checkout"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow"
            style={{ boxShadow: "var(--shadow-brand)" }}
          >
            <ShoppingCart className="h-4 w-4" />
            {count} item{count > 1 ? "s" : ""} · Rs. {total} — Checkout
          </Link>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={
              "rounded-full border px-4 py-1.5 text-sm font-medium transition " +
              (active === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground/80 hover:border-primary hover:text-primary")
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-primary/50"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              {item.category}
            </div>
            <h3 className="mt-2 text-lg font-bold text-foreground">{item.name}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{item.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-lg font-bold text-foreground">Rs. {item.price}</div>
              <button
                onClick={() => add(item)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
