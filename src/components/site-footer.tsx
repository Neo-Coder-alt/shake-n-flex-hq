import { Instagram, Facebook, Phone, MapPin, Clock } from "lucide-react";

export function SiteFooter() {
  return (
    <footer id="contact" className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-primary-foreground font-bold"
              style={{ background: "var(--gradient-hero)" }}
            >
              SF
            </div>
            <div>
              <div className="font-bold text-foreground">Shake N Flex</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Drink &amp; Relax
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Fresh juices, thick shakes and specialty coffee — blended fresh every day in Nazimabad, Karachi.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <h4 className="font-semibold text-foreground">Visit us</h4>
          <p className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              Adjacent to Bina Beauty Parlour, Nazimabad No. 4, Block 4, Karachi 74600
            </span>
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            4:00 PM – 1:30 AM (Daily)
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0 text-primary" />
            <a href="tel:+923166521118" className="hover:text-primary">
              +92 316 6521118
            </a>
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <h4 className="font-semibold text-foreground">Follow</h4>
          <div className="flex gap-3">
            <a
              aria-label="Instagram"
              href="https://instagram.com/shakenflex"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/70 transition hover:border-primary hover:text-primary"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              aria-label="Facebook"
              href="https://facebook.com/shakenflex"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/70 transition hover:border-primary hover:text-primary"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
          <p className="pt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Shake N Flex. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
