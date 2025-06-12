import { PrismaClient } from '@/app/generated/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method === 'GET') {
    const car = await prisma.car.findUnique({ where: { id } });
    return car ? res.status(200).json(car) : res.status(404).end();
  }

  if (req.method === 'PUT') {
    const data = req.body;
    const updated = await prisma.car.update({ where: { id }, data });
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    await prisma.car.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).end();
}
