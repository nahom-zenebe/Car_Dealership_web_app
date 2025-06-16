import { NextResponse } from 'next/server';
import { FuelType, PrismaClient, Transmission } from '../../generated/prisma';
import { z } from 'zod';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Zod schemas
const fuelTypeEnum = z.nativeEnum(FuelType);
const transmissionEnum = z.nativeEnum(Transmission);

const carSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().positive(),
  mileage: z.number().int().min(0).optional(),
  color: z.string().min(1).optional(),
  inStock: z.boolean().optional(),
  features: z.array(z.string().min(1)).optional(),
  fuelType: fuelTypeEnum,
  transmission: transmissionEnum,
  description: z.string().optional(),
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Get JSON data from formData
    const carData = formData.get('carData');
    if (!carData || typeof carData !== 'string') {
      return NextResponse.json(
        { error: 'Missing car data' },
        { status: 400 }
      );
    }

    // Parse and validate car data
    const parsedData = JSON.parse(carData);
    const validatedData = carSchema.parse({
      ...parsedData,
      year: Number(parsedData.year),
      price: Number(parsedData.price),
      mileage: parsedData.mileage ? Number(parsedData.mileage) : undefined,
    });

    // Handle multiple image uploads
    const imageFiles = formData.getAll('images');
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      if (file instanceof Blob) {
        const buffer = Buffer.from(await file.arrayBuffer());
        
        const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'car-listings' },
            (error, result?: UploadApiResponse) => {
              if (error) return reject(error);
              if (!result) return reject(new Error('Upload failed: no result returned'));
              resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        imageUrls.push(uploadResult.secure_url);
      }
    }

    // Create car in database with all image URLs
    const car = await prisma.car.create({
      data: {
        ...validatedData,
        imageUrls, // Store as an array of URLs
      },
    });

    return NextResponse.json(car, { status: 201 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating car:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create car' }, 
      { status: 500 }
    );
  }
}

// GET handler remains the same...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');

    const where: any = {};
    if (make) where.make = { contains: make, mode: 'insensitive' };
    if (model) where.model = { contains: model, mode: 'insensitive' };
    if (inStock) where.inStock = inStock === 'true';
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const cars = await prisma.car.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
  }
}