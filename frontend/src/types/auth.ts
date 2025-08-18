import { SupabaseClient, User } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  supabase: SupabaseClient;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  updateProfile: (updates: any) => Promise<{ data: any; error: any }>;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  currentRole?: string;
  targetRole?: string;
  experience: 'entry' | 'mid' | 'senior' | 'lead';
  createdAt: Date;
  updatedAt?: Date;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResponse<T = any> {
  data: T | null;
  error: AuthError | null;
}
