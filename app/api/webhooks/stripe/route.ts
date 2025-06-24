// Add new route /api/webhooks/stripe
export async function POST(request: Request) {
    const sig = request.headers.get('stripe-signature')!;
    const body = await request.text();
  
    let event: Stripe.Event;
  
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
  
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await prisma.sale.update({
          where: { paymentIntentId: paymentIntent.id },
          data: { 
            paymentStatus: 'succeeded',
            status: 'completed' 
          }
        });
        break;
      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        await prisma.sale.update({
          where: { paymentIntentId: failedIntent.id },
          data: { 
            paymentStatus: 'failed',
            failureReason: failedIntent.last_payment_error?.message 
          }
        });
        break;
    }
  
    return NextResponse.json({ received: true });
  }