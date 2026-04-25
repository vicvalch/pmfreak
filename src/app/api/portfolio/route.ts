import { getAuthUser } from "@/lib/auth";
import { readProjectMemory } from "@/lib/project-memory";

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await readProjectMemory(user.companyId);

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
