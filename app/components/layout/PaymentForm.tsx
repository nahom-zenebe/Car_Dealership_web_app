'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripeCardElementChangeEvent } from '@stripe/stripe-js';
import toast from 'react-hot-toast';

type PaymentMethodType = 'credit' | 'finance' | 'bank';

interface AddressDetails {
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code: string;
  country?: string;
}

interface BillingDetails {
  name: string;
  email?: string;
  phone?: string;
  address?: AddressDetails;
}

interface PaymentFormProps {
  cardName: string;
  clientSecret: string;
  billingDetails: BillingDetails;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onCardChange: (complete: boolean) => void;
  isProcessing: boolean;
  paymentMethod: PaymentMethodType;
  onPaymentMethodChange: (method: PaymentMethodType) => void;
}

const PaymentForm = ({
  cardName,
  clientSecret,
  billingDetails,
  onPaymentSuccess,
  onCardChange,
  isProcessing: parentProcessing,
  paymentMethod,
  onPaymentMethodChange,
}: PaymentFormProps) => {
  const [name, setName] = useState(cardName);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    onCardChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!stripe || !elements) {
      setError('Stripe not loaded');
      return;
    }
    
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingDetails.name,
            email: billingDetails.email,
            phone: billingDetails.phone,
            address: billingDetails.address ? {
              line1: billingDetails.address.line1,
              line2: billingDetails.address.line2,
              city: billingDetails.address.city,
              state: billingDetails.address.state,
              postal_code: billingDetails.address.postal_code,
              country: billingDetails.address.country
            } : undefined
          },
        },
      });
      
      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        toast.error(stripeError.message || 'Payment failed');
        return;
      }
      
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
        toast.success('Payment successful!');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
      toast.error(err.message || 'Unexpected error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!stripe || !elements) {
    return <div className="p-6">Loading payment gateway...</div>;
  }

  return (
    <form className="p-6" onSubmit={handleSubmit}>
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
                  onChange={(e: StripeCardElementChangeEvent) => onCardChange(e.complete)}
                />
              </div>
            </div>
          </>
        )}

        {paymentMethod === 'finance' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Financing options will be presented after you select this payment method.
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'bank' && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Bank transfer details will be provided after order confirmation.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isProcessing || parentProcessing || (paymentMethod === 'credit' && !name)}
            className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 shadow-md ${
              isProcessing || parentProcessing || (paymentMethod === 'credit' && !name)
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isProcessing || parentProcessing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </form>
  );
};

export default PaymentForm;