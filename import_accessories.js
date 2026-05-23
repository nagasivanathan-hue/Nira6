const mongoose = require('mongoose');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

// Define Product schema STANDALONE
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

// Try multiple connection strings in sequence since one of the shards is blocked
const uris = [
  process.env.MONGODB_URI,
  'mongodb://nagasivanathan_db_user:QO5vd9T5kx3oxcyK@ac-qxjieyl-shard-00-00.aoddqnz.mongodb.net:27017/test?ssl=true&authSource=admin&directConnection=true',
  'mongodb://nagasivanathan_db_user:QO5vd9T5kx3oxcyK@ac-qxjieyl-shard-00-02.aoddqnz.mongodb.net:27017/test?ssl=true&authSource=admin&directConnection=true'
].filter(Boolean);

async function connectDB() {
  for (let i = 0; i < uris.length; i++) {
    console.log(`Connecting to database option #${i+1}...`);
    try {
      await mongoose.connect(uris[i], {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
      console.log(`Successfully connected via option #${i+1}!`);
      return true;
    } catch (err) {
      console.log(`Database option #${i+1} failed: ${err.message}`);
    }
  }
  return false;
}

// Main run function
async function run() {
  try {
    // 1. Read Excel spreadsheet
    console.log('Reading amazon_photography_accessories_1000.xlsx...');
    const wb = XLSX.readFile('amazon_photography_accessories_1000.xlsx');
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const rawData = XLSX.utils.sheet_to_json(ws);
    console.log(`Found ${rawData.length} rows in Excel spreadsheet.`);

    const validGrades = ['Like New', 'Excellent', 'Good', 'Fair'];
    const productsToInsert = [];
    const mockProductsArray = [];

    // Process rows
    rawData.forEach((row, i) => {
      if (!row.title || !row.price) {
        return; // Skip empty rows
      }

      // Title & Name
      const name = String(row.title).trim();

      // Brand normalization
      let brand = String(row.brand || 'Generic').trim();
      if (brand === 'Generic') {
        const firstWord = name.split(' ')[0];
        if (firstWord && firstWord.length > 2) {
          brand = firstWord.replace(/[^a-zA-Z0-9]/g, '');
        }
      }
      // Standardize common brands capitalization
      if (brand.toUpperCase() === 'DIGITEK') brand = 'Digitek';
      if (brand.toUpperCase() === 'ULANZI') brand = 'ULANZI';
      if (brand.toUpperCase() === 'NEEWER') brand = 'Neewer';
      if (brand.toUpperCase() === 'HIFFIN') brand = 'Hiffin';

      // Price parsing
      const cleanedPrice = String(row.price).replace(/[^0-9.]/g, '');
      let price = Math.round(parseFloat(cleanedPrice)) || 1499;

      // Discount & Original Price
      let discount = 25;
      if (row.discount) {
        const discMatch = String(row.discount).match(/([0-9]+)/);
        if (discMatch) discount = parseInt(discMatch[1]);
      }
      if (discount <= 0 || discount >= 100) discount = 25;
      const originalPrice = Math.round(price / (1 - discount / 100));

      // Rating parsing
      let rating = 4.2;
      if (row.rating) {
        const ratMatch = String(row.rating).match(/([0-9.]+)/);
        if (ratMatch) rating = parseFloat(ratMatch[1]);
      }
      if (rating < 1 || rating > 5) rating = 4.2;

      // Review count parsing
      let reviewCount = 28 + (i % 17) * 9;
      if (row.reviews) {
        const revMatch = String(row.reviews).replace(/[^0-9]/g, '');
        if (revMatch) reviewCount = parseInt(revMatch);
      }

      // Category detection
      const lowercaseTitle = name.toLowerCase();
      let category = 'Accessories'; // Default
      if (lowercaseTitle.includes('light') || lowercaseTitle.includes('led') || lowercaseTitle.includes('flash') || lowercaseTitle.includes('softbox') || lowercaseTitle.includes('ringlight') || lowercaseTitle.includes('reflector') || lowercaseTitle.includes('lighting') || lowercaseTitle.includes('box')) {
        category = 'Lighting';
      } else if (lowercaseTitle.includes('mic') || lowercaseTitle.includes('microphone') || lowercaseTitle.includes('audio') || lowercaseTitle.includes('sound') || lowercaseTitle.includes('lavalier') || lowercaseTitle.includes('wireless microphone') || lowercaseTitle.includes('voice')) {
        category = 'Audio';
      } else if (lowercaseTitle.includes('gimbal') || lowercaseTitle.includes('stabilizer')) {
        category = 'Gimbals';
      } else if (lowercaseTitle.includes('lens') || lowercaseTitle.includes('aperture')) {
        category = 'Lenses';
      } else if (lowercaseTitle.includes('drone') || lowercaseTitle.includes('quadcopter')) {
        category = 'Drones';
      } else if (lowercaseTitle.includes('camera') || lowercaseTitle.includes('gopro')) {
        category = 'Cameras';
      }

      // Grade & condition score allocation
      const gradeIndex = i % validGrades.length;
      const grade = validGrades[gradeIndex];
      let conditionScore = 80;
      if (grade === 'Like New') conditionScore = 95 + (i % 5);
      else if (grade === 'Excellent') conditionScore = 86 + (i % 8);
      else if (grade === 'Good') conditionScore = 75 + (i % 10);
      else if (grade === 'Fair') conditionScore = 60 + (i % 12);

      // Specs map for DB
      const specs = new Map();
      specs.set('source', 'amazon_accessories_excel');
      specs.set('Sponsored', String(row.sponsored || 'No'));
      specs.set('Bestseller', String(row.bestseller || 'No'));
      specs.set('Prime Delivery', String(row.prime || 'No'));
      if (row.delivery) specs.set('Delivery Details', String(row.delivery).trim());

      // Specs record for typescript mockData
      const specsRecord = {
        'source': 'amazon_accessories_excel',
        'Sponsored': String(row.sponsored || 'No'),
        'Bestseller': String(row.bestseller || 'No'),
        'Prime Delivery': String(row.prime || 'No')
      };
      if (row.delivery) specsRecord['Delivery Details'] = String(row.delivery).trim();

      const image = row.image || 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=500';

      // 1. Data for MongoDB
      productsToInsert.push({
        name,
        brand,
        price,
        originalPrice,
        discount,
        rating,
        reviewCount,
        category,
        image,
        grade,
        conditionScore,
        emiAvailable: price > 2000,
        featured: row.bestseller === 'Yes' || (i % 15 === 0),
        trending: row.sponsored === 'Yes' || (i % 20 === 0),
        specs,
        stock: (i % 5) + 1,
        description: `${name}. Professional grade creator gear, thoroughly checked and certified by NIRA6 experts.`,
        seller: 'NIRA6 Certified',
        warranty: price > 5000 ? '12 Months NIRA6 Warranty' : '6 Months NIRA6 Warranty'
      });

      // 2. Data for TypeScript Mock File (src/lib/accessoriesMockData.ts)
      // Matches the Product interface in src/types/index.ts
      const gradeKeyMap = {
        'Like New': 'A+',
        'Excellent': 'A',
        'Good': 'B',
        'Fair': 'C'
      };
      const typeScriptMockGrade = gradeKeyMap[grade] || 'A';

      mockProductsArray.push({
        id: `excel_${i + 1}`,
        name,
        brand,
        category: category.toLowerCase(), // Frontend mock categories are lowercase
        price,
        originalPrice,
        discount,
        image,
        images: [image],
        condition: grade, // Frontend Product interface expects 'condition' as the grade name
        grade: typeScriptMockGrade, // Frontend Product interface expects 'grade' as A+, A, B, C etc.
        warranty: price > 5000 ? '12 months' : '6 months',
        rating,
        reviewCount,
        sellerName: 'NIRA6 Certified',
        sellerRating: 4.8,
        specs: specsRecord,
        description: `${name}. Professional grade creator gear, thoroughly checked and certified by NIRA6 experts.`,
        emiAvailable: price > 2000,
        inStock: true,
        featured: row.bestseller === 'Yes' || (i % 15 === 0),
        trending: row.sponsored === 'Yes' || (i % 20 === 0),
        createdAt: new Date().toISOString().split('T')[0]
      });
    });

    // 2. Write src/lib/accessoriesMockData.ts
    console.log('Generating src/lib/accessoriesMockData.ts...');
    const mockFilePath = path.join(__dirname, 'src', 'lib', 'accessoriesMockData.ts');
    
    // Ensure parent directories exist
    const mockDir = path.dirname(mockFilePath);
    if (!fs.existsSync(mockDir)) {
      fs.mkdirSync(mockDir, { recursive: true });
    }

    const fileContent = `/* ═══════════════════════════════════════════════════════════
   NIRA6 — Imported Accessories Mock Data
   Automatically generated from amazon_photography_accessories_1000.xlsx
   ═══════════════════════════════════════════════════════════ */

import type { Product } from '@/types';

export const accessoriesMockProducts: Product[] = ${JSON.stringify(mockProductsArray, null, 2)};
`;

    fs.writeFileSync(mockFilePath, fileContent, 'utf8');
    console.log(`Generated ${mockProductsArray.length} items in src/lib/accessoriesMockData.ts!`);

    // 3. Connect to DB and insert
    console.log('Connecting to database to seed imported products...');
    const connected = await connectDB();
    if (connected) {
      // Clear previous Excel imports
      console.log('Clearing old imported Excel accessories from MongoDB...');
      const deleteResult = await Product.deleteMany({ 'specs.source': 'amazon_accessories_excel' });
      console.log(`Cleared ${deleteResult.deletedCount} old Excel products.`);

      // Seed
      console.log(`Inserting ${productsToInsert.length} new accessories into MongoDB...`);
      const insertResult = await Product.insertMany(productsToInsert);
      console.log(`Successfully seeded ${insertResult.length} products to MongoDB!`);
    } else {
      console.warn('Could not connect to MongoDB Atlas cluster. Database seed was skipped, but mock data was successfully generated.');
    }

  } catch (err) {
    console.error('Fatal error during accessories import:', err);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('MongoDB disconnected.');
    }
    console.log('All done!');
  }
}

run();
