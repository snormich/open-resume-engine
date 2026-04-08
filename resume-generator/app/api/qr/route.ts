import { NextRequest, NextResponse } from 'next/server';
import { generateQrPayload } from '@/api/analyze';

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as unknown;
    const result = await generateQrPayload(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido al generar QR.' },
      { status: 400 }
    );
  }
}
