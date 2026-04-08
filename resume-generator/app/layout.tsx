import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Headless Resume Generator',
  description: 'Generador de CV ATS-friendly con exportación PDF y análisis ATS.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
