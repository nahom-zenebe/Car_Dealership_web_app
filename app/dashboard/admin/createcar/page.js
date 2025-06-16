'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiPlus, FiTrash2, FiChevronDown } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

export default function CreateCarPage() {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: 2020,
    price: 0.0,
    mileage: 20034,
    color: 'green',
    inStock: true,
    imageUrl: '',
    description:'',
    features: [], 
    transmission:'Automatic',
    fuelType:'Gasoline'
  });
  
  
  const [newFeature, setNewFeature] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (featureToRemove) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== featureToRemove)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
  
    if (files.length === 0) {
      toast.error("No files selected");
      return;
    }
  
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
  
    setUploadedImages(prev => [...prev, ...newImages]);
    toast.success("Image uploaded successfully");
  };
  
  const handleRemoveImage = (index) => {
    setUploadedImages(prev => {
     
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.preview);
  
      return prev.filter((_, i) => i !== index);
    });
  };
  

 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const formDataToSend = new FormData();
  
      // Append all fields
      formDataToSend.append('make', formData.make);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('year', formData.year.toString());
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('mileage', formData.mileage.toString());
      formDataToSend.append('color', formData.color);
      formDataToSend.append('inStock', formData.inStock.toString());
      formDataToSend.append('fuelType', formData.fuelType);
      formDataToSend.append('transmission', formData.transmission);
  
      // Append features
      formData.features.forEach(feature => {
        formDataToSend.append('features', feature);
      });
  
      // Append images
      uploadedImages.forEach((image) => {
        formDataToSend.append('images', image.file);
      });
  
      const response = await fetch('/api/cars', {
        method: 'POST',
        body: formDataToSend,
        // Don't set Content-Type header - FormData will set it automatically
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create listing');
      }
  
      const result = await response.json();
      toast.success("Car listing created successfully!");
      
      // Reset form
      setFormData({
        make: '',
        model: '',
        year: 2020,
        price: 0.0,
        mileage: 20034,
        color: 'green',
        inStock: true,
        imageUrl: '',
        description: '',
        features: [], 
        transmission: 'Automatic',
        fuelType: 'Gasoline'
      });
      setUploadedImages([]);
      
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || "Failed to create car listing!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">List Your Luxury Vehicle</h1>
          <p className="text-lg text-gray-600">Fill in the details to showcase your car to potential renters</p>
        </motion.div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Form Tabs */}
          <div className="flex border-b border-gray-200">
            {['details', 'media', 'features', 'pricing'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium text-sm capitalize transition-colors ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
              <div>
                {activeTab === 'details' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                      <input
                        type="text"
                        name="make"
                        value={formData.make}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div> 
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="1"  
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                          className="w-10 h-10 border border-gray-300 rounded-md mr-3 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.color}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                      <div className="relative">
                        <select
                          name="transmission"
                          value={formData.transmission}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        >
                          <option value="automatic">Automatic</option>
                          <option value="manual">Manual</option>
                          <option value="semi-automatic">Semi-Automatic</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-3 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                      <div className="relative">
                        <select
                          name="fuelType"
                          value={formData.fuelType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        >
                          <option value="gasoline">Gasoline</option>
                          <option value="diesel">Diesel</option>
                          <option value="electric">Electric</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-3 text-gray-400" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'media' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Upload Images</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FiUpload className="w-12 h-12 text-gray-400 mb-3" />
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">High-quality images (JPEG, PNG up to 10MB)</p>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Preview</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {uploadedImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image.preview}
                                alt={`Preview ${index}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <FiTrash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'features' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe your vehicle in detail..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                      <div className="flex mb-2">
                        <input
                          type="text"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Add a feature (e.g., Sunroof, Heated Seats)"
                        />
                        <button
                          type="button"
                          onClick={handleAddFeature}
                          className="px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
                        >
                          <FiPlus className="w-5 h-5" />
                        </button>
                      </div>

                      {formData.features.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.features.map((feature, index) => (
                            <div key={index} className="flex items-center bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {feature}
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(feature)}
                                className="ml-2 text-blue-500 hover:text-blue-700"
                              >
                                <FiTrash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'pricing' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Daily Price ($)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          min="0"
                          step="1"
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="mileage"
                          value={formData.mileage}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">mi</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-2">Pricing Tips</h3>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Research similar vehicles in your area</li>
                        <li>• Consider offering weekly/monthly discounts</li>
                        <li>• Higher quality photos can justify higher prices</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Column - Preview */}
              <div className="hidden lg:block">
                <div className="sticky top-8">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Listing Preview</h2>
                    
                    {formData.make || formData.model ? (
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {formData.make} {formData.model} {formData.year}
                      </h3>
                    ) : (
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    )}

                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                      {uploadedImages.length > 0 ? (
                        <img
                          src={uploadedImages[0].preview}
                          alt="Car preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiUpload className="w-12 h-12" />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Transmission</p>
                        <p className="font-medium capitalize">{formData.transmission || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fuel Type</p>
                        <p className="font-medium capitalize">{formData.fuelType || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Color</p>
                        <div className="flex items-center">
                          {formData.color && (
                            <>
                              <div 
                                className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                                style={{ backgroundColor: formData.color }}
                              ></div>
                              <span>{formData.color.toUpperCase()}</span>
                            </>
                          )}
                          {!formData.color && <span>-</span>}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Mileage</p>
                        <p className="font-medium">{formData.mileage ? `${formData.mileage} mi` : '-'}</p>
                      </div>
                    </div>

                    {formData.price && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-500">Daily Rate</p>
                        <p className="text-2xl font-bold text-blue-600">${formData.price}</p>
                      </div>
                    )}

                    {formData.features.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Key Features</p>
                        <ul className="space-y-1">
                          {formData.features.slice(0, 5).map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                          {formData.features.length > 5 && (
                            <li className="text-sm text-gray-500">+{formData.features.length - 5} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between border-t border-gray-200 pt-6">
              {activeTab !== 'details' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'media' ? 'details' : activeTab === 'features' ? 'media' : 'features')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              
              {activeTab !== 'pricing' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'details' ? 'media' : activeTab === 'media' ? 'features' : 'pricing')}
                  className="ml-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-auto px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}