import { AtsAnalysis, ResumeData } from './types';

const actionVerbs = [
  'led',
  'built',
  'optimized',
  'designed',
  'implemented',
  'improved',
  'launched',
  'managed',
  'developed',
  'delivered',
  'increased',
  'reduced'
];

const technicalKeywords = [
  'typescript',
  'javascript',
  'node',
  'react',
  'next',
  'api',
  'docker',
  'aws',
  'sql',
  'ci/cd',
  'testing',
  'kubernetes'
];

const quantifiableRegex = /\b\d+(?:\.\d+)?%?|\$\d+|\b\d+x\b/gi;

export function analyzeResumeATS(resume: ResumeData): AtsAnalysis {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  let score = 0;

  const hasExperience = resume.experience.length > 0;
  const hasEducation = resume.education.length > 0;
  const hasSkills = resume.skills.length > 0;

  score += hasExperience ? 20 : 0;
  score += hasSkills ? 15 : 0;
  score += hasEducation ? 10 : 0;

  if (!hasExperience) warnings.push('Falta la sección Experience o está vacía.');
  if (!hasSkills) warnings.push('Falta la sección Skills o está vacía.');
  if (!hasEducation) warnings.push('Falta la sección Education o está vacía.');

  const fullText = [
    resume.basics.summary,
    ...resume.experience.flatMap((exp) => [exp.role, exp.company, ...exp.highlights]),
    ...resume.skills.map((skill) => skill.name),
    ...resume.education.map((ed) => `${ed.degree} ${ed.institution}`)
  ]
    .join(' ')
    .toLowerCase();

  const keywordHits = technicalKeywords.filter((keyword) => fullText.includes(keyword)).length;
  const keywordDensityScore = Math.min(20, keywordHits * 2.5);
  score += keywordDensityScore;

  if (keywordHits < 4) {
    warnings.push('Baja densidad de keywords técnicas relevantes.');
    suggestions.push('Incluye tecnologías clave como frameworks, cloud, testing o bases de datos.');
  }

  const highlightsText = resume.experience.flatMap((exp) => exp.highlights).join(' ').toLowerCase();
  const verbHits = actionVerbs.filter((verb) => highlightsText.includes(verb)).length;
  const actionVerbScore = Math.min(15, verbHits * 2.5);
  score += actionVerbScore;

  if (verbHits < 3) {
    warnings.push('Pocos verbos de acción en los logros.');
    suggestions.push('Usa verbos como led, implemented, improved, reduced, launched.');
  }

  const quantifiableMatches = highlightsText.match(quantifiableRegex) ?? [];
  const metricScore = Math.min(10, quantifiableMatches.length * 2);
  score += metricScore;

  if (quantifiableMatches.length < 2) {
    warnings.push('Faltan métricas cuantificables en experiencia.');
    suggestions.push('Agrega impacto medible: porcentajes, tiempos, reducción de costos o ingresos.');
  }

  const contentLength = fullText.split(/\s+/).filter(Boolean).length;
  if (contentLength >= 180 && contentLength <= 900) {
    score += 10;
  } else {
    warnings.push('Longitud de contenido subóptima para ATS.');
    suggestions.push('Mantén el CV entre ~180 y 900 palabras con foco en logros.');
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  if (score >= 85) {
    suggestions.push('Buen nivel ATS. Ajusta keywords según la vacante específica.');
  }

  return { score, warnings, suggestions };
}

export async function analyzeWithAI(_resume: ResumeData): Promise<Partial<AtsAnalysis>> {
  return {
    suggestions: [
      'Hook de IA preparado. Integra aquí tu proveedor LLM para sugerencias contextuales por vacante.'
    ]
  };
}
