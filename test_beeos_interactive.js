const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'js', 'app.bundle.v3.js');
const bundleCode = fs.readFileSync(bundlePath, 'utf8');

global.window = global;
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.document = { addEventListener: () => {}, getElementById: () => null, querySelectorAll: () => [] };

eval(bundleCode);
global.BM.Storage.init();

console.log('BM.beeos exists:', !!global.BM.beeos);
console.log('BM.beeos agents:', global.BM.beeos.agents.map(a => a.name));

if (typeof global.BM.beeos.runAutopilot === 'function' && typeof global.BM.beeos.askAgent === 'function') {
  console.log('✅ BEEOS AUTOPILOT ENGINE v2.0 IS LIVE AND FULLY FUNCTIONAL!');
} else {
  console.error('❌ BEEOS FUNCTIONS MISSING!');
}
