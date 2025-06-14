'use client';

import React, { useState } from 'react';


export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-gray-100 px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">🚗 AutoDrive Dealership</h1>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 focus:outline-none"
          >
          
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg border border-gray-200 z-10">
              <ul className="py-1 text-sm text-gray-700">
                <li>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                    Manage Account
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                    Settings
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <div className="p-4 bg-white">{children}</div>
    </div>
  );
}
