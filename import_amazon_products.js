const mongoose = require('mongoose');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Dynamically load env vars from .env.local if it exists
if (fs.existsSync(path.join(__dirname, '.env.local'))) {
  const envConfig = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = (match[2] || '').trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

const mongoURI = process.env.MONGODB_URI || 'mongodb://nagasivanathan_db_user:QO5vd9T5kx3oxcyK@ac-qxjieyl-shard-00-00.aoddqnz.mongodb.net:27017,ac-qxjieyl-shard-00-01.aoddqnz.mongodb.net:27017,ac-qxjieyl-shard-00-02.aoddqnz.mongodb.net:27017/test?ssl=true&replicaSet=atlas-tasodn-shard-0&authSource=admin&appName=nira6';

// Define Product schema to match src/models/Product.ts
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
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
  description: { type: String },
  seller: { type: String, default: 'NIRA6 Certified' },
  warranty: { type: String, default: '6 Months NIRA6 Warranty' }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected successfully!');

    // Read CSV spreadsheet
    console.log('Reading amazon_products.csv...');
    const wb = XLSX.readFile('amazon_products.csv');
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const rawData = XLSX.utils.sheet_to_json(ws);
    console.log(`Found ${rawData.length} rows in the CSV.`);

    const validGrades = ['Like New', 'Excellent', 'Good', 'Fair'];
    const productsToInsert = [];

    // Common brands to detect
    const knownBrands = [
      'Sony', 'Canon', 'Nikon', 'Fujifilm', 'Panasonic', 'Olympus', 
      'GoPro', 'DJI', 'Kodak', 'Insta360', 'Sjcam', 'Xiaomi'
    ];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row.title || !row.price) {
        continue; // Skip empty rows
      }

      // 1. Name
      const name = String(row.title).trim();

      // 2. Brand detection
      let brand = 'Generic';
      const lowercaseTitle = name.toLowerCase();
      for (const kb of knownBrands) {
        if (lowercaseTitle.includes(kb.toLowerCase())) {
          brand = kb;
          break;
        }
      }
      if (brand === 'Generic') {
        // If not matched, use first word of title
        const firstWord = name.split(' ')[0];
        if (firstWord && firstWord.length > 2) {
          brand = firstWord.replace(/[^a-zA-Z0-9]/g, '');
        }
      }

      // 3. Price parsing
      let price = 0;
      if (typeof row.price === 'number') {
        price = row.price;
      } else {
        const cleanedPrice = String(row.price).replace(/[^0-9.]/g, '');
        price = parseFloat(cleanedPrice) || 0;
      }

      if (price <= 0) {
        // Default to a realistic value if invalid
        price = 15000;
      }

      // 4. Category detection
      let category = 'Cameras'; // default
      if (lowercaseTitle.includes('lens')) {
        category = 'Lenses';
      } else if (lowercaseTitle.includes('tripod') || lowercaseTitle.includes('stand') || lowercaseTitle.includes('mount') || lowercaseTitle.includes('bag') || lowercaseTitle.includes('case')) {
        category = 'Accessories';
      } else if (lowercaseTitle.includes('card') || lowercaseTitle.includes('memory') || lowercaseTitle.includes('battery') || lowercaseTitle.includes('charger')) {
        category = 'Accessories';
      } else if (lowercaseTitle.includes('microphone') || lowercaseTitle.includes('mic') || lowercaseTitle.includes('audio') || lowercaseTitle.includes('sound')) {
        category = 'Audio';
      }

      // 5. Image
      const image = row.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500';

      // 6. Grade and Condition distribution
      const gradeIndex = i % validGrades.length;
      const grade = validGrades[gradeIndex];
      let conditionScore = 80;
      if (grade === 'Like New') conditionScore = 95 + (i % 5);
      else if (grade === 'Excellent') conditionScore = 86 + (i % 8);
      else if (grade === 'Good') conditionScore = 75 + (i % 10);
      else if (grade === 'Fair') conditionScore = 60 + (i % 12);

      // 7. Specs mapping
      const specs = new Map();
      if (row.specs) {
        specs.set('Model Details', String(row.specs).trim());
      }
      specs.set('Verification Status', 'NIRA6 Certified');

      // 8. Description
      const description = row.specs ? `${String(row.specs).trim()}. Certified premium-grade gear, thoroughly verified and performance-tested by NIRA6 technicians.` : `Premium high-performance creator gear. Rigorously inspected and certified by NIRA6 experts.`;

      productsToInsert.push({
        name,
        brand,
        price,
        originalPrice: Math.round(price * 1.33),
        discount: 25,
        rating: parseFloat((4.0 + (i % 10) / 10).toFixed(1)),
        reviewCount: 12 + (i % 13) * 11,
        emiAvailable: i % 3 === 0,
        category,
        image,
        grade,
        conditionScore,
        featured: i % 8 === 0, // Mark every 8th product featured
        trending: i % 12 === 0, // Mark every 12th product trending
        specs,
        stock: (i % 4) + 1,
        description,
        seller: 'NIRA6 Certified',
        warranty: '6 Months NIRA6 Warranty'
      });
    }

    console.log(`Prepared ${productsToInsert.length} products to insert.`);
    
    // Clear existing products
    console.log('Clearing existing products in database...');
    await Product.deleteMany({});
    console.log('Existing products cleared!');

    // Perform bulk insertion
    const result = await Product.insertMany(productsToInsert);
    console.log(`Successfully imported ${result.length} products to MongoDB!`);

  } catch (error) {
    console.error('Fatal error during import:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

run();
