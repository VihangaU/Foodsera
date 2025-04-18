
import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { MultiSelect } from '../../components/ui/multi-select';
import { getAllCategories, createRestaurant } from '../../api/restaurantService';

const RestaurantForm = ({ onSuccess }) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deliveryFee: '',
    deliveryTime: '',
    address: '',
    categories: [],
  });
  const [logoFile, setLogoFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        if (data && data.length > 0) {
          const formattedCategories = data.map(category => ({
            value: category._id,
            label: category.name
          }));
          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load categories. Please try again.",
        });
      }
    };

    fetchCategories();
  }, [toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCategoriesChange = (selectedOptions) => {
    setFormData({
      ...formData,
      categories: selectedOptions.map(option => option.value)
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!logoFile || !imageFile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Logo and restaurant image are required.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create FormData object to handle file uploads
      const submitFormData = new FormData();
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (key === 'categories' && formData[key].length > 0) {
          // Convert categories array to comma-separated string
          submitFormData.append('categories', formData[key].join(','));
        } else {
          submitFormData.append(key, formData[key]);
        }
      });
      
      // Add files - ensure we're adding the actual File objects
      submitFormData.append('logo', logoFile);
      submitFormData.append('image', imageFile);
      
      console.log('Submitting restaurant data...');
      // Debug FormData contents
      for (let [key, value] of submitFormData.entries()) {
        console.log(`${key}: ${value instanceof File ? `File: ${value.name}` : value}`);
      }
      
      await createRestaurant(submitFormData);
      
      toast({
        title: "Success",
        description: "Restaurant created successfully!",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        deliveryFee: '',
        deliveryTime: '',
        address: '',
        categories: [],
      });
      setLogoFile(null);
      setImageFile(null);
      setLogoPreview('');
      setImagePreview('');
      
    } catch (error) {
      console.error('Failed to create restaurant:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create restaurant. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create Restaurant</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Delivery Fee ($)</Label>
              <Input
                id="deliveryFee"
                name="deliveryFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.deliveryFee}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deliveryTime">Delivery Time (minutes)</Label>
              <Input
                id="deliveryTime"
                name="deliveryTime"
                type="number"
                min="1"
                value={formData.deliveryTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="categories">Categories</Label>
            <MultiSelect
              options={categories}
              selected={formData.categories.map(catId => {
                const matchingCat = categories.find(cat => cat.value === catId);
                return matchingCat ? matchingCat : { value: catId, label: 'Unknown' };
              })}
              onChange={handleCategoriesChange}
              placeholder="Select categories"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Restaurant Logo</Label>
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Restaurant Image</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
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
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Restaurant'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RestaurantForm;
