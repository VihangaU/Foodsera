
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, DollarSign, Settings, Users, LayoutDashboard, MenuSquare } from 'lucide-react';
import AdminHome from './AdminHome';
import AdminOrders from './AdminOrders';
import AdminMenu from './AdminMenu';
import AdminPayments from './AdminPayments';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="bg-gray-900 text-white p-4 hidden md:block">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          <p className="text-sm text-gray-400">Restaurant Manager</p>
        </div>

        <nav className="space-y-1">
          {/* <Link 
            to="/admin" 
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              pathname === "/admin" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </Link> */}

          <Link
            to="/admin/menu"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${pathname.includes("/admin/menu") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
          >
            <MenuSquare className="h-5 w-5 mr-3" />
            Menu
          </Link>

          <Link
            to="/admin/orders"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${pathname.includes("/admin/orders") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
          >
            <ShoppingBag className="h-5 w-5 mr-3" />
            Orders
          </Link>
          {/*           
          <Link 
            to="/admin/payments" 
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              pathname.includes("/admin/payments") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <DollarSign className="h-5 w-5 mr-3" />
            Payments
          </Link> */}

          {/* <Link 
            to="#" 
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              pathname.includes("/admin/customers") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Users className="h-5 w-5 mr-3" />
            Customers
          </Link> */}

          {/* <Link 
            to="#" 
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              pathname.includes("/admin/settings") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link> */}
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <div className="bg-gray-900 text-white p-4 flex md:hidden overflow-x-auto">
        <nav className="flex space-x-1">
          <Link
            to="/admin"
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${pathname === "/admin" ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
          >
            <LayoutDashboard className="h-5 w-5 mb-1" />
            <span className="text-xs">Dashboard</span>
          </Link>

          <Link
            to="/admin/orders"
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${pathname.includes("/admin/orders") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
          >
            <ShoppingBag className="h-5 w-5 mb-1" />
            <span className="text-xs">Orders</span>
          </Link>

          <Link
            to="/admin/menu"
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${pathname.includes("/admin/menu") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
          >
            <MenuSquare className="h-5 w-5 mb-1" />
            <span className="text-xs">Menu</span>
          </Link>

          <Link
            to="/admin/payments"
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${pathname.includes("/admin/payments") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
          >
            <DollarSign className="h-5 w-5 mb-1" />
            <span className="text-xs">Payments</span>
          </Link>

          <Link
            to="#"
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${pathname.includes("/admin/customers") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
          >
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs">Customers</span>
          </Link>

          <Link
            to="#"
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${pathname.includes("/admin/settings") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
          >
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-xs">Settings</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="p-6 bg-gray-50">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/menu" element={<AdminMenu />} />
          <Route path="/payments" element={<AdminPayments />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
