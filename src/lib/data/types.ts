export type UUID = string;

export type SizeOption = { id: string; name: string; priceDelta: number };
export type ToppingOption = { id: string; name: string; priceDelta: number };

export type MenuItem = {
  id: UUID;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  sizes: SizeOption[];
  toppings: ToppingOption[];
  featured: boolean;
  available: boolean;
  outOfStock: boolean;
  createdAt: string;
};

export type Category = {
  id: UUID;
  name: string;
  slug: string;
};

export type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Ready"
  | "Completed"
  | "Cancelled";

export type OrderLine = {
  itemId: string;
  name: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: { name: string; phone: string; address: string };
  coords?: { lat: number; lng: number } | null;
  notes?: string;
  payment: "cod" | "online";
  lines: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
};

export type Review = {
  id: UUID;
  author: string;
  rating: number;
  text: string;
  createdAt: string;
  pinned: boolean;
  reply?: string;
};

export type Coupon = {
  id: UUID;
  code: string;
  type: "percent" | "fixed";
  value: number;
  expiresAt: string;
  active: boolean;
};

export type SiteSettings = {
  brandName: string;
  tagline: string;
  logo?: string;
  heroBanner?: string;
  about: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  deliveryFee: number;
  social: { instagram: string; facebook: string };
  gallery: string[];
};

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: "Shake N Flex",
  tagline: "Drink & Relax",
  about:
    "Fresh juices, thick shakes and specialty coffees blended daily in Nazimabad, Karachi.",
  phone: "+92 316 6521118",
  whatsapp: "923166521118",
  email: "hello@shakenflex.pk",
  address:
    "Adjacent to Bina Beauty Parlour, Block 4, Nazimabad No. 4, Karachi 74600",
  hours: "4 PM – 1:30 AM",
  deliveryFee: 100,
  social: { instagram: "", facebook: "" },
  gallery: [],
};

export type AdminUser = {
  id: UUID;
  name: string;
  email: string;
  password: string;
  avatar?: string;
};

export type AppState = {
  menu: MenuItem[];
  categories: Category[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  settings: SiteSettings;
  admin: AdminUser;
};