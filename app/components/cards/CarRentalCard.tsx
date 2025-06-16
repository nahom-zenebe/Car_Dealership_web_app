'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaCar, FaGasPump, FaTachometerAlt, FaUsers, FaStar } from 'react-icons/fa';

export default function CarRentalCard({
  id,
  make,
  model,
  year,
  price,
  inStock,
  mileage,
  color,
  imageUrls,
  transmission,
  fuelType
}: {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  inStock: boolean;
  mileage: number;
  color: string;
  imageUrls: string[];
  transmission: string;
  fuelType: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Rotate images on hover
  useEffect(() => {
    if (isHovered && imageUrls.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isHovered, imageUrls.length]);

  const getRandomColor = () => {
    const colors = [
      'bg-gray-200',
      'bg-blue-100',
      'bg-green-100',
      'bg-red-100',
      'bg-yellow-100',
      'bg-purple-100',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <Link href={`/cars/${id}`} passHref>
      <div
        className={`relative max-w-sm rounded-xl overflow-hidden shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
          isLoading ? 'animate-pulse' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 z-10"></div>
        )}

        {/* Image Section */}
        <div className="h-48 relative overflow-hidden">
          {imageUrls?.length > 0 ? (
            <img
              src={imageUrls[currentImageIndex]}
              alt={`${make} ${model}`}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setIsLoading(false)}
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center ${getRandomColor()} ${
                isLoading ? 'opacity-50' : 'opacity-100'
              }`}
            >
              <FaCar className="text-gray-400 text-5xl" />
            </div>
          )}
          {!isLoading && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {currentImageIndex + 1}/{imageUrls.length || 1}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 bg-white">
          {/* Title Section */}
          <div className="mb-3">
            <h2 className="text-xl font-bold text-gray-800 truncate">
              {make} {model}
            </h2>
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm">
                Year: {year} • {color}
              </p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {inStock ? 'Available' : 'Out of stock'}
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400 text-sm" />
              ))}
            </div>
            <span className="text-gray-600 text-sm ml-1">4.9 (100 reviews)</span>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-gray-700 text-sm">
              <FaTachometerAlt className="mr-2 text-gray-500" />
              {mileage.toLocaleString()} km
            </div>
            <div className="flex items-center text-gray-700 text-sm">
              <FaGasPump className="mr-2 text-gray-500" />
              {fuelType}
            </div>
            <div className="flex items-center text-gray-700 text-sm">
              <FaCar className="mr-2 text-gray-500" />
              {transmission}
            </div>
            <div className="flex items-center text-gray-700 text-sm">
              <FaUsers className="mr-2 text-gray-500" />
              5 Persons
            </div>
          </div>

          {/* Price & Button */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Starting from</p>
              <p className="text-xl font-bold text-gray-900">${price.toFixed(2)}/Day</p>
            </div>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                inStock
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!inStock}
            >
              {inStock ? 'Rent Now' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}