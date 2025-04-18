import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Cart, MenuItem, UserRole } from "./lib/types";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import CartDrawer from "./components/cart/CartDrawer";
import Index from "./pages/Index";
import RestaurantPage from "./pages/RestaurantPage";
import CheckoutPage from "./pages/CheckoutPage";
import NotFound from "./pages/NotFound";
import RestaurantsPage from "./pages/RestaurantsPage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import MainAdminDashboard from "./pages/admin/MainAdminDashboard";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MyOrdersPage from "./pages/MyOrdersPage";

const queryClient = new QueryClient();

const App = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<Cart>({ items: [], restaurantId: null });

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (restaurantId: string, menuItem: MenuItem) => {
    setCart(currentCart => {
      const existingItem = currentCart.items.find(item => item.menuItemId === menuItem._id);
      
      if (existingItem) {
        return {
          ...currentCart,
          items: currentCart.items.map(item => 
            item.menuItemId === menuItem._id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          )
        };
      } else {
        return {
          ...currentCart,
          restaurantId,
          items: [
            ...currentCart.items,
            {
              _id: uuidv4(),
              menuItemId: menuItem._id,
              menuItem,
              quantity: 1,
              restaurantId
            }
          ]
        };
      }
    });
    
    openCart();
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart(currentCart => ({
      ...currentCart,
      items: currentCart.items.map(item => 
        item._id === id ? { ...item, quantity } : item
      )
    }));
  };

  const removeItem = (id: string) => {
    setCart(currentCart => {
      const newItems = currentCart.items.filter(item => item._id !== id);
      return {
        ...currentCart,
        items: newItems
      };
    });
  };

  const clearCart = () => {
    setCart({ items: [], restaurantId: null });
  };

  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Navbar openCart={openCart} itemCount={itemCount} />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/restaurants" element={<RestaurantsPage addToCart={addToCart} />} />
                  <Route path="/restaurant/:id" element={<RestaurantPage addToCart={addToCart} />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/category/:id" element={<CategoryDetailPage addToCart={addToCart} />} />
                  <Route path="/checkout" element={<CheckoutPage cart={cart} clearCart={clearCart} />} />
                  <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
                  <Route path="/my-orders" element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <MyOrdersPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/*" element={
                    <ProtectedRoute allowedRoles={['restaurant']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/delivery/*" element={
                    <ProtectedRoute allowedRoles={['delivery']}>
                      <DeliveryDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/main-admin/*" element={
                    <ProtectedRoute allowedRoles={['main_admin']}>
                      <MainAdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              
              <CartDrawer 
                isOpen={isCartOpen} 
                onClose={closeCart} 
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
              />
            </div>
            
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
