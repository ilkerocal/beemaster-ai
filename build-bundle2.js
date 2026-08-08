// Build script — bundle_v3.js güncelle (sadece hives.js, ui.js, ve app.bundle.v3.js override edilir)
const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, 'js', 'modules');
const coreDir = path.join(__dirname, 'js', 'core');
const sourceBundle = path.join(__dirname, 'bundle_v3.js');
const outputPath = path.join(__dirname, 'js', 'app.bundle.v3.js');

// Bundle'dan modül section'ları çıkar, yenisiyle değiştir
let bundle = fs.readFileSync(sourceBundle, 'utf8');

// 1) hives.js bölümünü çıkar
// "/* ===== js/modules/hives.js ===== */" ile "/* ===== js/modules/frames.js ===== */" arası
const hivesStart = bundle.indexOf('/* ===== js/modules/hives.js ===== */');
const hivesEnd = bundle.indexOf('/* ===== js/modules/frames.js ===== */');
if (hivesStart < 0 || hivesEnd < 0) {
  console.error('hives section not found in bundle');
  process.exit(1);
}

// 2) Yeni hives.js içeriğini oku
const newHives = fs.readFileSync(path.join(modulesDir, 'hives.js'), 'utf8');

// 3) Değiştir
bundle = bundle.substring(0, hivesStart) +
          '/* ===== js/modules/hives.js ===== */\n' +
          newHives + '\n\n' +
          bundle.substring(hivesEnd);

// 4) ui.js bölümünü de çıkar ve değiştir
const uiStart = bundle.indexOf('/* ===== js/core/ui.js ===== */');
const uiEnd = bundle.indexOf('/* ===== js/core/auth.js ===== */');
if (uiStart > 0 && uiEnd > 0) {
  const newUi = fs.readFileSync(path.join(coreDir, 'ui.js'), 'utf8');
  bundle = bundle.substring(0, uiStart) +
           '/* ===== js/core/ui.js ===== */\n' +
           newUi + '\n\n' +
           bundle.substring(uiEnd);
}

fs.writeFileSync(outputPath, bundle, 'utf8');
console.log('Bundle updated:', outputPath);
console.log('New size:', bundle.length, 'bytes');
console.log('Backfill count:', (bundle.match(/Backfill/g) || []).length);
console.log('Kaydediliyor count:', (bundle.match(/Kaydediliyor/g) || []).length);
console.log('App.nav hives link:', (bundle.match(/App\.nav\('hives'\)/g) || []).length);