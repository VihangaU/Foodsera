
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { restaurantAPI } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const CategoriesPage: React.FC = () => {
  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: restaurantAPI.getAllCategories
  });

  if (isLoading) {
    return (
      <div className="py-10">
        <div className="foodix-container">
          <Skeleton className="h-10 w-3/12 mb-6" />
          <Skeleton className="h-6 w-6/12 mb-8" />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-10">
        <div className="foodix-container">
          <h1 className="text-3xl font-bold mb-6">Categories</h1>
          <p className="text-red-600 mb-8">
            Error loading categories. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-10">
      <div className="foodix-container">
        <h1 className="text-3xl font-bold mb-6">Categories</h1>
        <p className="text-gray-600 mb-8">
          Browse restaurants by your favorite food category
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((category) => (
            <Link 
              key={category._id} 
              to={`/category/${category._id}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="aspect-square overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
