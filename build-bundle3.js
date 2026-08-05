// Update bundle_v3.js — replace hives module section with new one
const fs = require('fs');
const path = require('path');

const sourceBundle = path.join(__dirname, 'bundle_v3.js');
const outputPath = path.join(__dirname, 'js', 'app.bundle.v3.js');

let bundle = fs.readFileSync(sourceBundle, 'utf8');

// Find start of hives module
const hivesStart = bundle.indexOf('const hivesModule = {');
const hivesEnd = bundle.indexOf('BM.hives = hivesModule;') + 'BM.hives = hivesModule;'.length;

if (hivesStart < 0 || hivesEnd < 0) {
  console.error('hives module boundaries not found');
  process.exit(1);
}

// Read new hives.js
const newHives = fs.readFileSync(path.join(__dirname, 'js', 'modules', 'hives.js'), 'utf8');

console.log('Old hives range:', hivesStart, '-', hivesEnd);
console.log('Old hives size:', hivesEnd - hivesStart);
console.log('New hives size:', newHives.length);

// Replace
bundle = bundle.substring(0, hivesStart) + newHives + '\n' + bundle.substring(hivesEnd);

fs.writeFileSync(outputPath, bundle, 'utf8');
console.log('Updated bundle:', outputPath);
console.log('New size:', bundle.length, 'bytes');
console.log('Backfill count:', (bundle.match(/Backfill/g) || []).length);
console.log('Kaydediliyor count:', (bundle.match(/Kaydediliyor/g) || []).length);