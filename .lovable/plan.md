
# Admin Dashboard for Shake N Flex

Build the admin panel inside the existing project (no separate app). The customer site keeps working exactly as-is; the only change on the customer side is that pages read from a shared data service instead of hardcoded arrays, so future admin edits reflect automatically.

Backend for now = a typed mock data service persisted to `localStorage`, structured so swapping to Lovable Cloud (Supabase) later means only replacing the service implementations. When you're ready to make it real (real logins, cross-device data, image uploads), I'll enable Lovable Cloud.

## Architecture

```text
src/
  lib/
    data/
      types.ts            shared types (MenuItem, Category, Order, Review, Coupon, Settings, AdminUser)
      store.ts            localStorage-backed reactive store + seed from current menu
      menu.service.ts     list/get/create/update/delete/toggle featured/stock
      category.service.ts CRUD
      order.service.ts    list/filter/updateStatus/delete + createFromCart (used by checkout)
      review.service.ts   list/create/delete/pin/reply
      coupon.service.ts   CRUD + validate(code)
      settings.service.ts get/update site settings (brand, hours, WhatsApp, delivery fee, socials)
      analytics.service.ts derived metrics from orders
    auth/
      admin-auth.tsx      mock admin auth context (email+password, remember me, logout)
  components/admin/       Sidebar, Topbar, StatCard, DataTable, FormField, ImageUploader, etc.
  routes/
    admin.tsx             /admin login (redirects to /admin/dashboard if signed in)
    _admin.tsx            pathless layout — guards + renders admin shell
    _admin/dashboard.tsx  KPIs + charts (recharts, already installed via shadcn)
    _admin/menu.tsx       menu CRUD
    _admin/categories.tsx category CRUD
    _admin/orders.tsx     orders list, filters, status updates, detail drawer
    _admin/reviews.tsx    reviews moderation
    _admin/coupons.tsx    coupon CRUD
    _admin/analytics.tsx  revenue/orders/best sellers charts
    _admin/settings.tsx   site settings + gallery (hero, promos)
    _admin/profile.tsx    admin profile + change password
```

Customer routes (`/`, `/menu`, `/checkout`) switch to reading from `menu.service` / `settings.service` and orders are written via `order.service.createFromCart` (still opens WhatsApp — nothing removed).

## Auth (mock, swap-ready)

- Seeded admin: `admin@shakenflex.pk` / `admin123` (shown once in-app; change on first login).
- Context provides `signIn`, `signOut`, `requestPasswordReset` (mock — shows a toast with reset token), `updatePassword`.
- `_admin.tsx` `beforeLoad` redirects to `/admin` when not signed in; `/admin` redirects to `/admin/dashboard` when signed in.
- "Remember me" toggles `localStorage` vs `sessionStorage` for the session.

## Dashboard

Stat cards: Total Orders, Today's Orders, Revenue, Pending, Completed, Best Seller, Avg Rating.
Charts (recharts): Sales over last 14 days (area), Orders by status (bar), Top 5 products (bar).

## Menu / Categories / Orders / Reviews / Coupons / Settings / Analytics / Profile

All the listed CRUD + toggles, driven by the services. Images stored as data URLs in mock mode (uploader accepts file → base64) so switching to Supabase Storage later is a single method change.

Notifications: bell in topbar reads a derived feed (new orders, new reviews, out-of-stock items, expired coupons).

## Design

Reuses the existing blue/white tokens in `src/styles.css` — no theme changes. Admin shell = fixed sidebar (collapsible on mobile via `Sheet`), sticky topbar, soft-shadow cards, rounded-xl, subtle motion on hover/route-change. Fully responsive.

## Scope note

This is a large build. I'll ship it in one pass focused on structure + working flows end-to-end with mock data. Once you're happy with the shape, say the word and I'll enable Lovable Cloud and port the services to real Supabase tables + RLS + storage + real auth.

Approve and I'll build it.
