import { PrismaClient } from '@/app/generated/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const sales = await prisma.sale.findMany();
    return res.status(200).json(sales);
  }

  if (req.method === 'POST') {
    const { carId, customerId, price } = req.body;
    const sale = await prisma.sale.create({
      data: {
        carId,
        customerId,
        price,
   
        
      },
    });
    return res.status(201).json(sale);
  }

  return res.status(405).end();
}
