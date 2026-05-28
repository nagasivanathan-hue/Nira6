import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  courierPartner: { 
    type: String, 
    enum: ['BlueDart', 'Delhivery', 'DHL', 'FedEx', 'NIRA Express'], 
    default: 'NIRA Express' 
  },
  trackingNumber: { type: String, required: true },
  estimatedDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date },
  shippingCost: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'failed'], 
    default: 'dispatched' 
  },
  routeHistory: [{
    status: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  deliveryOtp: { type: String },
  otpVerified: { type: Boolean, default: false },
  codAmount: { type: Number, default: 0 },
  codCollected: { type: Boolean, default: false }
}, { timestamps: true });

const Delivery = mongoose.models.Delivery || mongoose.model('Delivery', deliverySchema);
export default Delivery;
