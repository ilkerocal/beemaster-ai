// Build script — concatenates all modules into single bundle (dedup)
const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, 'js', 'modules');
const coreDir = path.join(__dirname, 'js', 'core');
const outputPath = path.join(__dirname, 'js', 'app.bundle.v3.js');

// Only include each module once, in dependency order
const order = [
  // Core first
  'utils.js',
  'db.js',
  'ui.js',
  'auth.js',
  // Modules (only the main module per file)
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
];

let bundle = `// ============================================================
// SUPABASE CONFIG (injected inline to bypass CDN cache)
// ============================================================
window.__SUPABASE_URL__ = 'https://assfwtjbvuuxclioqsih.supabase.co';
window.__SUPABASE_ANON_KEY__ = 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M';

/* BeeMaster AI v3.0 - Bundled JS (order: utils, db, ui, modules/*, app) */

`;

const seenModuleDefs = new Set(); // const XModule = {
const seenExports = new Set();    // BM.xxx = XModule;

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
  
  // Strip out duplicate module DEFINITIONS only (const XModule = {)
  // Keep all exports (BM.xxx = XModule) since they assign to different BM properties
  const lines = content.split('\n');
  const filteredLines = [];
  let skipModuleDef = false;
  let currentModuleDef = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const moduleDefMatch = line.match(/^\s*const\s+(\w+Module)\s*=/);
    const exportMatch = line.match(/BM\.(\w+)\s*=\s*(\w+Module);/);
    
    if (moduleDefMatch) {
      const moduleName = moduleDefMatch[1];
      if (seenModuleDefs.has(moduleName)) {
        // Skip this module definition entirely
        skipModuleDef = true;
        currentModuleDef = moduleName;
        continue;
      } else {
        seenModuleDefs.add(moduleName);
      }
    }
    
    if (skipModuleDef) {
      // Check if we've reached the end of this module definition
      // Module definitions end when we see "};" followed by blank line or export
      if (line.trim() === '};' || line.trim().startsWith('});')) {
        // This is likely the end of the module object
        skipModuleDef = false;
        currentModuleDef = null;
        // Don't add this line either since we're skipping the whole module
        continue;
      }
      // Keep skipping
      continue;
    }
    
    filteredLines.push(line);
  }
  
  bundle += `/* ===== ${filePath.replace(__dirname + path.sep, '')} ===== */\n`;
  bundle += filteredLines.join('\n') + '\n\n';
}

// Add app.js at the end
const appContent = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');
bundle += `/* ===== js/app.js ===== */\n`;
bundle += appContent + '\n';

fs.writeFileSync(outputPath, bundle, 'utf8');
console.log('Bundle written to:', outputPath);
console.log('Size:', bundle.length, 'bytes');
console.log('Seen module defs:', Array.from(seenModuleDefs).join(', '));