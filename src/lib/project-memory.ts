import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type ComplexityLevel = "Low" | "Medium" | "High";

export type StoredProjectAnalysis = {
  id: string;
  projectName: string;
  uploadDate: string;
  executiveSummary: string;
  requirements: string[];
  risks: string[];
  dependencies: string[];
  ambiguities: string[];
  complexity: ComplexityLevel;
  sourceFileNames: string[];
  similarProjects: string[];
  historicalRisks: string[];
  estimatedRelativeComplexity: string;
};

type ProjectMemoryStore = {
  companies: Record<string, StoredProjectAnalysis[]>;
};

const MEMORY_DIR = path.join(process.cwd(), "data");
const MEMORY_FILE = path.join(MEMORY_DIR, "project-memory.json");

const complexityScore: Record<ComplexityLevel, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();

const dedupe = (items: string[]) => {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const item of items) {
    const cleaned = item.trim();
    const key = normalize(cleaned);
    if (!cleaned || seen.has(key)) {
      continue;
    }
    seen.add(key);
    output.push(cleaned);
  }

  return output;
};

const safeParseStore = (raw: string): ProjectMemoryStore => {
  try {
    const parsed = JSON.parse(raw) as Partial<ProjectMemoryStore>;

    if (parsed && typeof parsed === "object" && parsed.companies && typeof parsed.companies === "object") {
      return {
        companies: Object.fromEntries(
          Object.entries(parsed.companies).map(([companyId, projects]) => [
            companyId,
            Array.isArray(projects) ? (projects as StoredProjectAnalysis[]) : [],
          ]),
        ),
      };
    }

    const legacyProjects = (parsed as { projects?: unknown[] })?.projects;
    if (Array.isArray(legacyProjects)) {
      return {
        companies: {
          legacy: legacyProjects as StoredProjectAnalysis[],
        },
      };
    }

    return { companies: {} };
  } catch {
    return { companies: {} };
  }
};

const readStore = async (): Promise<ProjectMemoryStore> => {
  try {
    const raw = await readFile(MEMORY_FILE, "utf-8");
    return safeParseStore(raw);
  } catch {
    return { companies: {} };
  }
};

export const readProjectMemory = async (companyId: string): Promise<StoredProjectAnalysis[]> => {
  const store = await readStore();
  return store.companies[companyId] ?? [];
};

export const writeProjectMemory = async (companyId: string, projects: StoredProjectAnalysis[]) => {
  const store = await readStore();
  await mkdir(MEMORY_DIR, { recursive: true });

  await writeFile(
    MEMORY_FILE,
    JSON.stringify(
      {
        companies: {
          ...store.companies,
          [companyId]: projects,
        },
      },
      null,
      2,
    ),
    "utf-8",
  );
};

const computeSimilarityScore = (current: StoredProjectAnalysis, candidate: StoredProjectAnalysis) => {
  const currentRequirements = new Set(current.requirements.map(normalize));
  const candidateRequirements = new Set(candidate.requirements.map(normalize));
  const currentDependencies = new Set(current.dependencies.map(normalize));
  const candidateDependencies = new Set(candidate.dependencies.map(normalize));

  const sharedRequirements = Array.from(currentRequirements).filter((item) => candidateRequirements.has(item)).length;
  const sharedDependencies = Array.from(currentDependencies).filter((item) => candidateDependencies.has(item)).length;
  const complexityDistance = Math.abs(complexityScore[current.complexity] - complexityScore[candidate.complexity]);

  return sharedRequirements * 2 + sharedDependencies * 3 - complexityDistance;
};

const estimateRelativeComplexity = (current: ComplexityLevel, historical: ComplexityLevel[]) => {
  if (historical.length === 0) {
    return "Baseline not available yet (first project in memory).";
  }

  const average = historical.reduce((sum, level) => sum + complexityScore[level], 0) / historical.length;
  const delta = complexityScore[current] - average;

  if (delta >= 0.75) {
    return "Above historical average complexity.";
  }

  if (delta <= -0.75) {
    return "Below historical average complexity.";
  }

  return "In line with historical average complexity.";
};

export const enrichWithPortfolioIntelligence = (
  current: Omit<StoredProjectAnalysis, "similarProjects" | "historicalRisks" | "estimatedRelativeComplexity">,
  previousProjects: StoredProjectAnalysis[],
): Pick<StoredProjectAnalysis, "similarProjects" | "historicalRisks" | "estimatedRelativeComplexity"> => {
  const scored = previousProjects
    .map((project) => ({
      project,
      score: computeSimilarityScore(
        { ...current, similarProjects: [], historicalRisks: [], estimatedRelativeComplexity: "" },
        project,
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const similarProjects = scored.map((item) => item.project.projectName);
  const historicalRisks = dedupe(previousProjects.flatMap((project) => project.risks)).slice(0, 10);
  const estimatedRelativeComplexity = estimateRelativeComplexity(
    current.complexity,
    previousProjects.map((project) => project.complexity),
  );

  return {
    similarProjects,
    historicalRisks,
    estimatedRelativeComplexity,
  };
};
