
import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { paymentAPI, orderAPI } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

// Define payment interface
interface Payment {
  _id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  method: string;
}

// Define revenue data interface
interface RevenueData {
  name: string;
  revenue: number;
}

const AdminPayments: React.FC = () => {
  const [timeframe, setTimeframe] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<RevenueData[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    averageOrderValue: 0,
    orderCount: 0,
    refundRate: 0
  });
  const { user } = useAuth();

  // Fetch payment data from the backend
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!user?._id) {
          setError('Restaurant ID not found. Please login again.');
          return;
        }
        
        // Fetch orders to calculate revenue
        // This would be a new API endpoint in a real app
        // For now, we'll simulate it
        try {
          const restaurantOrders = await orderAPI.getRestaurantOrders(user._id);
          
          // Create payments array from orders
          const fetchedPayments: Payment[] = restaurantOrders
            .filter(order => order.paymentStatus === 'completed')
            .map(order => ({
              _id: `INV-${Math.floor(Math.random() * 10000)}`,
              orderId: order._id,
              customerId: order.userId,
              customerName: 'Customer', // In a real app, you would get customer names
              amount: order.total,
              status: order.paymentStatus as 'completed',
              date: order.createdAt,
              method: order.paymentMethod
            }));
          
          setPayments(fetchedPayments);
          
          // Calculate stats
          const totalRev = fetchedPayments.reduce((sum, p) => sum + p.amount, 0);
          const orderCount = fetchedPayments.length;
          
          setStats({
            totalRevenue: totalRev,
            averageOrderValue: orderCount > 0 ? totalRev / orderCount : 0,
            orderCount,
            refundRate: 0 // In a real app, this would be calculated
          });
          
          // Generate weekly revenue data
          const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const weeklyData = weekDays.map(day => ({
            name: day,
            revenue: Math.floor(Math.random() * 500) + 300 // Simulated data
          }));
          setRevenueData(weeklyData);
          
          // Generate monthly revenue data
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthlyData = months.map(month => ({
            name: month,
            revenue: Math.floor(Math.random() * 3000) + 2000 // Simulated data
          }));
          setMonthlyRevenue(monthlyData);
          
        } catch (orderError) {
          console.error('Failed to fetch orders for payment data:', orderError);
          setError('Failed to load payment data. Please try again later.');
        }
      } catch (err) {
        console.error('Failed to fetch payment data:', err);
        setError('Failed to load payment data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaymentData();
  }, [user]);
  
  const handleProcessRefund = async (payment: Payment) => {
    try {
      // Call API to process refund
      await paymentAPI.processRefund({
        orderId: payment.orderId,
        amount: payment.amount,
        reason: 'Customer request'
      });
      
      // Update local state
      setPayments(prev => 
        prev.map(p => 
          p._id === payment._id ? { ...p, status: 'refunded' } : p
        )
      );
      
      toast({
        title: "Refund processed",
        description: `Refund for invoice ${payment._id} has been processed`,
      });
    } catch (error) {
      console.error('Failed to process refund:', error);
      toast({
        title: "Error",
        description: "Failed to process refund. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Payments & Revenue</h1>
        <div className="text-red-600 mb-4">{error}</div>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Payments & Revenue</h1>
        <div className="flex gap-2">
          <Select defaultValue="thisMonth">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="last3Months">Last 3 Months</SelectItem>
              <SelectItem value="yearToDate">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl">${stats.totalRevenue.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Order Value</CardDescription>
            <CardTitle className="text-3xl">${stats.averageOrderValue.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xs text-green-600 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+2.3% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Order Count</CardDescription>
            <CardTitle className="text-3xl">{stats.orderCount}</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+8.1% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Refund Rate</CardDescription>
            <CardTitle className="text-3xl">{stats.refundRate.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xs text-red-600 flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              <span>-0.5% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Revenue Over Time</h2>
          <Tabs defaultValue="week" onValueChange={setTimeframe}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={timeframe === 'month' ? monthlyRevenue : revenueData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Revenue']}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Bar dataKey="revenue" fill="#FF5A1F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Payments */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Payments</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </div>
        
        <div className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="px-6 py-4 text-sm font-medium">{payment._id}</td>
                  <td className="px-6 py-4 text-sm">{payment.customerName}</td>
                  <td className="px-6 py-4 text-sm">{new Date(payment.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">{payment.method}</td>
                  <td className="px-6 py-4 text-sm">
                    <Badge className={
                      payment.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                      payment.status === 'refunded' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                      'bg-red-100 text-red-800 hover:bg-red-100'
                    }>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">${payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <Button variant="ghost" size="sm" 
                      onClick={() => payment.status === 'completed' ? handleProcessRefund(payment) : null}
                      disabled={payment.status !== 'completed'}
                    >
                      {payment.status === 'completed' ? 'Refund' : 'View'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Payment Methods & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution of payment methods used by customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-orange-500 mr-2"></div>
                  <span>Credit Card</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">72%</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-blue-500 mr-2"></div>
                  <span>Debit Card</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">18%</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                  <span>PayPal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">8%</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '8%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-gray-500 mr-2"></div>
                  <span>Others</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">2%</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-gray-500 h-full rounded-full" style={{ width: '2%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common payment operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="lg">
              <DollarSign className="h-4 w-4 mr-2" />
              Process Refund
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download Statements
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPayments;
