
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Truck } from 'lucide-react';
import { Restaurant } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <Link to={`/restaurant/${restaurant._id}`} className="block">
      <div className="foodix-card h-full flex flex-col">
        <div className="relative">
          <img 
            src={restaurant.image} 
            alt={restaurant.name} 
            className="w-full h-44 object-cover"
          />
          
          <div className="absolute top-3 left-3">
            {!restaurant.isOpen && (
              <Badge variant="destructive" className="mb-2">
                Closed
              </Badge>
            )}
          </div>
          
          <div className="absolute -bottom-6 left-4 w-12 h-12 bg-white rounded-lg shadow-md overflow-hidden p-1">
            <img 
              src={restaurant.logo} 
              alt={`${restaurant.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="flex-1 p-4 pt-8">
          <h3 className="font-semibold text-lg truncate">{restaurant.name}</h3>
          <div className="flex items-center mt-1 text-sm">
            <Star className="text-yellow-500 h-4 w-4 mr-1" />
            <span className="font-medium">{restaurant.rating}</span>
            <span className="text-gray-500 ml-1">({restaurant.reviewCount})</span>
          </div>
          
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{restaurant.description}</p>
          
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>{restaurant.deliveryTime} min</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Truck className="h-4 w-4 mr-1" />
              <span>${restaurant.deliveryFee.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
