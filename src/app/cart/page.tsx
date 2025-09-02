"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/ui/header";
import { ArrowLeft, Plus, Minus, Send, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import StatusDialog from "@/components/ui/status-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Header');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [remark, setRemark] = useState(""); // State for the remark/notes
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // Loading state
  const [orderError, setOrderError] = useState<string | null>(null); // Error state
  const [isOrderPlacedDialogOpen, setIsOrderPlacedDialogOpen] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('restaurant-cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart.items || []);
      calculateTotal(parsedCart.items || []);
    }

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
    updateCartInStorage(updatedItems);
  };

  const removeItem = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    updateCartInStorage(updatedItems);
  };

  const clearCart = () => {
    updateCartInStorage([]);
  };

  const updateCartInStorage = (items: CartItem[]) => {
    setCartItems(items);
    calculateTotal(items);
    const newCount = items.reduce((sum, item) => sum + item.quantity, 0);
    localStorage.setItem('restaurant-cart', JSON.stringify({ items, count: newCount }));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setOrderError(null);

    const qrToken = localStorage.getItem('tableToken');
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!qrToken) {
      setOrderError("Table information not found. Please scan a QR code again.");
      setIsPlacingOrder(false);
      return;
    }
    
    if (!API_URL) {
        setOrderError("API URL is not configured.");
        setIsPlacingOrder(false);
        return;
    }

    const orderItems = cartItems.map(item => ({
      menuItemId: parseInt(item.id, 10),
      quantity: item.quantity,
    }));

    const orderData = {
      qrToken,
      remark,
      items: orderItems,
    };

    try {
      const response = await fetch(`${API_URL}/api/public/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to place order. Status: ${response.status}`);
      }

      console.log('Order placed successfully!');
      
      updateCartInStorage([]);
      setRemark("");
      localStorage.removeItem('restaurant-cart'); // Also remove explicitly
      window.dispatchEvent(new Event('cartUpdated'));
      
      setIsOrderPlacedDialogOpen(true);

    } catch (error: any) {
      console.error('Error placing order:', error);
      setOrderError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleDialogOkay = () => {
    setIsOrderPlacedDialogOpen(false);
    router.push('/screen');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center mb-6  justify-between">
          <div className="flex">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-3">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{t('cart')}</h1>
          </div>

          {cartItems.length > 0 && (
            <Button
              variant="ghost"
              onClick={clearCart}
              className="text-sm text-white bg-red-600/80 cursor-pointer hover:text-white hover:bg-red-800 flex items-center px-3 duration-300"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All</span>
            </Button>
          )}
        </div>

        <div className="space-y-4 mb-8">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <Button 
                onClick={() => router.push('/screen')}
                className="mt-4 bg-[var(--main-theme)] hover:bg-[var(--main-theme)]/90 text-white"
              >
                Browse Menu
              </Button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4">
                  {/* Item Image - FIXED */}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                    <p className="text-teal-600 font-medium">${item.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="hover:bg-gray-900 cursor-pointer w-8 h-8 rounded-l-3xl bg-gray-900/30 border-gray-200"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="!h-5 !w-5 text-white" />
                    </Button>
                    <div className="w-12 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center">
                      <span className="font-semibold text-gray-900">{item.quantity}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      className="hover:bg-gray-800 cursor-pointer w-8 h-8 rounded-r-3xl bg-gray-900/30 border-gray-200"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="!h-5 !w-5 text-white"/>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <>
            {/* NEW: Remark Section */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <label htmlFor="remark" className="text-md font-semibold text-gray-900 mb-2 block">
                Notes or Remarks
              </label>
              <Textarea
                id="remark"
                placeholder="e.g., allergies, special requests..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="bg-gray-50"
              />
            </div>
          
            {/* Total Cost Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Cost</span>
                <span className="text-2xl font-bold text-teal-600">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Display API Error if it exists */}
            {orderError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{orderError}</span>
              </div>
            )}

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-4 rounded-xl text-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <Send className="h-5 w-5" />
                </>
              )}
            </Button>
          </>
        )}
      </div>

      <StatusDialog
        open={isOrderPlacedDialogOpen}
        onOpenChange={setIsOrderPlacedDialogOpen}
        title="Order placed"
        description="Your order has been sent to the kitchen!"
        icon="orderPlaced"
        onPrimaryAction={handleDialogOkay}
        primaryActionText="Okay"
      />
    </div>
  );
}