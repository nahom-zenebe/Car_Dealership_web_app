import { useEffect, useState } from 'react';

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      const res = await fetch('/api/admin/analytics');
      const json = await res.json();
      setData(json);
      setIsLoading(false);
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Analytics</h1>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-2xl font-bold text-blue-700">{isLoading ? '...' : data?.totalSales}</div>
          <div className="text-gray-600 mt-2">Total Sales</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-2xl font-bold text-green-700">{isLoading ? '...' : `$${data?.totalRevenue?.toLocaleString()}`}</div>
          <div className="text-gray-600 mt-2">Total Revenue</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-2xl font-bold text-purple-700">{isLoading ? '...' : data?.uniqueBuyers}</div>
          <div className="text-gray-600 mt-2">Unique Buyers</div>
        </div>
      </div>

      {/* Top Models */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-purple-700 mb-4">Top Models</h2>
        <ul className="space-y-2">
          {isLoading ? (
            <li>Loading...</li>
          ) : data?.topModels?.length ? (
            data.topModels.map((item: any, idx: number) => (
              <li key={item.model} className={`flex items-center px-3 py-2 rounded-lg ${idx === 0 ? 'bg-purple-200 font-bold text-purple-900' : 'bg-purple-50 text-purple-700'}`}>
                <span className="mr-2 text-lg">{idx + 1}.</span>
                <span className="flex-1">{item.model}</span>
                <span className="ml-2 text-sm">{item.count} sold</span>
              </li>
            ))
          ) : (
            <li>No model data.</li>
          )}
        </ul>
      </div>

      {/* Top Buyers */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-blue-700 mb-4">Top Buyers</h2>
        <ul className="space-y-2">
          {isLoading ? (
            <li>Loading...</li>
          ) : data?.topBuyers?.length ? (
            data.topBuyers.map((item: any, idx: number) => (
              <li key={item.email} className={`flex items-center px-3 py-2 rounded-lg ${idx === 0 ? 'bg-blue-200 font-bold text-blue-900' : 'bg-blue-50 text-blue-700'}`}>
                <span className="mr-2 text-lg">{idx + 1}.</span>
                <span className="flex-1">{item.name} ({item.email})</span>
                <span className="ml-2 text-sm">{item.purchases} purchases, ${item.totalSpent.toLocaleString()}</span>
              </li>
            ))
          ) : (
            <li>No buyer data.</li>
          )}
        </ul>
      </div>

      {/* Sales Chart (simple bar) */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Over Time</h2>
        <div className="flex items-end space-x-2 h-40">
          {isLoading ? (
            <div>Loading chart...</div>
          ) : data?.salesData?.length ? (
            data.salesData.map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className="transition-all duration-500 rounded-t bg-blue-500"
                  style={{
                    height: `${(item._count.id || 1) * 10}px`,
                    width: '18px',
                    opacity: 0.8 + idx * 0.03,
                  }}
                ></div>
                <span className="text-xs mt-1 text-blue-700">{new Date(item.saleDate).toLocaleDateString('default', { month: 'short', year: '2-digit' })}</span>
              </div>
            ))
          ) : (
            <div>No sales data.</div>
          )}
        </div>
      </div>
    </div>
  );
} 