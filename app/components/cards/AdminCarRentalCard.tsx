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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MdDelete, MdEdit } from 'react-icons/md';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function AdminCarRentalCard({
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
  seats = 5,
  onDelete,
  onEdit
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
  onDelete?: (id: string) => void;
  onEdit?: (car: any) => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    make, model, year, price, inStock, mileage, color, transmission, fuelType, 
    features: features.join(', '), imageUrls: imageUrls.join(', ')
  });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
 
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

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    
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
    
    toggleFavorite(car);
  };

  const handleDeleteCar = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/cars/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete car');
      toast.success('Car deleted successfully');
      setShowDeleteDialog(false);
      if (onDelete) onDelete(id);
    } catch (err) {
      toast.error('Failed to delete car');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditCar = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowEditModal(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const submitEdit = async () => {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          year: Number(editForm.year),
          price: Number(editForm.price),
          mileage: Number(editForm.mileage),
          features: editForm.features.split(',').map(f => f.trim()),
          imageUrls: editForm.imageUrls.split(',').map(f => f.trim())
        })
      });
      if (!res.ok) throw new Error('Failed to update car');
      const updated = await res.json();
      toast.success('Car updated successfully');
      setShowEditModal(false);
      if (onEdit) onEdit(updated);
    } catch (err) {
      toast.error('Failed to update car');
    } finally {
      setEditLoading(false);
    }
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
      className="relative max-w-sm rounded-xl overflow-hidden shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-white group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Admin Actions - Always visible but more prominent on hover */}
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDeleteCar}
          className="h-8 w-8 rounded-full shadow-md opacity-80 hover:opacity-100 transition-opacity"
          title="Delete"
        >
          <MdDelete size={16} />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleEditCar}
          className="h-8 w-8 rounded-full shadow-md opacity-80 hover:opacity-100 transition-opacity"
          title="Edit"
        >
          <MdEdit size={16} />
        </Button>
      </div>

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

        <div className="absolute top-2 left-2 flex gap-2">
          {inStock ? (
            <Badge variant="default">Available</Badge>
          ) : (
            <Badge variant="destructive">Out of stock</Badge>
          )}
          {features.includes('Featured') && <Badge variant="secondary">Featured</Badge>}
        </div>

        <button
          onClick={handleToggleFavorite}
          className="absolute top-12 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors z-10"
          aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
        >
          {favorited ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-gray-700" />
          )}
        </button>

        {!isLoading && imageUrls.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {currentImageIndex + 1}/{imageUrls.length}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-3">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-800 truncate">
              {make} {model}
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    toast.success('Added to comparison');
                  }}
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

        <div className="flex items-center mb-3 gap-2">
          {renderRatingStars()}
          <span className="text-gray-600 text-sm">
            {rating.toFixed(1)} ({reviewCount.toLocaleString()} reviews)
          </span>
        </div>

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

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Starting from</p>
            <p className="text-xl font-bold text-gray-900">
              ${price.toLocaleString()}
             
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="min-w-[100px]"
            >
              {inStock ? 'Add to Cart' : 'Unavailable'}
            </Button>
          </div>
        </div>

        <div className="mt-3 text-right">
          <Link 
            href={`/cars/${id}`} 
            className="text-sm text-blue-600 hover:underline"
          >
            View details &rarr;
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete the <span className="font-semibold">{make} {model}</span>?</p>
            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete Car'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Car Details</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                name="make"
                value={editForm.make}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                value={editForm.model}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                type="number"
                value={editForm.year}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($/day)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={editForm.price}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage (km)</Label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                value={editForm.mileage}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                name="color"
                value={editForm.color}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmission">Transmission</Label>
              <Select
                value={editForm.transmission}
                onValueChange={(value) => handleSelectChange('transmission', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="SemiAutomatic">Semi-Automatic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select
                value={editForm.fuelType}
                onValueChange={(value) => handleSelectChange('fuelType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gasoline">Gasoline</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Electric">Electric</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Features (comma separated)</Label>
              <Input
                id="features"
                name="features"
                value={editForm.features}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrls">Image URLs (comma separated)</Label>
              <Input
                id="imageUrls"
                name="imageUrls"
                value={editForm.imageUrls}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                name="inStock"
                checked={editForm.inStock}
                onCheckedChange={(checked) => 
                  setEditForm(prev => ({ ...prev, inStock: checked as boolean }))
                }
              />
              <Label htmlFor="inStock">Available for rent</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}