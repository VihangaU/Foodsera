import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Home, MapPin, CheckCircle, User, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DeliveryHome from './DeliveryHome';
import DeliveryProfile from './DeliveryProfile';
import DeliveryHistory from './DeliveryHistory';
import NotFound from '@/pages/NotFound';

const DeliveryDashboard: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-12 gap-0">
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-3 lg:col-span-2 bg-white border-r h-[calc(100vh-64px)] sticky top-16">
          <div className="p-4 border-b">
            <h2 className="font-bold">Delivery Dashboard</h2>
            <p className="text-sm text-gray-500">{user.name}</p>
          </div>

          <nav className="py-4">
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/delivery"
                  end
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm ${isActive
                      ? 'bg-foodix-50 text-foodix-600 font-medium border-r-2 border-foodix-600'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Home className="h-5 w-5 mr-3" />
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/delivery/history"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm ${isActive
                      ? 'bg-foodix-50 text-foodix-600 font-medium border-r-2 border-foodix-600'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <CheckCircle className="h-5 w-5 mr-3" />
                  Completed Deliveries
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/delivery/profile"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm ${isActive
                      ? 'bg-foodix-50 text-foodix-600 font-medium border-r-2 border-foodix-600'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <User className="h-5 w-5 mr-3" />
                  Profile
                </NavLink>
              </li>
              {/* <li>
                <NavLink
                  to="/delivery/settings"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm ${
                      isActive
                        ? 'bg-foodix-50 text-foodix-600 font-medium border-r-2 border-foodix-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Settings
                </NavLink>
              </li> */}
            </ul>
          </nav>
        </div>

        {/* Main content */}
        <div className="col-span-12 md:col-span-9 lg:col-span-10">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<DeliveryHome />} />
              <Route path="/history" element={<DeliveryHistory />} />
              <Route path="/profile" element={<DeliveryProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
