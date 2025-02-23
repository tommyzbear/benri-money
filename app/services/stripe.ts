import Stripe from "stripe";
import { loadStripeOnramp } from "@stripe/crypto";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-01-27.acacia",
});

export const OnrampSessionResource = Stripe.StripeResource.extend({
    create: Stripe.StripeResource.method({
        method: 'POST',
        path: 'crypto/onramp_sessions',
    }),
});

export const stripeOnrampPromise = loadStripeOnramp(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string); 