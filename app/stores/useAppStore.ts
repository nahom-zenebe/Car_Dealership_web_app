import {create} from 'zustand'


type User={
    id:string;
    name: string;
    email: string;
    role: 'buyer' | 'seller';
}

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
  
    signup: (user, token) => set({ user, isAuthenticated: true, token }),
    login: (user, token) => set({ user, isAuthenticated: true, token }),
    logout: () => set({ user: null, isAuthenticated: false, token: null }),
  }));