'use client';

import { useEffect, useMemo, useState } from 'react';
import yaml from 'js-yaml';
import { parseResumeInput } from '@/lib/parser';
import { AtsAnalysis, ResumeData } from '@/lib/types';
import { MinimalTemplate } from '@/templates/minimal';
import { ModernTemplate } from '@/templates/modern';

type Props = {
  initialYaml: string;
};

type TemplateMode = 'minimal' | 'modern';

export function ResumeWorkbench({ initialYaml }: Props) {
  const [yamlText, setYamlText] = useState(initialYaml);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [analysis, setAnalysis] = useState<AtsAnalysis | null>(null);
  const [error, setError] = useState<string>('');
  const [template, setTemplate] = useState<TemplateMode>('minimal');

  useEffect(() => {
    try {
      const parsed = parseResumeInput(yamlText);
      setResume(parsed);
      setError('');
    } catch (err) {
      setResume(null);
      setError(err instanceof Error ? err.message : 'No se pudo parsear el CV.');
    }
  }, [yamlText]);

  const preview = useMemo(() => {
    if (!resume) return null;
    return template === 'minimal' ? (
      <MinimalTemplate data={resume} qrDataUrl={qrDataUrl} />
    ) : (
      <ModernTemplate data={resume} qrDataUrl={qrDataUrl} />
    );
  }, [resume, template, qrDataUrl]);

  async function handleAnalyze() {
    if (!resume) return;

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resume)
    });

    const data = (await response.json()) as AtsAnalysis & { error?: string };

    if (!response.ok) {
      setError(data.error ?? 'No se pudo analizar el CV.');
      return;
    }

    setAnalysis(data);
    setError('');
  }

  async function handleGeneratePDF() {
    if (!resume) return;

    const response = await fetch('/api/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resume)
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? 'No se pudo generar el PDF.');
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-ats.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleGenerateQR() {
    if (!resume) return;

    const cvUrl = typeof window !== 'undefined' ? window.location.href : 'https://example.com/cv';
    const response = await fetch('/api/qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvUrl, email: resume.basics.email })
    });

    const data = (await response.json()) as { qrDataUrl?: string; error?: string };

    if (!response.ok || !data.qrDataUrl) {
      setError(data.error ?? 'No se pudo generar el QR.');
      return;
    }

    setQrDataUrl(data.qrDataUrl);
    setError('');
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-6 p-6 lg:grid-cols-2">
      <section className="space-y-4 rounded border border-black bg-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Headless Resume Generator</h1>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as TemplateMode)}
            className="border border-black px-2 py-1 text-sm"
          >
            <option value="minimal">Template: Minimal</option>
            <option value="modern">Template: Modern</option>
          </select>
        </div>

        <label className="block text-sm font-medium">Editor YAML / JSON</label>
        <textarea
          value={yamlText}
          onChange={(e) => setYamlText(e.target.value)}
          className="h-[480px] w-full resize-y border border-black p-3 font-mono text-xs leading-6"
          spellCheck={false}
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!resume}
            className="border border-black px-4 py-2 text-sm hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Analizar CV
          </button>
          <button
            type="button"
            onClick={handleGeneratePDF}
            disabled={!resume}
            className="border border-black px-4 py-2 text-sm hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generar PDF
          </button>
          <button
            type="button"
            onClick={handleGenerateQR}
            disabled={!resume}
            className="border border-black px-4 py-2 text-sm hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generar QR
          </button>
        </div>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        {analysis ? (
          <div className="space-y-2 border border-black p-3 text-sm">
            <p className="font-semibold">ATS Score: {analysis.score}/100</p>
            <div>
              <p className="font-medium">Warnings</p>
              <ul className="list-disc pl-5">
                {analysis.warnings.map((warning, index) => (
                  <li key={`${warning}-${index}`}>{warning}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">Suggestions</p>
              <ul className="list-disc pl-5">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={`${suggestion}-${index}`}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded border border-black bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">Preview</h2>
        {resume ? preview : <p className="text-sm text-red-700">Corrige el YAML para ver el preview.</p>}
      </section>
    </main>
  );
}

export function resumeToYamlString(data: ResumeData): string {
  return yaml.dump(data, {
    noRefs: true,
    lineWidth: 120
  });
}
