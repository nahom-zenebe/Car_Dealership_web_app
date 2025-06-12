import { PrismaClient } from '@/app/generated/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const customers = await prisma.customer.findMany();
    return res.status(200).json(customers);
  }

  if (req.method === 'POST') {
    const { name, email, phone } = req.body;
    const customer = await prisma.customer.create({ data: { name, email, phone } });
    return res.status(201).json(customer);
  }

  return res.status(405).end();
}
