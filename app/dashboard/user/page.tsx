'use client';

import CarRentalCard from '@/app/components/cards/CarRentalCard'; 
import { FaSearch, FaFilter, FaUndo } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/app/components/layout/sidebar'; 
import { type Transmission, type FuelType } from '@/app/stores/useAppStore';

type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  inStock: boolean;
  mileage: number;
  color: string;
  imageUrls: string[];  
  createdAt: Date;
  updatedAt: Date;
  transmission: Transmission;
  features: string[];  
  fuelType: FuelType;
};

export default function UserDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/cars');
        if (!res.ok) {
          throw new Error('Failed to fetch cars');
        }
        const data: Car[] = await res.json();
        setCars(data);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      }
    };

    fetchCars();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-8 flex gap-8">
      <div className="flex flex-col flex-grow">
        {error && (
          <div className="text-red-500 mb-4">
            Error: {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cars.map((car) => (
            <CarRentalCard
              key={car.id}
              id={car.id} 
              make={car.make}
              model={car.model}
              year={car.year}
              price={car.price}
              inStock={car.inStock}
              mileage={car.mileage}
              color={car.color}
              imageUrls={car.imageUrls}
              transmission={car.transmission}
              fuelType={car.fuelType}
              features={car.features}
            />
          ))}
        </div>
      </div>
    </div>
  );
}