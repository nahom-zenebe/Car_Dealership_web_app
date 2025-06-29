'use client';

import CarRentalCard from '@/app/components/cards/CarRentalCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FaSearch, FaFilter, FaUndo } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import { type Transmission, type FuelType } from '@/app/stores/useAppStore';

type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  inStock: boolean;
  mileage?: number;
  color?: string;
  imageUrls: string[];
  createdAt: Date;
  updatedAt?: Date;
  transmission?: Transmission;
  features: string[];
  fuelType?: FuelType;
};

export default function UserDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [yearRange, setYearRange] = useState<[number, number]>([1990, new Date().getFullYear()]);
  const [mileageRange, setMileageRange] = useState<[number, number]>([0, 200000]);
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<Transmission[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<FuelType[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/cars');
        if (!res.ok) {
          throw new Error('Failed to fetch cars');
        }
        const data: Car[] = await res.json();
        setCars(data);
        setFilteredCars(data);
        
        // Extract unique makes and features for filters
        const makes = Array.from(new Set(data.map(car => car.make)));
        setSelectedMakes(makes);
        
        const features = Array.from(
          new Set(data.flatMap(car => car.features || []))
        ).sort();
        setAvailableFeatures(features);
        
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    searchTerm,
    priceRange,
    yearRange,
    mileageRange,
    selectedMakes,
    selectedTransmissions,
    selectedFuelTypes,
    inStockOnly,
    selectedFeatures,
    cars,
    sortOption
  ]);

  const applyFilters = () => {
    let results = [...cars];

    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(car => 
        car.make.toLowerCase().includes(term) || 
        car.model.toLowerCase().includes(term) ||
        `${car.year}`.includes(term)
      );
    }

    // Price filter
    results = results.filter(car => 
      car.price >= priceRange[0] && car.price <= priceRange[1]);

    // Year filter
    results = results.filter(car => 
      car.year >= yearRange[0] && car.year <= yearRange[1]);

    // Mileage filter
    results = results.filter(car => 
      (car.mileage || 0) >= mileageRange[0] && 
      (car.mileage || 0) <= mileageRange[1]);

    // Make filter
    if (selectedMakes.length > 0) {
      results = results.filter(car => 
        selectedMakes.includes(car.make));
    }

    // Transmission filter
    if (selectedTransmissions.length > 0) {
      results = results.filter(car => 
        car.transmission && selectedTransmissions.includes(car.transmission));
    }

    // Fuel type filter
    if (selectedFuelTypes.length > 0) {
      results = results.filter(car => 
        car.fuelType && selectedFuelTypes.includes(car.fuelType));
    }

    // In stock filter
    if (inStockOnly) {
      results = results.filter(car => car.inStock);
    }

    // Features filter
    if (selectedFeatures.length > 0) {
      results = results.filter(car => 
        selectedFeatures.every(feature => 
          car.features?.includes(feature)));
    }

    // Sorting
    if (sortOption) {
      switch (sortOption) {
        case 'price-asc':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'year-asc':
          results.sort((a, b) => a.year - b.year);
          break;
        case 'year-desc':
          results.sort((a, b) => b.year - a.year);
          break;
        case 'mileage-asc':
          results.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
          break;
        case 'mileage-desc':
          results.sort((a, b) => (b.mileage || 0) - (a.mileage || 0));
          break;
        default:
          break;
      }
    }

    setFilteredCars(results);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 100000]);
    setYearRange([1990, new Date().getFullYear()]);
    setMileageRange([0, 200000]);
    const allMakes = Array.from(new Set(cars.map(car => car.make)));
    setSelectedMakes(allMakes);
    setSelectedTransmissions([]);
    setSelectedFuelTypes([]);
    setInStockOnly(false);
    setSelectedFeatures([]);
    setSortOption('');
  };

  const handleMakeToggle = (make: string) => {
    setSelectedMakes(prev => 
      prev.includes(make) 
        ? prev.filter(m => m !== make) 
        : [...prev, make]);
  };

  const handleTransmissionToggle = (transmission: Transmission) => {
    setSelectedTransmissions(prev => 
      prev.includes(transmission) 
        ? prev.filter(t => t !== transmission) 
        : [...prev, transmission]);
  };

  const handleFuelTypeToggle = (fuelType: FuelType) => {
    setSelectedFuelTypes(prev => 
      prev.includes(fuelType) 
        ? prev.filter(f => f !== fuelType) 
        : [...prev, fuelType]);
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature) 
        : [...prev, feature]);
  };

  const uniqueMakes = Array.from(new Set(cars.map(car => car.make))).sort();

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 items-stretch">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by make, model, or year..."
              className="pl-10 pr-4 py-2 h-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 h-full">
                <FaFilter className="w-4 h-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader className="border-b pb-4 mb-4">
                <SheetTitle className="text-xl font-semibold">Filter Cars</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6">
                {/* Price Range */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="block mb-3 font-medium">Price Range</Label>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>${priceRange[0].toLocaleString()}</span>
                    <span>${priceRange[1].toLocaleString()}</span>
                  </div>
                  <Slider
                    min={0}
                    max={100000}
                    step={1000}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    minStepsBetweenThumbs={1}
                  />
                </div>
                
                {/* Year Range */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="block mb-3 font-medium">Year Range</Label>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{yearRange[0]}</span>
                    <span>{yearRange[1]}</span>
                  </div>
                  <Slider
                    min={1990}
                    max={new Date().getFullYear()}
                    step={1}
                    value={yearRange}
                    onValueChange={(value) => setYearRange(value as [number, number])}
                    minStepsBetweenThumbs={1}
                  />
                </div>
                
                {/* Mileage Range */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="block mb-3 font-medium">Mileage Range</Label>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{mileageRange[0].toLocaleString()} mi</span>
                    <span>{mileageRange[1].toLocaleString()} mi</span>
                  </div>
                  <Slider
                    min={0}
                    max={200000}
                    step={1000}
                    value={mileageRange}
                    onValueChange={(value) => setMileageRange(value as [number, number])}
                    minStepsBetweenThumbs={1}
                  />
                </div>
                
                {/* Makes */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="block mb-3 font-medium">Makes</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {uniqueMakes.map(make => (
                      <div key={make} className="flex items-center space-x-3">
                        <Checkbox
                          id={`make-${make}`}
                          checked={selectedMakes.includes(make)}
                          onCheckedChange={() => handleMakeToggle(make)}
                          className="h-5 w-5 rounded-md border-gray-300"
                        />
                        <Label htmlFor={`make-${make}`} className="text-sm font-normal">
                          {make}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Transmission */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="block mb-3 font-medium">Transmission</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Automatic', 'Manual', 'SemiAutomatic'].map(transmission => (
                      <div key={transmission} className="flex items-center space-x-3">
                        <Checkbox
                          id={`trans-${transmission}`}
                          checked={selectedTransmissions.includes(transmission as Transmission)}
                          onCheckedChange={() => handleTransmissionToggle(transmission as Transmission)}
                          className="h-5 w-5 rounded-md border-gray-300"
                        />
                        <Label htmlFor={`trans-${transmission}`} className="text-sm font-normal">
                          {transmission}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Fuel Type */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="block mb-3 font-medium">Fuel Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Gasoline', 'Diesel', 'Electric', 'Hybrid'].map(fuelType => (
                      <div key={fuelType} className="flex items-center space-x-3">
                        <Checkbox
                          id={`fuel-${fuelType}`}
                          checked={selectedFuelTypes.includes(fuelType as FuelType)}
                          onCheckedChange={() => handleFuelTypeToggle(fuelType as FuelType)}
                          className="h-5 w-5 rounded-md border-gray-300"
                        />
                        <Label htmlFor={`fuel-${fuelType}`} className="text-sm font-normal">
                          {fuelType}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Features */}
                {availableFeatures.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label className="block mb-3 font-medium">Features</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {availableFeatures.map(feature => (
                        <div key={feature} className="flex items-center space-x-3">
                          <Checkbox
                            id={`feature-${feature}`}
                            checked={selectedFeatures.includes(feature)}
                            onCheckedChange={() => handleFeatureToggle(feature)}
                            className="h-5 w-5 rounded-md border-gray-300"
                          />
                          <Label htmlFor={`feature-${feature}`} className="text-sm font-normal">
                            {feature}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* In Stock Only */}
                <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-3">
                  <Checkbox
                    id="inStock"
                    checked={inStockOnly}
                    onCheckedChange={(checked) => setInStockOnly(checked === true)}
                    className="h-5 w-5 rounded-md border-gray-300"
                  />
                  <Label htmlFor="inStock" className="text-sm font-normal">
                    Show only in-stock vehicles
                  </Label>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2"
                    onClick={resetFilters}
                  >
                    <FaUndo className="w-3 h-4 ml-3" /> Reset All
                  </Button>
                  <SheetTrigger asChild>
                    <Button className="flex-1 w-3 h-8 mr-1">
                      Apply Filters
                    </Button>
                  </SheetTrigger>
                </div>
              </div>
              <div className='mt-24'>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Sort Dropdown */}
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="year-asc">Year: Oldest</SelectItem>
              <SelectItem value="year-desc">Year: Newest</SelectItem>
              <SelectItem value="mileage-asc">Mileage: Low to High</SelectItem>
              <SelectItem value="mileage-desc">Mileage: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'} found
          </h2>
          {loading && <div className="text-sm text-gray-500">Loading...</div>}
        </div>
        
        {/* Cars Grid */}
        {error ? (
          <div className="text-red-500 text-center py-8">
            Error: {error}
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-700">No cars match your filters</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
            <Button 
              variant="outline" 
              className="mt-4 gap-2"
              onClick={resetFilters}
            >
              <FaUndo /> Reset Filters
            </Button>
         
         
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredCars.map((car) => (
              <CarRentalCard
                key={car.id}
                id={car.id}
                make={car.make}
                model={car.model}
                year={car.year}
                price={car.price}
                inStock={car.inStock}
                mileage={car.mileage ?? 0}
                color={car.color ?? ''}
                imageUrls={car.imageUrls}
                transmission={car.transmission ?? 'Automatic'}
                fuelType={car.fuelType ?? 'Gasoline'}
                features={car.features}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}