
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, Store, Truck, Settings, LayoutDashboard } from 'lucide-react';
import MainAdminHome from './MainAdminHome';
import ManageCategories from './ManageCategories';
import CustomerDetails from './CustomerDetails';
import RestaurantDetails from './RestaurantDetails';
import DriverDetails from './DriverDetails';

const MainAdminDashboard: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="bg-gray-900 text-white p-4 hidden md:block">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Main Admin Dashboard</h2>
          <p className="text-sm text-gray-400">System Administrator</p>
        </div>
        
        <nav className="space-y-1">
          <Link 
            to="/main-admin" 
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              pathname === "/main-admin" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          
          <Link 
            to="/main-admin/categories" 
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              pathname.includes("/categories") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            Manage Categories
          </Link>
          
          <Link 
            to="/main-admin/customers" 
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              pathname.includes("/customers") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Users className="h-5 w-5 mr-3" />
            Customer Details
          </Link>
          
          <Link 
            to="/main-admin/restaurants" 
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              pathname.includes("/restaurants") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Store className="h-5 w-5 mr-3" />
            Restaurant Details
          </Link>
          
          <Link 
            to="/main-admin/drivers" 
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              pathname.includes("/drivers") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Truck className="h-5 w-5 mr-3" />
            Driver Details
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="p-6 bg-gray-50">
        <Routes>
          <Route path="/" element={<MainAdminHome />} />
          <Route path="/categories" element={<ManageCategories />} />
          <Route path="/customers" element={<CustomerDetails />} />
          <Route path="/restaurants" element={<RestaurantDetails />} />
          <Route path="/drivers" element={<DriverDetails />} />
        </Routes>
      </div>
    </div>
  );
};

export default MainAdminDashboard;
