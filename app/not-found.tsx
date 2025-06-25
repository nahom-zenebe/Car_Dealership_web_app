'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FaHome, FaArrowLeft } from 'react-icons/fa';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-black mb-2">404</h1>
            <div className="w-16 h-1 bg-black mx-auto mb-4"></div>
            <p className="text-xl text-gray-700">Page not found</p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col space-y-4"
          >
            <Button
              onClick={() => router.push('/')}
              className="bg-black text-white hover:bg-gray-800 transition-colors"
            >
              <FaHome className="mr-2" />
              Go to Homepage
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-black text-black hover:bg-gray-100 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Return Back
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-sm text-gray-500"
          >
            The requested page could not be found.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}