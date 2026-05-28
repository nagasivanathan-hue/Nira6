import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Warehouse from '@/models/Warehouse';

export async function GET() {
  try {
    await dbConnect();
    const warehouses = await Warehouse.find({ active: true });
    return NextResponse.json(warehouses);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
