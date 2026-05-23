const XLSX = require('xlsx');

try {
  const wb = XLSX.readFile('amazon_photography_accessories_1000.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws);
  
  console.log('Total Rows:', data.length);
  
  const brands = new Set();
  const prices = [];
  const ratings = new Set();
  let missingImages = 0;
  let missingTitles = 0;
  let missingPrices = 0;
  
  const sampleRows = [];
  
  data.forEach((row, i) => {
    if (row.brand) brands.add(row.brand);
    if (row.price) {
      const p = parseFloat(String(row.price).replace(/[^0-9.]/g, ''));
      if (!isNaN(p)) prices.push(p);
      else missingPrices++;
    } else {
      missingPrices++;
    }
    if (row.rating) ratings.add(row.rating);
    if (!row.image) missingImages++;
    if (!row.title) missingTitles++;
    
    if (i < 5) {
      sampleRows.push(row);
    }
  });
  
  console.log('\nUnique Brands Count:', brands.size);
  console.log('Unique Brands (sample):', Array.from(brands).slice(0, 20));
  console.log('\nPrice Range:');
  if (prices.length > 0) {
    console.log('  Min Price:', Math.min(...prices));
    console.log('  Max Price:', Math.max(...prices));
    console.log('  Avg Price:', prices.reduce((a, b) => a + b, 0) / prices.length);
  } else {
    console.log('  No valid prices found');
  }
  console.log('\nRatings sample:', Array.from(ratings).slice(0, 10));
  console.log('\nMissing values:');
  console.log('  Missing Titles:', missingTitles);
  console.log('  Missing Prices:', missingPrices);
  console.log('  Missing Images:', missingImages);
  
  console.log('\nSample Rows:');
  console.log(JSON.stringify(sampleRows, null, 2));
} catch (err) {
  console.error(err);
}
