import yaml from 'js-yaml';
import { ResumeData } from './types';

const requiredBasics: (keyof ResumeData['basics'])[] = [
  'name',
  'title',
  'email',
  'phone',
  'location',
  'summary'
];

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function validateResumeData(input: unknown): ResumeData {
  if (!input || typeof input !== 'object') {
    throw new Error('Resume inválido: debe ser un objeto.');
  }

  const data = input as Partial<ResumeData>;

  if (!data.basics || typeof data.basics !== 'object') {
    throw new Error('Resume inválido: falta la sección basics.');
  }

  for (const field of requiredBasics) {
    if (!isString(data.basics[field]) || data.basics[field].trim().length === 0) {
      throw new Error(`Campo requerido faltante en basics: ${field}`);
    }
  }

  if (!Array.isArray(data.experience)) {
    throw new Error('Resume inválido: experience debe ser una lista.');
  }

  if (!Array.isArray(data.education)) {
    throw new Error('Resume inválido: education debe ser una lista.');
  }

  if (!Array.isArray(data.skills)) {
    throw new Error('Resume inválido: skills debe ser una lista.');
  }

  data.experience.forEach((item, index) => {
    if (
      !item ||
      typeof item !== 'object' ||
      !isString(item.company) ||
      !isString(item.role) ||
      !isString(item.start) ||
      !isString(item.end) ||
      !isStringArray(item.highlights)
    ) {
      throw new Error(`Experiencia inválida en índice ${index}.`);
    }
  });

  data.education.forEach((item, index) => {
    if (
      !item ||
      typeof item !== 'object' ||
      !isString(item.institution) ||
      !isString(item.degree) ||
      !isString(item.year)
    ) {
      throw new Error(`Educación inválida en índice ${index}.`);
    }
  });

  data.skills.forEach((item, index) => {
    if (!item || typeof item !== 'object' || !isString(item.name) || !isString(item.level)) {
      throw new Error(`Skill inválida en índice ${index}.`);
    }
  });

  return data as ResumeData;
}

export function parseResumeYaml(rawYaml: string): ResumeData {
  const parsed = yaml.load(rawYaml);
  return validateResumeData(parsed);
}

export function parseResumeJson(rawJson: string): ResumeData {
  const parsed = JSON.parse(rawJson) as unknown;
  return validateResumeData(parsed);
}

export function parseResumeInput(content: string): ResumeData {
  const trimmed = content.trim();
  if (trimmed.startsWith('{')) {
    return parseResumeJson(trimmed);
  }
  return parseResumeYaml(trimmed);
}
