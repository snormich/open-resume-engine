import fs from 'node:fs/promises';
import path from 'node:path';
import { ResumeWorkbench } from './components/resume-workbench';

async function getInitialYaml(): Promise<string> {
  const filePath = path.join(process.cwd(), 'data', 'resume.yaml');
  return fs.readFile(filePath, 'utf8');
}

export default async function HomePage() {
  const initialYaml = await getInitialYaml();
  return <ResumeWorkbench initialYaml={initialYaml} />;
}
