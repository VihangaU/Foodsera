
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { Restaurant } from '@/lib/types';

interface RestaurantListProps {
  title: string;
  restaurants: Restaurant[];
  viewAllLink?: string;
}

const RestaurantList: React.FC<RestaurantListProps> = ({ 
  title, 
  restaurants,
  viewAllLink
}) => {
  return (
    <section className="py-10">
      <div className="foodix-container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          {viewAllLink && (
            <Link 
              to={viewAllLink} 
              className="text-foodix-600 hover:text-foodix-700 flex items-center"
            >
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
        
        {restaurants.length === 0 && (
          <div className="py-10 text-center text-gray-500">
            No restaurants found.
          </div>
        )}
      </div>
    </section>
  );
};

export default RestaurantList;
