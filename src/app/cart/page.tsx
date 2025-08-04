"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/ui/header";
import { ArrowLeft, Plus, Minus, Send } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('restaurant-cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart.items || []);
      calculateTotal(parsedCart.items || []);
    }

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      const savedCart = localStorage.getItem('restaurant-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart.items || []);
        calculateTotal(parsedCart.items || []);
      } else {
        setCartItems([]);
        setTotal(0);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  const calculateTotal = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
    setTotal(total);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === itemId
        ? { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity }
        : item
    );

    setCartItems(updatedItems);
    calculateTotal(updatedItems);
    
    // Update localStorage
    const newCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    localStorage.setItem('restaurant-cart', JSON.stringify({
      items: updatedItems,
      count: newCount
    }));
    
    // Dispatch custom event to notify other components about cart update
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
    
    // Update localStorage
    const newCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    localStorage.setItem('restaurant-cart', JSON.stringify({
      items: updatedItems,
      count: newCount
    }));
    
    // Dispatch custom event to notify other components about cart update
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handlePlaceOrder = () => {
    // Here you would typically send the order to your backend
    console.log('Placing order:', { items: cartItems, total });
    alert('Order placed! Cart will be cleared.'); // Debug alert
    
    // Clear cart after order
    setCartItems([]);
    setTotal(0);
    localStorage.removeItem('restaurant-cart');
    
    // Dispatch custom event to notify other components about cart update
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Redirect to confirmation or menu page
    router.push('/screen');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Back Button and Title */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Cart</h1>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <Button 
                onClick={() => router.push('/screen')}
                className="mt-4 bg-teal-500 hover:bg-teal-600 text-white"
              >
                Browse Menu
              </Button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4">
                  {/* Item Image */}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">IMG</span>
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                    <p className="text-teal-600 font-medium">${item.price.toFixed(2)}</p>
                  </div>
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-8 h-8 rounded-full bg-gray-100 border-gray-200 hover:bg-gray-200"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <div className="w-12 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center">
                      <span className="font-semibold text-gray-900">{item.quantity}</span>
                    </div>
                    
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-8 h-8 rounded-full bg-gray-100 border-gray-200 hover:bg-gray-200"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total Cost Section */}
        {cartItems.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Cost</span>
              <span className="text-2xl font-bold text-teal-600">${total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Place Order Button */}
        {cartItems.length > 0 && (
          <Button
            onClick={handlePlaceOrder}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-4 rounded-xl text-lg font-semibold flex items-center justify-center space-x-2"
          >
            <span>Place Order</span>
            <Send className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
} 