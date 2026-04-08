import { analyzeResumeATS, analyzeWithAI } from '@/lib/ats-analyzer';
import { generateContactQR } from '@/lib/qr-generator';
import { validateResumeData } from '@/lib/parser';

export async function analyzeResumePayload(payload: unknown) {
  const resume = validateResumeData(payload);
  const analysis = analyzeResumeATS(resume);
  const aiHints = await analyzeWithAI(resume);

  return {
    ...analysis,
    suggestions: [...analysis.suggestions, ...(aiHints.suggestions ?? [])]
  };
}

export async function generateQrPayload(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload inválido para QR.');
  }

  const { cvUrl, email } = payload as { cvUrl?: string; email?: string };

  if (!cvUrl || !email) {
    throw new Error('cvUrl y email son requeridos para generar QR.');
  }

  const qrDataUrl = await generateContactQR(cvUrl, email);
  return { qrDataUrl };
}
