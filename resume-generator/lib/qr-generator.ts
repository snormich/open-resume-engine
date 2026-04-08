import QRCode from 'qrcode';

export async function generateContactQR(cvUrl: string, email: string): Promise<string> {
  const payload = `CV: ${cvUrl}\nEmail: ${email}`;
  return QRCode.toDataURL(payload, {
    margin: 1,
    width: 256,
    errorCorrectionLevel: 'M'
  });
}
