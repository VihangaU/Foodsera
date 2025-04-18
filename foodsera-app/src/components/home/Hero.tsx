
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-r from-foodix-500 to-foodix-600 text-white py-16 md:py-24">
      <div className="foodix-container">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Delicious Food Delivered to Your Doorstep
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Order from your favorite restaurants and get your meal delivered fast and fresh.
          </p>
          
          <div className="relative max-w-lg mx-auto">
            <div className="flex">
              <Input 
                type="text" 
                placeholder="Enter your address to find restaurants"
                className="pr-16 h-12 rounded-r-none text-gray-800 border-0 focus-visible:ring-foodix-300 focus-visible:ring-2"
              />
              <Button 
                className="h-12 px-6 rounded-l-none bg-white text-foodix-600 hover:bg-gray-100"
              >
                <Search className="mr-2 h-5 w-5" />
                Find Food
              </Button>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm">
              Free delivery on first order
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm">
              20+ cuisine types
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm">
              Live order tracking
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm">
              200+ restaurants
            </span>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="hidden md:block absolute -bottom-6 left-1/4 w-12 h-12 bg-white rounded-full opacity-20"></div>
      <div className="hidden md:block absolute top-1/3 right-1/4 w-8 h-8 bg-white rounded-full opacity-10"></div>
      <div className="hidden md:block absolute bottom-1/4 right-1/3 w-16 h-16 bg-white rounded-full opacity-15"></div>
    </div>
  );
};

export default Hero;
