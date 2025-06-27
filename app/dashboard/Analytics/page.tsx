'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Title,
  PieController,
  ArcElement
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

ChartJS.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Title,
  PieController,
  ArcElement
);

interface CarPurchaseData {
  month: string;
  count: number;
  revenue: number;
}

interface TopModelData {
  model: string;
  count: number;
}

interface UserAnalyticsProps {
  userId: string;
}

function AnalyticsTrendsAndModels() {
  const [salesData, setSalesData] = useState([]);
  const [topModels, setTopModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      const res = await fetch('/api/sales/analytics?range=monthly');
      const data = await res.json();
      setSalesData(data.salesData || []);
      setTopModels(data.topModels || []);
      setIsLoading(false);
    };
    fetchAnalytics();
  }, []);

  // Calculate trend
  const lastMonth = salesData[salesData.length - 2];
  const thisMonth = salesData[salesData.length - 1];
  const trendUp = thisMonth && lastMonth && thisMonth!.count > lastMonth!.count;
  const trendDown = thisMonth && lastMonth && thisMonth.count < lastMonth.count;
  const trendText = trendUp
    ? 'Upward trend in purchases this month!'
    : trendDown
    ? 'Purchases are down compared to last month.'
    : 'Stable purchase trend.';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      {/* Trends Section */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-blue-700 mb-2 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Trends
          </h3>
          <p className="text-gray-700 text-lg font-medium mb-4">
            {isLoading ? 'Loading trend...' : trendText}
          </p>
          <div className="flex items-end space-x-2 h-32">
            {salesData.slice(-6).map((item, idx) => (
              <div key={item.month} className="flex flex-col items-center">
                <div
                  className={`transition-all duration-500 rounded-t bg-blue-500`}
                  style={{
                    height: `${(item.count || 1) * 10}px`,
                    width: '18px',
                    opacity: 0.8 + idx * 0.03,
                  }}
                ></div>
                <span className="text-xs mt-1 text-blue-700">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Models Section */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-purple-700 mb-2 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 17l-5 3 1.9-5.6L4 9.5l5.7-.5L12 4l2.3 5 5.7.5-4.9 4.9L17 20z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Top Models
          </h3>
          <p className="text-gray-700 text-lg font-medium mb-4">
            {isLoading
              ? 'Loading top models...'
              : topModels.length
              ? `Most popular: ${topModels[0].model} (${topModels[0].count} purchases)`
              : 'No model data.'}
          </p>
          <ul className="space-y-2">
            {topModels.map((item, idx) => (
              <li
                key={item.model}
                className={`flex items-center px-3 py-2 rounded-lg ${
                  idx === 0
                    ? 'bg-purple-200 font-bold text-purple-900'
                    : 'bg-purple-50 text-purple-700'
                }`}
              >
                <span className="mr-2 text-lg">{idx + 1}.</span>
                <span className="flex-1">{item.model}</span>
                <span className="ml-2 text-sm">{item.count} sold</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function UserAnalytics({ userId }: UserAnalyticsProps) {
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const [purchaseData, setPurchaseData] = useState<CarPurchaseData[]>([]);
  const [topModels, setTopModels] = useState<TopModelData[]>([]);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/sales/analytics?range=${timeRange}`);
        const data = await response.json();
        
        if (response.ok) {
          setPurchaseData(data.salesData);
          setTopModels(data.topModels);
          setTotalPurchases(data.totalPurchases);
          setTotalRevenue(data.totalRevenue);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange, userId]);

  useEffect(() => {
    if (!purchaseData.length || !topModels.length) return;

    const charts: ChartJS[] = [];

    // Bar Chart - Monthly Purchases
    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext('2d');
      if (ctx) {
        const chart = new ChartJS(ctx, {
          type: 'bar',
          data: {
            labels: purchaseData.map(item => item.month),
            datasets: [{
              label: 'Purchases',
              data: purchaseData.map(item => item.count),
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Monthly Vehicle Purchases'
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
        charts.push(chart);
      }
    }

    // Line Chart - Revenue Trend
    if (lineChartRef.current) {
      const ctx = lineChartRef.current.getContext('2d');
      if (ctx) {
        const chart = new ChartJS(ctx, {
          type: 'line',
          data: {
            labels: purchaseData.map(item => item.month),
            datasets: [{
              label: 'Revenue ($)',
              data: purchaseData.map(item => item.revenue),
              borderColor: 'rgba(16, 185, 129, 1)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 2,
              tension: 0.1,
              fill: true
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Revenue Trend'
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
        charts.push(chart);
      }
    }

    // Pie Chart - Top Models
    if (pieChartRef.current) {
      const ctx = pieChartRef.current.getContext('2d');
      if (ctx) {
        const chart = new ChartJS(ctx, {
          type: 'pie',
          data: {
            labels: topModels.map(item => item.model),
            datasets: [{
              data: topModels.map(item => item.count),
              backgroundColor: [
                'rgba(59, 130, 246, 0.7)',
                'rgba(16, 185, 129, 0.7)',
                'rgba(245, 158, 11, 0.7)',
                'rgba(139, 92, 246, 0.7)',
                'rgba(244, 63, 94, 0.7)'
              ],
              borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(139, 92, 246, 1)',
                'rgba(244, 63, 94, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
              },
              title: {
                display: true,
                text: 'Top Purchased Models'
              }
            }
          }
        });
        charts.push(chart);
      }
    }

    return () => {
      charts.forEach(chart => chart.destroy());
    };
  }, [purchaseData, topModels]);

  const avgPurchaseValue = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;

  return (
    <div className="space-y-6">
      {/* New Trends & Top Models Section */}
      <AnalyticsTrendsAndModels />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dealership Analytics</h2>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-1 border rounded-md text-sm"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : totalPurchases}
            </div>
            <p className="text-xs text-muted-foreground">All time vehicle purchases</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `$${totalRevenue.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">Generated from sales</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg. Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `$${avgPurchaseValue.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
            </div>
            <p className="text-xs text-muted-foreground">Per vehicle</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <canvas ref={barChartRef} height={300} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Trends</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <canvas ref={lineChartRef} height={300} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Model Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex justify-center">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p>Loading chart data...</p>
                  </div>
                ) : (
                  <canvas ref={pieChartRef} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}