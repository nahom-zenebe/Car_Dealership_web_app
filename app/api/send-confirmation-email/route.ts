import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, userId } = await req.json();

    if (!paymentIntentId && !userId) {
      return NextResponse.json({ error: 'Missing paymentIntentId or userId' }, { status: 400 });
    }

    // Fetch sale/order
    const sale = await prisma.sale.findFirst({
      where: paymentIntentId ? { paymentIntentId } : { buyerId: userId },
      include: {
        buyer: true,
        items: { include: { car: true } },
      },
    });

    if (!sale) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Prevent duplicate emails
    if (sale.emailSent) {
      return NextResponse.json({ message: 'Confirmation email already sent.' }, { status: 200 });
    }

    // Compose order summary
    const orderSummary = sale.items.map(item =>
      `${item.car.make} ${item.car.model} (${item.car.year}) - $${item.price.toFixed(2)}`
    ).join('\n');

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Car Dealership" <${process.env.SMTP_USER}>`,
      to: sale.buyer.email,
      subject: 'Your Car Purchase Confirmation',
      text: `Thank you for your purchase!\n\nOrder Summary:\n${orderSummary}\n\nTotal: $${sale.price.toFixed(2)}\n\nWe will contact you soon.`,
    });

    // Mark as email sent
    await prisma.sale.update({
      where: { id: sale.id },
      data: { emailSent: true },
    });

    return NextResponse.json({ message: 'Confirmation email sent.' });
  } catch (error: any) {
    console.error('Send confirmation email error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 