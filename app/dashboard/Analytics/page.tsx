'use client';
import { useEffect, useRef } from 'react';
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

// Register ChartJS components
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
  topModel: string;
}

interface UserAnalyticsProps {
  userId: string;
}

export default function UserAnalytics({ userId }: UserAnalyticsProps) {
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);

  // Sample data - replace with API calls in a real application
  const purchaseData: CarPurchaseData[] = [
    { month: 'Jan', count: 12, revenue: 450000, topModel: 'Model X' },
    { month: 'Feb', count: 19, revenue: 720000, topModel: 'Model Y' },
    { month: 'Mar', count: 15, revenue: 580000, topModel: 'Model 3' },
    { month: 'Apr', count: 22, revenue: 890000, topModel: 'Model S' },
    { month: 'May', count: 18, revenue: 680000, topModel: 'Model Y' },
    { month: 'Jun', count: 25, revenue: 950000, topModel: 'Model X' },
  ];

  const totalPurchases = purchaseData.reduce((sum, item) => sum + item.count, 0);
  const totalRevenue = purchaseData.reduce((sum, item) => sum + item.revenue, 0);
  const avgPurchaseValue = totalRevenue / totalPurchases;

  useEffect(() => {
    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext('2d');
      if (ctx) {
        new ChartJS(ctx, {
          type: 'bar',
          data: {
            labels: purchaseData.map(item => item.month),
            datasets: [
              {
                label: 'Cars Purchased',
                data: purchaseData.map(item => item.count),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
              },
              {
                label: 'Revenue ($)',
                data: purchaseData.map(item => item.revenue / 10000),
                backgroundColor: 'rgba(34, 197, 94, 0.7)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1,
                yAxisID: 'y1',
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Monthly Purchases & Revenue'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    if (context.datasetIndex === 1) {
                      return `Revenue: $${(context.raw as number * 10000).toLocaleString()}`;
                    }
                    return `Cars: ${context.raw}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Cars'
                }
              },
              y1: {
                beginAtZero: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Revenue (in $10k)'
                },
                grid: {
                  drawOnChartArea: false,
                },
              }
            }
          }
        });
      }
    }

    if (lineChartRef.current) {
      const ctx = lineChartRef.current.getContext('2d');
      if (ctx) {
        new ChartJS(ctx, {
          type: 'line',
          data: {
            labels: purchaseData.map(item => item.month),
            datasets: [
              {
                label: 'Purchase Trend',
                data: purchaseData.map(item => item.count),
                borderColor: 'rgba(234, 88, 12, 1)',
                backgroundColor: 'rgba(234, 88, 12, 0.1)',
                tension: 0.3,
                fill: true
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Purchase Trend Over Time'
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    }

    if (pieChartRef.current) {
      const ctx = pieChartRef.current.getContext('2d');
      if (ctx) {
        // Group by topModel
        const modelCounts = purchaseData.reduce((acc, item) => {
          acc[item.topModel] = (acc[item.topModel] || 0) + item.count;
          return acc;
        }, {} as Record<string, number>);

        new ChartJS(ctx, {
          type: 'pie',
          data: {
            labels: Object.keys(modelCounts),
            datasets: [
              {
                data: Object.values(modelCounts),
                backgroundColor: [
                  'rgba(59, 130, 246, 0.7)',
                  'rgba(16, 185, 129, 0.7)',
                  'rgba(245, 158, 11, 0.7)',
                  'rgba(244, 63, 94, 0.7)',
                ],
                borderColor: [
                  'rgba(59, 130, 246, 1)',
                  'rgba(16, 185, 129, 1)',
                  'rgba(245, 158, 11, 1)',
                  'rgba(244, 63, 94, 1)',
                ],
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Top Selling Models'
              },
              legend: {
                position: 'right',
              }
            }
          }
        });
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dealership Analytics</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases}</div>
            <p className="text-xs text-muted-foreground">All time vehicle purchases</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Generated from sales</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg. Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgPurchaseValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
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
              <canvas ref={barChartRef} height={300} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Trends</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <canvas ref={lineChartRef} height={300} />
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
                <canvas ref={pieChartRef} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}