'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, StripeCardElement } from '@stripe/stripe-js';
import { useCartStore } from '@/app/stores/useAppStore';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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

const PaymentForm = ({
  cardName,
  onCardChange,
  onPaymentSubmit,
  isProcessing,
  paymentMethod,
  onPaymentMethodChange,
}: {
  cardName: string;
  onCardChange: (complete: boolean) => void;
  onPaymentSubmit: () => Promise<void>;
  isProcessing: boolean;
  paymentMethod: PaymentMethodType;
  onPaymentMethodChange: (method: PaymentMethodType) => void;
}) => {
  const [name, setName] = useState(cardName);
  const stripe = useStripe();
  const elements = useElements();

  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    onCardChange(false);
  };

  if (!stripe || !elements) {
    return <div className="p-6">Loading payment gateway...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Payment Details</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => onPaymentMethodChange('credit')}
              className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                paymentMethod === 'credit'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Credit Card
            </button>
            <button
              type="button"
              onClick={() => onPaymentMethodChange('finance')}
              className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                paymentMethod === 'finance'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Financing
            </button>
            <button
              type="button"
              onClick={() => onPaymentMethodChange('bank')}
              className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                paymentMethod === 'bank'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Bank Transfer
            </button>
          </div>
        </div>

        {paymentMethod === 'credit' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
              <input
                type="text"
                value={name}
                onChange={handleCardNameChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Full name as shown on card"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Details</label>
              <div className="px-4 py-3 border border-gray-300 rounded-lg">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }}
                  onChange={(e) => onCardChange(e.complete)}
                />
              </div>
            </div>
          </>
        )}

        {paymentMethod === 'finance' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Financing options will be presented after you complete your application. 
                  Our financing partner will contact you to finalize the details.
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'bank' && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  After placing your order, you'll receive bank transfer instructions. 
                  Your order will be processed once payment is received.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onPaymentSubmit}
            disabled={isProcessing || (paymentMethod === 'credit' && (!name))}
            className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 shadow-md ${
              isProcessing || (paymentMethod === 'credit' && (!name))
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;