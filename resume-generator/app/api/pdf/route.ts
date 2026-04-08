import { NextRequest, NextResponse } from 'next/server';
import { validateResumeData } from '@/lib/parser';
import { generateResumePdf } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as unknown;
    const resume = validateResumeData(payload);
    const pdfBuffer = await generateResumePdf(resume);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume-ats.pdf"'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido al generar PDF.' },
      { status: 400 }
    );
  }
}
