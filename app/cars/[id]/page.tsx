'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type CarDetail = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  inStock: boolean;
  // Add any other detailed fields here
};

export default function CarDetailPage() {
  const params = useParams();
  const id = params.id; // get the id from the URL params

  const [car, setCar] = useState<CarDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchCarDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/cars/${id}`);
        if (!res.ok) {
          throw new Error(res.status === 404 
            ? 'Car not found' 
            : 'Failed to fetch car details');
        }
        const data = await res.json();
        setCar(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetail();
  }, [id]);

  if (loading) return <div className="p-8">Loading car details...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!car) return <div className="p-8">No car details found.</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-4">{car.make} {car.model} ({car.year})</h1>
      <p className="text-xl mb-2">Price: ${car.price.toFixed(2)} / Day</p>
      <p className={`mb-2 font-medium ${car.inStock ? 'text-green-600' : 'text-red-600'}`}>
        {car.inStock ? 'Available' : 'Out of Stock'}
      </p>

      {/* Add more detailed info here */}
      {/* e.g., specs, images, features, etc. */}

      <button
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!car.inStock}
      >
        {car.inStock ? 'Rent This Car' : 'Unavailable'}
      </button>
    </div>
  );
}