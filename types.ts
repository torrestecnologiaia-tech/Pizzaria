export type Category = 'Pizzas' | 'Combos' | 'Pastéis' | 'Bebidas' | 'Sobremesas';

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface AppSettings {
  shopName: string;
  logoUrl: string;
  promoBanner?: string;
  whatsappNumber?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  isPromo?: boolean;
  isBestSeller?: boolean;
  promoText?: string;
  addons?: string[]; // IDs dos adicionais vinculados
}

export interface CartItem extends Product {
  quantity: number;
  selectedAddons?: Addon[];
}
