'use server'

import { Prisma } from "@prisma/client"


//fetch all cars
export async function getcars() {
    return await prisma.Car.findMany();
    
}
//create car
export async function createcars(data:{
    make: string
    model: string
    year: number
    price: number
    inStock?: boolean
}){
    return await prisma.Car.create({
        data:{
            ...data,
            inStock: data.inStock ?? true,
        }
    })
} 
