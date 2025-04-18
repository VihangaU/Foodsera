import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  openCart: () => void;
  itemCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ openCart, itemCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="foodix-container py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foodix-600">
              Foodix
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-foodix-500 transition-colors">
              Home
            </Link>
            <Link to="/restaurants" className="text-gray-700 hover:text-foodix-500 transition-colors">
              Restaurants
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 hover:text-foodix-500 transition-colors">
                Categories <ChevronDown size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link to="/category/pizza" className="w-full">Pizza</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/category/burger" className="w-full">Burgers</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/category/sushi" className="w-full">Sushi</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/category/salad" className="w-full">Salads</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/categories" className="w-full">View All</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/about" className="text-gray-700 hover:text-foodix-500 transition-colors">
              About
            </Link>
          </div>

          {/* Right side - cart, account */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative" 
              onClick={openCart}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-foodix-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-1">
                    <Avatar>
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      ) : (
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs text-gray-500">{user.role}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {user.role === 'customer' && (
                    <>
                      <DropdownMenuItem>
                        <Link to="/profile" className="w-full">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/my-orders" className="w-full">My Orders</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {user.role === 'restaurant' && (
                    <DropdownMenuItem>
                      <Link to="/admin" className="w-full">Restaurant Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  
                  {user.role === 'main_admin' && (
                    <DropdownMenuItem>
                      <Link to="/main-admin" className="w-full">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {user.role === 'driver' && (
                    <DropdownMenuItem>
                      <Link to="/delivery" className="w-full">Delivery Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <User className="mr-2 h-4 w-4" /> Sign In
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t mt-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700" onClick={toggleMenu}>
                Home
              </Link>
              <Link to="/restaurants" className="text-gray-700" onClick={toggleMenu}>
                Restaurants
              </Link>
              <Link to="/categories" className="text-gray-700" onClick={toggleMenu}>
                Categories
              </Link>
              <Link to="/about" className="text-gray-700" onClick={toggleMenu}>
                About
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="text-gray-700" onClick={toggleMenu}>
                  Sign In
                </Link>
              )}
              {isAuthenticated && user?.role === 'customer' && (
                <Link to="/my-orders" className="text-gray-700" onClick={toggleMenu}>
                  My Orders
                </Link>
              )}
              {isAuthenticated && user?.role === 'restaurant' && (
                <Link to="/admin" className="text-gray-700" onClick={toggleMenu}>
                  Restaurant Dashboard
                </Link>
              )}
              {isAuthenticated && user?.role === 'main_admin' && (
                <Link to="/main-admin" className="text-gray-700" onClick={toggleMenu}>
                  <div className="flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </div>
                </Link>
              )}
              {isAuthenticated && user?.role === 'driver' && (
                <Link to="/delivery" className="text-gray-700" onClick={toggleMenu}>
                  Delivery Dashboard
                </Link>
              )}
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  className="flex items-center justify-start px-0 hover:bg-transparent"
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
