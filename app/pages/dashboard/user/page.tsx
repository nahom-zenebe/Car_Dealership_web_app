'use client';

import React from 'react';
import CarRentalCard from '@/app/components/cards/CarRentalCard'; 

import { FaSearch, FaFilter, FaUndo } from 'react-icons/fa';
import { getcars } from '@/app/actions/carActions';

import { useState } from 'react';
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

    React.useEffect(() => {
        const fetchCars = async () => {
            const data = await getcars();
            setCars(data);
        };
        fetchCars();
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen p-8 flex gap-8">
            <Sidebar/>
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
    );
}
