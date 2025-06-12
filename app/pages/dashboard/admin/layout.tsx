// /app/dashboard/user/layout.tsx
import React from 'react';

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-white">
     
      {children}
    </div>
  );
}
