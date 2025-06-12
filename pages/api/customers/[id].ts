import { PrismaClient } from '@/app/generated/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method === 'GET') {
    const customer = await prisma.customer.findUnique({ where: { id } });
    return customer ? res.status(200).json(customer) : res.status(404).end();
  }

  if (req.method === 'PUT') {
    const data = req.body;
    const updated = await prisma.customer.update({ where: { id }, data });
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    await prisma.customer.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).end();
}
