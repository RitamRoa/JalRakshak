import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for active session and set user
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      // You would typically check user roles in your database
      // This is a placeholder
      setIsAdmin(data.session?.user?.email === 'admin@example.com');
      
      setIsLoading(false);
    };
    
    fetchSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAdmin(session?.user?.email === 'admin@example.com');
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Handle demo admin credentials
      if (email === 'admin@example.com' && password === 'password123') {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        if (error) {
          // If Supabase auth fails, create a session manually for demo
          const demoUser = { 
            email, 
            id: 'demo-admin', 
            role: 'admin',
            user_metadata: { role: 'admin' },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
          } as unknown as User;
          
          const demoSession = { 
            user: demoUser,
            access_token: 'demo-token',
            refresh_token: 'demo-refresh-token'
          } as Session;
          
          setUser(demoUser);
          setSession(demoSession);
          setIsAdmin(true);
          return { error: null };
        }
        
        // If Supabase auth succeeds, update the user with admin role
        if (data.user) {
          const adminUser = {
            ...data.user,
            user_metadata: { ...data.user.user_metadata, role: 'admin' }
          };
          setUser(adminUser);
          setSession(data.session);
          setIsAdmin(true);
        }
        
        return { error: null };
      }
      
      // For non-demo users, use normal Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        return { error };
      }
      
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        // Check if user has admin role in metadata
        setIsAdmin(data.user.user_metadata?.role === 'admin');
      }
      
      return { error: null };
    } catch (err) {
      console.error('Error during sign in:', err);
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};