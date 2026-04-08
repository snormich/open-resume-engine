import puppeteer from 'puppeteer';
import { ResumeData } from './types';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderAtsHtml(resume: ResumeData): string {
  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; margin: 36px; color: #000; font-size: 12px; line-height: 1.45; }
        h1 { margin: 0 0 4px 0; font-size: 24px; }
        h2 { margin: 18px 0 8px; font-size: 14px; border-bottom: 1px solid #000; padding-bottom: 2px; text-transform: uppercase; }
        p { margin: 0 0 4px; }
        ul { margin: 6px 0 0 18px; padding: 0; }
        li { margin: 0 0 4px; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(resume.basics.name)}</h1>
      <p>${escapeHtml(resume.basics.title)}</p>
      <p>${escapeHtml(resume.basics.email)} | ${escapeHtml(resume.basics.phone)} | ${escapeHtml(resume.basics.location)}</p>
      <h2>Summary</h2>
      <p>${escapeHtml(resume.basics.summary)}</p>

      <h2>Experience</h2>
      ${resume.experience
        .map(
          (exp) => `
            <p><strong>${escapeHtml(exp.role)} — ${escapeHtml(exp.company)}</strong> (${escapeHtml(exp.start)} - ${escapeHtml(exp.end)})</p>
            <ul>
              ${exp.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join('')}
            </ul>
          `
        )
        .join('')}

      <h2>Education</h2>
      ${resume.education
        .map(
          (ed) => `<p><strong>${escapeHtml(ed.degree)}</strong> - ${escapeHtml(ed.institution)} (${escapeHtml(ed.year)})</p>`
        )
        .join('')}

      <h2>Skills</h2>
      <p>${resume.skills.map((skill) => `${escapeHtml(skill.name)} (${escapeHtml(skill.level)})`).join(', ')}</p>
    </body>
  </html>`;
}

export async function generateResumePdf(resume: ResumeData): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(renderAtsHtml(resume), {
      waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '18mm',
        right: '14mm',
        bottom: '18mm',
        left: '14mm'
      }
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
