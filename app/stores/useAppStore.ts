import {create} from 'zustand'


type User={
    id:string;
    name: string;
    email: string;
}

type AppState = {
    user: User | null;
    isAuthenticated: boolean;
    
  
    signup:(user:User)=>void;
    login: (user: User) => void;
    logout: () => void;
  
  };

  

  export const useAppStore = create<AppState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    cart: [],

    signup:(user)=>set({ user, isAuthenticated: true }),
    login: (user) => set({ user, isAuthenticated: true }),
    logout: () => set({ user: null, isAuthenticated: false }),
  
  }));