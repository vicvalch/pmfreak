import { getAuthUser } from "@/lib/auth";
import { getCompanySubscription, updateCompanySubscription } from "@/lib/billing";
import { getStripeServerClient } from "@/lib/stripe";

type CheckoutPayload = {
  plan?: "pro" | "enterprise";
};

export async function POST(request: Request) {
  const user = await getAuthUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: CheckoutPayload;

  try {
    payload = (await request.json()) as CheckoutPayload;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const plan = payload.plan ?? "pro";

  if (plan === "enterprise") {
    return Response.json(
      { error: "Enterprise billing is handled via sales. Please contact support." },
      { status: 400 },
    );
  }

  const priceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!priceId) {
    return Response.json({ error: "Missing STRIPE_PRO_PRICE_ID on the server." }, { status: 500 });
  }

  try {
    const stripe = getStripeServerClient();
    const subscription = await getCompanySubscription(user.companyId);

    const customerId = subscription.stripeCustomerId
      ? subscription.stripeCustomerId
      : (
          await stripe.customers.create({
            email: user.email,
            name: user.companyName,
            metadata: {
              companyId: user.companyId,
              companyName: user.companyName,
              requestedByUserId: user.id,
            },
          })
        ).id;

    if (!subscription.stripeCustomerId) {
      await updateCompanySubscription(user.companyId, { stripeCustomerId: customerId });
    }

    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing?success=true`,
      cancel_url: `${origin}/billing?canceled=true`,
      metadata: {
        companyId: user.companyId,
        plan,
      },
      subscription_data: {
        metadata: {
          companyId: user.companyId,
          plan,
        },
      },
    });

    return Response.json({ url: session.url });
  } catch {
    return Response.json({ error: "Unable to create Stripe checkout session." }, { status: 502 });
  }
}
