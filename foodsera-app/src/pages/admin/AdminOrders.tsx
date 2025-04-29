import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TruckIcon, 
  ChevronLeft, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Order, DeliveryDriver, MenuItem, User } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { orderAPI, restaurantAPI, deliveryAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Restaurant } from '@/lib/types';
import { sendSMS } from '../../lib/sendSMS';

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
    case 'ready':
      return 'bg-blue-100 text-blue-800';
    case 'preparing':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Email sending function
const sendStatusEmail = async (to: string, status: string, orderId: string) => {
  const statusMessages = {
    confirmed: {
      subject: 'Order Confirmed',
      html: `<h1>Order #${orderId} Confirmed</h1><p>Your order has been confirmed and will be prepared soon.</p>`
    },
    preparing: {
      subject: 'Order Being Prepared',
      html: `<h1>Order #${orderId} In Preparation</h1><p>Your order is being prepared by our kitchen team.</p>`
    },
    ready: {
      subject: 'Order Ready',
      html: `<h1>Order #${orderId} Ready</h1><p>Your order is ready and awaiting driver assignment.</p>`
    },
    'in-delivery': {
      subject: 'Order Assigned to Driver',
      html: `<h1>Order #${orderId} In Delivery</h1><p>Your order has been assigned to a driver and is on its way.</p>`
    }
  };

  try {
    const response = await fetch('https://foodix.dynac.space:8081/notification-proxy/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject: statusMessages[status]?.subject || `Order Status Update: ${status}`,
        html: statusMessages[status]?.html || `<h1>Order #${orderId} Status Update</h1><p>Your order status has changed to ${status}.</p>`
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    toast({
      title: "Email Notification Error",
      description: "Status updated but failed to send email notification.",
      variant: "destructive",
    });
  }
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [assigningDriverId, setAssigningDriverId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({});
  const [userRestaurant, setUserRestaurant] = useState<Restaurant | null>(null);
  const { user } = useAuth();
  const [availableDrivers, setAvailableDrivers] = useState<DeliveryDriver[]>([]);
  
  // Fetch orders and drivers from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!user?._id) {
          setError('Restaurant ID not found. Please login again.');
          return;
        }
        
        // First get the user's restaurant
        const restaurants = await restaurantAPI.getAllRestaurants();
        const userRestaurant = restaurants.find((restaurant: Restaurant) => 
          restaurant.owner === user._id
        );
        
        if (!userRestaurant) {
          setError('No restaurant found for this user. Please create a restaurant first.');
          return;
        }
        
        setUserRestaurant(userRestaurant);
        
        // Fetch orders for the restaurant using restaurant ID
        const restaurantOrders = await orderAPI.getRestaurantOrders(userRestaurant._id);
        setOrders(restaurantOrders);
        
        // Fetch available drivers
        try {
          const availableDrivers = await deliveryAPI.getAvailableDrivers();
          setDrivers(availableDrivers);
        } catch (driverError) {
          console.error('Failed to fetch drivers:', driverError);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Fetch menu items for the restaurant
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!userRestaurant?._id) return;
      
      try {
        const items = await restaurantAPI.getMenuItems(userRestaurant._id);
        // Create a map of menu items by ID for quick lookup
        const itemsMap: Record<string, MenuItem> = {};
        items.forEach((item: MenuItem) => {
          itemsMap[item._id] = item;
        });
        setMenuItems(itemsMap);
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
      }
    };
    
    fetchMenuItems();
  }, [userRestaurant]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };
  
  const filteredOrders = orders
    .filter(order => 
      searchQuery === '' || 
      order._id.includes(searchQuery) || 
      order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(order => 
      statusFilter === 'all' || order.status === statusFilter
    );
  
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Call API to update order status
      await orderAPI.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Find the order to get user email
      const order = orders.find(o => o._id === orderId);
      if (true) {
        await 
        await sendStatusEmail('chamikamaths2002@gmail.com', newStatus, orderId);
      }
      
      toast({
        title: "Order status updated",
        description: `Order #${orderId} is now ${newStatus}`,
      });
      
      // Close details view
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const assignDriver = async (orderId: string, driverId: string) => {
    try {
      // Call API to assign driver
      await orderAPI.assignDriver(orderId, driverId);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { 
                ...order, 
                status: 'in-delivery',
                assignedDriverId: driverId 
              } 
            : order
        )
      );
      
      // Find the order to get user email
      const order = orders.find(o => o._id === orderId);
      if (true) {
        await sendStatusEmail('chamikamaths2002@gmail.com', 'in-delivery', orderId);
      }
      
      toast({
        title: "Driver assigned",
        description: `Order #${orderId} has been assigned to a driver`,
      });
      
      // Reset selected driver
      setAssigningDriverId(null);
    } catch (error) {
      console.error('Failed to assign driver:', error);
      toast({
        title: "Error",
        description: "Failed to assign driver. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const fetchAvailableDrivers = async () => {
    try {
      const drivers = await deliveryAPI.getAvailableDrivers();
      setAvailableDrivers(drivers);
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch available drivers',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Skeleton className="h-10 w-full sm:w-2/3" />
          <Skeleton className="h-10 w-full sm:w-1/3" />
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="overflow-x-auto">
            <div className="py-4 px-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full mb-4" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Manage Orders</h1>
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
      <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by order ID or address..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="in-delivery">In Delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {selectedOrder ? (
        // Order details view
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Order #{selectedOrder._id.substring(selectedOrder._id.length - 8)}</h2>
            <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to list
            </Button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <h3 className="font-medium mb-2">Order Details</h3>
                <div className="text-sm space-y-2">
                  <p>
                    <span className="text-gray-500">Date: </span>
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <span className="text-gray-500">Status: </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-1">
                        {selectedOrder.status.replace('-', ' ')}
                      </span>
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Payment: </span>
                    {selectedOrder.paymentMethod === 'card' ? 'Credit Card' : 'Cash'} ({selectedOrder.paymentStatus})
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Delivery Information</h3>
                <div className="text-sm space-y-2">
                  <p>
                    <span className="text-gray-500">Address: </span>
                    {selectedOrder.deliveryAddress}
                  </p>
                  <p>
                    <span className="text-gray-500">Estimated Time: </span>
                    {selectedOrder.estimatedDeliveryTime}
                  </p>
                  <p>
                    <span className="text-gray-500">Driver: </span>
                    {selectedOrder.assignedDriverId ? 
                      drivers.find(d => d._id === selectedOrder.assignedDriverId)?.name || 'Assigned' : 
                      'Not assigned'}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Amount</h3>
                <div className="text-sm space-y-2">
                  <p>
                    <span className="text-gray-500">Subtotal: </span>
                    ${selectedOrder.subtotal.toFixed(2)}
                  </p>
                  <p>
                    <span className="text-gray-500">Delivery Fee: </span>
                    ${selectedOrder.deliveryFee.toFixed(2)}
                  </p>
                  <p>
                    <span className="text-gray-500">Tax: </span>
                    ${selectedOrder.tax.toFixed(2)}
                  </p>
                  <p>
                    <span className="text-gray-500">Tip: </span>
                    ${selectedOrder.tip.toFixed(2)}
                  </p>
                  <p className="font-medium">
                    <span className="text-gray-500">Total: </span>
                    ${selectedOrder.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Order Items</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {selectedOrder.items.map((item) => {
                  // Get menu item details from our cache
                  const menuItemDetails = menuItems[item.menuItemId];
                  
                  // Handle both data structures
                  const itemName = menuItemDetails?.name || item.name || 'Unknown Item';
                  const itemPrice = menuItemDetails?.price || item.price || 0;
                  const itemImage = menuItemDetails?.image || item.image || '/placeholder-food.jpg';
                  
                  return (
                    <div key={item._id} className="flex items-center py-2 border-b last:border-0">
                      <div className="w-10 h-10 rounded overflow-hidden mr-3">
                        <img 
                          src={itemImage} 
                          alt={itemName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{itemName}</p>
                        <p className="text-xs text-gray-500">
                          {item.specialInstructions || 'No special instructions'}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 mr-4">
                        {item.quantity} x ${itemPrice.toFixed(2)}
                      </div>
                      <div className="font-medium">
                        ${((item.quantity || 0) * itemPrice).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Action buttons based on status */}
            <div>
              <h3 className="font-medium mb-2">Actions</h3>
              
              <div className="flex flex-wrap gap-3">
                {selectedOrder.status === 'pending' && (
                  <Button 
                    onClick={() => updateOrderStatus(selectedOrder._id, 'confirmed')}
                  >
                    Confirm Order
                  </Button>
                )}
                
                {selectedOrder.status === 'confirmed' && (
                  <Button 
                    onClick={() => updateOrderStatus(selectedOrder._id, 'preparing')}
                  >
                    Start Preparing
                  </Button>
                )}
                
                {selectedOrder.status === 'preparing' && (
                  <Button 
                    onClick={() => updateOrderStatus(selectedOrder._id, 'ready')}
                  >
                    Mark as Ready
                  </Button>
                )}
                
                {selectedOrder.status === 'ready' && !selectedOrder.assignedDriverId && (
                  <>
                    {assigningDriverId ? (
                      <div className="w-full">
                        <h4 className="text-sm font-medium mb-2">Select a driver:</h4>
                        <div className="space-y-2">
                          {drivers
                            .filter(driver => driver.status === 'available')
                            .map(driver => (
                              <div 
                                key={driver._id} 
                                className="flex items-center justify-between p-3 border rounded-lg hover:border-foodix-500 cursor-pointer"
                                onClick={() => {
                                  assignDriver(selectedOrder._id, driver.userId);
                                  sendSMS(driver.phone, `You have been assigned to order ${selectedOrder._id}`);
                                }}
                              >
                                <div>
                                  <p className="font-medium">{driver.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {driver.phone}
                                  </p>
                                </div>
                                <Button size="sm">Assign</Button>
                              </div>
                            ))}
                        </div>
                        <Button 
                          variant="ghost" 
                          className="mt-2"
                          onClick={() => setAssigningDriverId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => setAssigningDriverId(selectedOrder._id)}>
                        Assign Driver
                      </Button>
                    )}
                  </>
                )}
                
                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                  <Button 
                    variant="outline" 
                    onClick={() => updateOrderStatus(selectedOrder._id, 'cancelled')}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Orders table
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        #{order._id.substring(order._id.length - 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">
                            {order.status.replace('-', ' ')}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {order.deliveryAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                        View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-3 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">Showing {filteredOrders.length} orders</p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {selectedOrder && selectedOrder.status === 'ready' && !selectedOrder.assignedDriverId && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Available Drivers</h3>
          <div className="space-y-2">
            {availableDrivers
              .filter(driver => driver.status === 'available')
              .map(driver => (
                <div key={driver._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-sm text-gray-600">{driver.phone}</p>
                  </div>
                  <button
                    onClick={() => assignDriver(selectedOrder._id, driver.userId)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Assign
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;