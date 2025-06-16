'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', credentials);

    // TODO: Add login logic here (Clerk, Supabase, etc.)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-blue-600">Login to Your Account</h2>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={credentials.email}
            onChange={handleChange}
            className="mt-1 text-black  w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            value={credentials.password}
            onChange={handleChange}
            className="mt-1 w-full text-black  px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
        onClick={() => router.push('/dashboard/user')}
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
        >
          Log In
        </button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/Signup" className="text-blue-600 font-medium hover:underline">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}
