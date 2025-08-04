"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';

// --- SHADCN & LUCIDE IMPORTS ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/ui/header";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Drawer, DrawerContent, DrawerFooter, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
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


// --- TYPES & MOCK DATA ---

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string; // Added image property
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

const menuItems: MenuItem[] = [
  { id: "1", name: "Pasta", description: "Italian classic", price: 8.50, category: "Hot pot", image: "/image/placeholder.svg" },
  { id: "2", name: "Sushi", description: "Japanese delicacy", price: 12.00, category: "Size Dish", image: "/image/placeholder.svg" },
  { id: "3", name: "Burger", description: "American favorite", price: 10.00, category: "Hot pot", image: "/image/placeholder.svg" },
  { id: "4", name: "Tacos", description: "Mexican street food", price: 3.50, category: "Size Dish", image: "/image/placeholder.svg" },
  { id: "5", name: "Curry", description: "Spicy Indian dish", price: 9.00, category: "Hot pot", image: "/image/placeholder.svg" },
  { id: "6", name: "Ramen", description: "Hearty noodle soup", price: 11.50, category: "Hot pot", image: "/image/placeholder.svg" },
  { id: "7", name: "Salad", description: "Fresh and healthy", price: 7.00, category: "Vegetarian", image: "/image/placeholder.svg" },
  { id: "8", name: "Coke", description: "Classic soft drink", price: 2.50, category: "Drink", image: "/image/placeholder.svg" },
];

const categories = [
  { name: "All", icon: null },
  { name: "Hot pot", icon: Soup },
  { name: "Size Dish", icon: Spline },
  { name: "Drink", icon: GlassWater },
  { name: "Vegetarian", icon: Leaf },
];

const carouselImages = [
  { src: "/image/green.jpeg" },
  { src: "/image/green.jpeg" },
  { src: "/image/green.jpeg" },
];


// --- HELPER & CHILD COMPONENTS ---

function QuantityStepper({ onQuantityChange }: { onQuantityChange: (q: number) => void }) {
  const [quantity, setQuantity] = useState(1);

  const handleDecrement = () => {
    const newQuantity = Math.max(1, quantity - 1);
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

  return (
    <div className="flex items-center justify-center space-x-1">
      <Button size="icon" className="cursor-pointer rounded-l-3xl w-9 h-8 bg-gray-900/30" onClick={handleDecrement}><Minus className="!h-5 !w-5" /></Button>
      <span className="pt-0.5 border-gray-900/30 rounded-md item-center border w-12 h-8 font-bold text-gray-600 text-md text-center">{quantity}</span>
      <Button size="icon" className="cursor-pointer rounded-r-3xl w-9 h-8 bg-gray-900/30" onClick={handleIncrement}><Plus className="!h-5 !w-5" /></Button>
    </div>
  );
}

const MenuItemCard: React.FC<{
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}> = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Load cart count from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('restaurant-cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartCount(parsedCart.count || 0);
    }

    // Listen for cart updates
    const handleCartUpdate = () => {
      const savedCart = localStorage.getItem('restaurant-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartCount(parsedCart.count || 0);
      } else {
        setCartCount(0);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <div className="flex items-center space-x-4 p-2 rounded-lg transition-colors hover:bg-gray-100 cursor-pointer">
          <div className="w-20 h-20 bg-gray-300 rounded-lg flex-shrink-0">30</div>
          <div className="flex-grow">
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <p className="font-semibold text-md">${item.price.toFixed(2)}</p>
            <Button
              size="icon"
              className=" cursor-pointer bg-teal-500 hover:bg-teal-600 text-white rounded-full w-10 h-10 flex items-center justify-center z-10"
              onClick={(e) => {
                e.stopPropagation(); // Prevent opening the drawer
                onAddToCart(item, 1);
              }}
            >
              <CirclePlus className="!w-6 !h-6" />
            </Button>
          </div>
        </div>
      </DrawerTrigger>
      <DrawerContent className="p-0" aria-describedby="menu-item-desc">
        <VisuallyHidden>
          <DrawerTitle>{item.name}</DrawerTitle>
        </VisuallyHidden>
        <div className="mx-auto w-full max-w-sm">
          <div className="px-4">
            <div className="flex items-center justify-center">
              <div className="bg-gray-200 rounded-lg" style={{ height: "225px", width: "225px" }}>yay</div>
            </div>
            <div className="border-1 rounded-xl p-2 border-gray-400 mt-2 flex justify-between items-start">
              <div>
                <h2 className="font-bold text-xl">{item.name}</h2>
                <p className="font-semibold text-md text-black text-teal-500">${item.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              </div>
              <QuantityStepper onQuantityChange={setQuantity} />
            </div>
          </div>
          <DrawerFooter className="px-4 pt-2 pb-40">
            <div className="flex items-center space-x-1">
                              <Button variant="outline" className="hover:text-green-700 border-teal-500/20 border-1 rounded-l-3xl cursor-pointer hover:bg-teal-500 bg-teal-500/20 inline-flex items-center justify-center text-sm font-medium text-green-700 ring-1 ring-green-600/20 ring-inset w-26 px-2 h-12">
                  <ShoppingCart className="!w-5 !h-5" />
                  Cart
                  {cartCount > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums flex items-center justify-center">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              <Button
                className="cursor-pointer flex-1 bg-teal-500 hover:bg-teal-600 text-white h-12 rounded-r-3xl"
                onClick={() => {
                  onAddToCart(item, quantity);
                  setIsOpen(false);
                }}
              >
                Add to Cart
                <CirclePlus className="!w-5 !h-5 ml-1" />
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};



const FloatingCartButton: React.FC<{
  count: number; 
  total: number;
}> = ({ count, total }) => {
  const router = useRouter();
  
  return (
    <div className="fixed bottom-8 right-8 z-20">
      <Button 
        className="bg-teal-500 hover:bg-teal-600 cursor-pointer text-white rounded-2xl h-20 w-20 shadow-lg flex items-center justify-center relative"
        onClick={() => router.push('/cart')}
      >
        <div className="flex flex-col items-center">
          <ShoppingCart className="!w-7 !h-7"/>
          <span className="text-sm font-medium mt-1">Cart</span>
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

// --- MENU SCREEN COMPONENT ---

export function MenuScreen() {
    const [activeCategory, setActiveCategory] = useState("All");

    // FIX: Initialize state by reading from localStorage directly.
    // This function runs only once on the initial render.
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        // Check if window is defined to prevent errors during server-side rendering
        if (typeof window === 'undefined') {
            return [];
        }
        try {
            const savedCart = localStorage.getItem('restaurant-cart');
            return savedCart ? JSON.parse(savedCart).items || [] : [];
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
            return [];
        }
    });

    const [cartCount, setCartCount] = useState<number>(() => {
        if (typeof window === 'undefined') {
            return 0;
        }
        try {
            const savedCart = localStorage.getItem('restaurant-cart');
            return savedCart ? JSON.parse(savedCart).count || 0 : 0;
        } catch (error) {
            console.error("Failed to parse cart count from localStorage", error);
            return 0;
        }
    });

    // FIX: REMOVED the initial `useEffect` that was reading from localStorage.
    // It's no longer necessary because `useState` is now handling the initial load.

    // This `useEffect` now ONLY handles saving the state to localStorage when it changes.
    useEffect(() => {
      // It won't run with the initial empty state anymore,
      // because the state is initialized with the correct data from the start.
      localStorage.setItem('restaurant-cart', JSON.stringify({
        items: cartItems,
        count: cartCount
      }));
      
      // Dispatch custom event to notify other components about cart update
      window.dispatchEvent(new Event('cartUpdated'));
    }, [cartItems, cartCount]);

    const handleAddToCart = (item: MenuItem, quantity: number) => {
        setCartItems(prevItems => {
          const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
          
          if (existingItem) {
            // Update existing item quantity
            return prevItems.map(cartItem =>
              cartItem.id === item.id
                ? {
                    ...cartItem,
                    quantity: cartItem.quantity + quantity,
                    totalPrice: (cartItem.quantity + quantity) * cartItem.price
                  }
                : cartItem
            );
          } else {
            // Add new item
            return [...prevItems, {
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: quantity,
              totalPrice: item.price * quantity
            }];
          }
        });
        
        setCartCount(prev => prev + quantity);
    };

    const removeFromCart = (itemId: string) => {
      setCartItems(prevItems => {
        const itemToRemove = prevItems.find(item => item.id === itemId);
        if (itemToRemove) {
          setCartCount(prev => prev - itemToRemove.quantity);
        }
        return prevItems.filter(item => item.id !== itemId);
      });
    };

    const updateQuantity = (itemId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
      }
      
      setCartItems(prevItems => {
        const updatedItems = prevItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity }
            : item
        );
        
        // Recalculate total count
        const newCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(newCount);
        
        return updatedItems;
      });
    };

    const getCartTotal = () => {
      return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    };
    
    const filteredMenuItems = activeCategory === "All"
        ? menuItems
        : menuItems.filter(item => item.category === activeCategory);

    return (
      <div className="relative bg-gray-50 font-sans w-full max-w-md mx-auto border-2 border-gray-200 rounded-3xl shadow-2xl mt-4 md:max-w-2xl lg:max-w-4xl xl:max-w-7xl">
          <main className="px-4 pb-28">
              <div className="sticky top-0 z-20 bg-gray-50 pt-4 pb-2">
                <div className="relative mb-2">
                  <Input placeholder="Search Menu" className="h-11 bg-white border-gray-300 rounded-3xl" />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {/* FIX: Added the 'hide-scrollbar' class here */}
                <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar">
                  {categories.map(({ name, icon: Icon }) => (
                    <Button
                      key={name}
                      variant={activeCategory === name ? "default" : "outline"}
                      onClick={() => setActiveCategory(name)}
                      className={`cursor-pointer flex-shrink-0 h-11 rounded-full px-5 space-x-2 transition-all duration-200 ${activeCategory === name ? "bg-teal-500 text-white hover:bg-teal-600" : "bg-gray-300 border-gray-200 text-black hover:bg-teal-600/40"}`}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      <span className="font-semibold">{name}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <section className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4">
                      {filteredMenuItems.map((item) => (
                          <MenuItemCard
                              key={item.id}
                              item={item}
                              onAddToCart={handleAddToCart}
                          />
                      ))}
                  </div>
              </section>
          </main>
          <FloatingCartButton 
            count={cartCount}
            total={getCartTotal()}
          />
      </div>
    );
}

// --- MAIN PAGE COMPONENT ---

export default function Screen() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-white overflow-x-hidden">
      <React.Suspense fallback={<div>Loading...</div>}>
        <Header />
      </React.Suspense>

      <div className="w-full max-w-md mx-auto px-2 md:max-w-2xl lg:max-w-4xl xl:max-w-7xl">
        <Carousel>
          <CarouselContent>
            {carouselImages.map((img, index) => (
              <CarouselItem key={index}>
                <Card className="p-0 border-0">
                  <CardContent className="p-0 h-52 md:h-96 flex items-center justify-center">
                    <img
                      src={img.src}
                      alt="Promotion"
                      className="w-full h-full object-cover"
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