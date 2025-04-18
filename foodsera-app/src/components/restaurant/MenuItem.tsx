
import React from 'react';
import { Plus } from 'lucide-react';
import { MenuItem as MenuItemType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MenuItemProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onAddToCart }) => {
  return (
    <div className="flex bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex-1 pr-4">
        <div className="flex items-center mb-1">
          <h3 className="font-medium">{item.name}</h3>
          {item.popular && (
            <Badge variant="outline" className="ml-2 bg-foodix-50 text-foodix-800 border-foodix-200">
              Popular
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{item.description}</p>
        <div className="text-foodix-700 font-medium">${item.price.toFixed(2)}</div>
      </div>
      
      <div className="relative">
        <img 
          src={item.image} 
          alt={item.name}
          className="h-20 w-24 rounded-md object-cover"
        />
        {item.available ? (
          <Button 
            size="icon" 
            variant="secondary"
            className="absolute -bottom-3 -right-3 h-8 w-8 rounded-full shadow-sm bg-white border border-gray-100 hover:bg-foodix-50"
            onClick={() => onAddToCart(item)}
          >
            <Plus className="h-4 w-4 text-foodix-700" />
          </Button>
        ) : (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-80 rounded-md flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600 p-1 bg-white rounded">
              Unavailable
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItem;
