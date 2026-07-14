import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

export function SiteNav() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground font-bold"
            style={{ background: "var(--gradient-hero)" }}
          >
            SF
          </div>
          <div className="leading-tight">
            <div className="text-base font-bold text-foreground">Shake N Flex</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Drink &amp; Relax
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-primary [&.active]:text-primary">
            Home
          </Link>
          <Link to="/menu" className="text-sm font-medium text-foreground/80 hover:text-primary [&.active]:text-primary">
            Menu
          </Link>
          <a href="#contact" className="text-sm font-medium text-foreground/80 hover:text-primary">
            Contact
          </a>
        </nav>

        <Link
          to="/checkout"
          className="relative inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Cart</span>
          {count > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-primary">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
