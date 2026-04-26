import { getAuthUser } from "@/lib/auth";
import { getCompanySubscription } from "@/lib/billing";
import { readProjectMemory } from "@/lib/project-memory";
import { canUsePortfolioMemory } from "@/lib/usage-limits";

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }


  const subscription = await getCompanySubscription(user.companyId);

  if (!canUsePortfolioMemory(subscription.plan)) {
    return Response.json(
      { error: "Portfolio memory is available on Enterprise plan." },
      { status: 403 },
    );
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
