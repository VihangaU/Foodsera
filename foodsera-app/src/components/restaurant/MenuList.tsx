
import React from 'react';
import MenuItem from './MenuItem';
import { MenuItem as MenuItemType } from '@/lib/types';

interface MenuListProps {
  title: string;
  items: MenuItemType[];
  onAddToCart: (item: MenuItemType) => void;
}

const MenuList: React.FC<MenuListProps> = ({ title, items, onAddToCart }) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <MenuItem key={item._id} item={item} onAddToCart={onAddToCart} />
        ))}
      </div>
      
      {items.length === 0 && (
        <div className="py-6 text-center text-gray-500">
          No items found in this category.
        </div>
      )}
    </div>
  );
};

export default MenuList;
