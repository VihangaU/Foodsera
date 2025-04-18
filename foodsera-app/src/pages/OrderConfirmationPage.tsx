import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Clock, MapPin, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Order, MenuItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { orderAPI, restaurantAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({});
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const orderData = await orderAPI.getOrderById(id);
        setOrder(orderData);
        
        // Fetch menu items for all restaurants in the order
        if (orderData.restaurants && orderData.restaurants.length > 0) {
          const menuItemsMap: Record<string, MenuItem> = {};
          
          for (const restaurant of orderData.restaurants) {
            try {
              const items = await restaurantAPI.getMenuItems(restaurant._id);
              items.forEach((item: MenuItem) => {
                menuItemsMap[item._id] = item;
              });
            } catch (err) {
              console.error(`Failed to fetch menu items for restaurant ${restaurant._id}:`, err);
            }
          }
          
          setMenuItems(menuItemsMap);
        } else {
          // If no restaurants array, fetch menu items for each item in the order
          const menuItemsMap: Record<string, MenuItem> = {};
          
          // Get unique restaurant IDs from order items
          const restaurantIds = [...new Set(orderData.items.map(item => item.restaurantId))].filter(Boolean) as string[];
          
          // Fetch menu items for each restaurant
          for (const restaurantId of restaurantIds) {
            try {
              const items = await restaurantAPI.getMenuItems(restaurantId);
              items.forEach((item: MenuItem) => {
                menuItemsMap[item._id] = item;
              });
            } catch (err) {
              console.error(`Failed to fetch menu items for restaurant ${restaurantId}:`, err);
            }
          }
          
          // If we still don't have all menu items, try to fetch them directly
          const missingMenuItemIds = orderData.items
            .filter(item => item.menuItemId && !menuItemsMap[item.menuItemId])
            .map(item => item.menuItemId);
          
          if (missingMenuItemIds.length > 0) {
            console.log(`Fetching ${missingMenuItemIds.length} missing menu items directly`);
            
            // Try to fetch each missing menu item
            for (const menuItemId of missingMenuItemIds) {
              try {
                // Since we don't have a direct API to get a menu item by ID,
                // we'll try to find the restaurant ID for this menu item
                // and then fetch all menu items for that restaurant
                const item = orderData.items.find(item => item.menuItemId === menuItemId);
                if (item && item.restaurantId) {
                  const items = await restaurantAPI.getMenuItems(item.restaurantId);
                  items.forEach((menuItem: MenuItem) => {
                    menuItemsMap[menuItem._id] = menuItem;
                  });
                }
              } catch (err) {
                console.error(`Failed to fetch menu item ${menuItemId}:`, err);
              }
            }
          }
          
          setMenuItems(menuItemsMap);
        }
        
        // If order is in delivery, start tracking driver location
        if (orderData.status === 'in-delivery' && orderData.driverLocation) {
          setDriverLocation(orderData.driverLocation);
          setEstimatedArrival(orderData.estimatedDeliveryTime || '20-30 min');
          
          // Simulate driver movement
          const interval = setInterval(() => {
            if (orderData.driverLocation && orderData.customerLocation) {
              const driverLoc = { ...orderData.driverLocation };
              const customerLoc = orderData.customerLocation;
              
              // Move driver closer to customer
              if (driverLoc.latitude < customerLoc.latitude) {
                driverLoc.latitude += 0.0005;
              } else if (driverLoc.latitude > customerLoc.latitude) {
                driverLoc.latitude -= 0.0005;
              }
              
              if (driverLoc.longitude < customerLoc.longitude) {
                driverLoc.longitude += 0.0005;
              } else if (driverLoc.longitude > customerLoc.longitude) {
                driverLoc.longitude -= 0.0005;
              }
              
              setDriverLocation(driverLoc);
              
              // Update estimated arrival
              const dist = Math.sqrt(
                Math.pow(customerLoc.latitude - driverLoc.latitude, 2) + 
                Math.pow(customerLoc.longitude - driverLoc.longitude, 2)
              );
              
              const minutesLeft = Math.round(dist * 1000);
              setEstimatedArrival(`${minutesLeft > 1 ? minutesLeft : 'less than 1'} minute${minutesLeft !== 1 ? 's' : ''}`);
            }
          }, 2000);
          
          return () => clearInterval(interval);
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="foodix-container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="foodix-container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">{error}</h2>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="foodix-container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Order not found</h2>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const getStatusStepClass = (step: number, currentStatus: string) => {
    const statusMap: Record<string, number> = {
      'pending': 1,
      'confirmed': 2,
      'preparing': 3,
      'ready': 4,
      'in-delivery': 5,
      'delivered': 6
    };
    
    const currentStep = statusMap[currentStatus] || 1;
    
    if (step < currentStep) {
      return 'bg-green-500';
    } else if (step === currentStep) {
      return 'bg-foodix-500 animate-pulse';
    } else {
      return 'bg-gray-300';
    }
  };
  
  // Group items by restaurant
  const itemsByRestaurant: Record<string, typeof order.items> = {};
  if (order) {
    order.items.forEach(item => {
      if (!itemsByRestaurant[item.restaurantId]) {
        itemsByRestaurant[item.restaurantId] = [];
      }
      itemsByRestaurant[item.restaurantId].push(item);
    });
  }
  
  return (
    <div className="foodix-container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Order #{order._id}</h1>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {order.status === 'delivered' ? (
                <Check className="mr-1 h-4 w-4" />
              ) : (
                <Clock className="mr-1 h-4 w-4" />
              )}
              {order.status.replace('-', ' ')}
            </div>
          </div>
          
          {/* Order progress */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-between">
                <div className="text-center">
                  <div className={`h-8 w-8 rounded-full ${getStatusStepClass(1, order.status)} flex items-center justify-center mx-auto`}>
                    <span className="text-white font-medium">1</span>
                  </div>
                  <div className="mt-2 text-xs">Ordered</div>
                </div>
                <div className="text-center">
                  <div className={`h-8 w-8 rounded-full ${getStatusStepClass(2, order.status)} flex items-center justify-center mx-auto`}>
                    <span className="text-white font-medium">2</span>
                  </div>
                  <div className="mt-2 text-xs">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className={`h-8 w-8 rounded-full ${getStatusStepClass(3, order.status)} flex items-center justify-center mx-auto`}>
                    <span className="text-white font-medium">3</span>
                  </div>
                  <div className="mt-2 text-xs">Preparing</div>
                </div>
                <div className="text-center">
                  <div className={`h-8 w-8 rounded-full ${getStatusStepClass(4, order.status)} flex items-center justify-center mx-auto`}>
                    <span className="text-white font-medium">4</span>
                  </div>
                  <div className="mt-2 text-xs">Ready</div>
                </div>
                <div className="text-center">
                  <div className={`h-8 w-8 rounded-full ${getStatusStepClass(5, order.status)} flex items-center justify-center mx-auto`}>
                    <span className="text-white font-medium">5</span>
                  </div>
                  <div className="mt-2 text-xs">On the way</div>
                </div>
                <div className="text-center">
                  <div className={`h-8 w-8 rounded-full ${getStatusStepClass(6, order.status)} flex items-center justify-center mx-auto`}>
                    <span className="text-white font-medium">6</span>
                  </div>
                  <div className="mt-2 text-xs">Delivered</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Map and Delivery Driver */}
          {order.status === 'in-delivery' && driverLocation && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Delivery Tracking</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-gray-100 rounded-lg overflow-hidden h-64 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1569336415962-a4bd9f69c07b?q=80&w=2078&auto=format&fit=crop" 
                      alt="Map view" 
                      className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
                    <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-md text-center">
                      <p className="text-gray-800">
                        Estimated arrival in <span className="font-medium">{estimatedArrival}</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium text-gray-800 mb-3">Your Delivery Driver</h3>
                  <div className="flex items-center mb-4">
                    <img 
                      src={order.assignedDriverPhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop'} 
                      alt="Driver" 
                      className="w-16 h-16 rounded-full object-cover mr-3"
                    />
                    <div>
                      <p className="font-medium">{order.assignedDriverName}</p>
                      <p className="text-xs text-gray-500">Delivery Partner</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Driver
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Order Details */}
          <div className="border-t border-b py-4 mb-4">
            <h2 className="text-lg font-semibold mb-4">Order Details</h2>
            
            {order.restaurants && order.restaurants.length > 0 && (
              <div className="space-y-6">
                {order.restaurants.map(restaurant => {
                  const restaurantItems = itemsByRestaurant[restaurant._id] || [];
                  return (
                    <div key={restaurant._id} className="mb-4">
                      <div className="flex items-center mb-3">
                        <img 
                          src={restaurant.logo || '/placeholder-restaurant.jpg'}
                          alt={restaurant.name || 'Restaurant'}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <h3 className="font-medium">{restaurant.name || 'Unknown Restaurant'}</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {restaurantItems.map((item) => {
                          // Get menu item details from our cache
                          const menuItemDetails = menuItems[item.menuItemId];
                          
                          // Handle both data structures
                          const itemName = menuItemDetails?.name || item.name || 'Unknown Item';
                          const itemPrice = menuItemDetails?.price || item.price || 0;
                          const itemImage = menuItemDetails?.image || item.image || '/placeholder-food.jpg';
                          
                          console.log(`Item ${item._id}:`, {
                            menuItemId: item.menuItemId,
                            menuItemDetails: menuItemDetails ? 'Found' : 'Not found',
                            itemName,
                            itemPrice,
                            itemImage
                          });
                          
                          return (
                            <div key={item._id} className="flex items-center">
                              <div className="w-16 h-16 rounded-md overflow-hidden mr-4">
                                <img
                                  src={itemImage}
                                  alt={itemName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error(`Image failed to load: ${itemImage}`);
                                    // Use a data URL for the fallback to avoid network requests
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium">{itemName}</h3>
                                <p className="text-sm text-gray-500">
                                  Quantity: {item.quantity}
                                </p>
                                {item.specialInstructions && (
                                  <p className="text-xs text-gray-500">
                                    {item.specialInstructions}
                                  </p>
                                )}
                              </div>
                              <div className="font-medium">
                                ${((item.quantity || 0) * itemPrice).toFixed(2)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Add a separator between restaurants if not the last one */}
                      {restaurant._id !== order.restaurants[order.restaurants.length - 1]._id && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* If no restaurants array is present, fall back to default rendering */}
            {(!order.restaurants || order.restaurants.length === 0) && (
              <div className="space-y-4">
                {order.items.map((item) => {
                  // Get menu item details from our cache
                  const menuItemDetails = menuItems[item.menuItemId];
                  
                  // Handle both data structures
                  const itemName = menuItemDetails?.name || item.name || 'Unknown Item';
                  const itemPrice = menuItemDetails?.price || item.price || 0;
                  const itemImage = menuItemDetails?.image || item.image || '/placeholder-food.jpg';
                  
                  console.log(`Item ${item._id}:`, {
                    menuItemId: item.menuItemId,
                    menuItemDetails: menuItemDetails ? 'Found' : 'Not found',
                    itemName,
                    itemPrice,
                    itemImage
                  });
                  
                  return (
                    <div key={item._id} className="flex items-center">
                      <div className="w-16 h-16 rounded-md overflow-hidden mr-4">
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`Image failed to load: ${itemImage}`);
                            // Use a data URL for the fallback to avoid network requests
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{itemName}</h3>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                        {item.specialInstructions && (
                          <p className="text-xs text-gray-500">
                            {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <div className="font-medium">
                        ${((item.quantity || 0) * itemPrice).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Delivery Address */}
          <div className="border-b py-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Delivery Address</h2>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-foodix-600 mt-0.5 mr-2" />
              <p className="text-gray-700">{order.deliveryAddress}</p>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tip</span>
                <span>${order.tip.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold text-base">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-between">
            <Button variant="outline" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
            
            <div className="space-x-2">
              <Button variant="outline" asChild>
                <Link to="#">Need Help?</Link>
              </Button>
              <Button asChild>
                <Link to="/my-orders">My Orders</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
