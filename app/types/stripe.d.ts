// types/stripe.d.ts
import { Stripe, StripeElements } from '@stripe/stripe-js';

declare global {
  interface Window {
    Stripe?: Stripe;
  }
}