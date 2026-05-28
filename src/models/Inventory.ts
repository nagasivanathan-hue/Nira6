import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  stockLevel: { type: Number, required: true, default: 0 },
  lowStockThreshold: { type: Number, default: 2 },
  warehouseStock: [{
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    stock: { type: Number, default: 0 },
    binLocation: { type: String, required: true } // Zone-Shelf-Bin, e.g. A-12-3
  }],
  history: [{
    type: { type: String, enum: ['inward', 'outward', 'adjustment', 'return'], required: true },
    quantity: { type: Number, required: true },
    description: { type: String, required: true },
    referenceId: { type: String }, // e.g., OrderId or RestockRef
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
export default Inventory;
