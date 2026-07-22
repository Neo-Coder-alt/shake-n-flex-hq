import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Truck, Sparkles, ArrowRight, Phone, Clock, MapPin } from "lucide-react";
import heroImg from "@/assets/hero-shakes.jpg";
import { useCart } from "@/lib/cart";
import { useFeaturedMenu } from "@/lib/data/menu.service";
import { useSettings } from "@/lib/data/settings.service";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { add } = useCart();
  const settings = useSettings();
  const featured = useFeaturedMenu().slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-90"
          style={{ background: "var(--gradient-soft)" }}
        />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Fresh · Blended Daily · Karachi
            </div>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-foreground md:text-6xl">
              Drink <span className="text-primary">&amp;</span> Relax
              <span className="block text-primary">Shake N Flex</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">
              Thick shakes, fresh fruit juices and specialty coffees — served hot &amp;
              cold from our Nazimabad No. 4 outlet, delivered to your doorstep.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-90"
                style={{ boxShadow: "var(--shadow-brand)" }}
              >
                Order Now <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
              >
                <Phone className="h-4 w-4" /> Call to Order
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold text-foreground">4.6</span> · 76 Google reviews
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" /> 4 PM – 1:30 AM
              </div>
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-6 -z-10 rounded-[2rem] blur-3xl"
              style={{ background: "var(--gradient-hero)", opacity: 0.25 }}
            />
            <img
              src={heroImg}
              alt="Assortment of Shake N Flex milkshakes and juices"
              width={1600}
              height={1000}
              className="w-full rounded-3xl object-cover shadow-2xl"
              style={{ boxShadow: "var(--shadow-brand)" }}
            />
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Blended Fresh", body: "Every shake and juice made from scratch — never pre-mixed." },
            { icon: Truck, title: "Home Delivery", body: "Fast delivery across Nazimabad and nearby blocks." },
            { icon: Star, title: "Loved by 1,200+", body: "Top-rated on foodpanda with 4.9★ from over a thousand orders." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured menu */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
              Fan Favourites
            </h2>
            <p className="mt-2 text-muted-foreground">Our most-ordered blends this month.</p>
          </div>
          <Link to="/menu" className="hidden text-sm font-semibold text-primary hover:underline sm:inline">
            Full menu →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item) => (
            <div key={item.id} className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-primary/50" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                {item.category}
              </div>
              <h3 className="mt-2 text-xl font-bold text-foreground">{item.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{item.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-lg font-bold text-foreground">Rs. {item.price}</div>
                <button
                  onClick={() => add(item)}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Add to cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About / Visit */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div
          className="overflow-hidden rounded-3xl p-8 text-primary-foreground md:p-12"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-black md:text-4xl">Visit our Nazimabad outlet</h2>
              <p className="mt-3 max-w-md text-white/90">
                Come chill at our cart, or let us come to you. Order online and track
                delivery straight to your GPS location.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-white/90"
                >
                  Order Delivery <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://maps.google.com/?q=Shake+N+Flex+Nazimabad"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <MapPin className="h-4 w-4" /> Directions
                </a>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-xs uppercase tracking-widest text-white/70">Address</div>
                <div className="mt-1 font-semibold">
                  Adjacent to Bina Beauty Parlour, Block 4, Nazimabad No. 4, Karachi 74600
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <div className="text-xs uppercase tracking-widest text-white/70">Hours</div>
                  <div className="mt-1 font-semibold">4 PM – 1:30 AM</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <div className="text-xs uppercase tracking-widest text-white/70">Call</div>
                  <div className="mt-1 font-semibold">+92 316 6521118</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
