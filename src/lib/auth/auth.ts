import jwt from 'jsonwebtoken';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';

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
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string };

    await dbConnect();
    const user = await User.findById(decoded.id).select('-password');
    return user || null;
  } catch {
    return null;
  }
}

export function generateToken(id: string) {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: '30d',
  });
}
