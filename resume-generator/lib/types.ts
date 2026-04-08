export type ResumeBasics = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
};

export type ResumeExperience = {
  company: string;
  role: string;
  start: string;
  end: string;
  highlights: string[];
};

export type ResumeEducation = {
  institution: string;
  degree: string;
  year: string;
};

export type ResumeSkill = {
  name: string;
  level: string;
};

export type ResumeData = {
  basics: ResumeBasics;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
};

export type AtsAnalysis = {
  score: number;
  warnings: string[];
  suggestions: string[];
};
