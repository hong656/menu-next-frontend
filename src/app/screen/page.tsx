"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/ui/header";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import StatusDialog from '@/components/ui/status-dialog'; // Kept for the "View Cart" popup
import {
  Search,
  Soup,
  Plus,
  ShoppingCart,
  GlassWater,
  Leaf,
  Spline,
  Minus,
  CirclePlus,
} from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useLocale, useTranslations } from 'next-intl';

interface ApiMenuTypeTranslation {
  languageCode: string;
  name: string;
}

interface ApiMenuItemTranslation {
  languageCode: string;
  name: string;
  description: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface ApiMenuItem {
    id: number;
    menuType: { id: number; name: string; };
    priceCents: number;
    imageUrl: string;
    status: number;
    translations: ApiMenuItemTranslation[];
}

interface ApiMenuType {
    id: number;
    status: number;
    translations: ApiMenuTypeTranslation[];
}


interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image: string;
}

interface Banner {
  id: number;
  bannerImage: string;
  title: string;
}

const MenuItemCard: React.FC<{
  item: MenuItem;
  quantity: number;
  onAddToCart: (item: MenuItem, quantity: number) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
}> = ({ item, quantity, onAddToCart, onUpdateQuantity }) => {

  return (
    <div className="border shadow-lg flex items-center space-x-4 p-2 rounded-lg transition-colors hover:bg-gray-100">
      <div className="w-20 h-20 bg-gray-300 rounded-lg flex-shrink-0 overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-lg">{item.name}</h3>
        <p className="text-sm text-gray-500">{item.description}</p>
      </div>

      <div className="flex flex-col items-center justify-between space-y-2" style={{ minHeight: '5.5rem' }}>
        <p className="font-semibold text-md w-20 text-center">${item.price.toFixed(2)}</p>
        
        {quantity === 0 ? (
          <Button
            size="icon"
            className="cursor-pointer bg-[var(--main-theme)] hover:bg-[var(--main-theme)]/90 text-white rounded-full w-10 h-10 flex items-center justify-center z-10"
            onClick={() => onAddToCart(item, 1)}
          >
            <CirclePlus className="!w-6 !h-6" />
          </Button>
        ) : (
          <div className="flex items-center justify-center space-x-1">
            <Button
              size="icon"
              className="cursor-pointer rounded-l-full w-9 h-9 bg-gray-900/30 text-white"
              onClick={() => onUpdateQuantity(item.id, quantity - 1)}
            >
              <Minus className="!h-5 !w-5" />
            </Button>
            <span className="flex items-center justify-center w-8 h-9 font-bold text-gray-700 text-md">
              {quantity}
            </span>
            <Button
              size="icon"
              className="cursor-pointer rounded-r-full w-9 h-9 bg-gray-900/30 text-white"
              onClick={() => onUpdateQuantity(item.id, quantity + 1)}
            >
              <Plus className="!h-5 !w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const FloatingCartButton: React.FC<{
  count: number; 
  total: number;
}> = ({ count, total }) => {
  const router = useRouter();
  const t = useTranslations('Header');
  return (
    <div className="fixed bottom-8 right-8 z-20">
      <Button 
        className="bg-[var(--main-theme)] hover:bg-[var(--main-theme)]/90 cursor-pointer text-white rounded-2xl h-20 w-20 shadow-lg flex items-center justify-center relative"
        onClick={() => router.push('/cart')}
      >
        <div className="flex flex-col items-center">
          <ShoppingCart className="!w-7 !h-7"/>
          <span className="text-sm font-medium mt-1">{t('cart')}</span>
          {total > 0 && (
            <span className="text-xs font-bold">${total.toFixed(2)}</span>
          )}
        </div>
        {count > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 flex items-center justify-center rounded-full w-6 h-6 text-xs font-bold border-2 border-white"
          >
            {count}
          </Badge>
        )}
      </Button>
    </div>
  );
};

const TableTokenHandler: React.FC = () => {
  const searchParams = useSearchParams();
  useEffect(() => {
    const tableToken = searchParams.get('t');
    if (tableToken) {
      localStorage.setItem('tableToken', tableToken);
    }
  }, [searchParams]);
  return null;
};

const formatApiMenuItems = (items: ApiMenuItem[], locale: string, apiUrl: string): MenuItem[] => {
    return items.map(item => {
        let translation = item.translations.find(t => t.languageCode === locale);

        if (!translation) {
            translation = item.translations.find(t => t.languageCode === 'en');
        }

        if (!translation) {
            translation = item.translations[0] || { name: 'Name not available', description: '' };
        }

        return {
            id: item.id.toString(),
            name: translation.name,
            description: translation.description,
            price: item.priceCents / 100,
            category: item.menuType?.name || "Uncategorized", 
            image: `${apiUrl}${item.imageUrl}`, 
        };
    });
};

export function MenuScreen() {
    const locale = useLocale();
    const t = useTranslations('Header');
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const savedCart = localStorage.getItem('restaurant-cart');
            return savedCart ? JSON.parse(savedCart).items || [] : [];
        } catch (error) { console.error("Failed to parse cart from localStorage", error); return []; }
    });

    useEffect(() => {
        const fetchCategories = async () => {
          const API_URL = process.env.NEXT_PUBLIC_API_URL;
          if (!API_URL) return;
          try {
              const menuTypesResponse = await fetch(`${API_URL}/api/public/menu-types`);
              if (!menuTypesResponse.ok) throw new Error(`Failed to fetch menu types`);
              
              const menuTypesData: ApiMenuType[] = await menuTypesResponse.json();

              const categoryIconMap: { [key: string]: React.ElementType } = {
                  "Hot pot": Soup, "Size Dish": Spline, "Drink": GlassWater, "Vegetarian": Leaf,
              };

              const dynamicCategories = [
                { id: null, name: "All", icon: null },
                ...menuTypesData
                  .filter(type => type.status === 1)
                  .map(type => {
                    let translation = type.translations.find(t => t.languageCode === locale);
                    if (!translation) {
                        translation = type.translations.find(t => t.languageCode === 'en');
                    }
                    
                    const displayName = translation ? translation.name : `Category #${type.id}`;

                    const englishName = type.translations.find(t => t.languageCode === 'en')?.name || "";

                    return { 
                      id: type.id,
                      name: displayName,
                      icon: categoryIconMap[englishName] || null
                    };
                  })
              ];
              setCategories(dynamicCategories);
          } catch (err: any) { 
              setError(err.message); 
          }
        };
        fetchCategories();
    }, [locale]);

    useEffect(() => {
      const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      localStorage.setItem('restaurant-cart', JSON.stringify({ items: cartItems, count: cartCount }));
      window.dispatchEvent(new Event('cartUpdated'));
    }, [cartItems]);

    useEffect(() => {
      const timerId = setTimeout(() => { setDebouncedSearchQuery(searchQuery); }, 500);
      return () => { clearTimeout(timerId); };
    }, [searchQuery]);

    useEffect(() => {
      const fetchFilteredMenuItems = async () => {
          const API_URL = process.env.NEXT_PUBLIC_API_URL;
          if (!API_URL) {
              setError("API URL is not configured.");
              return;
          }

          setLoading(true);
          const params = new URLSearchParams();
          if (debouncedSearchQuery) {
              params.append('search', debouncedSearchQuery);
          }
          if (activeCategoryId !== null) {
              params.append('menuTypeId', activeCategoryId.toString());
          }

          const requestUrl = `${API_URL}/api/public/menu-items?${params.toString()}`;
          
          try {
              const response = await fetch(requestUrl);
              if (!response.ok) throw new Error(`Failed to fetch menu items: ${response.statusText}`);
              
              const data: ApiMenuItem[] = await response.json();
              
              // Use our helper to process translations based on the current locale
              const formattedItems = formatApiMenuItems(data, locale, API_URL);
              setMenuItems(formattedItems);

          } catch (err: any) {
              setError(err.message);
          } finally {
              setLoading(false);
          }
      };

      fetchFilteredMenuItems();
    }, [debouncedSearchQuery, activeCategoryId, locale]);

    const removeFromCart = (itemId: string) => {
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
      }
      
      setCartItems(prevItems => 
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity } : item
        )
      );
    };

    const handleAddToCart = (item: MenuItem, quantity: number) => {
        setCartItems(prevItems => {
          const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
          if (existingItem) {
            // This case is now handled by updateQuantity, but kept as a fallback
            return prevItems.map(cartItem =>
              cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + quantity, totalPrice: (cartItem.quantity + quantity) * cartItem.price } : cartItem
            );
          } else {
            return [...prevItems, { id: item.id, name: item.name, price: item.price, quantity: quantity, totalPrice: item.price * quantity, image: item.image }];
          }
        });
    };

    const getCartTotal = () => {
      return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    };
    
    const filteredMenuItems = menuItems.filter(item => {
      const categoryMatch = activeCategory === "All" || item.category === activeCategory;
      if (!debouncedSearchQuery) return categoryMatch;
      const searchMatch = item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || item.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div className="relative bg-gray-50 font-sans w-full max-w-md mx-auto border-2 border-gray-200 rounded-3xl shadow-2xl mt-4 md:max-w-2xl lg:max-w-4xl xl:max-w-7xl">
          <main className="px-4 pb-28">
              <div className="sticky top-0 z-20 bg-gray-50 pt-4 pb-2">
                <div className="relative mb-2">
                  <Input
                    placeholder={t('search')}
                    className="h-11 bg-white border-gray-300 rounded-3xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar">
                  {categories.map(({ id, name, icon: Icon }) => (
                    <Button
                      key={name}
                      variant={activeCategoryId === id ? "default" : "outline"}
                      onClick={() => {
                        setActiveCategory(name);
                        setActiveCategoryId(id);
                      }}
                      className={`cursor-pointer flex-shrink-0 h-11 rounded-full px-5 space-x-2 transition-all duration-200 ${activeCategory === name ? "bg-[var(--main-theme)] text-white hover:brightness-90" : "bg-gray-300 border-gray-200 text-black hover:bg-[var(--main-theme)]/40"}`}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      <span className="font-semibold">{name}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <section className="mt-4">
                  {loading && <p>Loading menu...</p>}
                  {error && <p className="text-red-500">Error: {error}</p>}
                  {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4">
                      {menuItems.map((item) => {
                        const cartItem = cartItems.find(ci => ci.id === item.id);
                        const quantityInCart = cartItem ? cartItem.quantity : 0;
                        return (
                            <MenuItemCard
                                key={item.id}
                                item={item}
                                quantity={quantityInCart}
                                onAddToCart={handleAddToCart}
                                onUpdateQuantity={updateQuantity}
                            />
                        );
                      })}
                    </div>
                  )}
              </section>
          </main>
          <FloatingCartButton 
            count={cartCount}
            total={getCartTotal()}
          />
      </div>
    );
}

export default function Screen() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [errorBanners, setErrorBanners] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!API_URL) {
      setErrorBanners("API URL is not configured.");
      setLoadingBanners(false);
      return;
    }

    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_URL}/api/public/banners`);
        if (!response.ok) {
          throw new Error(`Failed to fetch banners: ${response.statusText}`);
        }
        const data: Banner[] = await response.json();
        setBanners(data);
      } catch (err: any) {
        setErrorBanners(err.message);
        console.error(err);
      } finally {
        setLoadingBanners(false);
      }
    };

    fetchBanners();
  }, [API_URL]);

  return (
    <div className=" w-full flex flex-col min-h-screen bg-white overflow-hidden">
      <React.Suspense fallback={<div>Loading...</div>}>
        <Header />
        <TableTokenHandler />
      </React.Suspense>

      <div className=" w-full max-w-md mx-auto px-2 md:max-w-2xl lg:max-w-4xl xl:max-w-7xl">
        <Carousel 
          plugins={[Autoplay({ delay: 3000 })]}
          opts={{ loop: true }}
        >
          <CarouselContent>
            {loadingBanners && (
              <CarouselItem>
                <Card className="p-0 border-0">
                  <CardContent className="p-0 h-52 md:h-96 flex items-center justify-center">
                    <p>Loading banners...</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            )}
            {errorBanners && (
              <CarouselItem>
                <Card className="p-0 border-0">
                  <CardContent className="p-0 h-52 md:h-96 flex items-center justify-center">
                    <p className="text-red-500">Error: {errorBanners}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            )}
            {!loadingBanners && !errorBanners && banners.map((banner) => (
              <CarouselItem key={banner.id}>
                <Card className="p-0 border-0 rounded-xl overflow-hidden">
                  <CardContent className="p-0 h-52 md:h-96 flex items-center justify-center">
                    <img
                      src={`${API_URL}${banner.bannerImage}`}
                      alt={banner.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="flex justify-center pb-8">
          <MenuScreen />
        </div>
      </div>
    </div>
  );
}