


export default async function CreateSales(data:{
    carId: string;
    customerId: string;
    price: number;
    sellerId: string;
    saleDate?: Date;
}) {
    return await prisma.sales
    
}