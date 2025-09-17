import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { AuthContextType, User as UserType } from '../types';
import {
  createUser,
  signInUser,
  signInWithGoogle,
  signOutUser,
  onAuthStateChange,
  getUserData,
  ensureUserDocument
} from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          // Ensure user document exists and get user data
          const userData = await ensureUserDocument(firebaseUser);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to basic user object if Firestore fails
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            preferences: {
              workHours: '9-5 EST',
              communicationStyle: 'async',
              skills: []
            },
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      await signInUser(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      await createUser(email, password, displayName);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogleAuth = async (): Promise<void> => {
    try {
      await signInWithGoogle();
    } catch (error) {
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await signOutUser();
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle: signInWithGoogleAuth,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
