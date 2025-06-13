import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for appointment update
const appointmentUpdateSchema = z.object({
  date: z.string().datetime().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
});

// GET /api/appointments/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        car: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

// PUT /api/appointments/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = appointmentUpdateSchema.parse(body);

    // If updating the date, check for conflicts
    if (validatedData.date) {
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          carId: (await prisma.appointment.findUnique({ where: { id: params.id } }))?.carId,
          date: new Date(validatedData.date),
          status: 'scheduled',
          id: { not: params.id }, // Exclude current appointment
        },
      });

      if (existingAppointment) {
        return NextResponse.json(
          { error: 'Car is already booked for this time slot' },
          { status: 409 }
        );
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
      },
      include: {
        customer: true,
        car: true,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.appointment.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
} 