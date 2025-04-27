import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, AlertTriangle, TruckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { orderAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'cancelled':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'in-delivery':
      return <TruckIcon className="h-5 w-5 text-blue-500" />;
    default:
      return <Clock className="h-5 w-5 text-yellow-500" />;
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'in-delivery':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

const MyOrdersPage: React.FC = () => {
  const { user } = useAuth();
  
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders', user?._id],
    queryFn: () => orderAPI.getUserOrders(user?._id),
    enabled: !!user?._id
  });
  
  if (isLoading) {
    return (
      <div className="foodix-container py-12">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-6 border-b">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 mb-4 md:mb-0 md:mr-6">
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-4 w-full max-w-xs mb-1" />
                  <Skeleton className="h-4 w-full max-w-xs mb-1" />
                  <Skeleton className="h-5 w-24 mt-2" />
                </div>
                <div className="md:w-1/3">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-full max-w-xs mb-3" />
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="foodix-container py-12">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-red-500">Failed to load your orders. Please try again later.</p>
          <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="foodix-container py-12">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {!orders || orders.length === 0 ? (
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <Button asChild>
              <Link to="/restaurants">Browse Restaurants</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {orders.map((order: Order) => (
              <div key={order._id} className="p-6">
                <div className="flex flex-col md:flex-row justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Order #{order._id}</h2>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status.replace('-', ' ')}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row mb-4">
                  {/* Order items summary */}
                  <div className="flex-1 mb-4 md:mb-0 md:mr-6">
                    <h3 className="font-medium mb-2">Items:</h3>
                    <ul className="text-sm text-gray-600">
                      {order.items.map((item) => {
                        // Handle both data structures
                        const itemName = item.menuItem?.name || item.name || 'Unknown Item';
                        const itemPrice = item.menuItem?.price || item.price || 0;
                        
                        return (
                          <li key={item._id} className="mb-1">
                            {item.quantity}x {itemName} - ${(itemPrice * item.quantity).toFixed(2)}
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-2 font-medium">
                      Total: ${order.total.toFixed(2)}
                    </p>
                  </div>
                  
                  {/* Order details */}
                  <div className="md:w-1/3">
                    <h3 className="font-medium mb-2">Delivery Address:</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {order.deliveryAddress}
                    </p>
                    
                    <h3 className="font-medium mb-2">Payment Method:</h3>
                    <p className="text-sm text-gray-600">
                      {order.paymentMethod === 'card' ? 'Credit Card' : 'Cash'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  {order.status === 'in-delivery' && (
                    <Button variant="default" asChild>
                      <Link to={`/order-confirmation/${order._id}`}>Track Order</Link>
                    </Button>
                  )}
                  
                  <Button variant="outline" asChild>
                    <Link to={`/order-confirmation/${order._id}`}>View Details</Link>
                  </Button>
                  
                  {order.status === 'delivered' && (
                    <Button variant="outline">Reorder</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
