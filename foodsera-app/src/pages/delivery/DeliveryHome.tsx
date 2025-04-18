import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Order } from '@/lib/types';
import { orderAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TruckIcon, CheckCircle, AlertTriangle, Eye, MapPin, CreditCard, Clock } from 'lucide-react';
import { deliveryAPI } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const DeliveryHome: React.FC = () => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActiveOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch active delivery orders (in-delivery status)
        const orders = await orderAPI.getDriverOrders('in-delivery');
        setActiveOrders(orders);
      } catch (err) {
        console.error('Failed to fetch active orders:', err);
        setError('Failed to load active orders. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await orderAPI.updateOrderStatus(orderId, status);
      
      // Update local state
      setActiveOrders(prev => prev.filter(order => order._id !== orderId));
      
      // If order is delivered, update driver status to available
      if (status === 'delivered') {
        await deliveryAPI.updateDriverStatus({ status: 'available' });
      }
      
      toast({
        title: status === 'delivered' ? "Order marked as delivered" : "Order canceled",
        description: `Order #${orderId} has been updated`,
      });
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Delivery Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Delivery Dashboard</h1>
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
      <h1 className="text-2xl font-bold mb-6">Delivery Dashboard</h1>
      
      {activeOrders.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <TruckIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h2 className="text-xl font-semibold mb-1">No active deliveries</h2>
          <p className="text-gray-500 mb-4">You don't have any active deliveries at the moment</p>
          <Button onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOrders.map(order => (
            <Card key={order._id} className="overflow-hidden">
              <CardHeader className="bg-foodix-50 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order._id}</CardTitle>
                    <CardDescription>{new Date(order.createdAt).toLocaleString()}</CardDescription>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    In Delivery
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Delivery Address</h3>
                  <p className="font-medium">{order.deliveryAddress}</p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Items</h3>
                  <ul className="text-sm space-y-1 mt-1">
                    {order.items.map(item => (
                      <li key={item._id} className="flex justify-between">
                        <span>{item.quantity}x {item.name || 'Unknown Item'}</span>
                        <span>${(item.quantity * (item.price || 0)).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex justify-between text-sm font-medium mb-4">
                  <span>Total:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleViewOrder(order)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => updateOrderStatus(order._id, 'cancelled')}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    className="w-full"
                    onClick={() => updateOrderStatus(order._id, 'delivered')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Delivered
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Order #{selectedOrder._id}</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {selectedOrder.status.replace('-', ' ')}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    Delivery Address
                  </h3>
                  <p className="text-sm text-gray-600">{selectedOrder.deliveryAddress}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                    Payment Method
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.paymentMethod === 'card' ? 'Credit Card' : 
                     selectedOrder.paymentMethod === 'cash' ? 'Cash' : 
                     selectedOrder.paymentMethod === 'paypal' ? 'PayPal' : 'Unknown'}
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item._id} className="flex items-center py-2 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.name || 'Unknown Item'}</p>
                        <p className="text-xs text-gray-500">
                          {item.specialInstructions || 'No special instructions'}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 mr-4">
                        {item.quantity} x ${(item.price || 0).toFixed(2)}
                      </div>
                      <div className="font-medium">
                        ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Subtotal:</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tax:</span>
                  <span>${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Delivery Fee:</span>
                  <span>${selectedOrder.deliveryFee.toFixed(2)}</span>
                </div>
                {selectedOrder.tip > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span>Tip:</span>
                    <span>${selectedOrder.tip.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (selectedOrder) {
                      updateOrderStatus(selectedOrder._id, 'cancelled');
                      setSelectedOrder(null);
                    }
                  }}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedOrder) {
                      updateOrderStatus(selectedOrder._id, 'delivered');
                      setSelectedOrder(null);
                    }
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Delivered
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryHome;
