'use client';

import { useState,useEffect } from 'react';

import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// React Icons
import {
  FaUsers,
  FaFileAlt,
  FaShoppingCart,
  FaDollarSign,
  FaChartBar,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');
  const [getalluser, setgetalluser] = useState(0);
  const [getallposts, setgetallposts] = useState(0);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [userGrowthData, setUserGrowthData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [categoryDistributionData, setCategoryDistributionData] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, carRes, analyticsRes] = await Promise.all([
          fetch('/api/auth/Alluser'),
          fetch('/api/cars/getallposts'),
          fetch('/api/admin/analytics'),
        ]);
        const userCount = await userRes.json();
        const carCount = await carRes.json();
        const analytics = await analyticsRes.json();

        setgetalluser(typeof userCount === 'number' ? userCount : userCount.totalUsers || userCount.total || 0);
        setgetallposts(typeof carCount === 'number' ? carCount : carCount.totalCars || carCount.total || 0);
        setTotalPurchases(analytics.totalSales || 0);
        setTotalRevenue(analytics.totalRevenue || 0);

        // User Growth and Revenue Trends (Line/Bar charts)
        if (analytics.salesData) {
          setUserGrowthData({
            labels: analytics.salesData.map((d: any) => d.saleDate ? new Date(d.saleDate).toLocaleString('default', { month: 'short' }) : ''),
            datasets: [
              {
                label: 'New Purchases',
                data: analytics.salesData.map((d: any) => d._count ? d._count.id : d.count),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                tension: 0.3,
              },
            ],
          });
          setRevenueData({
            labels: analytics.salesData.map((d: any) => d.saleDate ? new Date(d.saleDate).toLocaleString('default', { month: 'short' }) : ''),
            datasets: [
              {
                label: 'Revenue ($)',
                data: analytics.salesData.map((d: any) => d._sum ? d._sum.price : d.revenue),
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                tension: 0.3,
              },
            ],
          });
        }
        // Category Distribution (Pie chart)
        if (analytics.topModels) {
          setCategoryDistributionData({
            labels: analytics.topModels.map((m: any) => m.model),
            datasets: [
              {
                data: analytics.topModels.map((m: any) => m.count),
                backgroundColor: [
                  'rgba(59, 130, 246, 0.7)',
                  'rgba(16, 185, 129, 0.7)',
                  'rgba(245, 158, 11, 0.7)',
                  'rgba(139, 92, 246, 0.7)',
                  'rgba(236, 72, 153, 0.7)',
                ],
                borderColor: [
                  'rgba(59, 130, 246, 1)',
                  'rgba(16, 185, 129, 1)',
                  'rgba(245, 158, 11, 1)',
                  'rgba(139, 92, 246, 1)',
                  'rgba(236, 72, 153, 1)',
                ],
                borderWidth: 1,
              },
            ],
          });
        }
        // Recent Activity (from salesData or topBuyers)
        if (analytics.salesData) {
          setRecentActivity(
            analytics.salesData.slice(-5).reverse().map((sale: any, idx: number) => ({
              id: idx + 1,
              user: analytics.topBuyers && analytics.topBuyers[idx] ? analytics.topBuyers[idx].name : 'User',
              action: 'Purchased',
              time: sale.saleDate ? new Date(sale.saleDate).toLocaleString() : '',
              amount: sale._sum ? `$${sale._sum.price}` : sale.revenue ? `$${sale.revenue}` : '',
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      }
    }
    fetchData();
  }, []);

  const stats = [
    { id: 1, name: 'Total Users', value: getalluser, change: '+12%', changeType: 'increase', icon: FaUsers },
    { id: 2, name: 'Total Posts', value: getallposts, change: '+5%', changeType: 'increase', icon: FaFileAlt },
    { id: 3, name: 'Total Purchases', value: totalPurchases, change: '-3%', changeType: 'decrease', icon: FaShoppingCart },
    { id: 4, name: 'Total Revenue', value: `$${totalRevenue}`, change: '+18%', changeType: 'increase', icon: FaDollarSign },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="quarter">Last 90 days</option>
                <option value="year">Last year</option>
              </select>
              <FaCalendarAlt className="h-4 w-4 absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'analytics', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className={`font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                    {stat.changeType === 'increase' ? (
                      <FaArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <FaArrowDown className="h-4 w-4 mr-1" />
                    )}
                    {stat.change}
                  </span>
                  <span className="text-gray-500 ml-2">vs last period</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 shadow rounded-lg lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">User Growth</h3>
              <FaChartBar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              {userGrowthData && <Line data={userGrowthData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }} />}
            </div>
          </div>

          <div className="bg-white p-6 shadow rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Revenue Trends</h3>
              <FaDollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              {revenueData && <Bar data={revenueData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }} />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 shadow rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Inventory Distribution</h3>
              <FaChartBar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              {categoryDistributionData && <Pie data={categoryDistributionData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />}
            </div>
          </div>

          <div className="bg-white p-6 shadow rounded-lg lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              <FaFileAlt className="h-5 w-5 text-gray-400" />
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentActivity.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.user}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.action}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.amount || activity.car || activity.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
