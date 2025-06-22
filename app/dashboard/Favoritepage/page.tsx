'use client';

import { useFavoriteStore } from '@/app/stores/useAppStore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FaHeartBroken } from 'react-icons/fa';
import CarRentalCard from '@/app/components/cards/CarRentalCard';
export default function FavoritesPage() {

  const { favorites } = useFavoriteStore();

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Your Favorite Cars
      </h1>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <FaHeartBroken className="text-6xl text-gray-400 mb-4" />
          <p className="text-lg text-gray-600 mb-4">No favorite cars yet.</p>
          <Link href="/cars">
            <Button className="px-6 py-2 text-sm">Browse Cars</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((car) => (
        <CarRentalCard
        key={car.id}
        id={car.id}
        make={car.make}
        model={car.model}
        year={car.year}
        price={car.price}
        mileage={car.mileage ?? 0}            // fallback to 0 if undefined
        color={car.color ?? 'Unknown'}        // fallback string
        inStock={car.inStock}
        imageUrls={car.imageUrls}
        transmission={car.transmission ?? 'Automatic'} // fallback transmission
        fuelType={car.fuelType ?? 'Gasoline'}          // fallback fuelType
        features={car.features ?? []}
      />
      
       
          ))}
        </div>
      )}
    </div>
  );
}
