'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import toast, { Toaster } from 'react-hot-toast';
import { Bell, ChevronDown, Search, Settings, User, LogOut, Home, Car,ShoppingCart, Calendar, Wallet, BarChart2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigateTo } from '@/app/Hook/useNavigateTo';
import { useAppStore,} from '@/app/stores/useAppStore';

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const navigateTo = useNavigateTo();
  const logout = useAppStore((state) => state.logout);
  const  user = useAppStore((state) => state. user);


  const navItems = [
    { icon: <Home className="h-5 w-5" />, label: 'Dashboard', path: '/dashboard/user' },
    { icon: <Car className="h-5 w-5" />, label: 'Vehicles', path: 'vechile' },
    { icon: <ShoppingCart className="h-5 w-5" />, label: 'Carts', path: '/dashboard/Cartpage' },
    { icon: <Wallet className="h-5 w-5" />, label: 'Payments', path: '/dashboard/user/checkout' },
    { icon: <BarChart2 className="h-5 w-5" />, label: 'Analytics', path: '/dashboard/Analytics' },
  ];

  const handleOnLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
  
      if (!res.ok) {
        throw new Error('Logout failed');
      }
  
      toast.success("Logout successful");
      router.push('/dashboard/user');
    } catch (err) {
      console.error('Logout error:', err);
      alert('Failed to logout. Please try again.');
    }
  };
  


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar + Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-screen px-4 py-8 bg-white border-r border-gray-200 sticky top-0">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-800">AutoDrive</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-lg bg-gray-50 border-gray-300 focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigateTo(item.path)}
                    className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
                  >
                    <span className="mr-3 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 transition">
                  <Avatar className="mr-3">
                    <AvatarImage src="https://i.pravatar.cc/40" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">  { user?.name ?? "John Doe"}  </p>
                    <p className="text-xs text-gray-500">{ user?.email??"Guest@gmail.com"}</p>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigateTo('/dashboard/user/UserAccountprofile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigateTo('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleOnLogout}
                  className="text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="flex items-center space-x-2">
              <Car className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-800">AutoDrive</span>
            </div>
            <div className="flex items-center space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
                      <Bell className="h-5 w-5 text-gray-600" />
                      <span className="absolute top-1 right-1 inline-flex h-2 w-2 bg-red-500 rounded-full" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full hover:bg-gray-100 p-1 transition focus:outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://i.pravatar.cc/40" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigateTo('/account')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleOnLogout}
                    className="text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
            <h1 className="text-xl font-semibold text-gray-800">Dashboard Overview</h1>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-lg bg-gray-50 border-gray-300 focus:ring-2 focus:ring-indigo-500 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
                      <Bell className="h-5 w-5 text-gray-600" />
                      <span className="absolute top-1 right-1 inline-flex h-2 w-2 bg-red-500 rounded-full" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </header>

          {/* Mobile Navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
            <ul className="flex justify-around py-3">
              {navItems.slice(0, 4).map((item) => (
                <li key={item.label}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => navigateTo(item.path)}
                          className="p-3 text-gray-600 hover:text-indigo-600 transition"
                        >
                          {item.icon}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
              ))}
            </ul>
          </nav>

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
        </div>
      </div>
    </div>
  );
}