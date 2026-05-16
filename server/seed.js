import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const mockProducts = [
  {
    name: "Sony A7 IV Mirrorless Camera",
    brand: "Sony",
    price: 185000,
    category: "Cameras",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
    grade: "Like New",
    conditionScore: 98,
    featured: true,
    trending: true,
    description: "The Sony A7 IV is the ultimate hybrid camera, offering incredible 33MP stills and 4K 60p video performance.",
    specs: { "Sensor": "33MP Full-Frame Exmor R CMOS", "ISO": "100-51200", "Video": "4K 60p 10-bit" }
  },
  {
    name: "DJI Mavic 3 Pro",
    brand: "DJI",
    price: 165000,
    category: "Drones",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800",
    grade: "Excellent",
    conditionScore: 92,
    featured: true,
    description: "Capture stunning aerial footage with the triple-camera system of the DJI Mavic 3 Pro.",
    specs: { "Flight Time": "43 mins", "Range": "15km", "Camera": "Hasselblad 4/3 CMOS" }
  },
  {
    name: "Canon RF 24-70mm f/2.8L IS USM",
    brand: "Canon",
    price: 145000,
    category: "Lenses",
    image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&q=80&w=800",
    grade: "Like New",
    conditionScore: 96,
    trending: true,
    specs: { "Mount": "Canon RF", "Aperture": "f/2.8", "Type": "Standard Zoom" }
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    await Product.deleteMany({});
    console.log('🗑️ Existing products cleared');

    await Product.insertMany(mockProducts);
    console.log('🌱 Mock products seeded successfully');

    process.exit();
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
}

seedDB();
