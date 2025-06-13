import { NextResponse } from 'next/server';
import { PrismaClient } from '../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for appointment creation
const appointmentSchema = z.object({
  customerId: z.string(),
  carId: z.string(),
  date: z.string().datetime(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
});

// GET /api/appointments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const carId = searchParams.get('carId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (carId) where.carId = carId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        car: true,
      },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST /api/appointments
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = appointmentSchema.parse(body);

    // Check if the car is available for the appointment time
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        carId: validatedData.carId,
        date: new Date(validatedData.date),
        status: 'scheduled',
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Car is already booked for this time slot' },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
      },
      include: {
        customer: true,
        car: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
} 