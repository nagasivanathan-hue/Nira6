import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Product from '@/models/Product';
import Warehouse from '@/models/Warehouse';
import Inventory from '@/models/Inventory';

export async function POST() {
  try {
    await dbConnect();

    // 1. Create Warehouses if not exist
    const defaultWarehouses = [
      {
        name: 'Mumbai Central Fulfillment Hub',
        code: 'WH-BOM-01',
        location: 'Saki Naka, Andheri East, Mumbai',
        city: 'Mumbai',
        zones: ['Zone A', 'Zone B', 'Zone C'],
        active: true
      },
      {
        name: 'Delhi NCR Logistics Center',
        code: 'WH-DEL-02',
        location: 'Okhla Industrial Area Phase III, New Delhi',
        city: 'Delhi',
        zones: ['Zone A', 'Zone B'],
        active: true
      }
    ];

    const warehouses = [];
    for (const wh of defaultWarehouses) {
      let existing = await Warehouse.findOne({ code: wh.code });
      if (!existing) {
        existing = await Warehouse.create(wh);
      }
      warehouses.push(existing);
    }

    const bomWh = warehouses[0];
    const delWh = warehouses[1];

    // 2. Fetch some products and update them with SKUs & variants if they don't have them
    const products = await Product.find({});
    
    // If no products, return message to add products first
    if (products.length === 0) {
      return NextResponse.json({ 
        message: 'No products found in DB. Please make sure you have mock products populated first.' 
      }, { status: 400 });
    }

    let seededCount = 0;
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const categoryCode = p.category.substring(0, 3).toUpperCase();
      const brandCode = p.brand.substring(0, 3).toUpperCase();
      
      const parentSku = `SKU-${brandCode}-${categoryCode}-${i + 1}`;
      
      // Update parent product
      p.sku = parentSku;
      p.variants = [
        {
          sku: `${parentSku}-LN`,
          name: `${p.name} - Like New`,
          price: p.price,
          stock: 5,
          attributes: { condition: 'Like New', color: 'Midnight Black' }
        },
        {
          sku: `${parentSku}-EX`,
          name: `${p.name} - Excellent`,
          price: Math.round(p.price * 0.9),
          stock: 3,
          attributes: { condition: 'Excellent', color: 'Steel Gray' }
        }
      ];
      await p.save();

      // 3. Create or Update Inventory for parent SKU
      let parentInv = await Inventory.findOne({ sku: parentSku });
      if (!parentInv) {
        parentInv = new Inventory({
          sku: parentSku,
          product: p._id,
          stockLevel: 8,
          lowStockThreshold: 2,
          warehouseStock: [
            {
              warehouse: bomWh._id,
              stock: 5,
              binLocation: `A-${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 10) + 1}`
            },
            {
              warehouse: delWh._id,
              stock: 3,
              binLocation: `B-${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 10) + 1}`
            }
          ],
          history: [
            {
              type: 'inward',
              quantity: 8,
              description: 'Initial seed stock inward cataloging',
              timestamp: new Date()
            }
          ]
        });
        await parentInv.save();
      }

      // Create or Update Inventory for Variant SKUs
      for (const variant of p.variants) {
        let varInv = await Inventory.findOne({ sku: variant.sku });
        if (!varInv) {
          varInv = new Inventory({
            sku: variant.sku,
            product: p._id,
            stockLevel: variant.stock,
            lowStockThreshold: 1,
            warehouseStock: [
              {
                warehouse: variant.sku.endsWith('LN') ? bomWh._id : delWh._id,
                stock: variant.stock,
                binLocation: `${variant.sku.endsWith('LN') ? 'A' : 'B'}-${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 5) + 1}`
              }
            ],
            history: [
              {
                type: 'inward',
                quantity: variant.stock,
                description: `Initial seed stock for variant ${variant.name}`,
                timestamp: new Date()
              }
            ]
          });
          await varInv.save();
        }
      }
      seededCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded e-commerce fulfillment data for ${seededCount} products.`,
      warehouses: warehouses.map(w => w.name)
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
