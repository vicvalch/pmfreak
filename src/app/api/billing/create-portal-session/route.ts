import { getAuthUser } from "@/lib/auth";
import { getCompanySubscription } from "@/lib/billing";
import { getStripeServerClient } from "@/lib/stripe";

export async function POST(request: Request) {
  const user = await getAuthUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await getCompanySubscription(user.companyId);

  if (!subscription.stripeCustomerId) {
    return Response.json({ error: "No Stripe customer found for this company." }, { status: 400 });
  }

  try {
    const stripe = getStripeServerClient();
    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${origin}/billing`,
    });

    return Response.json({ url: session.url });
  } catch {
    return Response.json({ error: "Unable to create Stripe billing portal session." }, { status: 502 });
  }
}
