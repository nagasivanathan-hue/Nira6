'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchWishlist } from '@/store/wishlistSlice';
import { createClient } from '@/lib/supabase/client';
import { setAuth } from '@/store/authSlice';

export default function StoreInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const supabase = createClient();
    
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch(setAuth({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          phone: session.user.phone || '',
          avatar: session.user.user_metadata.avatar_url || '',
          role: 'customer',
          walletBalance: 0,
          verified: !!session.user.email_confirmed_at
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch(setAuth({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          phone: session.user.phone || '',
          avatar: session.user.user_metadata.avatar_url || '',
          role: 'customer',
          walletBalance: 0,
          verified: !!session.user.email_confirmed_at
        }));
      } else {
        dispatch(setAuth(null));
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  return <>{children}</>;
}
