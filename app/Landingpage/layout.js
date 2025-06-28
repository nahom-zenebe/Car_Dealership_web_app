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
    <div className="min-h-screen flex flex-col  bg-gray-50 text-gray-800 font-sans">
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
      <main className="flex-grow px-4 md:px-10  py-10"    style={{ background: "linear-gradient(135deg, #0f172a 0%, #2563eb 100%)" }}>{children}</main>

      {/* 🔚 FOOTER */}
      <footer className="bg-gray-900 text-white text-sm ">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xl font-bold text-blue-400">
              <FaCar /> Car Dealership
            </div>
            <p className="text-gray-300 mb-2">Your trusted partner for luxury and premium cars. Experience the best in class service and selection.</p>
            <p className="text-gray-400">&copy; {new Date().getFullYear()} Car Dealership. All rights reserved.</p>
          </div>

          {/* Address */}
          <div>
            <h4 className="font-semibold text-blue-300 mb-2">Address</h4>
            <p className="text-gray-300">1234 Luxury Ave<br />Beverly Hills, CA 90210<br />United States</p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-blue-300 mb-2">Contact</h4>
            <p className="text-gray-300">Phone: <a href="tel:+1234567890" className="hover:underline">+1 (234) 567-890</a></p>
            <p className="text-gray-300">Email: <a href="mailto:info@cardealership.com" className="hover:underline">info@cardealership.com</a></p>
            <p className="text-gray-300 mt-2">Mon - Fri: 9:00am - 7:00pm<br />Sat - Sun: 10:00am - 5:00pm</p>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold text-blue-300 mb-2">Follow Us</h4>
            <div className="flex gap-4 mt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.116 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.425 3.635 1.392 2.668 2.359 2.374 3.532 2.315 4.809 2.256 6.089 2.243 6.498 2.243 12c0 5.502.013 5.911.072 7.191.059 1.277.353 2.45 1.32 3.417.967.967 2.14 1.261 3.417 1.32 1.28.059 1.689.072 7.191.072s5.911-.013 7.191-.072c1.277-.059 2.45-.353 3.417-1.32.967-.967 1.261-2.14 1.32-3.417.059-1.28.072-1.689.072-7.191s-.013-5.911-.072-7.191c-.059-1.277-.353-2.45-1.32-3.417C19.45.425 18.277.131 17 .072 15.721.013 15.312 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
