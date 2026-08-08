const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'js', 'app.bundle.v3.js');
const bundleCode = fs.readFileSync(bundlePath, 'utf8');

global.window = global;
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.document = { addEventListener: () => {}, getElementById: () => null, querySelectorAll: () => [] };

eval(bundleCode);
global.BM.Storage.init();

// Test queen lookup
const hiveId = 'hv_1';
const queenTab = global.BM.Storage.list('queens').find(x => x.hiveId === hiveId);
console.log('Queen found for hive 1:', queenTab ? queenTab.strain : 'NOT FOUND');

if (queenTab) {
  console.log('✅ QUEEN CORRECTLY LINKED TO HIVE DETAIL!');
} else {
  console.error('❌ QUEEN NOT FOUND FOR HIVE!');
}
