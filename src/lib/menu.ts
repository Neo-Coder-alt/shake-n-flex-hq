export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
};

export const CATEGORIES = [
  "Signature Shakes",
  "Fresh Juices",
  "Coffees",
  "Smoothies",
  "Lemonades",
  "Desserts",
] as const;

export const MENU: MenuItem[] = [
  { id: "big-bang-brownie", name: "Big Bang Brownie", price: 580, category: "Signature Shakes", description: "Rich chocolate brownie blended with ice cream and milk." },
  { id: "the-feast-shake", name: "The Feast Shake", price: 680, category: "Signature Shakes", description: "Our loaded shake with chocolate, cream and a scoop of ice cream." },
  { id: "kitkat-shake", name: "KitKat Shake", price: 520, category: "Signature Shakes", description: "Crushed KitKat blended with creamy milk and ice cream." },
  { id: "chocolate-oreo", name: "Chocolate Oreo", price: 540, category: "Signature Shakes", description: "Chocolate and Oreo cookies blended into a thick shake." },
  { id: "hazelnut-chocolate", name: "Hazelnut Chocolate", price: 620, category: "Signature Shakes", description: "Creamy hazelnut with a chocolate swirl." },
  { id: "strawberry-shake", name: "Strawberry Shake", price: 400, category: "Signature Shakes", description: "Fresh strawberries blended with milk and ice cream." },
  { id: "chiko-shake", name: "Chiko Shake", price: 420, category: "Signature Shakes", description: "Classic chikoo shake, thick and refreshing." },

  { id: "mango-juice", name: "Mango Juice", price: 350, category: "Fresh Juices", description: "Freshly blended seasonal mango." },
  { id: "orange-juice", name: "Orange Juice", price: 320, category: "Fresh Juices", description: "100% fresh squeezed orange." },
  { id: "apple-juice", name: "Apple Juice", price: 340, category: "Fresh Juices", description: "Crisp, cold pressed apple juice." },

  { id: "iced-latte", name: "Iced Latte", price: 380, category: "Coffees", description: "Espresso, cold milk and ice." },
  { id: "wicked-vanilla-coffee", name: "Wicked Vanilla Coffee", price: 460, category: "Coffees", description: "Bold coffee with a vanilla cream finish." },
  { id: "pistachio-frappe", name: "Pistachio Frappe", price: 520, category: "Coffees", description: "Blended pistachio and coffee frappe." },

  { id: "chocolate-smoothie", name: "Chocolate Smoothie", price: 480, category: "Smoothies", description: "Thick chocolate smoothie, cold and creamy." },
  { id: "banana-smoothie", name: "Banana Smoothie", price: 420, category: "Smoothies", description: "Banana blended with yoghurt and honey." },

  { id: "mint-margarita", name: "Mint Margarita", price: 280, category: "Lemonades", description: "Refreshing mint, lemon and soda." },
  { id: "mint-lemonade", name: "Mint Lemonade", price: 260, category: "Lemonades", description: "Classic mint lemonade, ice cold." },

  { id: "kitkat-kalato", name: "Kit Kat Kalato", price: 460, category: "Desserts", description: "Ice cream dessert loaded with KitKat." },
  { id: "cream-dessert", name: "Cream", price: 380, category: "Desserts", description: "House cream dessert cup." },
];
