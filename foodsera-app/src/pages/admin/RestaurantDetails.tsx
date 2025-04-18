
import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Store, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { Restaurant } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const RestaurantDetails: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminAPI.getAllRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setError('Failed to load restaurant data. Please try again later.');
        toast({
          title: "Error loading restaurants",
          description: "Failed to fetch restaurant data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleApproveRestaurant = async (id: string) => {
    setActionLoading(id);
    try {
      await adminAPI.approveRestaurant(id);
      toast({
        title: "Restaurant approved",
        description: "The restaurant has been approved successfully."
      });
      
      // Update local state
      setRestaurants(restaurants.map(rest => 
        rest._id === id ? { ...rest, isOpen: true } : rest
      ));
    } catch (error) {
      console.error('Error approving restaurant:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve restaurant",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendRestaurant = async (id: string) => {
    setActionLoading(id);
    try {
      await adminAPI.suspendRestaurant(id);
      toast({
        title: "Restaurant suspended",
        description: "The restaurant has been suspended successfully."
      });
      
      // Update local state
      setRestaurants(restaurants.map(rest => 
        rest._id === id ? { ...rest, isOpen: false } : rest
      ));
    } catch (error) {
      console.error('Error suspending restaurant:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to suspend restaurant",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Restaurant Details</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Restaurant Details</h1>

      {restaurants.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No restaurants found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Restaurant</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restaurants.map((restaurant) => (
              <TableRow key={restaurant._id}>
                <TableCell className="flex items-center gap-3">
                  {restaurant.logo ? (
                    <img src={restaurant.logo} alt={restaurant.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <Store className="h-5 w-5" />
                  )}
                  {restaurant.name}
                </TableCell>
                <TableCell>
                  <Badge variant={restaurant.isOpen ? 'default' : 'secondary'}>
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </Badge>
                </TableCell>
                <TableCell>{restaurant.rating.toFixed(1)} ⭐</TableCell>
                <TableCell>{restaurant.address}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {restaurant.isOpen ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSuspendRestaurant(restaurant._id)}
                        disabled={actionLoading === restaurant._id}
                      >
                        {actionLoading === restaurant._id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <X className="h-4 w-4 mr-1" />
                        )}
                        Suspend
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleApproveRestaurant(restaurant._id)}
                        disabled={actionLoading === restaurant._id}
                      >
                        {actionLoading === restaurant._id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Approve
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default RestaurantDetails;
