// build-bundle.js — Concatenate all modules into app.bundle.v3.js
const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, 'js', 'modules');
const outputFile = path.join(__dirname, 'js', 'app.bundle.v3.js');

// Read all .js files in numbered order
const files = fs.readdirSync(modulesDir)
    .filter(f => f.endsWith('.js'))
    .sort();

let bundle = '';
let total = 0;

for (const file of files) {
    const content = fs.readFileSync(path.join(modulesDir, file), 'utf8');
    bundle += content;
    total += content.length;
    console.log(`  + ${file}: ${content.length.toLocaleString()} chars`);
}

// Add newline at end
bundle += '\n';

fs.writeFileSync(outputFile, bundle, 'utf8');
console.log(`\n✅ Bundle built: ${outputFile}`);
console.log(`   Size: ${bundle.length.toLocaleString()} chars`);
console.log(`   Modules: ${files.length}`);

// Verify
if (bundle.length !== total + 1) {
    console.error(`⚠️ Size mismatch! ${bundle.length} vs ${total + 1}`);
}
