// frontend/src/contexts/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import  useAuth from './AuthContext';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'shopping_cart';
const CART_EXPIRY_KEY = 'cart_expiry';
const CART_EXPIRY_DAYS = 7;

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [promoCode, setPromoCode] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [notes, setNotes] = useState('');

  // Load cart from storage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        const expiry = localStorage.getItem(CART_EXPIRY_KEY);
        
        // Check if cart has expired
        if (expiry && new Date(expiry) < new Date()) {
          clearCart();
          return;
        }
        
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setItems(parsedCart.items || []);
          setSavedForLater(parsedCart.savedForLater || []);
          setPromoCode(parsedCart.promoCode || null);
          setDiscount(parsedCart.discount || 0);
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    };

    loadCart();
  }, []);

  // Save cart to storage
  useEffect(() => {
    try {
      const cartData = {
        items,
        savedForLater,
        promoCode,
        discount,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
      
      // Set expiry
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + CART_EXPIRY_DAYS);
      localStorage.setItem(CART_EXPIRY_KEY, expiry.toISOString());
    } catch (err) {
      console.error('Failed to save cart:', err);
    }
  }, [items, savedForLater, promoCode, discount]);

  // Sync with user account if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      syncCartWithUser();
    }
  }, [isAuthenticated, user]);

  const syncCartWithUser = async () => {
    try {
      // API call to sync cart with user account
      // This would merge local cart with server-side cart
    } catch (err) {
      console.error('Failed to sync cart:', err);
    }
  };

  // Calculate subtotal - MOVED BEFORE any functions that use it
  const subtotal = items.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );

  // Calculate shipping - MOVED BEFORE any functions that use it
  const shippingCost = useCallback(() => {
    const methods = {
      standard: { price: 5.99, days: '5-7' },
      express: { price: 12.99, days: '2-3' },
      overnight: { price: 24.99, days: '1' }
    };
    
    if (promoCode === 'FREESHIP') return 0;
    return methods[shippingMethod]?.price || 0;
  }, [shippingMethod, promoCode]);

  // Calculate tax
  const tax = (subtotal - discount) * 0.1;

  // Calculate total
  const total = subtotal - discount + tax + shippingCost();

  // Add item to cart
  const addItem = useCallback((item, quantity = 1, options = {}) => {
    setItems(prev => {
      const existingItemIndex = prev.findIndex(i => 
        i.id === item.id && 
        JSON.stringify(i.options) === JSON.stringify(options)
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const updated = [...prev];
        updated[existingItemIndex] = {
          ...updated[existingItemIndex],
          quantity: updated[existingItemIndex].quantity + quantity
        };
        return updated;
      }
      
      // Add new item
      return [...prev, {
        ...item,
        quantity,
        options,
        addedAt: new Date().toISOString()
      }];
    });
  }, []);

  // Remove item from cart
  const removeItem = useCallback((itemId, options = {}) => {
    setItems(prev => prev.filter(item => 
      !(item.id === itemId && JSON.stringify(item.options) === JSON.stringify(options))
    ));
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((itemId, quantity, options = {}) => {
    if (quantity < 1) {
      removeItem(itemId, options);
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.id === itemId && JSON.stringify(item.options) === JSON.stringify(options)
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  // Move item to saved for later
  const moveToSaved = useCallback((itemId, options = {}) => {
    const item = items.find(i => 
      i.id === itemId && JSON.stringify(i.options) === JSON.stringify(options)
    );
    
    if (item) {
      removeItem(itemId, options);
      setSavedForLater(prev => [...prev, { ...item, savedAt: new Date().toISOString() }]);
    }
  }, [items, removeItem]);

  // Move item from saved to cart
  const moveToCart = useCallback((itemId, options = {}) => {
    const item = savedForLater.find(i => 
      i.id === itemId && JSON.stringify(i.options) === JSON.stringify(options)
    );
    
    if (item) {
      setSavedForLater(prev => prev.filter(i => 
        !(i.id === itemId && JSON.stringify(i.options) === JSON.stringify(options))
      ));
      addItem(item, item.quantity, options);
    }
  }, [savedForLater, addItem]);

  // Clear cart
  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode(null);
    setDiscount(0);
    setNotes('');
  }, []);

  // Apply promo code
  const applyPromo = useCallback(async (code) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // API call to validate promo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const validPromos = {
        'SAVE10': { type: 'percentage', value: 10, minPurchase: 50 },
        'SAVE20': { type: 'percentage', value: 20, minPurchase: 100 },
        'FLAT50': { type: 'fixed', value: 50, minPurchase: 200 },
        'FREESHIP': { type: 'shipping', value: 0 }
      };
      
      if (validPromos[code]) {
        const promo = validPromos[code];
        
        // Check minimum purchase
        if (promo.minPurchase && subtotal < promo.minPurchase) {
          throw new Error(`Minimum purchase of $${promo.minPurchase} required`);
        }
        
        setPromoCode(code);
        
        // Calculate discount
        if (promo.type === 'percentage') {
          setDiscount(subtotal * (promo.value / 100));
        } else if (promo.type === 'fixed') {
          setDiscount(promo.value);
        }
        
        return { success: true, discount: promo };
      }
      
      throw new Error('Invalid promo code');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [subtotal]);

  // Remove promo code
  const removePromo = useCallback(() => {
    setPromoCode(null);
    setDiscount(0);
  }, []);

  // Get cart summary
  const summary = {
    subtotal: subtotal.toFixed(2),
    discount: discount.toFixed(2),
    tax: tax.toFixed(2),
    shipping: shippingCost().toFixed(2),
    total: total.toFixed(2),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    uniqueItems: items.length
  };

  // Check if item is in cart
  const isInCart = useCallback((itemId, options = {}) => {
    return items.some(item => 
      item.id === itemId && JSON.stringify(item.options) === JSON.stringify(options)
    );
  }, [items]);

  // Get cart item
  const getCartItem = useCallback((itemId, options = {}) => {
    return items.find(item => 
      item.id === itemId && JSON.stringify(item.options) === JSON.stringify(options)
    );
  }, [items]);

  const value = {
    // State
    items,
    savedForLater,
    isLoading,
    error,
    promoCode,
    discount,
    shippingMethod,
    notes,
    
    // Cart operations
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    
    // Saved for later
    moveToSaved,
    moveToCart,
    
    // Promo codes
    applyPromo,
    removePromo,
    
    // Settings
    setShippingMethod,
    setNotes,
    
    // Calculations
    subtotal,
    tax,
    total,
    summary,
    
    // Utilities
    isInCart,
    getCartItem,
    isEmpty: items.length === 0,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};