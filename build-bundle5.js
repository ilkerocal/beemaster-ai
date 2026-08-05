// Append frames.js to bundle
const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'js', 'app.bundle.v3.js');
const framesPath = path.join(__dirname, 'js', 'modules', 'frames.js');
const outputPath = path.join(__dirname, 'js', 'app.bundle.v3.js');

let bundle = fs.readFileSync(sourcePath, 'utf8');
const framesContent = fs.readFileSync(framesPath, 'utf8');

// Find insertion point - before app.js
const appJsMarker = bundle.indexOf('/* ===== js/app.js ===== */');
if (appJsMarker < 0) {
  console.error('app.js marker not found');
  process.exit(1);
}

// Insert frames.js before app.js
bundle = bundle.substring(0, appJsMarker) +
          '/* ===== js/modules/frames.js ===== */\n' +
          framesContent + '\n\n' +
          bundle.substring(appJsMarker);

fs.writeFileSync(outputPath, bundle, 'utf8');
console.log('Bundle updated');
console.log('New size:', bundle.length, 'bytes');
console.log('framesModule count:', (bundle.match(/const framesModule/g) || []).length);
console.log('BM.frames count:', (bundle.match(/BM\.frames/g) || []).length);
