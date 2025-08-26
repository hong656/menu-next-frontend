"use client"

import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
} from "lucide-react";
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Define a type for the setting object
interface WebSetting {
  settingKey: string;
  settingValue: string;
}

export default function Header() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [logoUrl, setLogoUrl] = useState('/image/logo.png');
  const [themeColor, setThemeColor] = useState('#14b8a6'); // Fallback color

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // --- CHANGE #1: New useEffect to set the theme globally ---
  // This effect watches the themeColor state. When it changes,
  // it applies the color as a CSS variable to the entire <html> document.
  useEffect(() => {
    document.documentElement.style.setProperty('--main-theme', themeColor);
  }, [themeColor]);


  // This useEffect now handles all data fetching and state updates
  useEffect(() => {
    // Immediately check localStorage on mount to prevent color flash
    const savedTheme = localStorage.getItem('main_theme');
    if (savedTheme) {
      setThemeColor(savedTheme);
    }

    const fetchWebSettings = async () => {
      if (!apiUrl) {
        console.error("NEXT_PUBLIC_API_URL is not defined.");
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/api/public/web-settings`);
        const data: WebSetting[] = await response.json();

        const logoSetting = data.find(setting => setting.settingKey === 'logo');
        if (logoSetting) {
          const fullLogoUrl = `${apiUrl}${logoSetting.settingValue}`;
          setLogoUrl(fullLogoUrl);
        }

        const themeSetting = data.find(setting => setting.settingKey === 'main_theme');
        if (themeSetting) {
          localStorage.setItem('main_theme', themeSetting.settingValue);
          setThemeColor(themeSetting.settingValue); 
        }
      } catch (error) {
        console.error('Failed to fetch web settings:', error);
      }
    };

    fetchWebSettings();

    const savedCart = localStorage.getItem('restaurant-cart');
    if (savedCart) {
      setCartCount(JSON.parse(savedCart).count || 0);
    }

    // This function handles updates from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'restaurant-cart') {
        const savedCart = localStorage.getItem('restaurant-cart');
        setCartCount(savedCart ? JSON.parse(savedCart).count || 0 : 0);
      }
      if (event.key === 'main_theme') {
        const updatedTheme = localStorage.getItem('main_theme');
        if (updatedTheme) {
          setThemeColor(updatedTheme);
        }
      }
    };
    
    // This custom event handles updates within the same tab
    const handleCartUpdate = () => {
        const savedCart = localStorage.getItem('restaurant-cart');
        setCartCount(savedCart ? JSON.parse(savedCart).count || 0 : 0);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [apiUrl]);

  return (
    // --- CHANGE #2: Remove the style prop from here ---
    <header>
      <nav>
        <div className="mx-auto max-w-7xl px-2">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex flex-1 items-center justify-between sm:items-stretch">
              <div onClick={() => router.push('/screen')} className="cursor-pointer flex shrink-0 items-center">
                <img src={logoUrl} alt="Emily Restaurant" className="h-8 w-auto" />
              </div>
              <div className="flex items-center space-x-3">
                <span
                  // This class will now work perfectly
                  className="rounded-full duration-500 cursor-pointer bg-[var(--main-theme)]/20 hover:bg-[var(--main-theme)]/60 inline-flex items-center justify-center text-sm font-medium text-[var(--main-theme)] ring-1 ring-[var(--main-theme)]/20 ring-inset w-24 px-2 h-10 hover:text-white "
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