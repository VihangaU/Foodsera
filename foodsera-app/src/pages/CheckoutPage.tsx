import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Banknote, CreditCardIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { Cart } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { orderAPI, restaurantAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import StripePaymentForm from '@/components/payment/StripePaymentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

interface CheckoutPageProps {
  cart: Cart;
  clearCart: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart, clearCart }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryInstructions: '',
    paymentMethod: 'card',
  });
  
  const restaurantIds = [...new Set(cart.items.map(item => item.restaurantId))];
  
  // Get restaurant details for delivery fee calculation
  const { data: restaurantsData } = useQuery({
    queryKey: ['checkoutRestaurants', restaurantIds],
    queryFn: async () => {
      const promises = restaurantIds.map(id => restaurantAPI.getRestaurantById(id));
      return Promise.all(promises);
    },
    enabled: restaurantIds.length > 0
  });
  
  if (cart.items.length === 0) {
    return (
      <div className="foodix-container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="mb-6">Add items to your cart before proceeding to checkout.</p>
        <Link to="/">
          <Button>Browse Restaurants</Button>
        </Link>
      </div>
    );
  }
  
  // Group items by restaurant
  const itemsByRestaurant: Record<string, typeof cart.items> = {};
  cart.items.forEach(item => {
    const restaurantId = item.restaurantId;
    if (!itemsByRestaurant[restaurantId]) {
      itemsByRestaurant[restaurantId] = [];
    }
    itemsByRestaurant[restaurantId].push(item);
  });
  
  const subtotal = cart.items.reduce((total, item) => {
    return total + (item.menuItem.price * item.quantity);
  }, 0);
  
  // Calculate total delivery fee from all restaurants
  const deliveryFee = restaurantsData
    ? restaurantsData.reduce((total, restaurant) => total + restaurant.deliveryFee, 0)
    : 0;
  
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + deliveryFee + tax;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleRadioChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: value
    }));
  };
  
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Create delivery address string
    const deliveryAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
    
    try {
      // Process each restaurant order separately
      const orderPromises = Object.keys(itemsByRestaurant).map(async (restaurantId) => {
        const items = itemsByRestaurant[restaurantId].map(item => ({
          menuItemId: item.menuItem._id,
          quantity: item.quantity,
          restaurantId
        }));
        
        const restaurantSubtotal = items.reduce((total, item) => {
          const cartItem = cart.items.find(i => 
            i.menuItem._id === item.menuItemId && i.restaurantId === item.restaurantId
          );
          return total + (cartItem ? cartItem.menuItem.price * cartItem.quantity : 0);
        }, 0);
        
        const restaurant = restaurantsData?.find(r => r._id === restaurantId);
        const restaurantDeliveryFee = restaurant ? restaurant.deliveryFee : 0;
        const restaurantTax = restaurantSubtotal * 0.1;
        const restaurantTotal = restaurantSubtotal + restaurantDeliveryFee + restaurantTax;
        
        const orderData = {
          userId: user?._id,
          restaurantId,
          items,
          subtotal: restaurantSubtotal,
          tax: restaurantTax,
          deliveryFee: restaurantDeliveryFee,
          tip: 0, // Could add tip functionality in the future
          total: restaurantTotal,
          paymentMethod: formData.paymentMethod,
          deliveryAddress,
        };
        
        return orderAPI.createOrder(orderData);
      });
      
      const orders = await Promise.all(orderPromises);
      
      // If payment method is card, show the payment dialog
      if (formData.paymentMethod === 'card' && orders.length > 0) {
        setCurrentOrderId(orders[0]._id);
        setTotalAmount(total);
        setShowPaymentDialog(true);
        setIsProcessing(false);
      } else {
        // For cash on delivery, just proceed
        handleOrderSuccess();
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Failed to place order",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const handleOrderSuccess = () => {
    toast({
      title: "Order Placed Successfully!",
      description: "Your food is being prepared and will be delivered soon.",
    });
    
    clearCart();
    
    // Navigate to the order confirmation page if we have an order ID
    if (currentOrderId) {
      navigate(`/order-confirmation/${currentOrderId}`);
    } else {
      navigate('/');
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false);
    setIsProcessing(false);
  };
  
  return (
    <div className="foodix-container py-8 md:py-12">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-foodix-600 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to restaurant
      </Link>
      
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Order form */}
        <div className="lg:col-span-2">
          <form onSubmit={handlePlaceOrder}>
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    placeholder="Your full name" 
                    required 
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    placeholder="Your phone number" 
                    required 
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="address">Street Address</Label>
                <Input 
                  id="address" 
                  placeholder="Street address" 
                  required 
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    placeholder="City" 
                    required 
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    placeholder="State" 
                    required 
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input 
                    id="zipCode" 
                    placeholder="Zip code" 
                    required 
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Delivery Instructions */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Instructions</h2>
              <Textarea 
                id="deliveryInstructions"
                placeholder="Add any special instructions for delivery (optional)"
                className="mb-2"
                value={formData.deliveryInstructions}
                onChange={handleChange}
              />
            </div>
            
            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <RadioGroup 
                defaultValue="card" 
                className="mb-4"
                value={formData.paymentMethod}
                onValueChange={handleRadioChange}
              >
                <div className="flex items-center space-x-2 rounded-lg border p-4 mb-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1 flex items-center cursor-pointer">
                    <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                    Pay with Card
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex-1 flex items-center cursor-pointer">
                    <Banknote className="h-5 w-5 mr-2 text-gray-600" />
                    Cash on Delivery
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button 
              type="submit" 
              className="w-full md:w-auto bg-foodix-600 hover:bg-foodix-700"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Place Order"}
            </Button>
          </form>
        </div>
        
        {/* Right column - Order summary */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            {restaurantIds.map((restaurantId, index) => {
              const restaurant = restaurantsData?.find(r => r._id === restaurantId);
              return (
                <div key={restaurantId} className="mb-4">
                  {restaurant && (
                    <div className="flex items-center mb-2 pb-2 border-b">
                      <img 
                        src={restaurant.logo} 
                        alt={restaurant.name}
                        className="w-10 h-10 rounded-md object-cover mr-3"
                      />
                      <div>
                        <h3 className="font-medium">{restaurant.name}</h3>
                        <p className="text-sm text-gray-500">{restaurant.deliveryTime} min delivery</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-2">
                    {itemsByRestaurant[restaurantId].map((item) => (
                      <div key={item._id} className="flex justify-between text-sm mb-2">
                        <span>
                          {item.quantity} x {item.menuItem.name}
                        </span>
                        <span className="font-medium">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {index < restaurantIds.length - 1 && <Separator className="my-3" />}
                </div>
              );
            })}
            
            <div className="mb-4 pb-4 border-b">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">{restaurantIds.length > 1 ? 'Delivery Fees' : 'Delivery Fee'}</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          {currentOrderId && (
            <StripePaymentForm 
              amount={totalAmount} 
              orderId={currentOrderId}
              onSuccess={handleOrderSuccess}
              onCancel={handlePaymentCancel}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutPage;
