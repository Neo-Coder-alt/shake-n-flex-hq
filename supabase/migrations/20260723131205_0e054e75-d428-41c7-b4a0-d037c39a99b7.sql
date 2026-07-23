
-- ===== ENUMS =====
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.order_status AS ENUM ('Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled');

-- ===== UPDATED_AT TRIGGER FUNCTION =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== USER ROLES =====
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- ===== CATEGORIES =====
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== MENU =====
CREATE TABLE public.menu (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  category text NOT NULL,
  image text,
  sizes jsonb NOT NULL DEFAULT '[]'::jsonb,
  toppings jsonb NOT NULL DEFAULT '[]'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  available boolean NOT NULL DEFAULT true,
  out_of_stock boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX menu_category_idx ON public.menu(category);
CREATE INDEX menu_featured_idx ON public.menu(featured);
GRANT SELECT ON public.menu TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu TO authenticated;
GRANT ALL ON public.menu TO service_role;
ALTER TABLE public.menu ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view menu" ON public.menu FOR SELECT USING (true);
CREATE POLICY "Admins can manage menu" ON public.menu FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER menu_updated_at BEFORE UPDATE ON public.menu FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== ORDERS =====
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('SNF-' || upper(substring(gen_random_uuid()::text, 1, 8))),
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  lat numeric,
  lng numeric,
  notes text,
  payment text NOT NULL DEFAULT 'cod',
  lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  coupon_code text,
  status public.order_status NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_status_idx ON public.orders(status);
CREATE INDEX orders_created_at_idx ON public.orders(created_at DESC);
GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== REVIEWS =====
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  reply text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can create reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update reviews" ON public.reviews FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reviews" ON public.reviews FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== COUPONS =====
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('percent', 'fixed')),
  value numeric NOT NULL,
  expires_at timestamptz NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== WEBSITE SETTINGS (singleton) =====
CREATE TABLE public.website_settings (
  id text PRIMARY KEY DEFAULT 'global',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.website_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.website_settings TO authenticated;
GRANT ALL ON public.website_settings TO service_role;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view settings" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.website_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER website_settings_updated_at BEFORE UPDATE ON public.website_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== SEED =====
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Signature Shakes', 'signature-shakes', 1),
  ('Fresh Juices', 'fresh-juices', 2),
  ('Coffees', 'coffees', 3),
  ('Smoothies', 'smoothies', 4),
  ('Lemonades', 'lemonades', 5),
  ('Desserts', 'desserts', 6);

INSERT INTO public.menu (name, description, price, category, featured, sizes, toppings) VALUES
  ('Big Bang Brownie', 'Rich chocolate brownie blended with ice cream and milk.', 580, 'Signature Shakes', true, '[{"id":"reg","name":"Regular","priceDelta":0},{"id":"lg","name":"Large","priceDelta":100}]'::jsonb, '[{"id":"cream","name":"Whipped Cream","priceDelta":50},{"id":"choco","name":"Extra Chocolate","priceDelta":80}]'::jsonb),
  ('The Feast Shake', 'Loaded shake with chocolate, cream and a scoop of ice cream.', 680, 'Signature Shakes', true, '[{"id":"reg","name":"Regular","priceDelta":0},{"id":"lg","name":"Large","priceDelta":100}]'::jsonb, '[{"id":"cream","name":"Whipped Cream","priceDelta":50}]'::jsonb),
  ('KitKat Shake', 'Crushed KitKat blended with creamy milk and ice cream.', 520, 'Signature Shakes', false, '[{"id":"reg","name":"Regular","priceDelta":0},{"id":"lg","name":"Large","priceDelta":100}]'::jsonb, '[]'::jsonb),
  ('Chocolate Oreo', 'Chocolate and Oreo cookies blended into a thick shake.', 540, 'Signature Shakes', false, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb),
  ('Hazelnut Chocolate', 'Creamy hazelnut with a chocolate swirl.', 620, 'Signature Shakes', true, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb),
  ('Strawberry Shake', 'Fresh strawberries blended with milk and ice cream.', 400, 'Signature Shakes', true, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb),
  ('Chiko Shake', 'Classic chikoo shake, thick and refreshing.', 420, 'Signature Shakes', false, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb),
  ('Mango Juice', 'Freshly blended seasonal mango.', 350, 'Fresh Juices', false, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb),
  ('Orange Juice', '100% fresh squeezed orange.', 320, 'Fresh Juices', false, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb),
  ('Apple Juice', 'Crisp, cold pressed apple juice.', 340, 'Fresh Juices', false, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb),
  ('Iced Latte', 'Espresso, cold milk and ice.', 380, 'Coffees', true, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb),
  ('Wicked Vanilla Coffee', 'Bold coffee with a vanilla cream finish.', 460, 'Coffees', false, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb),
  ('Pistachio Frappe', 'Blended pistachio and coffee frappe.', 520, 'Coffees', false, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb),
  ('Chocolate Smoothie', 'Thick chocolate smoothie, cold and creamy.', 480, 'Smoothies', false, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb),
  ('Banana Smoothie', 'Banana blended with yoghurt and honey.', 420, 'Smoothies', false, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb),
  ('Mint Margarita', 'Refreshing mint, lemon and soda.', 280, 'Lemonades', true, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb),
  ('Mint Lemonade', 'Classic mint lemonade, ice cold.', 260, 'Lemonades', false, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb),
  ('Kit Kat Kalato', 'Ice cream dessert loaded with KitKat.', 460, 'Desserts', false, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb),
  ('Cream', 'House cream dessert cup.', 380, 'Desserts', false, '[{"id":"reg","name":"Regular","priceDelta":0}]'::jsonb, '[]'::jsonb);

INSERT INTO public.reviews (author, rating, text, pinned) VALUES
  ('Ahmed K.', 5, 'Best brownie shake in Nazimabad!', true),
  ('Sana M.', 4, 'Delivery was quick, mint margarita was perfect.', false),
  ('Bilal R.', 5, 'The Feast Shake is a whole meal. Loved it.', false);

INSERT INTO public.coupons (code, type, value, expires_at, active) VALUES
  ('WELCOME10', 'percent', 10, now() + interval '30 days', true),
  ('FLAT100', 'fixed', 100, now() + interval '15 days', true);

INSERT INTO public.website_settings (id, data) VALUES ('global', '{
  "brandName": "Shake N Flex",
  "tagline": "Drink & Relax",
  "about": "Fresh juices, thick shakes and specialty coffee blended fresh every day in Nazimabad, Karachi.",
  "phone": "+92 316 6521118",
  "whatsapp": "923166521118",
  "email": "hello@shakenflex.pk",
  "address": "Adjacent to Bina Beauty Parlour, Block 4, Nazimabad No. 4, Karachi 74600",
  "hours": "4:00 PM – 1:30 AM (Daily)",
  "deliveryFee": 80,
  "social": {"instagram": "https://instagram.com/shakenflex", "facebook": "https://facebook.com/shakenflex"},
  "gallery": []
}'::jsonb);

-- Storage bucket RLS (bucket itself created via tool)
CREATE POLICY "Public read menu-images" ON storage.objects FOR SELECT USING (bucket_id = 'menu-images');
CREATE POLICY "Admins upload menu-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update menu-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete menu-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));
