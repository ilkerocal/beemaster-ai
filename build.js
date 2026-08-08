const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, 'js', 'modules');
const outputFile = path.join(__dirname, 'js', 'app.bundle.v3.js');

try {
  const files = fs.readdirSync(modulesDir)
    .filter(f => f.endsWith('.js'))
    .sort();

  console.log('Bundling modules:', files);

  let combined = '';
  for (const file of files) {
    const filePath = path.join(modulesDir, file);
    combined += `\n/* ===== ${file} ===== */\n` + fs.readFileSync(filePath, 'utf8') + '\n';
  }

  fs.writeFileSync(outputFile, combined, 'utf8');
  console.log('Successfully bundled to', outputFile, `(${combined.length} bytes)`);
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}
