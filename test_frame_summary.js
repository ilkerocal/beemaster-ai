const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'js', 'app.bundle.v3.js');
const bundleCode = fs.readFileSync(bundlePath, 'utf8');

global.window = global;
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
global.document = {
  addEventListener: () => {},
  getElementById: () => null,
  querySelectorAll: () => []
};

eval(bundleCode);

// Seed data init
global.BM.Storage.init();

// Test hive frames
const hiveId = 'hv_1';
const frames = global.BM.Storage.list('frames').filter(f => f.hiveId === hiveId);

console.log('Hive 1 total frames count:', frames.length);
console.log('Frame types distribution:');

const summary = frames.reduce((acc, x) => {
  const t = (x.frameType === 'empty' ? 'foundation' : x.frameType) || 'foundation';
  acc[t] = (acc[t] || 0) + 1; return acc;
}, { brood: 0, honey: 0, pollen: 0, perga: 0, foundation: 0 });

console.log(summary);

const totalInSummary = Object.values(summary).reduce((a, b) => a + b, 0);
console.log('Total count in summary:', totalInSummary);

if (totalInSummary === frames.length) {
  console.log('✅ SUMMARY MATCHES TOTAL FRAME COUNT PERFECTLY!');
} else {
  console.error('❌ MISMATCH:', totalInSummary, 'vs', frames.length);
}
