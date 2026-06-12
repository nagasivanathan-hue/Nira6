import dbConnect from './db/mongodb';
import AdminActivityLog from '@/models/AdminActivityLog';
import { getClientIp } from './rateLimit';

export async function logAdminActivity(
  adminEmail: string,
  action: string,
  details: string,
  req?: Request
) {
  try {
    let ipAddress = '127.0.0.1';
    let device = 'Unknown Device';

    if (req) {
      ipAddress = getClientIp(req);
      const userAgent = req.headers.get('user-agent') || '';
      device = userAgent.slice(0, 255) || 'Unknown Device';
    }

    await dbConnect();
    await AdminActivityLog.create({
      adminEmail,
      action,
      details,
      ipAddress,
      device,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Failed to log admin activity:', err);
  }
}
