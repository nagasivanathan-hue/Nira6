const XLSX = require('xlsx');

try {
  const wb = XLSX.readFile('amazon_photography_accessories_1000.xlsx');
  console.log('Sheets:', wb.SheetNames);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws);
  console.log('Total rows:', data.length);
  if (data.length > 0) {
    console.log('First row:', JSON.stringify(data[0], null, 2));
    console.log('Keys in first row:', Object.keys(data[0]));
  }
} catch (err) {
  console.error(err);
}
