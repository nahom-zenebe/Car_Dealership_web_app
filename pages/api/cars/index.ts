import { PrismaClient } from '@/app/generated/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';


const prisma =new PrismaClient();

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    if(req.method==="GET"){
        const cars=await prisma.car.findMany();
        return res.status(200).json(cars);

    }

if(req.method==="POST"){
    const {make,model,year,price}=req.body;
    const newCar=await prisma.car.create({
        data:{make,model,year,price}
    });
    return res.status(201).json(newCar);

}
return res.status(405).end();
    
}