const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

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

const mongoURI = process.env.MONGODB_URI;
console.log('Using URI:', mongoURI ? mongoURI.substring(0, 30) + '...' : 'undefined');

async function run() {
  try {
    console.log('Connecting with 5s timeout...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log('Connected to MongoDB.');
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const count = await Product.countDocuments();
    console.log('Total products in DB:', count);
    if (count > 0) {
      const samples = await Product.find().limit(3);
      console.log('Sample products:', JSON.stringify(samples, null, 2));
    }
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Done.');
  }
}

run();
