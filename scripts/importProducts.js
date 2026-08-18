const fs = require('fs');
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        const value = values.join('=').replace(/^"|"$/g, '').trim();
        process.env[key.trim()] = value;
      }
    }
  });
}
const mongoose = require('mongoose');
const xlsx = require('xlsx');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  images: [{ type: String }],
  grade: { type: String, enum: ['Like New', 'Excellent', 'Good', 'Fair'], required: true },
  conditionScore: { type: Number, min: 0, max: 100 },
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  originalPrice: { type: Number },
  discount: { type: Number },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 10 },
  emiAvailable: { type: Boolean, default: false },
  specs: { type: Map, of: String },
  stock: { type: Number, default: 1 },
  sku: { type: String, unique: true, sparse: true },
  weight: { type: Number, default: 1000 },
  description: { type: String },
  affiliateUrl: { type: String },
  seller: { type: String, default: 'NIRA6 Certified' },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function importData() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined in .env.local');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const filePath = 'public/assets/amazon-products-listings-scraper-affiliate.xlsx';
    console.log('Reading Excel file...');
    const wb = xlsx.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);

    console.log(`Found ${data.length} records. Processing...`);

    let count = 0;
    let updated = 0;
    for (const row of data) {
      if (!row.product_name) continue;

      const name = row.product_name || 'Unknown Product';
      const brand = row.brand || 'Generic';
      const priceStr = String(row.price || '0').replace(/[^0-9.]/g, '');
      const price = parseFloat(priceStr) || 0;
      
      const mainImage = row.main_image || 'https://via.placeholder.com/500';
      
      let images = [];
      if (row.images) {
        images = row.images.split(/\r?\n/).map(img => img.trim()).filter(img => img);
      }

      let category = 'Photography';
      const lowerName = name.toLowerCase();
      if (lowerName.includes('camera')) category = 'Cameras';
      else if (lowerName.includes('lens')) category = 'Lenses';
      else if (lowerName.includes('drone')) category = 'Drones';
      else if (lowerName.includes('light')) category = 'Lighting';
      else if (lowerName.includes('gimbal')) category = 'Gimbals';

      const sku = row.asin || `SKU-${Math.random().toString(36).substring(7)}`;

      const specs = new Map();
      if (row.color) specs.set('Color', String(row.color));
      if (row.model_number) specs.set('Model Number', String(row.model_number));
      if (row.shipping_info) specs.set('Shipping Info', String(row.shipping_info));
      if (row.badges) specs.set('Badges', String(row.badges));
      if (row.weight_unit) specs.set('Weight Unit', String(row.weight_unit));
      if (row.currency) specs.set('Currency', String(row.currency));
      if (row.availability) specs.set('Availability', String(row.availability));

      const productData = {
        name,
        brand,
        price,
        category,
        image: mainImage,
        images,
        grade: 'Like New',
        conditionScore: 100,
        rating: parseFloat(row.rating) || 4.5,
        reviewCount: parseInt(String(row.review_count).replace(/[^0-9]/g, ''), 10) || 0,
        sku,
        weight: parseFloat(row.weight) || 1000,
        description: row.features || '',
        affiliateUrl: row['product link'] || '',
        seller: row.seller_name || 'Amazon Affiliate',
        stock: parseInt(row.availability, 10) || 100,
        specs
      };

      // Upsert based on SKU
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        await Product.updateOne({ sku }, { $set: productData });
        updated++;
      } else {
        const product = new Product(productData);
        await product.save();
        count++;
      }
    }

    console.log(`Successfully added ${count} products and updated ${updated} products!`);
    process.exit(0);
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}

importData();
