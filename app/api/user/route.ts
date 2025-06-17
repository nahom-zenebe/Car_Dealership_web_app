import { NextResponse } from 'next/server';
import { PrismaClient } from '../../generated/prisma';
import { z } from 'zod';
const prisma = new PrismaClient();

const appointmentSchema = z.object({
    customerId: z.string(),
    carId: z.string(),
    date: z.string().datetime(),
    status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
    notes: z.string().optional(),
  });
  