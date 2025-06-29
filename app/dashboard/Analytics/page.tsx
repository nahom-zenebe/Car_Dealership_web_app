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

export default function UserAnalytics() {
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
  }, [timeRange]);

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