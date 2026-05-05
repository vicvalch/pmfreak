import Stripe from "stripe";
import {
  findCompanyIdByStripeCustomerId,
  getCompanySubscription,
  type SubscriptionPlan,
  updateCompanySubscription,
} from "@/lib/billing";
import { getStripeServerClient } from "@/lib/stripe";

const toIsoDate = (timestampSeconds?: number | null) => {
  if (!timestampSeconds) {
    return null;
  }

  return new Date(timestampSeconds * 1000).toISOString();
};

const planForSubscription = (subscription: Stripe.Subscription): SubscriptionPlan => {
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
  const hasProPrice = subscription.items.data.some((item) => item.price.id === proPriceId);

  if (hasProPrice) {
    return "pro";
  }

  const pmoPriceId = process.env.STRIPE_PMO_PRICE_ID;
  const hasPmoPrice = subscription.items.data.some((item) => item.price.id === pmoPriceId);

  if (hasPmoPrice) {
    return "pmo";
  }

  return "free";
};

const companyIdFromSubscription = async (subscription: Stripe.Subscription) => {
  const metadataCompanyId = subscription.metadata.companyId;

  if (metadataCompanyId) {
    return metadataCompanyId;
  }

  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  return findCompanyIdByStripeCustomerId(customerId, { useServiceRole: true });
};

const applySubscriptionUpdate = async (subscription: Stripe.Subscription) => {
  const companyId = await companyIdFromSubscription(subscription);

  if (!companyId) {
    return;
  }

  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  const periodEnd = subscription.items.data[0]?.current_period_end ?? null;

  await updateCompanySubscription(companyId, {
    plan: planForSubscription(subscription),
    subscriptionStatus: subscription.status,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    currentPeriodEnd: toIsoDate(periodEnd),
  }, { useServiceRole: true });
};

const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  const companyId = await companyIdFromSubscription(subscription);

  if (!companyId) {
    return;
  }

  const current = await getCompanySubscription(companyId, { useServiceRole: true });

  await updateCompanySubscription(companyId, {
    plan: "free",
    subscriptionStatus: "canceled",
    stripeCustomerId:
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
    stripeSubscriptionId: current.stripeSubscriptionId,
    currentPeriodEnd: toIsoDate(subscription.items.data[0]?.current_period_end ?? null),
  }, { useServiceRole: true });
};

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json({ error: "Missing STRIPE_WEBHOOK_SECRET on server." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing Stripe signature header." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    const stripe = getStripeServerClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== "subscription" || !session.subscription) {
          break;
        }

        const stripe = getStripeServerClient();
        const subscription = await stripe.subscriptions.retrieve(
          typeof session.subscription === "string" ? session.subscription : session.subscription.id,
        );

        await applySubscriptionUpdate(subscription);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await applySubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }

    return Response.json({ received: true });
  } catch {
    return Response.json({ error: "Unable to process webhook." }, { status: 500 });
  }
}
