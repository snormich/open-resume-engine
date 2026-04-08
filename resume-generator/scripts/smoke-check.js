/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');

const required = [
  'data/resume.yaml',
  'lib/parser.ts',
  'lib/ats-analyzer.ts',
  'lib/pdf-generator.ts',
  'lib/qr-generator.ts',
  'app/api/analyze/route.ts',
  'app/api/pdf/route.ts',
  'app/api/qr/route.ts',
  'templates/minimal.tsx',
  'templates/modern.tsx'
];

const missing = required.filter((file) => !fs.existsSync(path.join(process.cwd(), file)));

if (missing.length > 0) {
  console.error('❌ Faltan archivos requeridos:\n' + missing.join('\n'));
  process.exit(1);
}

console.log('✅ Smoke check OK. Estructura principal presente.');
