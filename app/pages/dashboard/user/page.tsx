'use client';

import React from 'react';
import CarRentalCard from '@/app/components/cards/CarRentalCard'; 

import { FaSearch, FaFilter, FaUndo } from 'react-icons/fa';
import { getcars } from '@/app/actions/carActions';

import { useState } from 'react';
import Sidebar from '@/app/components/layout/sidebar'; 

export  default async function UserDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const cars = await getcars()
  return (
    <div className="bg-gray-100 min-h-screen p-8 flex gap-8">
      <Sidebar/>
    
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 28 }).map((_, index) => (
            <CarRentalCard   key={cars.id}
            make={cars.make}
            model={cars.model}
            year={cars.year}
            price={cars.price}
            inStock={cars.inStock} />
          ))}
        </div>
      </div>
  
  );
}
