
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.resolve(__dirname, '../../Price_Agriculture_commodities_Week.csv');
const outputPath = path.resolve(__dirname, '../data/marketPrices.json');

const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split('\n');

const data = {};

// Skip header
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Handle commas inside quotes if any, but looking at the CSV head, it looks like simple comma separation
  // State,District,Market,Commodity,Variety,Grade,Arrival_Date,Min Price,Max Price,Modal Price
  const cols = line.split(',');
  if (cols.length < 10) continue;
  
  const state = cols[0].trim();
  const commodity = cols[3].trim();
  const modalPriceStr = cols[9].trim();
  const modalPrice = parseFloat(modalPriceStr);
  
  if (isNaN(modalPrice) || modalPrice <= 0) continue;
  
  if (!data[state]) {
    data[state] = {};
  }
  if (!data[state][commodity]) {
    data[state][commodity] = { sum: 0, count: 0 };
  }
  
  data[state][commodity].sum += modalPrice;
  data[state][commodity].count += 1;
}

const finalData = {};
for (const state in data) {
  finalData[state] = {};
  for (const commodity in data[state]) {
    const avgQuintal = data[state][commodity].sum / data[state][commodity].count;
    // Divide by 100 to convert Quintal to Kg, round to 1 decimal
    const avgKg = parseFloat((avgQuintal / 100).toFixed(1));
    finalData[state][commodity] = avgKg;
  }
}

// Make sure directory exists
if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
console.log('Successfully processed market data to ' + outputPath);

