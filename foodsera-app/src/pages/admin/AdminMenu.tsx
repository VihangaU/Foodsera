import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { MenuItem, Category, Restaurant } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { restaurantAPI } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AdminMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateRestaurantOpen, setIsCreateRestaurantOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuCategories, setMenuCategories] = useState<Category[]>([
    { _id: 'all', name: 'All Items', image: '' }
  ]);
  const { user } = useAuth();
  const [userRestaurant, setUserRestaurant] = useState<Restaurant | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [menuItemImageFile, setMenuItemImageFile] = useState<File | null>(null);
  const [menuItemImagePreview, setMenuItemImagePreview] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!user?._id) {
          setError('Unable to identify restaurant owner. Please login again.');
          return;
        }

        const allRestaurants = await restaurantAPI.getAllRestaurants();
        const userOwnedRestaurant = allRestaurants.find((restaurant: Restaurant) =>
          restaurant.owner === user._id
        );

        if (userOwnedRestaurant) {
          setUserRestaurant(userOwnedRestaurant);
          console.log('Found user restaurant:', userOwnedRestaurant);

          const items = await restaurantAPI.getMenuItems(userOwnedRestaurant._id);
          setMenuItems(items);
        } else {
          console.log('No restaurant found for user, will need to create one');
          setError('You need to create a restaurant before adding menu items.');
          setIsLoading(false);
          return;
        }

        const categories = await restaurantAPI.getAllCategories();
        setMenuCategories([
          { _id: 'all', name: 'All Items', image: '' },
          ...categories.map((cat: Category) => ({ _id: cat._id, name: cat.name, image: cat.image }))
        ]);
      } catch (err) {
        console.error('Failed to fetch menu data:', err);
        setError('Failed to load menu items. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    categories: string[];
    popular: boolean;
    available: boolean;
    image: string;
  }>({
    name: '',
    description: '',
    price: '',
    categories: [],
    popular: false,
    available: true,
    image: '',
  });

  const [restaurantFormData, setRestaurantFormData] = useState<{
    name: string;
    description: string;
    deliveryFee: string;
    deliveryTime: string;
    address: string;
    categories: string[];
  }>({
    name: '',
    description: '',
    deliveryFee: '',
    deliveryTime: '',
    address: '',
    categories: []
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const filteredItems = menuItems
    .filter(item =>
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(item =>
      activeCategory === 'all' || item.categories.includes(activeCategory)
    );

  const openAddDialog = () => {
    if (!userRestaurant) {
      toast({
        title: "No Restaurant Found",
        description: "You need to create a restaurant first.",
        variant: "destructive",
      });
      setIsCreateRestaurantOpen(true);
      return;
    }

    setFormData({
      name: '',
      description: '',
      price: '',
      categories: [],
      popular: false,
      available: true,
      image: '',
    });
    setMenuItemImageFile(null);
    setMenuItemImagePreview('');
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (item: MenuItem) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      categories: item.categories,
      popular: item.popular,
      available: item.available,
      image: item.image,
    });
    setMenuItemImageFile(null);
    setMenuItemImagePreview('');
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: MenuItem) => {
    setCurrentItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRestaurantInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRestaurantFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category]
        };
      }
    });
  };

  const handleRestaurantCategorySelect = (category: string) => {
    setRestaurantFormData(prev => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category]
        };
      }
    });
  };

  const handleRestaurantLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setLogoPreview(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRestaurantImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setImagePreview(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMenuItemImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMenuItemImageFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setMenuItemImagePreview(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateRestaurant = async () => {
    try {
      if (!user?._id) {
        toast({
          title: "Error",
          description: "User not found. Please login again.",
          variant: "destructive",
        });
        return;
      }

      if (!logoFile || !imageFile) {
        toast({
          title: "Error",
          description: "Logo and image files are required",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append('name', restaurantFormData.name);
      formData.append('description', restaurantFormData.description);
      formData.append('deliveryFee', restaurantFormData.deliveryFee);
      formData.append('deliveryTime', restaurantFormData.deliveryTime);
      formData.append('address', restaurantFormData.address);

      // Ensure categories is a string with comma-separated values
      if (restaurantFormData.categories && restaurantFormData.categories.length > 0) {
        formData.append('categories', restaurantFormData.categories.join(','));
      } else {
        formData.append('categories', '');
      }

      // Ensure we're appending the actual File objects
      formData.append('logo', logoFile);
      formData.append('image', imageFile);
      formData.append('owner', user?._id);

      console.log('FormData prepared for submission:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? `File: ${value.name}` : value}`);
      }

      const addedRestaurant = await restaurantAPI.createRestaurant(formData);

      setUserRestaurant(addedRestaurant);
      setIsCreateRestaurantOpen(false);

      toast({
        title: "Restaurant created",
        description: `${addedRestaurant.name} has been created successfully`,
      });

      window.location.reload();
    } catch (error) {
      console.error('Failed to create restaurant:', error);
      toast({
        title: "Error",
        description: "Failed to create restaurant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddItem = async () => {
    try {
      if (!userRestaurant?._id) {
        toast({
          title: "Error",
          description: "Restaurant not found. Please create one first.",
          variant: "destructive",
        });
        return;
      }

      if (!menuItemImageFile) {
        toast({
          title: "Error",
          description: "Image is required for menu items",
          variant: "destructive",
        });
        return;
      }

      const newItemData = new FormData();
      newItemData.append('name', formData.name);
      newItemData.append('description', formData.description);
      newItemData.append('price', formData.price);
      newItemData.append('categories', formData.categories.join(','));
      newItemData.append('popular', String(formData.popular));
      newItemData.append('available', String(formData.available));

      // Log the image file details for debugging
      console.log('Image file details:', {
        name: menuItemImageFile.name,
        type: menuItemImageFile.type,
        size: menuItemImageFile.size
      });

      // Ensure the image is properly appended to FormData
      newItemData.append('image', menuItemImageFile);

      // Log the FormData contents for debugging
      for (const pair of newItemData.entries()) {
        console.log(`${pair[0]}: ${pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]}`);
      }

      const addedItem = await restaurantAPI.addMenuItem(userRestaurant._id, newItemData);

      setMenuItems(prev => [...prev, addedItem]);
      setIsAddDialogOpen(false);

      toast({
        title: "Menu item added",
        description: `${addedItem.name} has been added to your menu`,
      });
    } catch (error) {
      console.error('Failed to add menu item:', error);
      toast({
        title: "Error",
        description: "Failed to add menu item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = async () => {
    if (!currentItem) return;

    try {
      const menuItemData = new FormData();
      menuItemData.append('name', formData.name);
      menuItemData.append('description', formData.description);
      menuItemData.append('price', formData.price);
      menuItemData.append('categories', formData.categories.join(','));
      menuItemData.append('popular', String(formData.popular));
      menuItemData.append('available', String(formData.available));

      if (menuItemImageFile) {
        menuItemData.append('image', menuItemImageFile);
      }

      const updatedItem = await restaurantAPI.updateMenuItem(currentItem._id, menuItemData);

      setMenuItems(prev =>
        prev.map(item =>
          item._id === currentItem._id ? updatedItem : item
        )
      );

      setIsEditDialogOpen(false);

      toast({
        title: "Menu item updated",
        description: `${updatedItem.name} has been updated`,
      });
    } catch (error) {
      console.error('Failed to update menu item:', error);
      toast({
        title: "Error",
        description: "Failed to update menu item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!currentItem) return;

    try {
      await restaurantAPI.deleteMenuItem(currentItem._id);

      setMenuItems(prev =>
        prev.filter(item => item._id !== currentItem._id)
      );

      setIsDeleteDialogOpen(false);

      toast({
        title: "Menu item deleted",
        description: `${currentItem.name} has been removed from your menu`,
      });
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      toast({
        title: "Error",
        description: "Failed to delete menu item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const formData = new FormData();
      formData.append('available', String(!item.available));

      const updatedItem = await restaurantAPI.updateMenuItem(item._id, formData);

      setMenuItems(prev =>
        prev.map(menuItem =>
          menuItem._id === item._id ? updatedItem : menuItem
        )
      );

      toast({
        title: item.available ? "Item marked as unavailable" : "Item marked as available",
        description: `${item.name} is now ${item.available ? 'unavailable' : 'available'} for ordering`,
      });
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      toast({
        title: "Error",
        description: "Failed to update item availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !userRestaurant) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Menu Management</h1>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Restaurant Required</AlertTitle>
          <AlertDescription>
            You need to create a restaurant before you can manage menu items.
          </AlertDescription>
        </Alert>

        <Button
          onClick={() => setIsCreateRestaurantOpen(true)}
          className="mb-4"
        >
          Create Restaurant
        </Button>

        <Dialog open={isCreateRestaurantOpen} onOpenChange={setIsCreateRestaurantOpen}>
          <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="sticky bg-white z-10 pb-4">
              <DialogTitle className="text-lg font-bold">Create Your Restaurant</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Please fill in the details below to set up your restaurant.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={restaurantFormData.name}
                  onChange={handleRestaurantInputChange}
                  className="col-span-3"
                  placeholder="My Restaurant"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right text-sm font-medium">
                  Description
                </label>
                <Input
                  id="description"
                  name="description"
                  value={restaurantFormData.description}
                  onChange={handleRestaurantInputChange}
                  className="col-span-3"
                  placeholder="Delicious food served with love"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="deliveryFee" className="text-right text-sm font-medium">
                  Delivery Fee
                </label>
                <Input
                  id="deliveryFee"
                  name="deliveryFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={restaurantFormData.deliveryFee}
                  onChange={handleRestaurantInputChange}
                  className="col-span-3"
                  placeholder="2.99"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="deliveryTime" className="text-right text-sm font-medium">
                  Delivery Time
                </label>
                <Input
                  id="deliveryTime"
                  name="deliveryTime"
                  value={restaurantFormData.deliveryTime}
                  onChange={handleRestaurantInputChange}
                  className="col-span-3"
                  placeholder="20-30 min"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="address" className="text-right text-sm font-medium">
                  Address
                </label>
                <Input
                  id="address"
                  name="address"
                  value={restaurantFormData.address}
                  onChange={handleRestaurantInputChange}
                  className="col-span-3"
                  placeholder="123 Main St, City"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <label className="text-right text-sm font-medium pt-2">
                  Categories
                </label>
                <div className="col-span-3 flex flex-wrap gap-2">
                  {menuCategories
                    .filter(category => category._id !== 'all')
                    .map(category => (
                      <label
                        key={category._id}
                        className={`px-3 py-1 text-sm rounded-full cursor-pointer ${restaurantFormData.categories.includes(category._id)
                          ? 'bg-foodix-100 text-foodix-800 border border-foodix-300'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={restaurantFormData.categories.includes(category._id)}
                          onChange={() => handleRestaurantCategorySelect(category._id)}
                        />
                        {category.name}
                      </label>
                    ))
                  }
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="logo" className="text-right text-sm font-medium pt-2">
                  Logo
                </label>
                <div className="col-span-3">
                  <Input
                    id="logo"
                    name="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleRestaurantLogoChange}
                    className="cursor-pointer"
                    required
                  />
                  {logoPreview && (
                    <div className="mt-2">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    </div>
                  )}
                  {!logoPreview && (
                    <div className="mt-2 border rounded-md w-24 h-24 flex items-center justify-center bg-gray-50">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="image" className="text-right text-sm font-medium pt-2">
                  Cover Image
                </label>
                <div className="col-span-3">
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleRestaurantImageChange}
                    className="cursor-pointer"
                    required
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Restaurant Image Preview"
                        className="w-full h-40 object-cover rounded-md"
                      />
                    </div>
                  )}
                  {!imagePreview && (
                    <div className="mt-2 border rounded-md w-full h-40 flex items-center justify-center bg-gray-50">
                      <Upload className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateRestaurantOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateRestaurant} 
                disabled={!restaurantFormData.name || !restaurantFormData.description || !logoFile || !imageFile}
              >
                Create Restaurant
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Menu Management</h1>
        <div className="text-red-600 mb-4">{error}</div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </div>

      {userRestaurant && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Current Restaurant: {userRestaurant.name}</AlertTitle>
          <AlertDescription>
            All menu items will be added to this restaurant.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search menu items..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <Tabs
          defaultValue="all"
          value={activeCategory}
          onValueChange={handleCategoryChange}
          className="w-full"
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            {menuCategories.map(category => (
              <TabsTrigger
                key={category._id}
                value={category._id}
                className="px-4"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-8 text-center text-gray-500">
            No menu items found
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  {!item.available && (
                    <div className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                      Unavailable
                    </div>
                  )}
                  {item.popular && (
                    <div className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      Popular
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-medium">${item.price.toFixed(2)}</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAvailability(item)}
                    >
                      {item.available ? (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="h-4 w-4 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(item)}
                    >
                      <Trash className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new item to your menu.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Cheeseburger"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Delicious burger with cheese"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="price" className="text-right text-sm font-medium">
                Price
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="9.99"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right text-sm font-medium pt-2">
                Categories
              </label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {menuCategories
                  .filter(category => category._id !== 'all')
                  .map(category => (
                    <label
                      key={category._id}
                      className={`px-3 py-1 text-sm rounded-full cursor-pointer ${formData.categories.includes(category._id)
                        ? 'bg-foodix-100 text-foodix-800 border border-foodix-300'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.categories.includes(category._id)}
                        onChange={() => handleCategorySelect(category._id)}
                      />
                      {category.name}
                    </label>
                  ))
                }
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Options
              </label>
              <div className="col-span-3 space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="popular"
                    checked={formData.popular}
                    onChange={handleCheckboxChange}
                    className="rounded text-foodix-600"
                  />
                  <span className="text-sm">Mark as popular</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleCheckboxChange}
                    className="rounded text-foodix-600"
                  />
                  <span className="text-sm">Available for ordering</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="menuItemImage" className="text-right text-sm font-medium pt-2">
                Image
              </label>
              <div className="col-span-3">
                <Input
                  id="menuItemImage"
                  name="menuItemImage"
                  type="file"
                  accept="image/*"
                  onChange={handleMenuItemImageChange}
                  className="cursor-pointer"
                  required
                />
                {menuItemImagePreview && (
                  <div className="mt-2">
                    <img
                      src={menuItemImagePreview}
                      alt="Menu Item Image Preview"
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </div>
                )}
                {!menuItemImagePreview && (
                  <div className="mt-2 border rounded-md w-full h-40 flex items-center justify-center bg-gray-50">
                    <Upload className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={!formData.name || !formData.price || !menuItemImageFile}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the details of this menu item.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-name" className="text-right text-sm font-medium">
                Name
              </label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-description" className="text-right text-sm font-medium">
                Description
              </label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-price" className="text-right text-sm font-medium">
                Price
              </label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right text-sm font-medium pt-2">
                Categories
              </label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {menuCategories
                  .filter(category => category._id !== 'all')
                  .map(category => (
                    <label
                      key={category._id}
                      className={`px-3 py-1 text-sm rounded-full cursor-pointer ${formData.categories.includes(category._id)
                        ? 'bg-foodix-100 text-foodix-800 border border-foodix-300'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.categories.includes(category._id)}
                        onChange={() => handleCategorySelect(category._id)}
                      />
                      {category.name}
                    </label>
                  ))
                }
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Options
              </label>
              <div className="col-span-3 space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="popular"
                    checked={formData.popular}
                    onChange={handleCheckboxChange}
                    className="rounded text-foodix-600"
                  />
                  <span className="text-sm">Mark as popular</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleCheckboxChange}
                    className="rounded text-foodix-600"
                  />
                  <span className="text-sm">Available for ordering</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="editMenuItemImage" className="text-right text-sm font-medium pt-2">
                Image
              </label>
              <div className="col-span-3">
                <Input
                  id="editMenuItemImage"
                  name="editMenuItemImage"
                  type="file"
                  accept="image/*"
                  onChange={handleMenuItemImageChange}
                  className="cursor-pointer"
                />
                {menuItemImagePreview ? (
                  <div className="mt-2">
                    <img
                      src={menuItemImagePreview}
                      alt="Menu Item Image Preview"
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </div>
                ) : currentItem && currentItem.image ? (
                  <div className="mt-2">
                    <img
                      src={currentItem.image}
                      alt="Current Menu Item Image"
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </div>
                ) : (
                  <div className="mt-2 border rounded-md w-full h-40 flex items-center justify-center bg-gray-50">
                    <Upload className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem} disabled={!formData.name || !formData.price}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Menu Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {currentItem && (
            <div className="flex items-center py-4">
              <div className="w-16 h-16 rounded overflow-hidden mr-4">
                <img
                  src={currentItem.image}
                  alt={currentItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{currentItem.name}</h3>
                <p className="text-sm text-gray-500">${currentItem.price.toFixed(2)}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMenu;
