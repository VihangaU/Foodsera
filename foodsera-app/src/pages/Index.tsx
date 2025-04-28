
import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '@/components/home/Hero';
import RestaurantList from '@/components/home/RestaurantList';
import { useQuery } from '@tanstack/react-query';
import { restaurantAPI } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import deliveryImage from '../../public/delivery-image.png';
import qualityImage from '../../public/quality-foods.png';
import trackingImage from '../../public/live-tracking.png';
import webAppImage from '../../public/webapp.png';
import webAppImage2 from '../../public/app-back.png';

const Index: React.FC = () => {
  const { data: restaurants, isLoading: isRestaurantsLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: restaurantAPI.getAllRestaurants
  });
  
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: restaurantAPI.getAllCategories
  });
  
  const renderCategoriesSection = () => {
    if (isCategoriesLoading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      );
    }
    
    if (!categories || categories.length === 0) {
      return <p className="text-center py-4">No categories available</p>;
    }
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category) => (
          <Link 
            key={category._id} 
            to={`/category/${category._id}`}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 text-center cursor-pointer"
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-foodix-100 flex items-center justify-center">
              <img 
                src={category.image} 
                alt={category.name}
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="text-sm font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    );
  };
  
  const renderRestaurantSection = (title, filterFn = null) => {
    if (isRestaurantsLoading) {
      return (
        <div className="py-10">
          <div className="foodix-container">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    if (!restaurants || restaurants.length === 0) {
      return null;
    }
    
    let displayRestaurants = restaurants;
    
    // Apply filter if provided
    if (filterFn) {
      displayRestaurants = restaurants.filter(filterFn);
    }
    
    return (
      <RestaurantList 
        title={title} 
        restaurants={displayRestaurants}
        viewAllLink="/restaurants"
      />
    );
  };
  
  return (
    <div>
      <Hero />
      
      {/* Categories */}
      <section className="py-10 bg-gray-50">
        <div className="foodix-container">
          <h2 className="text-2xl font-bold mb-6">Explore by Category</h2>
          {renderCategoriesSection()}
        </div>
      </section>
      
      {/* All Restaurants */}
      {renderRestaurantSection("All Restaurants", (r) => r.isOpen)}
      
      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="foodix-container">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Choose Foodix</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-foodix-100 flex items-center justify-center">
                <img 
                  src={deliveryImage} 
                  alt="Fast Delivery"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h3 className="text-lg font-bold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Get your food delivered to your doorstep within 30 minutes.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-foodix-100 flex items-center justify-center">
                <img 
                  src={qualityImage} 
                  alt="Quality Food"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h3 className="text-lg font-bold mb-2">Quality Food</h3>
              <p className="text-gray-600">
                We partner with the best restaurants to ensure quality meals.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-foodix-100 flex items-center justify-center">
                <img 
                  src={trackingImage} 
                  alt="Live Tracking"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h3 className="text-lg font-bold mb-2">Live Tracking</h3>
              <p className="text-gray-600">
                Track your order in real-time from restaurant to delivery.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* App Download */}
      <section className="py-16 bg-gradient-to-r from-foodix-500 to-foodix-600 text-white">
        <div className="foodix-container">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">
                Get the Foodix Web App
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Order food on the go with our mobile or laptop
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-black rounded-lg px-6 py-3 flex items-center justify-center hover:bg-gray-900 transition-colors">
                  <img 
                    src={webAppImage} 
                    alt="App Store"
                    className="h-6 mr-2 bg-white"
                  />
                  <span>Web App</span>
                </button>
              </div>
            </div>
            <div className="md:w-1/3">
              <img 
                src={qualityImage} 
                alt="Foodix App"
                className="w-full rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
