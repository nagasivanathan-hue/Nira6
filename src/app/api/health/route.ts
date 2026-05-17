import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      message: error.message
    }, { status: 500 });
  }
}
