
import React from 'react';
import { useParams } from 'react-router-dom';
import { Star, Clock, Truck, MapPin, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import MenuList from '@/components/restaurant/MenuList';
import { MenuItem as MenuItemType } from '@/lib/types';
import { restaurantAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface RestaurantPageProps {
  addToCart: (restaurantId: string, menuItem: MenuItemType) => void;
}

const RestaurantPage: React.FC<RestaurantPageProps> = ({ addToCart }) => {
  const { id } = useParams<{ id: string }>();
  
  const { data: restaurant, isLoading: isLoadingRestaurant, isError: isRestaurantError } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => id ? restaurantAPI.getRestaurantById(id) : null,
    enabled: !!id
  });
  
  const { data: menuItems, isLoading: isLoadingMenu, isError: isMenuError } = useQuery({
    queryKey: ['menuItems', id],
    queryFn: () => id ? restaurantAPI.getMenuItems(id) : [],
    enabled: !!id
  });
  
  if (isLoadingRestaurant || isLoadingMenu) {
    return (
      <div>
        <div className="relative h-64 bg-gray-200">
          <Skeleton className="w-full h-full" />
          <div className="absolute top-4 left-4">
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        
        <div className="foodix-container py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-6 w-full max-w-xl mb-6" />
          
          <div className="mb-8">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isRestaurantError || isMenuError || !restaurant) {
    return (
      <div className="foodix-container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Restaurant not found</h2>
        <p className="mb-6">The restaurant you're looking for doesn't exist or has been removed.</p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }
  
  // Group menu items by category
  const popularItems = menuItems?.filter(item => item.popular && item.available) || [];
  const mainDishes = menuItems?.filter(item => item.available) || [];
  
  const handleAddToCart = (item: MenuItemType) => {
    if (id) {
      addToCart(id, item);
    }
  };
  
  return (
    <div>
      {/* Restaurant Header */}
      <div className="relative h-64 bg-gray-200">
        <img 
          src={restaurant.image} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        
        <div className="absolute top-4 left-4">
          <Link to="/">
            <Button variant="secondary" size="sm" className="rounded-full">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="foodix-container">
            <div className="flex items-center">
              <img 
                src={restaurant.logo} 
                alt={`${restaurant.name} logo`}
                className="w-16 h-16 mr-4 rounded-lg border-2 border-white object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold mb-1">{restaurant.name}</h1>
                <div className="flex flex-wrap items-center text-sm">
                  <div className="flex items-center mr-4">
                    <Star className="text-yellow-400 h-4 w-4 mr-1" />
                    <span className="font-medium">{restaurant.rating}</span>
                    <span className="opacity-80 ml-1">({restaurant.reviewCount})</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <Clock className="opacity-80 h-4 w-4 mr-1" />
                    <span>{restaurant.deliveryTime} min</span>
                  </div>
                  <div className="flex items-center">
                    <Truck className="opacity-80 h-4 w-4 mr-1" />
                    <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Restaurant Info */}
      <div className="bg-white border-b">
        <div className="foodix-container py-4">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-start md:items-center flex-col md:flex-row">
              <p className="text-gray-700 mr-6 mb-2 md:mb-0">
                <MapPin className="inline-block h-4 w-4 mr-1 align-text-top" /> 
                {restaurant.address}
              </p>
              
              {!restaurant.isOpen && (
                <Badge variant="destructive">
                  Currently Closed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu */}
      <div className="foodix-container py-8">
        <Tabs defaultValue="menu">
          <TabsList className="mb-6">
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="menu">
            <div className="max-w-4xl mx-auto">
              {popularItems.length > 0 && (
                <MenuList 
                  title="Most Popular" 
                  items={popularItems}
                  onAddToCart={handleAddToCart}
                />
              )}
              
              <MenuList 
                title="All Menu Items" 
                items={mainDishes}
                onAddToCart={handleAddToCart}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="reviews">
            <div className="max-w-4xl mx-auto py-8 text-center">
              <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
              <p className="text-gray-500">
                Reviews coming soon!
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="info">
            <div className="max-w-4xl mx-auto py-8">
              <h3 className="text-xl font-bold mb-4">Restaurant Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">About</h4>
                  <p className="text-gray-700">{restaurant.description}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Address</h4>
                  <p className="text-gray-700">{restaurant.address}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Hours</h4>
                  <div className="text-gray-700">
                    <div className="flex justify-between mb-1">
                      <span>Monday - Friday</span>
                      <span>10:00 AM - 10:00 PM</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Saturday</span>
                      <span>11:00 AM - 11:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>11:00 AM - 9:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RestaurantPage;
