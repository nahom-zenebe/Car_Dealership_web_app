'use client';

import CarRentalCard from '@/app/components/cards/CarRentalCard'; 
import { FaSearch, FaFilter, FaUndo } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/app/components/layout/sidebar'; 

type Car = {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    inStock: boolean;
};

export default function UserDashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    const [cars, setCars] = useState<Car[]>([]);
    const [error, setError] = useState<string | null>(null);  // <-- moved here

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
            <Sidebar />
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
                            make={car.make}
                            model={car.model}
                            year={car.year}
                            price={car.price}
                            inStock={car.inStock}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
