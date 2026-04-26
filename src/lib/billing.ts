import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type SubscriptionPlan = "free" | "pro" | "enterprise";

export type SubscriptionStatus =
  | "inactive"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

export type CompanySubscriptionState = {
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
};

type BillingStore = {
  companies: Record<string, CompanySubscriptionState>;
};

const DEFAULT_STATE: CompanySubscriptionState = {
  plan: "free",
  subscriptionStatus: "inactive",
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  currentPeriodEnd: null,
};

const BILLING_DIR = path.join(process.cwd(), "data");
const BILLING_FILE = path.join(BILLING_DIR, "billing-state.json");

const safeParseStore = (raw: string): BillingStore => {
  try {
    const parsed = JSON.parse(raw) as Partial<BillingStore>;

    if (!parsed || typeof parsed !== "object" || !parsed.companies || typeof parsed.companies !== "object") {
      return { companies: {} };
    }

    return {
      companies: Object.fromEntries(
        Object.entries(parsed.companies).map(([companyId, state]) => {
          const value = state as Partial<CompanySubscriptionState>;
          const plan =
            value.plan === "pro" || value.plan === "enterprise" || value.plan === "free"
              ? value.plan
              : DEFAULT_STATE.plan;
          const subscriptionStatus =
            value.subscriptionStatus === "trialing" ||
            value.subscriptionStatus === "active" ||
            value.subscriptionStatus === "past_due" ||
            value.subscriptionStatus === "canceled" ||
            value.subscriptionStatus === "incomplete" ||
            value.subscriptionStatus === "inactive" ||
            value.subscriptionStatus === "incomplete_expired" ||
            value.subscriptionStatus === "unpaid" ||
            value.subscriptionStatus === "paused"
              ? value.subscriptionStatus
              : DEFAULT_STATE.subscriptionStatus;

          return [
            companyId,
            {
              plan,
              subscriptionStatus,
              stripeCustomerId:
                typeof value.stripeCustomerId === "string" && value.stripeCustomerId.length > 0
                  ? value.stripeCustomerId
                  : null,
              stripeSubscriptionId:
                typeof value.stripeSubscriptionId === "string" && value.stripeSubscriptionId.length > 0
                  ? value.stripeSubscriptionId
                  : null,
              currentPeriodEnd:
                typeof value.currentPeriodEnd === "string" && value.currentPeriodEnd.length > 0
                  ? value.currentPeriodEnd
                  : null,
            } satisfies CompanySubscriptionState,
          ];
        }),
      ),
    };
  } catch {
    return { companies: {} };
  }
};

const readStore = async (): Promise<BillingStore> => {
  try {
    const raw = await readFile(BILLING_FILE, "utf-8");
    return safeParseStore(raw);
  } catch {
    return { companies: {} };
  }
};

const writeStore = async (store: BillingStore) => {
  await mkdir(BILLING_DIR, { recursive: true });
  await writeFile(BILLING_FILE, JSON.stringify(store, null, 2), "utf-8");
};

export const getCompanySubscription = async (companyId: string): Promise<CompanySubscriptionState> => {
  const store = await readStore();
  return store.companies[companyId] ?? DEFAULT_STATE;
};

export const setCompanySubscription = async (
  companyId: string,
  value: CompanySubscriptionState,
): Promise<CompanySubscriptionState> => {
  const store = await readStore();

  const next = {
    ...store,
    companies: {
      ...store.companies,
      [companyId]: value,
    },
  };

  await writeStore(next);

  return value;
};

export const updateCompanySubscription = async (
  companyId: string,
  patch: Partial<CompanySubscriptionState>,
): Promise<CompanySubscriptionState> => {
  const current = await getCompanySubscription(companyId);
  const next = { ...current, ...patch };
  await setCompanySubscription(companyId, next);
  return next;
};

export const findCompanyIdByStripeCustomerId = async (customerId: string): Promise<string | null> => {
  const store = await readStore();

  for (const [companyId, state] of Object.entries(store.companies)) {
    if (state.stripeCustomerId === customerId) {
      return companyId;
    }
  }

  return null;
};
