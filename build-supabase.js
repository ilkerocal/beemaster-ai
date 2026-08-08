// Build script — reads env vars and writes supabase-config.js
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const content = `// ============================================================
// Supabase Configuration (auto-generated at build time)
// ============================================================
window.__SUPABASE_URL__ = '${SUPABASE_URL}';
window.__SUPABASE_ANON_KEY__ = '${SUPABASE_ANON_KEY}';
`;

const target = path.join(__dirname, 'js', 'supabase-config.js');
fs.writeFileSync(target, content, 'utf8');
console.log('Supabase config written to', target);
console.log('URL set:', SUPABASE_URL ? 'YES' : 'NO');
console.log('Key set:', SUPABASE_ANON_KEY ? 'YES' : 'NO');
