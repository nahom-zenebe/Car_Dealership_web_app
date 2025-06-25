// app/api/payment-intent/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import {  PrismaClient } from '../../generated/prisma';


const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {

});

export async function POST(request: Request) {
  try {
    const { amount, currency, items } = await request.json();

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        items: JSON.stringify(items.map((item: any) => ({
          carId: item.carId,
          price: item.price,
          quantity: item.quantity,
        }))),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message } },
      { status: 400 }
    );
  }
}