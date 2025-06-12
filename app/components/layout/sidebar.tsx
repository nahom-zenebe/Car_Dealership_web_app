'use client';

import { useState, ChangeEvent, ReactNode } from "react";
import { FaCar, FaSlidersH, FaCog, FaMapMarkerAlt, FaTag } from "react-icons/fa";

type Filters = {
  brand: string;
  model: string;
  bodyType: string;
  year: string;
  fuelType: string;
  transmission: string;
  driveType: string;
  priceRange: string;
  rentPrice: string;
  installment: boolean;
  discount: string;
  mileage: string;
  horsepower: string;
  fuelEconomy: string;
  doors: string;
  seating: string;
  color: string;
  sunroof: boolean;
  bluetooth: boolean;
  camera: boolean;
  cruise: boolean;
  location: string;
  dates: { from: string; to: string };
  availableNow: boolean;
  delivery: string;
  condition: string;
  rentalType: string;
  ratings: string;
  sellerType: string;
  verified: boolean;
};

export default function Sidebar() {
  const [filters, setFilters] = useState<Filters>({
    brand: "",
    model: "",
    bodyType: "",
    year: "",
    fuelType: "",
    transmission: "",
    driveType: "",
    priceRange: "",
    rentPrice: "",
    installment: false,
    discount: "",
    mileage: "",
    horsepower: "",
    fuelEconomy: "",
    doors: "",
    seating: "",
    color: "",
    sunroof: false,
    bluetooth: false,
    camera: false,
    cruise: false,
    location: "",
    dates: { from: "", to: "" },
    availableNow: false,
    delivery: "",
    condition: "",
    rentalType: "",
    ratings: "",
    sellerType: "",
    verified: false,
  });

  // Simple handler examples (you can expand them as needed)
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      dates: { ...prev.dates, [name]: value },
    }));
  };

  return (
    <aside className="w-72 bg-white shadow-lg rounded-2xl p-4 space-y-6 overflow-y-auto h-screen">
      {/* Vehicle Details */}
      <FilterSection icon={<FaCar className="w-4 h-4" />} title="Vehicle Details">
        <Select
          name="brand"
          label="Brand / Make"
          options={["Tesla", "BMW", "Audi", "Toyota", "Mercedes", "Honda"]}
          value={filters.brand}
          onChange={handleSelectChange}
        />
        <Select
          name="model"
          label="Model"
          options={["Model S", "Corolla", "Civic", "A4", "X5"]}
          value={filters.model}
          onChange={handleSelectChange}
        />
        <Select
          name="bodyType"
          label="Body Type"
          options={["SUV", "Sedan", "Hatchback", "Coupe", "Convertible", "Pickup"]}
          value={filters.bodyType}
          onChange={handleSelectChange}
        />
        <Select
          name="year"
          label="Year"
          options={["2020", "2021", "2022", "2023", "2024"]}
          value={filters.year}
          onChange={handleSelectChange}
        />
        <Select
          name="fuelType"
          label="Fuel Type"
          options={["Petrol", "Diesel", "Electric", "Hybrid", "CNG"]}
          value={filters.fuelType}
          onChange={handleSelectChange}
        />
        <Select
          name="transmission"
          label="Transmission"
          options={["Automatic", "Manual"]}
          value={filters.transmission}
          onChange={handleSelectChange}
        />
        <Select
          name="driveType"
          label="Drive Type"
          options={["FWD", "RWD", "AWD", "4WD"]}
          value={filters.driveType}
          onChange={handleSelectChange}
        />
      </FilterSection>

      {/* Price & Payment */}
      <FilterSection icon={<FaSlidersH className="w-4 h-4" />} title="Price & Payment">
        <Select
          name="priceRange"
          label="Price Range"
          options={["Under $20,000", "$20k–$50k", "$50k–$100k", "Over $100k"]}
          value={filters.priceRange}
          onChange={handleSelectChange}
        />
        <Select
          name="rentPrice"
          label="Daily Rent Price"
          options={["$50–$100/day", "$100–$200/day"]}
          value={filters.rentPrice}
          onChange={handleSelectChange}
        />
        <Checkbox
          name="installment"
          label="EMI Available"
          checked={filters.installment}
          onChange={handleCheckboxChange}
        />
        <Select
          name="discount"
          label="Discounts"
          options={["10% off", "20% off", "Coupon code"]}
          value={filters.discount}
          onChange={handleSelectChange}
        />
      </FilterSection>

      {/* Features & Specs */}
      <FilterSection icon={<FaCog className="w-4 h-4" />} title="Features & Specs">
        <Select
          name="mileage"
          label="Mileage"
          options={["0–10k km", "10k–50k km", "50k+ km"]}
          value={filters.mileage}
          onChange={handleSelectChange}
        />
        <Select
          name="horsepower"
          label="Horsepower"
          options={["<100 HP", "100–200 HP", ">200 HP"]}
          value={filters.horsepower}
          onChange={handleSelectChange}
        />
        <Select
          name="fuelEconomy"
          label="Fuel Economy"
          options={["10–15 km/l", "15–20 km/l", "20+ km/l"]}
          value={filters.fuelEconomy}
          onChange={handleSelectChange}
        />
        <Select
          name="doors"
          label="Doors"
          options={["2-Door", "4-Door", "5-Door"]}
          value={filters.doors}
          onChange={handleSelectChange}
        />
        <Select
          name="seating"
          label="Seating"
          options={["2-seater", "4-seater", "5+", "7+"]}
          value={filters.seating}
          onChange={handleSelectChange}
        />
        <Select
          name="color"
          label="Color"
          options={["Black", "White", "Red", "Blue", "Silver"]}
          value={filters.color}
          onChange={handleSelectChange}
        />
        <Checkbox
          name="sunroof"
          label="Sunroof"
          checked={filters.sunroof}
          onChange={handleCheckboxChange}
        />
        <Checkbox
          name="bluetooth"
          label="Bluetooth / Nav"
          checked={filters.bluetooth}
          onChange={handleCheckboxChange}
        />
        <Checkbox
          name="camera"
          label="Parking Camera"
          checked={filters.camera}
          onChange={handleCheckboxChange}
        />
        <Checkbox
          name="cruise"
          label="Cruise Control"
          checked={filters.cruise}
          onChange={handleCheckboxChange}
        />
      </FilterSection>

      {/* Location & Availability */}
      <FilterSection icon={<FaMapMarkerAlt className="w-4 h-4" />} title="Location & Availability">
        <Select
          name="location"
          label="Pickup Location"
          options={["New York", "LA", "Miami", "Chicago"]}
          value={filters.location}
          onChange={handleSelectChange}
        />
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">Availability</label>
          <div className="flex gap-2">
            <input
              type="date"
              name="from"
              className="w-1/2 border rounded p-1 text-xs"
              value={filters.dates.from}
              onChange={handleDateChange}
            />
            <input
              type="date"
              name="to"
              className="w-1/2 border rounded p-1 text-xs"
              value={filters.dates.to}
              onChange={handleDateChange}
            />
          </div>
        </div>
        <Checkbox
          name="availableNow"
          label="Available Now"
          checked={filters.availableNow}
          onChange={handleCheckboxChange}
        />
        <Select
          name="delivery"
          label="Delivery Option"
          options={["Home delivery", "Pickup station", "Airport"]}
          value={filters.delivery}
          onChange={handleSelectChange}
        />
      </FilterSection>

      {/* Other */}
      <FilterSection icon={<FaTag className="w-4 h-4" />} title="Other Filters">
        <Select
          name="condition"
          label="Car Condition"
          options={["New", "Used", "Certified Pre-Owned"]}
          value={filters.condition}
          onChange={handleSelectChange}
        />
        <Select
          name="rentalType"
          label="Rental Type"
          options={["Short-term", "Long-term"]}
          value={filters.rentalType}
          onChange={handleSelectChange}
        />
        <Select
          name="ratings"
          label="Ratings"
          options={["4+ stars", "3+ stars"]}
          value={filters.ratings}
          onChange={handleSelectChange}
        />
        <Select
          name="sellerType"
          label="Seller Type"
          options={["Dealer", "Individual"]}
          value={filters.sellerType}
          onChange={handleSelectChange}
        />
        <Checkbox
          name="verified"
          label="Verified Listings"
          checked={filters.verified}
          onChange={handleCheckboxChange}
        />
      </FilterSection>
    </aside>
  );
}

// Props typing for FilterSection wrapper
function FilterSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center text-sm font-semibold text-gray-700 uppercase gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// Props typing for Select component
function Select({
  label,
  options,
  name,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  name?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-600">{label}</label>
      <select
        name={name}
        className="w-full border rounded px-2 py-1 text-sm"
        value={value}
        onChange={onChange}
      >
        <option value="">Select</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// Props typing for Checkbox component
function Checkbox({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name?: string;
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex items-center space-x-2 text-sm text-gray-600">
      <input
        type="checkbox"
        name={name}
        className="accent-blue-600"
        checked={checked}
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  );
}
