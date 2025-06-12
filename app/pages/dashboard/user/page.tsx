'use client';

import React from 'react';
import CarRentalCard from '@/app/components/cards/CarRentalCard'; 

import { FaSearch, FaFilter, FaUndo } from 'react-icons/fa';


import { useState } from 'react';
import Sidebar from '@/app/components/layout/sidebar'; 

export default function UserDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="bg-gray-100 min-h-screen p-8 flex gap-8">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Filter Bar */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

            {/* 🔍 Search Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by model or brand"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-xl py-2 pl-10 pr-4 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-9 text-gray-400" />
            </div>

            {/* 🚗 Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select className="w-full border border-gray-300 rounded-xl py-2 px-4 shadow-sm">
                <option>All Brands</option>
                <option>Tesla</option>
                <option>BMW</option>
                <option>Audi</option>
                <option>Mercedes</option>
              </select>
            </div>

            {/* 💰 Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <select className="w-full border border-gray-300 rounded-xl py-2 px-4 shadow-sm">
                <option>Any</option>
                <option>Under $30,000</option>
                <option>$30,000 - $60,000</option>
                <option>Over $60,000</option>
              </select>
            </div>

            {/* 🧼 Reset Filters */}
            <div>
              <button className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 px-4 rounded-xl shadow hover:bg-red-600 transition-all">
                <FaUndo /> Reset Filters
              </button>
            </div>
          </div>

          {/* 🚦 Additional Filters */}
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="form-checkbox text-blue-600" /> Electric
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="form-checkbox text-blue-600" /> Petrol
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="form-checkbox text-blue-600" /> Diesel
            </label>
          </div>
        </div>

        {/* Car Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 28 }).map((_, index) => (
            <CarRentalCard key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
