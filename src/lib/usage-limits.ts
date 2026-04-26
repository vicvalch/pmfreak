import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SubscriptionPlan } from "@/lib/billing";
export { canExportReports, canInviteTeamMembers, canRunAiAnalysis, canUsePortfolioMemory } from "@/lib/plan-access";

export type CompanyUsageState = {
  currentMonth: string;
  uploadCount: number;
};

type UsageStore = {
  companies: Record<string, CompanyUsageState>;
};

const USAGE_DIR = path.join(process.cwd(), "data");
const USAGE_FILE = path.join(USAGE_DIR, "usage-state.json");

const FREE_UPLOAD_LIMIT = 5;

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
};

const defaultUsage = (): CompanyUsageState => ({
  currentMonth: getCurrentMonthKey(),
  uploadCount: 0,
});

const parseStore = (raw: string): UsageStore => {
  try {
    const parsed = JSON.parse(raw) as Partial<UsageStore>;

    if (!parsed.companies || typeof parsed.companies !== "object") {
      return { companies: {} };
    }

    return {
      companies: Object.fromEntries(
        Object.entries(parsed.companies).map(([companyId, value]) => {
          const usage = value as Partial<CompanyUsageState>;
          return [
            companyId,
            {
              currentMonth:
                typeof usage.currentMonth === "string" && usage.currentMonth.length > 0
                  ? usage.currentMonth
                  : getCurrentMonthKey(),
              uploadCount: typeof usage.uploadCount === "number" ? usage.uploadCount : 0,
            } satisfies CompanyUsageState,
          ];
        }),
      ),
    };
  } catch {
    return { companies: {} };
  }
};

const readStore = async () => {
  try {
    const raw = await readFile(USAGE_FILE, "utf-8");
    return parseStore(raw);
  } catch {
    return { companies: {} } satisfies UsageStore;
  }
};

const writeStore = async (store: UsageStore) => {
  await mkdir(USAGE_DIR, { recursive: true });
  await writeFile(USAGE_FILE, JSON.stringify(store, null, 2), "utf-8");
};

export const getCompanyUsage = async (companyId: string): Promise<CompanyUsageState> => {
  const store = await readStore();
  const usage = store.companies[companyId] ?? defaultUsage();

  if (usage.currentMonth !== getCurrentMonthKey()) {
    const reset = defaultUsage();
    await writeStore({
      companies: {
        ...store.companies,
        [companyId]: reset,
      },
    });
    return reset;
  }

  return usage;
};

export const incrementUploadUsage = async (companyId: string, incrementBy = 1): Promise<CompanyUsageState> => {
  const store = await readStore();
  const existing = store.companies[companyId] ?? defaultUsage();
  const current =
    existing.currentMonth === getCurrentMonthKey()
      ? existing
      : {
          currentMonth: getCurrentMonthKey(),
          uploadCount: 0,
        };

  const next = {
    ...current,
    uploadCount: current.uploadCount + incrementBy,
  };

  await writeStore({
    companies: {
      ...store.companies,
      [companyId]: next,
    },
  });

  return next;
};

export const canUploadDocuments = (plan: SubscriptionPlan, currentUploadCount: number, incomingCount = 1) => {
  if (plan !== "free") {
    return true;
  }

  return currentUploadCount + incomingCount <= FREE_UPLOAD_LIMIT;
};

export const getUploadLimitForPlan = (plan: SubscriptionPlan) => {
  if (plan === "free") {
    return FREE_UPLOAD_LIMIT;
  }

  return null;
};
