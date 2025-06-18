'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CheckoutPage() {
  const [activeTab, setActiveTab] = useState('delivery');
  const [saveInfo, setSaveInfo] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('credit');

  const cartItems = [
    { id: 1, name: 'Tesla Model S', price: 79990, quantity: 1, image: '/tesla-model-s.jpg' },
    { id: 2, name: 'Extended Warranty', price: 3500, quantity: 1, image: '/warranty-icon.svg' },
    { id: 3, name: 'Premium Paint', price: 1500, quantity: 1, image: '/paint-icon.svg' }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            Complete Your Purchase
          </motion.h1>
          <p className="text-lg text-gray-600">Final step to own your dream car</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Checkout Steps */}
          <div className="lg:w-2/3">
            {/* Progress Steps */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex justify-between mb-6">
                {['delivery', 'payment', 'confirmation'].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {step === 'delivery' ? '1' : step === 'payment' ? '2' : '3'}
                    </div>
                    <span className="mt-2 text-sm capitalize">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Step Content */}
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              {activeTab === 'delivery' && (
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Customer Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                      <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Preferences</label>
                      <textarea rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Any special delivery requirements?"></textarea>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center">
                    <input 
                      type="checkbox" 
                      id="save-info" 
                      checked={saveInfo} 
                      onChange={() => setSaveInfo(!saveInfo)} 
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="save-info" className="ml-2 block text-sm text-gray-700">
                      Save this information for next time
                    </label>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={() => setActiveTab('payment')}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Payment Method</h2>
                  
                  <div className="space-y-4 mb-8">
                    {['credit', 'finance', 'bank'].map((method) => (
                      <div 
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === method ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex items-center">
                          <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${paymentMethod === method ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                            {paymentMethod === method && (
                              <div className="h-2 w-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800 capitalize">
                              {method === 'credit' ? 'Credit Card' : 
                               method === 'finance' ? 'Financing' : 
                               'Bank Transfer'}
                            </h3>
                            {method === 'credit' && (
                              <p className="text-sm text-gray-500 mt-1">Pay with Visa, Mastercard, or American Express</p>
                            )}
                            {method === 'finance' && (
                              <p className="text-sm text-gray-500 mt-1">Apply for financing options</p>
                            )}
                          </div>
                          {method === 'credit' && (
                            <div className="flex space-x-2">
                              <img src="/visa.svg" alt="Visa" className="h-6" />
                              <img src="/mastercard.svg" alt="Mastercard" className="h-6" />
                              <img src="/amex.svg" alt="American Express" className="h-6" />
                            </div>
                          )}
                        </div>

                        {paymentMethod === method && method === 'credit' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                <input 
                                  type="text" 
                                  placeholder="1234 5678 9012 3456" 
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                                <input 
                                  type="text" 
                                  placeholder="MM/YY" 
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Security Code</label>
                                <input 
                                  type="text" 
                                  placeholder="CVC" 
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                                <input 
                                  type="text" 
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {paymentMethod === method && method === 'finance' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income</label>
                                <input 
                                  type="text" 
                                  placeholder="$" 
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment</label>
                                <input 
                                  type="text" 
                                  placeholder="$" 
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term</label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                  <option>36 months</option>
                                  <option>48 months</option>
                                  <option>60 months</option>
                                  <option>72 months</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Score</label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                  <option>Excellent (720+)</option>
                                  <option>Good (660-719)</option>
                                  <option>Fair (620-659)</option>
                                  <option>Poor (below 620)</option>
                                </select>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-8">
                    <button 
                      onClick={() => setActiveTab('delivery')}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition duration-200"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setActiveTab('confirmation')}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
                    >
                      Complete Purchase
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'confirmation' && (
                <div className="p-6 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Purchase Confirmed!</h2>
                    <p className="text-gray-600">Your new car is on its way to you.</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                    <h3 className="font-medium text-gray-800 mb-4">Order Summary</h3>
                    <div className="space-y-4">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-md mr-3 overflow-hidden">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tax</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-gray-800 mt-2">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">A confirmation has been sent to your email. Our sales representative will contact you shortly.</p>
                    <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 shadow-md">
                      View Purchase Details
                    </button>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    <p>Need help? <a href="#" className="text-blue-600 hover:underline">Contact our sales team</a></p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm sticky top-8 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Your Order</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-md mr-3 overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-800 pt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {activeTab === 'delivery' && (
                  <button 
                    onClick={() => setActiveTab('payment')}
                    className="w-full mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
                  >
                    Continue to Payment
                  </button>
                )}

                {activeTab === 'payment' && (
                  <button 
                    onClick={() => setActiveTab('confirmation')}
                    className="w-full mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
                  >
                    Complete Purchase
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}