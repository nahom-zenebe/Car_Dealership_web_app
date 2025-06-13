'use server'

import { prisma } from '@/app/lib/prisma';
import { Car } from '../generated/prisma';


//fetch all cars
export async function getcars(): Promise<Car[]> {
    return await prisma.car.findMany();
}

//create car
export async function createcars(data: {
    make: string;
    model: string;
    year: number;
    price: number;
    inStock?: boolean;
}): Promise<Car> {
    return await prisma.car.create({
        data: {
            ...data,
            inStock: data.inStock ?? true,
        }
    });
}
