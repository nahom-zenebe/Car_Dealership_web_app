import { create } from 'zustand';

// User type
type User = {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
};

// Car-related types
export type Transmission = 'Automatic' | 'Manual' | 'CVT' | 'Semi-Automatic';
export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';

type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  color?: string;
  inStock: boolean;
  imageUrls: string[];
  createdAt: Date;
  updatedAt?: Date;
  transmission?: Transmission;
  features: string[];
  fuelType?: FuelType;
};

// Cart item extends Car and adds quantity
interface CartItem extends Car {
  quantity: number;
}

// Zustand cart store interface
interface CartState {
  items: CartItem[];
  addToCart: (car: Car) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  totalPrice: () => number;
}

// Cart store implementation
export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addToCart: (car) => {
    const items = get().items;
    const existing = items.find((item) => item.id === car.id);

    if (existing) {
      set({
        items: items.map((item) =>
          item.id === car.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({
        items: [...items, { ...car, quantity: 1 }],
      });
    }
  },

  removeFromCart: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  clearCart: () => set({ items: [] }),

  incrementQuantity: (id) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ),
    }));
  },

  decrementQuantity: (id) => {
    set((state) => ({
      items: state.items
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0),
    }));
  },

  totalPrice: () =>
    get().items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    ),
}));

// Global auth/app store
type AppState = {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;

  signup: (user: User, token: string) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,

  signup: (user, token) =>
    set({ user, isAuthenticated: true, token }),
  login: (user, token) =>
    set({ user, isAuthenticated: true, token }),
  logout: () =>
    set({ user: null, isAuthenticated: false, token: null }),
}));
