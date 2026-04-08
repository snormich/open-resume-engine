# Headless Resume Generator con Analizador ATS

Aplicación full-stack construida con Next.js (App Router) + TypeScript para generar CV web, PDF ATS-friendly, QR de contacto y score ATS.

## Stack

- Next.js 14 + React 18
- Tailwind CSS
- TypeScript
- `js-yaml` para parser YAML
- `puppeteer` para PDF
- `qrcode` para código QR

## Estructura

```txt
/resume-generator
  /app
  /lib
  /templates
  /data
  /api
  /scripts
  /out (generado)
```

## Cómo ejecutar (UI web)

```bash
cd resume-generator
npm install
npm run dev
```

Luego abre: `http://localhost:3000`

## Modo headless (automático)

Genera artefactos directamente desde `data/resume.yaml` sin interacción UI:

```bash
cd resume-generator
npm run generate
```

Output generado en `resume-generator/out/`:
- `index.html` (CV web estático)
- `resume-ats.pdf` (PDF ATS)
- `contact-qr.png` (QR)
- `ats-report.json` (score/warnings/suggestions)

## Smoke check rápido

```bash
cd resume-generator
npm run test:smoke
```

Valida estructura de archivos críticos del proyecto.

## Funcionalidades

- Editor YAML/JSON con preview en tiempo real.
- Render de CV con template `minimal` (default) y `modern`.
- Botón **Analizar CV** -> llama `POST /api/analyze`.
- Botón **Generar PDF** -> llama `POST /api/pdf` y descarga PDF ATS-friendly.
- Botón **Generar QR** -> llama `POST /api/qr` y muestra QR.
- Infra preparada para IA con `analyzeWithAI()` en `lib/ats-analyzer.ts`.

## Formato de CV soportado

Se provee un ejemplo en `data/resume.yaml`.

```yaml
basics:
  name: ""
  title: ""
  email: ""
  phone: ""
  location: ""
  summary: ""

experience:
  - company: ""
    role: ""
    start: ""
    end: ""
    highlights: []

education:
  - institution: ""
    degree: ""
    year: ""

skills:
  - name: ""
    level: ""
```

## Endpoints

### `POST /api/analyze`
Recibe JSON del CV y devuelve:

```json
{
  "score": 0,
  "warnings": [],
  "suggestions": []
}
```

### `POST /api/qr`
Recibe:

```json
{
  "cvUrl": "https://...",
  "email": "mail@domain.com"
}
```

Devuelve:

```json
{
  "qrDataUrl": "data:image/png;base64,..."
}
```

### `POST /api/pdf`
Recibe JSON del CV y devuelve un PDF descargable.

## Static export opcional

Si necesitas export estático de Next (sin endpoints runtime):

```bash
cd resume-generator
STATIC_EXPORT=true npm run build
```

## Cómo probar que funciona correctamente (checklist)

1. `npm run dev` y abrir UI.
2. Pegar YAML válido/invalidar para verificar parser y validaciones.
3. Click en **Analizar CV** y confirmar score + warnings/suggestions.
4. Click en **Generar QR** y confirmar render de QR.
5. Click en **Generar PDF** y abrir el archivo descargado.
6. Ejecutar `npm run generate` y validar archivos en `out/`.

## Notas de producción

- El template PDF evita layouts multi-columna para mejorar compatibilidad ATS.
- Ajusta lista de keywords y verbos de acción en `lib/ats-analyzer.ts` según la industria objetivo.
- Para IA real, conecta `analyzeWithAI()` a tu proveedor LLM y añade manejo de secretos en entorno server.
