import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Inventory from '@/models/Inventory';
import Product from '@/models/Product';
import Warehouse from '@/models/Warehouse';
import { verifyAuth } from '@/lib/auth/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const lowStockOnly = searchParams.get('lowStock') === 'true';

    // Populate products
    let query = Inventory.find({}).populate({ path: 'product', model: Product });
    const items = await query;

    let filtered = items;
    if (lowStockOnly) {
      filtered = items.filter(item => item.stockLevel <= item.lowStockThreshold);
    }

    return NextResponse.json(filtered);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const { sku, warehouseId, changeQuantity, type, description } = await req.json();

    if (!sku || !warehouseId || changeQuantity === undefined) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    const inventory = await Inventory.findOne({ sku });
    if (!inventory) {
      return NextResponse.json({ message: 'SKU not found in inventory' }, { status: 404 });
    }

    const change = Number(changeQuantity);

    // Update parent stock
    inventory.stockLevel = Math.max(0, inventory.stockLevel + change);

    // Update warehouse stock
    let whStock = inventory.warehouseStock.find(
      (w: any) => w.warehouse.toString() === warehouseId
    );

    if (whStock) {
      whStock.stock = Math.max(0, whStock.stock + change);
    } else {
      // Allocate new bin
      const zones = ['A', 'B', 'C'];
      const randomBin = `${zones[Math.floor(Math.random() * zones.length)]}-${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 10) + 1}`;
      inventory.warehouseStock.push({
        warehouse: warehouseId,
        stock: Math.max(0, change),
        binLocation: randomBin
      });
    }

    // Add to logs
    inventory.history.push({
      type: type || 'adjustment',
      quantity: Math.abs(change),
      description: description || 'Manual stock adjustment by admin',
      timestamp: new Date()
    });

    await inventory.save();

    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully.',
      inventory
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
