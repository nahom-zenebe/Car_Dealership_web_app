'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaCar, FaGasPump, FaTachometerAlt, FaUsers, FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useCartStore, type Transmission, type FuelType } from "@/app/stores/useAppStore";
import toast from 'react-hot-toast';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from 'framer-motion';
import { useFavoriteStore } from '@/app/stores/useAppStore';

type CarDetail = {
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
  features: string[];
  rating?: number;
  reviewCount?: number;
  seats?: number;
};

export default function CarDetailPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const [car, setCar] = useState<CarDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);
  const { toggleFavorite, isFavorite: checkFavorite } = useFavoriteStore();

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
        setIsFavorite(checkFavorite(data.id));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetail();
  }, [id, checkFavorite]);

  const nextImage = () => {
    if (!car) return;
    setCurrentImageIndex((prev) => (prev + 1) % car.imageUrls.length);
  };

  const prevImage = () => {
    if (!car) return;
    setCurrentImageIndex((prev) => (prev - 1 + car.imageUrls.length) % car.imageUrls.length);
  };

  const handleAddToCart = () => {
    if (!car) return;
    
    const validateTransmission = (t: string): Transmission | undefined => {
      const validTransmissions: Transmission[] = ['Automatic', 'Manual', 'SemiAutomatic'];
      return validTransmissions.includes(t as Transmission) ? t as Transmission : undefined;
    };

    const validateFuelType = (f: string): FuelType | undefined => {
      const validFuelTypes: FuelType[] = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];
      return validFuelTypes.includes(f as FuelType) ? f as FuelType : undefined;
    };

    const carItem = {
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      mileage: car.mileage,
      color: car.color,
      inStock: car.inStock,
      imageUrls: car.imageUrls,
      transmission: validateTransmission(car.transmission),
      fuelType: validateFuelType(car.fuelType),
      features: car.features,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    addToCart(carItem);
    toast.success(`${car.make} ${car.model} added to cart`);
  };

  const handleToggleFavorite = () => {
    if (!car) return;
    
    const validateTransmission = (t: string): Transmission | undefined => {
      const validTransmissions: Transmission[] = ['Automatic', 'Manual', 'SemiAutomatic'];
      return validTransmissions.includes(t as Transmission) ? t as Transmission : undefined;
    };
  
    const validateFuelType = (f: string): FuelType | undefined => {
      const validFuelTypes: FuelType[] = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];
      return validFuelTypes.includes(f as FuelType) ? f as FuelType : undefined;
    };
  
    const carItem = {
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      mileage: car.mileage,
      color: car.color,
      inStock: car.inStock,
      imageUrls: car.imageUrls,
      transmission: validateTransmission(car.transmission),
      fuelType: validateFuelType(car.fuelType),
      features: car.features,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    toggleFavorite(carItem);
    setIsFavorite(!isFavorite);
  };

  const renderRatingStars = (rating: number = 4.9) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <FaStar key={i} className="text-yellow-400 text-sm" />;
          } else if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative">
                <FaStar className="text-gray-300 text-sm" />
                <FaStar className="text-yellow-400 text-sm absolute top-0 w-1/2 overflow-hidden" />
              </div>
            );
          } else {
            return <FaStar key={i} className="text-gray-300 text-sm" />;
          }
        })}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-4"></div>
        <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      Error: {error}
    </div>
  );

  if (!car) return (
    <div className="min-h-screen flex items-center justify-center">
      No car details found.
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <button 
        onClick={() => router.back()}
        className="mb-8 flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to results
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Image Gallery */}
        <div className="relative h-96 bg-gray-100 md:h-[500px]">
          {car.imageUrls.length > 0 ? (
            <>
              <Image
                src={car.imageUrls[currentImageIndex]}
                alt={`${car.make} ${car.model}`}
                fill
                className="object-cover"
                priority
              />
              
              <div className="absolute top-4 left-4 flex gap-2">
                {car.inStock ? (
                  <Badge variant="default">Available</Badge>
                ) : (
                  <Badge variant="destructive">Out of stock</Badge>
                )}
                {car.features.includes('Featured') && <Badge variant="secondary">Featured</Badge>}
              </div>

              <button
                onClick={handleToggleFavorite}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/80 hover:bg-white transition-colors shadow-md"
                aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isFavorite ? (
                  <FaHeart className="text-red-500 text-xl" />
                ) : (
                  <FaRegHeart className="text-gray-700 text-xl" />
                )}
              </button>

              {car.imageUrls.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors shadow-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors shadow-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {car.imageUrls.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'}`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <FaCar className="text-5xl" />
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Car Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl md:text-4xl font-bold text-gray-900"
                >
                  {car.make} {car.model}
                </motion.h1>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => toast.success('Added to comparison')}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Compare
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add to comparison</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-600 mb-6"
              >
                {car.year} • {car.color} • {car.transmission}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4 mb-8"
              >
                {renderRatingStars(car.rating)}
                <span className="text-gray-600">
                  {car.rating?.toFixed(1) || '4.9'} ({car.reviewCount?.toLocaleString() || '100'} reviews)
                </span>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-4 mb-8"
              >
                <div className="flex items-center text-gray-700 p-3 bg-gray-50 rounded-lg">
                  <FaTachometerAlt className="mr-3 text-gray-500 text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Mileage</p>
                    <p className="font-medium">{car.mileage.toLocaleString()} km</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700 p-3 bg-gray-50 rounded-lg">
                  <FaGasPump className="mr-3 text-gray-500 text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Fuel Type</p>
                    <p className="font-medium">{car.fuelType}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700 p-3 bg-gray-50 rounded-lg">
                  <FaCar className="mr-3 text-gray-500 text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Transmission</p>
                    <p className="font-medium">{car.transmission}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700 p-3 bg-gray-50 rounded-lg">
                  <FaUsers className="mr-3 text-gray-500 text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Seats</p>
                    <p className="font-medium">{car.seats || 5}</p>
                  </div>
                </div>
              </motion.div>

              {car.features.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8"
                >
                  <h3 className="text-xl font-semibold mb-4">Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {car.features.map((feature, index) => (
                      <div key={index} className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
                        <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 pt-6 border-t border-gray-200"
              >
                <h3 className="text-xl font-semibold mb-4">Description</h3>
                <p className="text-gray-600">
                  The {car.make} {car.model} is a premium vehicle that combines performance and luxury. 
                  With its {car.transmission.toLowerCase()} transmission and {car.fuelType.toLowerCase()} engine, 
                  it offers an exceptional driving experience. The spacious interior comfortably seats {car.seats || 5} 
                  passengers, making it perfect for both city driving and long trips.
                </p>
              </motion.div>
            </div>

            {/* Pricing and Action */}
            <div className="md:w-80 lg:w-96">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 p-6 rounded-xl sticky top-6"
              >
                <div className="mb-6">
                  <p className="text-sm text-gray-500">Starting from</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${car.price.toLocaleString()}
                    <span className="text-base text-gray-500">/day</span>
                  </p>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!car.inStock}
                  className="w-full py-6 text-lg"
                >
                  {car.inStock ? 'Add to Cart' : 'Currently Unavailable'}
                </Button>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-3">Included in your rental:</h3>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Unlimited mileage
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Collision damage waiver
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      24/7 roadside assistance
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Free cancellation
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}