"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const API_BASE = "http://127.0.0.1:4000";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  buyNow: (product: Product) => void;
  cartTotal: number;
  cartCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate or retrieve a persistent session ID
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let sessionId = localStorage.getItem("cart_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("cart_session_id", sessionId);
  }
  return sessionId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart from cart-service
  const fetchCart = useCallback(async () => {
    try {
      const sessionId = getSessionId();
      if (sessionId === "ssr") return;

      const res = await fetch(`${API_BASE}/api/cart/${sessionId}`);
      const data = await res.json();

      if (data.items) {
        setCartItems(
          data.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product: Product) => {
    // Optimistic update
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });

    // Sync with server
    try {
      const sessionId = getSessionId();
      await fetch(`${API_BASE}/api/cart/${sessionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      fetchCart(); // Revert to server state
    }
  };

  const removeFromCart = async (id: string) => {
    // Optimistic update
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));

    // Sync with server
    try {
      const sessionId = getSessionId();
      await fetch(`${API_BASE}/api/cart/${sessionId}/items/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      fetchCart();
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    // Optimistic update
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );

    // Sync with server
    try {
      const sessionId = getSessionId();
      await fetch(`${API_BASE}/api/cart/${sessionId}/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
    } catch (error) {
      console.error("Failed to update cart:", error);
      fetchCart();
    }
  };

  const clearCart = async () => {
    setCartItems([]);

    try {
      const sessionId = getSessionId();
      await fetch(`${API_BASE}/api/cart/${sessionId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  const buyNow = (product: Product) => {
    // Clear cart and add only this product for instant checkout
    setCartItems([{ ...product, quantity: 1 }]);
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        buyNow,
        cartTotal,
        cartCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
