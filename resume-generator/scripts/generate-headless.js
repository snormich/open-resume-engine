/* eslint-disable no-console */
const fs = require('node:fs/promises');
const path = require('node:path');
const yaml = require('js-yaml');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');

const rootDir = process.cwd();
const inputPath = path.join(rootDir, 'data', 'resume.yaml');
const outDir = path.join(rootDir, 'out');

function validateResumeData(data) {
  if (!data || typeof data !== 'object') throw new Error('Resume inválido: objeto requerido.');

  const requiredBasics = ['name', 'title', 'email', 'phone', 'location', 'summary'];
  if (!data.basics || typeof data.basics !== 'object') throw new Error('Falta basics.');

  for (const key of requiredBasics) {
    if (typeof data.basics[key] !== 'string' || data.basics[key].trim().length === 0) {
      throw new Error(`Campo requerido faltante en basics: ${key}`);
    }
  }

  if (!Array.isArray(data.experience) || !Array.isArray(data.education) || !Array.isArray(data.skills)) {
    throw new Error('experience, education y skills deben ser arreglos.');
  }

  return data;
}

function analyzeResumeATS(resume) {
  const actionVerbs = ['led', 'built', 'optimized', 'designed', 'implemented', 'improved', 'launched', 'managed', 'developed'];
  const technicalKeywords = ['typescript', 'javascript', 'node', 'react', 'next', 'api', 'docker', 'aws', 'sql', 'testing'];
  const quantifiableRegex = /\b\d+(?:\.\d+)?%?|\$\d+|\b\d+x\b/gi;

  const warnings = [];
  const suggestions = [];
  let score = 0;

  if (resume.experience.length > 0) score += 20; else warnings.push('Falta Experience.');
  if (resume.skills.length > 0) score += 15; else warnings.push('Falta Skills.');
  if (resume.education.length > 0) score += 10; else warnings.push('Falta Education.');

  const fullText = [
    resume.basics.summary,
    ...resume.experience.flatMap((exp) => [exp.role, exp.company, ...(exp.highlights || [])]),
    ...resume.skills.map((s) => s.name),
    ...resume.education.map((ed) => `${ed.degree} ${ed.institution}`)
  ].join(' ').toLowerCase();

  const keywordHits = technicalKeywords.filter((k) => fullText.includes(k)).length;
  score += Math.min(20, keywordHits * 2.5);
  if (keywordHits < 4) suggestions.push('Agrega más keywords técnicas relevantes para la vacante objetivo.');

  const highlightsText = resume.experience.flatMap((exp) => exp.highlights || []).join(' ').toLowerCase();
  const verbHits = actionVerbs.filter((verb) => highlightsText.includes(verb)).length;
  score += Math.min(15, verbHits * 2.5);
  if (verbHits < 3) suggestions.push('Usa más verbos de acción en logros.');

  const quantMatches = highlightsText.match(quantifiableRegex) ?? [];
  score += Math.min(10, quantMatches.length * 2);
  if (quantMatches.length < 2) suggestions.push('Incluye métricas cuantificables (% / números / impacto).');

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 180 && wordCount <= 900) score += 10; else warnings.push('Longitud de contenido fuera de rango recomendado.');

  return { score: Math.max(0, Math.min(100, Math.round(score))), warnings, suggestions };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderHtml(resume, qrDataUrl, ats) {
  const experiences = resume.experience
    .map((exp) => `
      <div class="item">
        <p><strong>${escapeHtml(exp.role)} — ${escapeHtml(exp.company)}</strong> (${escapeHtml(exp.start)} - ${escapeHtml(exp.end)})</p>
        <ul>${(exp.highlights || []).map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul>
      </div>
    `)
    .join('');

  const skills = resume.skills.map((s) => `${escapeHtml(s.name)} (${escapeHtml(s.level)})`).join(', ');
  const education = resume.education
    .map((ed) => `<p><strong>${escapeHtml(ed.degree)}</strong> — ${escapeHtml(ed.institution)} (${escapeHtml(ed.year)})</p>`)
    .join('');

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(resume.basics.name)} - CV</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; color: #000; }
    h1 { margin-bottom: 4px; } h2 { margin-top: 24px; border-bottom: 1px solid #000; font-size: 14px; text-transform: uppercase; }
    p, li { font-size: 14px; line-height: 1.45; }
    .meta { font-size: 13px; }
    .ats { margin-top: 16px; padding: 12px; border: 1px solid #000; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(resume.basics.name)}</h1>
    <p>${escapeHtml(resume.basics.title)}</p>
    <p class="meta">${escapeHtml(resume.basics.email)} · ${escapeHtml(resume.basics.phone)} · ${escapeHtml(resume.basics.location)}</p>
  </header>

  <h2>Summary</h2>
  <p>${escapeHtml(resume.basics.summary)}</p>

  <h2>Experience</h2>
  ${experiences}

  <h2>Education</h2>
  ${education}

  <h2>Skills</h2>
  <p>${skills}</p>

  <section class="ats">
    <p><strong>ATS Score:</strong> ${ats.score}/100</p>
    <p><strong>Warnings:</strong> ${ats.warnings.join(' | ') || 'Ninguno'}</p>
    <p><strong>Suggestions:</strong> ${ats.suggestions.join(' | ') || 'Ninguna'}</p>
  </section>

  <h2>QR de contacto</h2>
  <img src="${qrDataUrl}" alt="QR de contacto" width="160" height="160" />
</body>
</html>`;
}

async function generatePdf(html, targetPath) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: targetPath, format: 'A4', printBackground: true, margin: { top: '18mm', right: '14mm', bottom: '18mm', left: '14mm' } });
  } finally {
    await browser.close();
  }
}

async function run() {
  await fs.mkdir(outDir, { recursive: true });

  const raw = await fs.readFile(inputPath, 'utf8');
  const parsed = validateResumeData(yaml.load(raw));

  const cvUrl = 'https://example.com/cv';
  const qrDataUrl = await QRCode.toDataURL(`CV: ${cvUrl}\nEmail: ${parsed.basics.email}`, { margin: 1, width: 256, errorCorrectionLevel: 'M' });
  const ats = analyzeResumeATS(parsed);

  const html = renderHtml(parsed, qrDataUrl, ats);
  await fs.writeFile(path.join(outDir, 'index.html'), html, 'utf8');

  await generatePdf(html, path.join(outDir, 'resume-ats.pdf'));
  const base64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
  await fs.writeFile(path.join(outDir, 'contact-qr.png'), Buffer.from(base64, 'base64'));
  await fs.writeFile(path.join(outDir, 'ats-report.json'), JSON.stringify(ats, null, 2), 'utf8');

  console.log('✅ Headless generation completed: out/index.html, out/resume-ats.pdf, out/contact-qr.png, out/ats-report.json');
}

run().catch((error) => {
  console.error('❌ Error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
