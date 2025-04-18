
import React from 'react';
import { useParams } from 'react-router-dom';
import RestaurantList from '@/components/home/RestaurantList';
import { MenuItem } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { restaurantAPI } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryDetailPageProps {
  addToCart: (restaurantId: string, menuItem: MenuItem) => void;
}

const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({ addToCart }) => {
  const { id } = useParams<{ id: string }>();
  
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: restaurantAPI.getAllCategories
  });
  
  const { data: restaurants, isLoading: isRestaurantsLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: restaurantAPI.getAllRestaurants
  });
  
  if (isCategoriesLoading || isRestaurantsLoading) {
    return (
      <div>
        <div className="relative h-64 bg-gray-200">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="py-10">
          <div className="foodix-container">
            <Skeleton className="h-10 w-64 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const category = categories?.find(c => c._id === id);
  
  if (!category) {
    return (
      <div className="foodix-container py-20">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <p>The category you're looking for doesn't exist.</p>
      </div>
    );
  }
  
  // Filter restaurants by category
  const filteredRestaurants = restaurants?.filter(restaurant => 
    restaurant.categories.includes(category.name)
  ) || [];
  
  return (
    <div>
      <div className="relative h-64 bg-gray-200">
        <img 
          src={category.image} 
          alt={category.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="foodix-container">
            <h1 className="text-3xl font-bold text-white">{category.name}</h1>
            <p className="text-white opacity-90 mt-2">
              Explore restaurants with amazing {category.name.toLowerCase()} options
            </p>
          </div>
        </div>
      </div>
      
      <div className="py-10">
        <div className="foodix-container">
          <RestaurantList 
            title={`${category.name} Restaurants`}
            restaurants={filteredRestaurants}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPage;
