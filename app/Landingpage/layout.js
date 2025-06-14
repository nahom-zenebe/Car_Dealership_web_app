"use client";

import React from "react";
import {
  FaCar,
  FaHome,
  FaStar,
  FaPhone,
  FaShoppingCart,
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function LandingLayout({ children }) {
  const router=useRouter();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
            <FaCar />
            Car Dealership
          </Link>

          <nav className="hidden md:flex gap-8 items-center text-sm font-medium">
            <Link href="/" className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <FaHome /> Home
            </Link>
            <Link href="#features" className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <FaStar /> Features
            </Link>
            <Link href="/cars" className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <FaPhone /> Contact
            </Link>
          </nav>

          <div className="flex gap-4 items-center">
            

            {/* Clerk Auth Buttons */}
         
                <button  onClick={()=>router.push("/Login")} className="border border-blue-600 text-blue-600 px-4 py-2 rounded-xl text-sm shadow hover:bg-blue-50 transition-all">
                  Login
                </button>
        
          
                <button onClick={()=>router.push("/Signup")} className="border border-blue-600 text-blue-600 px-4 py-2 rounded-xl text-sm shadow hover:bg-blue-50 transition-all ml-2">
                  Sign Up
                </button>
            
          </div>
        </div>
      </header>

      {/* 🌟 MAIN CONTENT */}
      <main className="flex-grow px-4 md:px-10 py-10">{children}</main>

      {/* 🔚 FOOTER */}
      <footer className="bg-gray-800 text-white text-center py-4 text-sm">
        &copy; {new Date().getFullYear()} Car Dealership. All rights reserved.
      </footer>
    </div>
  );
}
