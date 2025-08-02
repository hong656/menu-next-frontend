"use client"

import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
} from "lucide-react";
import { useSearchParams } from 'next/navigation'; 

export default function Header() {
  // 2. Get the search params object
  const searchParams = useSearchParams();
  
  // 3. Get the specific 'table' parameter from the URL
  const tableNumber = searchParams.get('table');

  return (
    <header>
      <nav>
        <div className="mx-auto max-w-7xl px-2">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex flex-1 items-center justify-between sm:items-stretch">
              <div className="flex shrink-0 items-center">
                <img src="/image/logo.png" alt="Emily Restaurant" className="h-8 w-auto" />
              </div>
              <div className="flex items-center space-x-3">
                <div className="inline-flex flex-col items-center justify-center rounded-md bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  <p className="leading-tight">Table</p>
                  <p className="font-bold leading-tight">#{tableNumber || '--'}</p>
                </div>
                <span className="rounded-full cursor-pointer hover:bg-teal-500 bg-teal-500/20 inline-flex items-center justify-center text-sm font-medium text-green-700 ring-1 ring-green-600/20 ring-inset w-24 px-2 h-10">
                  <ShoppingCart className="h-4 w-4 mr-1.5" />
                  Cart
                  <Badge className="ml-1 h-5 min-w-5 rounded-full px-1 font-mono tabular-nums flex items-center justify-center" variant="destructive">
                    5
                  </Badge>
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}