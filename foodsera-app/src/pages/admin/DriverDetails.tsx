
import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { adminAPI } from '@/lib/api';
import { User } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { Loader2, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const DriverDetails: React.FC = () => {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      setError(null);
      try {
        const allDrivers = await adminAPI.getAllDrivers();
        setDrivers(allDrivers);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        setError('Failed to load driver data. Please try again later.');
        toast({
          title: "Error loading drivers",
          description: "Failed to fetch driver data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'busy':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleApproveDriver = async (id: string) => {
    setActionLoading(id);
    try {
      await adminAPI.approveDriver(id);
      toast({
        title: "Driver approved",
        description: "The driver has been approved successfully."
      });
      
      // Update local state
      setDrivers(drivers.map(driver => 
        driver._id === id ? { ...driver, driverStatus: 'available' } : driver
      ));
    } catch (error) {
      console.error('Error approving driver:', error);
      toast({
        title: "Error",
        description: "Failed to approve driver",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendDriver = async (id: string) => {
    setActionLoading(id);
    try {
      await adminAPI.suspendDriver(id);
      toast({
        title: "Driver suspended",
        description: "The driver has been suspended successfully."
      });
      
      // Update local state
      setDrivers(drivers.map(driver => 
        driver._id === id ? { ...driver, driverStatus: 'offline' } : driver
      ));
    } catch (error) {
      console.error('Error suspending driver:', error);
      toast({
        title: "Error",
        description: "Failed to suspend driver",
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
        <h1 className="text-2xl font-bold">Driver Details</h1>
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
      <h1 className="text-2xl font-bold">Driver Details</h1>

      {drivers.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No drivers found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver._id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar>
                    {driver.avatar ? (
                      <AvatarImage src={driver.avatar} alt={driver.name} />
                    ) : (
                      <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  {driver.name}
                </TableCell>
                <TableCell>{driver.email}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(driver.driverStatus)}>
                    {driver.driverStatus || 'offline'}
                  </Badge>
                </TableCell>
                <TableCell>{driver.phone || driver.phoneNumber || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {driver.driverStatus !== 'offline' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSuspendDriver(driver._id)}
                        disabled={actionLoading === driver._id}
                      >
                        {actionLoading === driver._id ? (
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
                        onClick={() => handleApproveDriver(driver._id)}
                        disabled={actionLoading === driver._id}
                      >
                        {actionLoading === driver._id ? (
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

export default DriverDetails;
