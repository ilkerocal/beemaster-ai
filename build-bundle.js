// Build script — concatenates all modules into single bundle
const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, 'js', 'modules');
const coreDir = path.join(__dirname, 'js', 'core');
const outputPath = path.join(__dirname, 'js', 'app.bundle.v3.js');

const order = [
  // Core first
  'utils.js',
  'db.js',
  'ui.js',
  'auth.js',
  // Modules
  'apiaries.js',
  'hives.js',
  'frames.js',
  'inspections.js',
  'harvest.js',
  'feeding.js',
  'treatments.js',
  'diseases.js',
  'queens.js',
  'inventory.js',
  'dashboard.js',
  'crud.js',
];

let bundle = `// ============================================================
// SUPABASE CONFIG (injected inline to bypass CDN cache)
// ============================================================
window.__SUPABASE_URL__ = 'https://assfwtjbvuuxclioqsih.supabase.co';
window.__SUPABASE_ANON_KEY__ = 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M';

/* BeeMaster AI v3.0 - Bundled JS (order: utils, db, ui, modules/*, app) */

`;

for (const file of order) {
  let filePath;
  if (fs.existsSync(path.join(coreDir, file))) {
    filePath = path.join(coreDir, file);
  } else if (fs.existsSync(path.join(modulesDir, file))) {
    filePath = path.join(modulesDir, file);
  } else {
    console.warn(`File not found: ${file}`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  bundle += `/* ===== ${filePath.replace(__dirname + path.sep, '')} ===== */\n`;
  bundle += content + '\n\n';
}

// Add app.js at the end
const appContent = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');
bundle += `/* ===== js/app.js ===== */\n`;
bundle += appContent + '\n';

fs.writeFileSync(outputPath, bundle, 'utf8');
console.log('Bundle written to:', outputPath);
console.log('Size:', bundle.length, 'bytes');