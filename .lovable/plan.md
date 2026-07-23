# Migrate Shake N Flex to Lovable Cloud

Replace the `localStorage` store with real Supabase tables, auth, and storage while keeping every component's public API (`useMenu`, `useCategories`, etc.) the same so the website UI and admin UI don't change.

## 1. Database schema (single migration)

Tables in `public`, all with `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at timestamptz default now()` + auto-update trigger, RLS enabled, GRANTs.

- `categories` — name, slug (unique). Public read, admin write.
- `menu` — name, description, price, category (fk categories.slug), image, sizes jsonb, toppings jsonb, featured, available, out_of_stock. Public read where `available`. Admin write.
- `orders` — customer_name, phone, address, lat, lng, items jsonb, subtotal, delivery_fee, discount, total, status, notes, coupon_code. Anyone can insert (guest checkout). Admin read/update/delete.
- `reviews` — name, rating, text, pinned, reply. Public read + insert. Admin update/delete.
- `coupons` — code (unique), type, value, expires_at, active. Public read active (for validate). Admin write.
- `website_settings` — singleton row keyed on `id='global'` with jsonb `data` (brand, hours, WhatsApp, delivery fee, socials, gallery). Public read, admin write.
- `profiles` — `id uuid pk references auth.users(id)`, email, name, avatar_url. Trigger on `auth.users` insert auto-creates row.
- `user_roles` + `app_role` enum (`admin`, `user`) + `has_role(uuid, app_role)` security-definer fn. Used by all admin RLS policies.

Storage: `menu-images` bucket (public read, admin write).

## 2. Auth

- Replace mock `admin-auth.tsx` with Supabase `signInWithPassword` / `signOut` / `resetPasswordForEmail` / `updateUser`.
- Add `/reset-password` public route.
- `_authenticated` gate not used — admin routes stay under `/admin/*` and check `useAdminAuth()` + `has_role('admin')` client-side; server-side protection lives in RLS.
- First admin: user signs up via Supabase, then a one-off SQL inserts their row into `user_roles`. I'll surface this in the plan output.

## 3. Service layer

Keep every exported function name (`useMenu`, `upsertMenuItem`, `useOrders`, `createOrder`, `validateCoupon`, `useSettings`, etc.). Internally:

- Rewrite each `*.service.ts` to use `@tanstack/react-query` with `supabase` client. Hooks return the same shapes; mutation helpers call `.from(...).insert/update/delete`.
- Delete `src/lib/data/store.ts` (localStorage store) once services no longer depend on it.
- `analytics.service.ts` derives from orders via a react-query hook.

## 4. Image uploads

Replace `ImageUploader` base64 flow with `supabase.storage.from('menu-images').upload(...)` returning a public URL.

## 5. Customer site

No visual change. `index.tsx`, `menu.tsx`, `checkout.tsx` already call the hooks — they keep working because hook signatures are preserved.

## 6. Wiring

- Add react-query provider to root (already installed).
- Seed initial data (categories + settings row) in the migration.

## Technical notes

- All admin RLS policies gate on `public.has_role(auth.uid(), 'admin')`.
- `orders.status` uses text enum-like check constraint.
- `website_settings` uses singleton pattern; `useSettings()` fetches by id.
- One database migration for schema + seed. Storage bucket created via storage tool.

## Out of scope

- Realtime subscriptions (not requested).
- Migrating existing localStorage data to Supabase (starts fresh; seed provides defaults).
- OAuth providers (email/password only per current admin flow).

Approve and I'll build it end to end.
