// Update bundle with ui.js changes
const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'js', 'app.bundle.v3.js');
const newUiPath = path.join(__dirname, 'js', 'core', 'ui.js');
const outputPath = path.join(__dirname, 'js', 'app.bundle.v3.js');

let bundle = fs.readFileSync(sourcePath, 'utf8');
const newUi = fs.readFileSync(newUiPath, 'utf8');

// Find ui.js start marker
const uiStart = bundle.indexOf('/* ===== js/core/ui.js ===== */');
if (uiStart < 0) {
  console.log('ui.js marker not found, skipping');
  process.exit(0);
}

// Find next marker after ui
const searchFrom = uiStart + '/* ===== js/core/ui.js ===== */'.length;
const nextMarker = bundle.indexOf('/* =====', searchFrom);
console.log('ui range:', uiStart, '-', nextMarker);
console.log('Old ui size:', nextMarker - uiStart);

bundle = bundle.substring(0, uiStart) +
          '/* ===== js/core/ui.js ===== */\n' +
          newUi + '\n\n' +
          bundle.substring(nextMarker);

fs.writeFileSync(outputPath, bundle, 'utf8');
console.log('Updated');
console.log('Backfill count:', (bundle.match(/Backfill/g) || []).length);
console.log('Kaydediliyor count:', (bundle.match(/Kaydediliyor/g) || []).length);