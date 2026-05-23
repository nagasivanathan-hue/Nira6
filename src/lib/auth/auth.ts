import jwt from 'jsonwebtoken';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';

export async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string };
    
    try {
      await dbConnect();
      const user = await User.findById(decoded.id).select('-password');
      if (user) return user;
    } catch (dbErr: any) {
      console.warn("Database error in verifyAuth, using mock user fallback:", dbErr.message);
    }
    
    // Fallback: If DB failed or user not found in DB but JWT is valid, return mock user
    if (decoded.id === 'mock_client_id') {
      return { _id: 'mock_client_id', name: 'Client User', email: 'client@nira.com', role: 'client' };
    }
    if (decoded.id === 'mock_creator_id') {
      return { _id: 'mock_creator_id', name: 'Creator User', email: 'creator@nira.com', role: 'creator' };
    }
    if (decoded.id === 'mock_admin_id') {
      return { _id: 'mock_admin_id', name: 'Admin User', email: 'admin@nira.com', role: 'admin' };
    }
    return null;
  } catch {
    return null;
  }
}

export function generateToken(id: string) {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
}
