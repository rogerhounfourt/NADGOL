import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, USERS } from '@/lib/data';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  showIntro: boolean;
  setShowIntro: (v: boolean) => void;
  activeSection: string;
  setActiveSection: (s: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      isAuthenticated: !!currentUser,
      showIntro,
      setShowIntro,
      activeSection,
      setActiveSection,
      sidebarOpen,
      setSidebarOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
