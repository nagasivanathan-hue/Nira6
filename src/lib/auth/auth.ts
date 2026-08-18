import jwt from 'jsonwebtoken';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';
import { createClient as createSupabaseClient } from '@/lib/supabase/server';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET environment variable must be set and be at least 32 characters long.');
  }
  return secret;
};

export async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }

  // 1. Try Custom JWT validation (MongoDB authentication)
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string };
    await dbConnect();
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      return user;
    }
  } catch {
    // Custom JWT failed, fall through to Supabase token check
  }

  // 2. Try Supabase session validation
  try {
    const supabase = await createSupabaseClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser(token);
    
    if (supabaseUser && supabaseUser.email) {
      await dbConnect();
      let user = await User.findOne({ email: supabaseUser.email }).select('-password');
      const supabaseRole = supabaseUser.user_metadata?.role || 'user';
      if (!user) {
        // Create MongoDB user profile on first Google/Supabase Sign In
        user = await User.create({
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0] || 'Google User',
          email: supabaseUser.email,
          password: 'google-auth-placeholder-password',
          role: supabaseRole,
          phone: supabaseUser.user_metadata?.phone || undefined,
          walletBalance: 0,
        });
      } else {
        let modified = false;
        if (supabaseUser.user_metadata?.role && user.role !== supabaseUser.user_metadata.role) {
          user.role = supabaseUser.user_metadata.role;
          modified = true;
        }
        if (supabaseUser.user_metadata?.phone && user.phone !== supabaseUser.user_metadata.phone) {
          user.phone = supabaseUser.user_metadata.phone;
          modified = true;
        }
        if (modified) {
          await user.save();
        }
      }
      return user;
    }
  } catch {
    // Supabase validation failed
  }

  return null;
}

export function generateToken(id: string) {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: '15m',
  });
}

export function generateRefreshToken(id: string) {
  return jwt.sign({ id, type: 'refresh' }, getJwtSecret(), {
    expiresIn: '7d',
  });
}

export async function verifyAdmin(req: Request) {
  const user = await verifyAuth(req);
  if (!user) {
    return null;
  }
  // Exclusively nira6studio@gmail.com is owner/admin
  if (user.email === 'nira6studio@gmail.com') {
    return user;
  }
  // Staff accounts must be explicitly approved by owner
  if (['admin', 'super_admin', 'order_manager', 'support_agent'].includes(user.role) && user.adminApprovedByOwner) {
    return user;
  }
  return null;
}
