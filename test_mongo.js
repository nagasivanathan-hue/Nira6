const mongoose = require('mongoose');

const uris = [
  // 1. Excluding shard-00-01 from replica set
  'mongodb://nagasivanathan_db_user:QO5vd9T5kx3oxcyK@ac-qxjieyl-shard-00-00.aoddqnz.mongodb.net:27017,ac-qxjieyl-shard-00-02.aoddqnz.mongodb.net:27017/test?ssl=true&replicaSet=atlas-tasodn-shard-0&authSource=admin',
  // 2. Direct connection to shard-00-00
  'mongodb://nagasivanathan_db_user:QO5vd9T5kx3oxcyK@ac-qxjieyl-shard-00-00.aoddqnz.mongodb.net:27017/test?ssl=true&authSource=admin&directConnection=true',
  // 3. Direct connection to shard-00-02
  'mongodb://nagasivanathan_db_user:QO5vd9T5kx3oxcyK@ac-qxjieyl-shard-00-02.aoddqnz.mongodb.net:27017/test?ssl=true&authSource=admin&directConnection=true'
];

async function testUri(uri, index) {
  console.log(`\n--- Testing URI #${index + 1} ---`);
  console.log('URI:', uri.substring(0, 50) + '...');
  try {
    const conn = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    }).asPromise();
    console.log(`SUCCESS on URI #${index + 1}!`);
    const db = conn.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    await conn.close();
    return true;
  } catch (err) {
    console.error(`FAILED on URI #${index + 1}:`, err.message);
    return false;
  }
}

async function run() {
  for (let i = 0; i < uris.length; i++) {
    const success = await testUri(uris[i], i);
    if (success) {
      console.log(`\nRecommended Connection String found: ${uris[i]}`);
      break;
    }
  }
  process.exit(0);
}

run();
