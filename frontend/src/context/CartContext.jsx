import React, {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import useAuth from './AuthContext';
import { cartService } from '@/api';
import { getApiErrorMessage } from '@/api/client';

const CartContext = createContext(null);

const EMPTY_CART = {
  items: [],
  subtotal: 0,
  discount: 0,
  discountAmount: 0,
  itemCount: 0,
  total: 0,
  promoCode: null,
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const applyCartState = useCallback((nextCart) => {
    startTransition(() => {
      setCart(nextCart || EMPTY_CART);
    });
  }, []);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      applyCartState(EMPTY_CART);
      setError(null);
      return EMPTY_CART;
    }

    setIsLoading(true);

    try {
      const nextCart = await cartService.getCart();
      applyCartState(nextCart || EMPTY_CART);
      setError(null);
      return nextCart || EMPTY_CART;
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to load cart');
      applyCartState(EMPTY_CART);
      setError(message);
      return EMPTY_CART;
    } finally {
      setIsLoading(false);
    }
  }, [applyCartState, isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const runCartMutation = useCallback(
    async (requestFactory, fallbackMessage) => {
      setIsLoading(true);

      try {
        const nextCart = await requestFactory();
        applyCartState(nextCart || EMPTY_CART);
        setError(null);
        return nextCart || EMPTY_CART;
      } catch (requestError) {
        const message = getApiErrorMessage(requestError, fallbackMessage);
        setError(message);
        throw requestError;
      } finally {
        setIsLoading(false);
      }
    },
    [applyCartState],
  );

  const addItem = useCallback(
    (data) => runCartMutation(() => cartService.addItem(data), 'Failed to add item to cart'),
    [runCartMutation],
  );

  const updateItem = useCallback(
    (itemId, data) => runCartMutation(() => cartService.updateItem(itemId, data), 'Failed to update cart item'),
    [runCartMutation],
  );

  const removeItem = useCallback(
    (itemId) => runCartMutation(() => cartService.removeItem(itemId), 'Failed to remove cart item'),
    [runCartMutation],
  );

  const clearCart = useCallback(
    async () => {
      setIsLoading(true);

      try {
        await cartService.clearCart();
        applyCartState(EMPTY_CART);
        setError(null);
        return EMPTY_CART;
      } catch (requestError) {
        const message = getApiErrorMessage(requestError, 'Failed to clear cart');
        setError(message);
        throw requestError;
      } finally {
        setIsLoading(false);
      }
    },
    [applyCartState],
  );

  const applyPromo = useCallback(
    (code) => runCartMutation(() => cartService.applyPromo(code), 'Failed to apply promo code'),
    [runCartMutation],
  );

  const removePromo = useCallback(
    () => runCartMutation(() => cartService.removePromo(), 'Failed to remove promo code'),
    [runCartMutation],
  );

  const checkout = useCallback(
    async (payload) => {
      setIsLoading(true);

      try {
        const result = await cartService.checkout(payload);
        setError(null);
        return result;
      } catch (requestError) {
        const message = getApiErrorMessage(requestError, 'Checkout failed');
        setError(message);
        throw requestError;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const items = cart?.items || [];
  const subtotal = Number(cart?.subtotal ?? 0);
  const discount = Number(cart?.discount ?? cart?.discountAmount ?? 0);
  const total = Number(cart?.total ?? Math.max(0, subtotal - discount));
  const itemCount = Number(
    cart?.itemCount ?? items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
  );

  const value = {
    cart,
    items,
    isLoading,
    error,
    promoCode: cart?.promoCode || null,
    subtotal,
    discount,
    total,
    itemCount,
    isEmpty: itemCount === 0,
    refreshCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    applyPromo,
    removePromo,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};
