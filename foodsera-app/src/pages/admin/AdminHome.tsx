import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, TrendingUp, Users, DollarSign, ArrowRight, MenuSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminHome: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Restaurant Dashboard</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Orders</CardDescription>
            <CardTitle className="text-3xl">24</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>12% from yesterday</span>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/admin/orders" className="text-xs text-foodix-600 hover:underline flex items-center">
              View orders <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Delivery</CardDescription>
            <CardTitle className="text-3xl">5</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xs text-yellow-600">
              <span>2 waiting for driver</span>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/admin/orders" className="text-xs text-foodix-600 hover:underline flex items-center">
              Manage deliveries <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Revenue</CardDescription>
            <CardTitle className="text-3xl">$458.90</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>8% from yesterday</span>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/admin/payments" className="text-xs text-foodix-600 hover:underline flex items-center">
              View revenue <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Menu Items</CardDescription>
            <CardTitle className="text-3xl">32</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xs text-gray-600">
              <span>4 unavailable</span>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/admin/menu" className="text-xs text-foodix-600 hover:underline flex items-center">
              Manage menu <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link to="/admin/orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </div>
        
        <div className="px-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-4 text-sm">#124578</td>
                <td className="py-4 text-sm">John Doe</td>
                <td className="py-4 text-sm">
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                    Preparing
                  </span>
                </td>
                <td className="py-4 text-sm">$35.50</td>
                <td className="py-4 text-sm">15 min ago</td>
                <td className="py-4 text-sm text-right">
                  <Button variant="ghost" size="sm">View</Button>
                </td>
              </tr>
              <tr>
                <td className="py-4 text-sm">#124577</td>
                <td className="py-4 text-sm">Jane Smith</td>
                <td className="py-4 text-sm">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    Ready
                  </span>
                </td>
                <td className="py-4 text-sm">$28.75</td>
                <td className="py-4 text-sm">32 min ago</td>
                <td className="py-4 text-sm text-right">
                  <Button variant="ghost" size="sm">View</Button>
                </td>
              </tr>
              <tr>
                <td className="py-4 text-sm">#124576</td>
                <td className="py-4 text-sm">Robert Johnson</td>
                <td className="py-4 text-sm">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Delivered
                  </span>
                </td>
                <td className="py-4 text-sm">$42.20</td>
                <td className="py-4 text-sm">1 hour ago</td>
                <td className="py-4 text-sm text-right">
                  <Button variant="ghost" size="sm">View</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="flex justify-center items-center gap-2" variant="outline">
            <ShoppingBag className="h-4 w-4" />
            New Order
          </Button>
          <Button className="flex justify-center items-center gap-2" variant="outline">
            <DollarSign className="h-4 w-4" />
            Process Payment
          </Button>
          <Link to="/admin/menu" className="w-full">
            <Button className="w-full flex justify-center items-center gap-2" variant="outline">
              <MenuSquare className="h-4 w-4" />
              Update Menu
            </Button>
          </Link>
          <Button className="flex justify-center items-center gap-2" variant="outline">
            <Users className="h-4 w-4" />
            Manage Delivery
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
