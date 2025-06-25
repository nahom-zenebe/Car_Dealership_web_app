import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/app/lib/stripe';
import { PrismaClient } from '@/app/generated/prisma';
import Stripe from 'stripe';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentSucceeded(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentFailed(failedIntent);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update sale record
    await prisma.sale.updateMany({
      where: { paymentIntentId: paymentIntent.id },
      data: {
        paymentStatus: 'succeeded',
        status: 'completed',
      },
    });

    // Mark cars as not in stock
    const sale = await prisma.sale.findFirst({
      where: { paymentIntentId: paymentIntent.id },
      include: { items: true },
    });

    if (sale) {
      await Promise.all(
        sale.items.map((item) =>
          prisma.car.update({
            where: { id: item.carId },
            data: { inStock: false },
          })
        )
      );
    }
  } catch (error) {
    console.error('Error handling successful payment intent:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    await prisma.sale.updateMany({
      where: { paymentIntentId: paymentIntent.id },
      data: {
        paymentStatus: 'failed',
        status: 'cancelled',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      },
    });
  } catch (error) {
    console.error('Error handling failed payment intent:', error);
  }
}