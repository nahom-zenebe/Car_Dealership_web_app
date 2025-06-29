// types/stripe.d.ts
import { Stripe } from '@stripe/stripe-js';

declare global {
  interface Window {
    Stripe: typeof Stripe;
  }
}