import jwt from 'jsonwebtoken';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';

export async function verifyAuth(req: Request) {
  await dbConnect();
  
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await User.findById(decoded.id).select('-password');
    return user;
  } catch {
    return null;
  }
}

export function generateToken(id: string) {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
}
