
import React, { useEffect, useState } from 'react';
import { X, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Cart, CartItem, Restaurant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { restaurantAPI } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Record<string, Restaurant>>({});
  const [loading, setLoading] = useState(false);
  
  // Fetch restaurant data for all restaurants in the cart
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        if (cart.items.length === 0) return;
        
        setLoading(true);
        const restaurantIds = Array.from(new Set(cart.items.map(item => item.restaurantId)));
        
        const restaurantData: Record<string, Restaurant> = {};
        
        for (const id of restaurantIds) {
          try {
            const restaurant = await restaurantAPI.getRestaurantById(id);
            restaurantData[id] = restaurant;
          } catch (error) {
            console.error(`Failed to fetch restaurant ${id}:`, error);
          }
        }
        
        setRestaurants(restaurantData);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen && cart.items.length > 0) {
      fetchRestaurants();
    }
  }, [isOpen, cart.items]);
  
  // Group items by restaurant
  const itemsByRestaurant: Record<string, CartItem[]> = {};
  cart.items.forEach(item => {
    const restaurantId = item.restaurantId;
    if (!itemsByRestaurant[restaurantId]) {
      itemsByRestaurant[restaurantId] = [];
    }
    itemsByRestaurant[restaurantId].push(item);
  });
  
  const restaurantIds = Object.keys(itemsByRestaurant);
  
  const subtotal = cart.items.reduce((total, item) => {
    return total + (item.menuItem.price * item.quantity);
  }, 0);
  
  // Calculate average delivery fee if multiple restaurants
  const deliveryFee = restaurantIds.reduce((total, id) => {
    const restaurant = restaurants[id];
    return total + (restaurant ? restaurant.deliveryFee : 0);
  }, 0);
  
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + deliveryFee + tax;
  
  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };
  
  return (
    <div 
      className={`fixed inset-y-0 right-0 z-50 w-full md:w-96 bg-white shadow-xl transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={onClose}
        ></div>
      )}
      
      <div className="flex flex-col h-full z-50">
        {/* Header */}
        <div className="px-4 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <ShoppingBag className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-1">Your cart is empty</p>
              <p className="text-sm text-center mb-6">Add items from a restaurant to get started</p>
              <Button variant="outline" onClick={onClose}>
                Browse Restaurants
              </Button>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="w-16 h-16 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {restaurantIds.map(restaurantId => {
                const restaurant = restaurants[restaurantId];
                return (
                  <div key={restaurantId} className="mb-6">
                    {restaurant && (
                      <div className="flex items-center mb-3">
                        <img 
                          src={restaurant.logo} 
                          alt={restaurant.name}
                          className="w-10 h-10 rounded object-cover mr-3"
                        />
                        <div>
                          <h3 className="font-medium">{restaurant.name}</h3>
                          <p className="text-xs text-gray-500">Delivery: {restaurant.deliveryTime} min</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {itemsByRestaurant[restaurantId].map(item => (
                        <CartItemComponent
                          key={item._id}
                          item={item}
                          onUpdateQuantity={onUpdateQuantity}
                          onRemoveItem={onRemoveItem}
                        />
                      ))}
                    </div>
                    {restaurantId !== restaurantIds[restaurantIds.length - 1] && (
                      <Separator className="my-4" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Summary */}
        {cart.items.length > 0 && (
          <div className="border-t p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{restaurantIds.length > 1 ? 'Delivery Fees' : 'Delivery Fee'}</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full mt-4 bg-foodix-600 hover:bg-foodix-700"
              onClick={handleCheckout}
            >
              Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// CartItem component
interface CartItemComponentProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const CartItemComponent: React.FC<CartItemComponentProps> = ({
  item,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  return (
    <div className="flex py-3 border-b last:border-b-0">
      <div className="flex-shrink-0 mr-3">
        <img 
          src={item.menuItem.image} 
          alt={item.menuItem.name}
          className="w-16 h-16 rounded object-cover"
        />
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <h4 className="font-medium">{item.menuItem.name}</h4>
          <span className="font-medium">
            ${(item.menuItem.price * item.quantity).toFixed(2)}
          </span>
        </div>
        
        {item.specialInstructions && (
          <p className="text-xs text-gray-500 mb-2">
            {item.specialInstructions}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7 rounded-full"
              onClick={() => {
                if (item.quantity > 1) {
                  onUpdateQuantity(item._id, item.quantity - 1);
                } else {
                  onRemoveItem(item._id);
                }
              }}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="mx-2 text-sm min-w-[20px] text-center">{item.quantity}</span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7 rounded-full"
              onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 h-7 px-2"
            onClick={() => onRemoveItem(item._id)}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
