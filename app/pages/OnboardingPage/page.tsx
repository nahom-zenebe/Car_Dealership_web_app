'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingStep from '@/app/components/layout/OnboardingStep';
import { FaUser, FaBriefcase, FaCar, FaMoneyBill, FaStar, FaSpinner } from 'react-icons/fa';

const questions = [
  {
    id: 1,
    question: 'Are you a buyer or seller?',
    options: [
      { label: 'Buyer', value: 'buyer', icon: <FaUser className="text-blue-600 text-2xl" /> },
      { label: 'Seller', value: 'seller', icon: <FaBriefcase className="text-green-600 text-2xl" /> },
    ],
  },
  {
    id: 2,
    question: 'What type of car are you interested in?',
    options: [
      { label: 'New', value: 'new', icon: <FaStar className="text-yellow-500 text-2xl" /> },
      { label: 'Used', value: 'used', icon: <FaCar className="text-gray-600 text-2xl" /> },
    ],
  },
  {
    id: 3,
    question: 'What is your budget range?',
    options: [
      { label: '< $20,000', value: 'under20k', icon: <FaMoneyBill className="text-gray-700 text-2xl" /> },
      { label: '$20,000 - $50,000', value: '20kto50k', icon: <FaMoneyBill className="text-gray-700 text-2xl" /> },
      { label: '$50,000+', value: 'over50k', icon: <FaMoneyBill className="text-gray-700 text-2xl" /> },
    ],
  },
  {
    id: 4,
    question: 'Preferred car brand?',
    options: [
      { label: 'BMW', value: 'bmw', icon: <FaCar className="text-blue-700 text-2xl" /> },
      { label: 'Audi', value: 'audi', icon: <FaCar className="text-gray-700 text-2xl" /> },
      { label: 'Tesla', value: 'tesla', icon: <FaCar className="text-red-600 text-2xl" /> },
      { label: 'Toyota', value: 'toyota', icon: <FaCar className="text-green-600 text-2xl" /> },
    ],
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleAnswer = (value: string) => {
    setLoading(true);
    const updatedAnswers = { ...answers, [`q${step + 1}`]: value };
    setAnswers(updatedAnswers);

    setTimeout(() => {
      setLoading(false);
      
     
      if (step === 0) {
        if (value === 'buyer') {
          
          setStep(1); 
        } else if (value === 'seller') {
          
          setStep(1); 
        }
      } 
      // If it's the last question
      else if (step === questions.length - 1) {
        console.log('Final answers:', updatedAnswers);
        
        // Navigate based on initial buyer/seller selection
        if (answers.q1 === 'buyer') {
          router.push('/dashboard/buyer');
        } else if (answers.q1 === 'seller') {
          router.push('/dashboard/seller');
        } else {
          // Fallback in case something went wrong
          router.push('/dashboard');
        }
      } 
      // For intermediate questions
      else {
        setStep((prev) => prev + 1);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {loading ? (
        <div className="flex flex-col items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading next question...</p>
        </div>
      ) : (
        <div className="w-full max-w-md">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Question {step + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round(((step + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${((step + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <OnboardingStep data={questions[step]} onAnswer={handleAnswer} />
        </div>
      )}
    </div>
  );
}