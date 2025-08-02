"use client"

import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
} from "lucide-react";
import { useSearchParams } from 'next/navigation'; 
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  // 2. Get the search params object
  const searchParams = useSearchParams();
  
  // 3. Get the specific 'table' parameter from the URL
  const tableNumber = searchParams.get('table');
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  // Load cart count from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('restaurant-cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartCount(parsedCart.count || 0);
    }

    // Listen for storage changes to update cart count in real-time
    const handleStorageChange = () => {
      const savedCart = localStorage.getItem('restaurant-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartCount(parsedCart.count || 0);
      } else {
        setCartCount(0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-tab updates
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  return (
    <header>
      <nav>
        <div className="mx-auto max-w-7xl px-2">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex flex-1 items-center justify-between sm:items-stretch">
              <div onClick={() => router.push('/screen')} className="cursor-pointer flex shrink-0 items-center">
                <img src="/image/logo.png" alt="Emily Restaurant" className="h-8 w-auto" />
              </div>
              <div className="flex items-center space-x-3">
                <div className="inline-flex flex-col items-center justify-center rounded-md bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  <p className="leading-tight">Table</p>
                  <p className="font-bold leading-tight">#{tableNumber || '--'}</p>
                </div>
                <span 
                  className="rounded-full cursor-pointer hover:bg-teal-500 bg-teal-500/20 inline-flex items-center justify-center text-sm font-medium text-green-700 ring-1 ring-green-600/20 ring-inset w-24 px-2 h-10"
                  onClick={() => router.push('/cart')}
                >
                  <ShoppingCart className="h-4 w-4 mr-1.5" />
                  Cart
                  {cartCount > 0 && (
                    <Badge className="ml-1 h-5 min-w-5 rounded-full px-1 font-mono tabular-nums flex items-center justify-center" variant="destructive">
                      {cartCount}
                    </Badge>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}