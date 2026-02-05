'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { isAdminEmail, isAuthorizedEmail } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthorized: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isAuthorized: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const isAdmin = isAdminEmail(user?.email);
  const isAuthorized = isAuthorizedEmail(user?.email);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin,
      isAuthorized,
      signInWithGoogle, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
