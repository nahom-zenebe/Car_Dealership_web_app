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
    const charts: ChartJS[] = [];
  
    // Bar Chart
    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext('2d');
      if (ctx) {
        const chart = new ChartJS(ctx, { /* your bar chart config */ });
        charts.push(chart);
      }
    }
  
    // Line Chart
    if (lineChartRef.current) {
      const ctx = lineChartRef.current.getContext('2d');
      if (ctx) {
        const chart = new ChartJS(ctx, { /* your line chart config */ });
        charts.push(chart);
      }
    }
  
    // Pie Chart
    if (pieChartRef.current) {
      const ctx = pieChartRef.current.getContext('2d');
      if (ctx) {
        const chart = new ChartJS(ctx, { /* your pie chart config */ });
        charts.push(chart);
      }
    }
  
    // ✅ Cleanup: destroy all charts on unmount
    return () => {
      charts.forEach(chart => chart.destroy());
    };
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