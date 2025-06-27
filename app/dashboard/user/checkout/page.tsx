'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Elements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe, StripeCardElement } from '@stripe/stripe-js';
import { useCartStore } from '@/app/stores/useAppStore';
import PaymentForm from '@/app/components/layout/PaymentForm'



interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  deliveryNotes: string;
  cardName: string;
}
type CheckoutTab = 'delivery' | 'payment' | 'confirmation';
type PaymentMethodType = 'credit' | 'finance' | 'bank';

const CheckoutPage = () => {
  const [activeTab, setActiveTab] = useState<CheckoutTab>('delivery');
  const [saveInfo, setSaveInfo] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('credit');
  const [clientSecret, setClientSecret] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    deliveryNotes: '',
    cardName: ''
  });
  const [paymentIntentId, setPaymentIntentId] = useState('');

  const { items, clearCart } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    if (activeTab === 'payment' && items.length > 0 && !clientSecret) {
      createPaymentIntent();
    }
  }, [activeTab]); 
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;



  const createPaymentIntent = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          carIds: items.map(item => item.id),
          paymentType: paymentMethod === 'credit' 
            ? 'CreditCard' 
            : paymentMethod === 'bank' 
              ? 'BankTransfer' 
              : 'Financing',
          deliveryAddress: formData.address,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize payment');
      console.error('Payment intent error:', error);
      setActiveTab('delivery');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const completePurchase = async (paymentIntentId?: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/complete-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            carId: item.id,
            price: item.price,
            quantity: item.quantity
          })),
          paymentType: paymentMethod === 'credit' 
            ? 'CreditCard' 
            : paymentMethod === 'bank' 
              ? 'BankTransfer' 
              : 'Financing',
          deliveryAddress: formData.address,
          paymentIntentId,
          savePaymentMethod: saveInfo && paymentMethod === 'credit'
        }),
      });
  
      let errorMsg = 'Purchase failed';
      let data = null;
      try {
        data = await response.json();
        if (data && (data.error || data.message)) {
          errorMsg = data.error || data.message;
        }
      } catch (e) {
        // If response is not JSON, fallback to text
        const text = await response.text();
        if (text) errorMsg = text;
      }
  
      if (!response.ok) {
        throw new Error(errorMsg);
      }
  
      clearCart();
      toast.success('Purchase completed successfully!');
    } catch (error: any) {
      console.error('Complete purchase error:', error);
      toast.error(error.message || 'Failed to complete purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  const isDeliveryInfoComplete = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      formData.phone.trim() &&
      formData.address.trim()
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
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
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex justify-between mb-6">
                {['delivery', 'payment', 'confirmation'].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activeTab === step 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step === 'delivery' ? '1' : step === 'payment' ? '2' : '3'}
                    </div>
                    <span className="mt-2 text-sm capitalize">{step}</span>
                  </div>
                ))}
              </div>
            </div>

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
                      <input 
                        type="text" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input 
                        type="text" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                      <textarea 
                        rows={3} 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      ></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Preferences</label>
                      <textarea 
                        rows={2} 
                        name="deliveryNotes"
                        value={formData.deliveryNotes}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Any special delivery requirements?"
                      ></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                      <input 
                        type="text" 
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Required for credit card payments"
                      />
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
                      Save my information for faster checkout next time
                    </label>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={() => setActiveTab('payment')}
                      disabled={!isDeliveryInfoComplete()}
                      className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 shadow-md ${
                        !isDeliveryInfoComplete() ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm
                    cardName={formData.cardName}
                    clientSecret={clientSecret}
                    billingDetails={{
                      name: formData.cardName,
                      email: formData.email,
                      phone: formData.phone,
                      address: {
                        line1: formData.address,
                        postal_code: '',
                      },
                    }}
                    onPaymentSuccess={async (paymentIntentId) => {
                      await completePurchase(paymentIntentId);
                      setActiveTab('confirmation');
                    }}
                    onCardChange={setCardComplete}
                    isProcessing={isProcessing}
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={setPaymentMethod}
                  />
                </Elements>
              ) : activeTab === 'payment' ? (
                <div className="p-6 text-center">
                  <p>Loading payment information...</p>
                </div>
              ) : null}

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
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-md mr-3 overflow-hidden">
                              {item.imageUrls?.[0] && (
                                <img src={item.imageUrls[0]} alt={`${item.make} ${item.model}`} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{item.make} {item.model} ({item.year})</p>
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
                    <button 
                      onClick={() => router.push('/account/purchases')}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
                    >
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

          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm sticky top-8 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Your Order</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-md mr-3 overflow-hidden">
                          {item.imageUrls?.[0] && (
                            <img src={item.imageUrls[0]} alt={`${item.make} ${item.model}`} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.make} {item.model}</p>
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
                    disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address}
                    className={`w-full mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 shadow-md ${
                      !formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Continue to Payment
                  </button>
                )}

                {activeTab === 'payment' && paymentMethod !== 'credit' && (
                  <button 
                    onClick={async () => {
                      setActiveTab('confirmation');
                      await completePurchase();
                    }}
                    disabled={isProcessing}
                    className={`w-full mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 shadow-md ${
                      isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 'Complete Purchase'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;