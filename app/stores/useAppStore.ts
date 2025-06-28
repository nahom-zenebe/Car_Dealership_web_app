'use client';

import { create } from 'zustand';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type Transmission = 'Automatic' | 'Manual' | 'SemiAutomatic';
export type FuelType = 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';
export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  profilePhotoUrl?: string;
  governmentIdFrontUrl?: string;
  governmentIdBackUrl?: string;
  verificationStatus?: VerificationStatus;
  verificationComments?: string;
  verifiedAt?: Date;
  verifiedByAdminId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Car {
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
}

export interface CartItem extends Car {
  quantity: number;
}
interface FavoriteStore {
  favorites: Car[];
  toggleFavorite: (car: Car) => void;
  isFavorite: (carId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],
  toggleFavorite: (car) =>
    set((state) => {
      const exists = state.favorites.find((fav) => fav.id === car.id);
      if (exists) {
        return {
          favorites: state.favorites.filter((fav) => fav.id !== car.id),
        };
      } else {
        return {
          favorites: [...state.favorites, car],
        };
      }
    }),
  isFavorite: (carId) => get().favorites.some((car) => car.id === carId),
}));




export interface VerificationRequest {
  id: string;
  name: string;
  email: string;
  governmentIdFrontUrl: string;
  governmentIdBackUrl: string | null;
  createdAt: string;
}

interface CartState {
  items: CartItem[];
  addToCart: (car: Car) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  totalPrice: () => number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  verificationRequests: VerificationRequest[];
  loading: boolean;
  error: string | null;

  signup: (user: User, token: string) => void;
  login: (user: User, token: string) => void;
  logout: () => void;

  submitVerification: (frontId: File, backId?: File) => Promise<void>;
  fetchVerificationRequests: () => Promise<void>;
  approveVerification: (userId: string) => Promise<void>;
  rejectVerification: (userId: string, comments: string) => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addToCart: (car) => {
    const items = get().items;
    const existing = items.find((item) => item.id === car.id);
    set({
      items: existing
        ? items.map((item) =>
            item.id === car.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...items, { ...car, quantity: 1 }],
    });
  },
  removeFromCart: (id) =>
    set({ items: get().items.filter((item) => item.id !== id) }),
  clearCart: () => set({ items: [] }),
  incrementQuantity: (id) =>
    set({
      items: get().items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      ),
    }),
  decrementQuantity: (id) =>
    set({
      items: get()
        .items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0),
    }),
  totalPrice: () =>
    get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
}));

export const useAppStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  verificationRequests: [],
  loading: false,
  error: null,

  signup: (user, token) =>
    set({ user, isAuthenticated: true, token }),
  login: (user, token) =>
    set({ user, isAuthenticated: true, token }),
  logout: () =>
    set({ user: null, isAuthenticated: false, token: null }),


  submitVerification: async (frontId, backId) => {
    try {
      set({ loading: true, error: null });
      const formData = new FormData();
      formData.append('frontId', frontId);
      if (backId) formData.append('backId', backId);

      const response = await fetch(`/api/users/${get().user?.id}/verification`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${get().token}`,
        },
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      set({
        user: { ...get().user!, ...data.user },
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchVerificationRequests: async () => {
    try {
      set({ loading: true, error: null });
      const response = await fetch('/api/admin/verifications', {
        headers: {
          Authorization: `Bearer ${get().token}`,
        },
      });

      if (!response.ok) throw new Error(await response.text());

      const data: VerificationRequest[] = await response.json();
      set({ verificationRequests: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  approveVerification: async (userId) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/admin/verifications/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${get().token}`,
        },
        body: JSON.stringify({ approved: true }),
      });

      if (!response.ok) throw new Error(await response.text());

      set({
        verificationRequests: get().verificationRequests.filter((req) => req.id !== userId),
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  rejectVerification: async (userId, comments) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/admin/verifications/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${get().token}`,
        },
        body: JSON.stringify({ approved: false, comments }),
      });

      if (!response.ok) throw new Error(await response.text());

      set({
        verificationRequests: get().verificationRequests.filter((req) => req.id !== userId),
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateUserProfile: async (userData) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/users/${get().user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${get().token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      set({
        user: { ...get().user!, ...data },
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));

