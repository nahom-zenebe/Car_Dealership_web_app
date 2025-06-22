'use client';

import { useState, useEffect } from 'react';
import { FaCar, FaGasPump, FaTachometerAlt, FaUsers, FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useCartStore, type Transmission, type FuelType } from "@/app/stores/useAppStore";
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from 'framer-motion';
import { useFavoriteStore } from '@/app/stores/useAppStore';
import { Car } from 'lucide-react';
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
  fuelType,
  features = [],
  rating = 4.9,
  reviewCount = 100,
  seats = 5
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
  features?: string[];
  rating?: number;
  reviewCount?: number;
  seats?: number;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
 
  const addToCart = useCartStore((state) => state.addToCart);
  const { toggleFavorite, isFavorite } = useFavoriteStore();
  const favorited = isFavorite(id);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isHovered && imageUrls.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isHovered, imageUrls.length]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Type-safe validation
    const validateTransmission = (t: string): Transmission | undefined => {
      const validTransmissions: Transmission[] = ['Automatic', 'Manual', 'SemiAutomatic'];
      return validTransmissions.includes(t as Transmission) ? t as Transmission : undefined;
    };

    const validateFuelType = (f: string): FuelType | undefined => {
      const validFuelTypes: FuelType[] = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];
      return validFuelTypes.includes(f as FuelType) ? f as FuelType : undefined;
    };

    const car = {
      id,
      make,
      model,
      year,
      price,
      mileage,
      color,
      inStock,
      imageUrls,
      transmission: validateTransmission(transmission),
      fuelType: validateFuelType(fuelType),
      features,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    addToCart(car);
    toast.success(`${make} ${model} added to cart`);
  };

  

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success('Added to comparison');
  };

  const renderRatingStars = () => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative max-w-sm rounded-xl overflow-hidden shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <FaCar className="text-gray-400 text-5xl" />
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {inStock ? (
            <Badge variant="default">Available</Badge>
          ) : (
            <Badge variant="destructive">Out of stock</Badge>
          )}
          {features.includes('Featured') && <Badge variant="secondary">Featured</Badge>}
        </div>

        {/* Favorite Button */}
       <button
      onClick={() => toggleFavorite(car)}
      className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
      aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
    >
      {favorited ? (
        <FaHeart className="text-red-500" />
      ) : (
        <FaRegHeart className="text-gray-700" />
      )}
    </button>

        {/* Image Counter */}
        {!isLoading && imageUrls.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {currentImageIndex + 1}/{imageUrls.length}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title Section */}
        <div className="mb-3">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-800 truncate">
              {make} {model}
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleAddToCompare}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Compare
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add to comparison</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-gray-600 text-sm">
            {year} • {color} • {transmission}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3 gap-2">
          {renderRatingStars()}
          <span className="text-gray-600 text-sm">
            {rating.toFixed(1)} ({reviewCount.toLocaleString()} reviews)
          </span>
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
            {seats} Seats
          </div>
        </div>

        {/* Features Badges */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {features.slice(0, 3).map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{features.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Price & Button */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Starting from</p>
            <p className="text-xl font-bold text-gray-900">
              ${price.toLocaleString()}
              <span className="text-sm text-gray-500">/day</span>
            </p>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="min-w-[100px]"
          >
            {inStock ? 'Rent Now' : 'Unavailable'}
          </Button>
        </div>

        {/* View Details Link */}
        <div className="mt-3 text-right">
          <Link 
            href={`/cars/${id}`} 
            className="text-sm text-blue-600 hover:underline"
          >
            View details &rarr;
          </Link>
        </div>
      </div>
    </motion.div>
  );
}