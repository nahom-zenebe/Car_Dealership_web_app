'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripeCardElementChangeEvent } from '@stripe/stripe-js';
import toast from 'react-hot-toast';

type PaymentMethodType = 'credit' | 'finance' | 'bank';

interface PaymentFormProps {
  cardName: string;
  clientSecret: string;
  billingDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
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
          billing_details: billingDetails,
        },
      });
      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        return;
      }
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
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
            {/* ... existing finance method JSX ... */}
          </div>
        )}

        {paymentMethod === 'bank' && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            {/* ... existing bank method JSX ... */}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isProcessing || (paymentMethod === 'credit' && !name)}
            className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 shadow-md ${
              isProcessing || (paymentMethod === 'credit' && !name)
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
    </form>
  );
};

export default PaymentForm;