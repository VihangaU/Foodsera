
import React from 'react';
import RestaurantList from '@/components/home/RestaurantList';
import { MenuItem, Restaurant } from '@/lib/types';
import { restaurantAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface RestaurantsPageProps {
  addToCart: (restaurantId: string, menuItem: MenuItem) => void;
}

const RestaurantsPage: React.FC<RestaurantsPageProps> = ({ addToCart }) => {
  const { data: restaurants, isLoading, isError } = useQuery({
    queryKey: ['restaurants'],
    queryFn: restaurantAPI.getAllRestaurants,
  });
  
  if (isLoading) {
    return (
      <div className="py-10">
        <div className="foodix-container">
          <Skeleton className="h-10 w-3/12 mb-6" />
          <Skeleton className="h-6 w-6/12 mb-8" />
          
          <div className="mb-8">
            <Skeleton className="h-8 w-2/12 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="py-10">
        <div className="foodix-container">
          <h1 className="text-3xl font-bold mb-6">All Restaurants</h1>
          <p className="text-red-600 mb-8">
            Error loading restaurants. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  
  const openRestaurants = restaurants?.filter((r: Restaurant) => r.isOpen) || [];
  
  return (
    <div className="py-10">
      <div className="foodix-container">
        <h1 className="text-3xl font-bold mb-6">All Restaurants</h1>
        <p className="text-gray-600 mb-8">
          Discover the best food and drinks from our partner restaurants
        </p>
        
        {openRestaurants.length > 0 && (
          <div className="mb-8">
            <RestaurantList 
              title="Open Now" 
              restaurants={openRestaurants} 
            />
          </div>
        )}
        
        <div className="mb-8">
          <RestaurantList 
            title="All Restaurants" 
            restaurants={restaurants} 
          />
        </div>
      </div>
    </div>
  );
};

export default RestaurantsPage;
