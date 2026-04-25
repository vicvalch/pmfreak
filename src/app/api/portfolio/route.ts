import { readProjectMemory } from "@/lib/project-memory";

export async function GET() {
  const projects = await readProjectMemory();

  const list = projects.map((project) => ({
    id: project.id,
    projectName: project.projectName,
    uploadDate: project.uploadDate,
    complexity: project.complexity,
    riskCount: project.risks.length,
    sourceFileNames: project.sourceFileNames,
  }));

  return Response.json({ projects: list });
}
