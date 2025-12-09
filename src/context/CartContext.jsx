import React, { createContext, useContext, useEffect, useReducer, useCallback, useMemo, useState } from 'react';
import { cartApi } from '../services/cartApi.js';
import { deliveryChargeApi } from '../services/deliveryChargeApi.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

const initialState = {
  cartItems: [],
  loading: false,
  error: null,
  sessionId: null,
};

// Generate or retrieve session ID for guest carts
const getSessionId = () => {
  let sessionId = localStorage.getItem('cartSessionId');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('cartSessionId', sessionId);
  }
  return sessionId;
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'LOAD_CART_SUCCESS':
      return { 
        ...state, 
        cartItems: action.payload.items || [], 
        loading: false, 
        error: null 
      };
    case 'LOAD_CART_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_SUCCESS':
      return { 
        ...state, 
        cartItems: action.payload.items || [], 
        loading: false, 
        error: null 
      };
    case 'UPDATE_SUCCESS':
      return { 
        ...state, 
        cartItems: action.payload.items || [], 
        loading: false, 
        error: null 
      };
    case 'REMOVE_SUCCESS':
      return { 
        ...state, 
        cartItems: action.payload.items || [], 
        loading: false, 
        error: null 
      };
    case 'CLEAR_SUCCESS':
      return { 
        ...state, 
        cartItems: [], 
        loading: false, 
        error: null 
      };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    default:
      return state;
  }
}

// Helper to transform cart items from API to frontend format
const transformCartItems = (items) => {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map(item => {
    const product = item.product || {};
    return {
      _id: product._id || product.id, // Product ID for navigation
      cartItemId: item._id, // Cart item ID for API operations
      name: product.name,
      image: product.image,
      price: item.price, // This is already the discounted price from backend
      originalPrice: item.originalPrice || item.price, // Store original price if available
      qty: item.qty,
      selectedWeight: item.weight,
      weightOption: product.weightOptions?.find(w => w.weight === item.weight)
    };
  });
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useAuth();

  // Initialize session ID
  useEffect(() => {
    const sessionId = getSessionId();
    dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
  }, []);

  // Load cart from API
  const loadCart = useCallback(async () => {
    dispatch({ type: 'LOADING' });
    try {
      const data = await cartApi.getCart();
      const transformedItems = transformCartItems(data.items);
      dispatch({ type: 'LOAD_CART_SUCCESS', payload: { items: transformedItems } });
    } catch (err) {
      console.error('Load cart error:', err);
      // If cart doesn't exist, that's okay - start with empty cart
      if (err.response?.status === 404 || err.response?.status === 400) {
        dispatch({ type: 'LOAD_CART_SUCCESS', payload: { items: [] } });
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        // Network error - server might not be running
        console.warn('Backend server not reachable. Cart will work in offline mode.');
        dispatch({ type: 'LOAD_CART_SUCCESS', payload: { items: [] } });
      } else {
        dispatch({ type: 'LOAD_CART_ERROR', payload: err.response?.data?.message || 'Failed to load cart' });
      }
    }
  }, []);

  // Merge guest cart with user cart (called on login)
  const mergeGuestCart = useCallback(async () => {
    try {
      const sessionId = getSessionId();
      const token = localStorage.getItem('token');
      
      if (!token || !sessionId) {
        // No guest cart to merge, just load user cart
        await loadCart();
        return;
      }

      const data = await cartApi.mergeCart(sessionId);
      const transformedItems = transformCartItems(data.items);
      dispatch({ type: 'LOAD_CART_SUCCESS', payload: { items: transformedItems } });
      
      // Clear session ID after merge
      localStorage.removeItem('cartSessionId');
    } catch (err) {
      console.error('Merge cart error:', err);
      // Don't show error to user, just load user cart
      await loadCart();
    }
  }, [loadCart]);

  // Merge guest cart when user logs in or load cart when user changes
  useEffect(() => {
    const handleUserChange = async () => {
      if (user && user.id) {
        const sessionId = localStorage.getItem('cartSessionId');
        if (sessionId) {
          // User just logged in, merge guest cart
          await mergeGuestCart();
        } else {
          // User already logged in, just load their cart
          await loadCart();
        }
      } else if (!user) {
        // User logged out, load guest cart
        await loadCart();
      }
    };
    
    handleUserChange();
  }, [user, loadCart, mergeGuestCart]);

  const addToCart = async (product, qty = 1) => {
    dispatch({ type: 'LOADING' });
    try {
      const payload = {
        productId: product._id,
        qty: Number(qty),
        price: product.price,
        originalPrice: product.originalPrice,
        weight: product.selectedWeight
      };

      const data = await cartApi.addItem(payload);
      const transformedItems = transformCartItems(data.items);
      dispatch({ type: 'ADD_SUCCESS', payload: { items: transformedItems } });
    } catch (err) {
      console.error('Add to cart error:', err);
      let errorMessage = 'Failed to add item to cart';
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const removeFromCart = async (itemId) => {
    dispatch({ type: 'LOADING' });
    try {
      const data = await cartApi.removeItem(itemId);
      const transformedItems = transformCartItems(data.items);
      dispatch({ type: 'REMOVE_SUCCESS', payload: { items: transformedItems } });
    } catch (err) {
      console.error('Remove from cart error:', err);
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || 'Failed to remove item from cart' });
    }
  };

  const updateQuantity = async (itemId, qty, selectedWeight) => {
    dispatch({ type: 'LOADING' });
    try {
      const data = await cartApi.updateItem(itemId, Number(qty));
      const transformedItems = transformCartItems(data.items);
      dispatch({ type: 'UPDATE_SUCCESS', payload: { items: transformedItems } });
    } catch (err) {
      console.error('Update quantity error:', err);
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || 'Failed to update quantity' });
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'LOADING' });
    try {
      await cartApi.clearCart();
      dispatch({ type: 'CLEAR_SUCCESS', payload: { items: [] } });
    } catch (err) {
      console.error('Clear cart error:', err);
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || 'Failed to clear cart' });
    }
  };

  // Calculate subtotal
  const subtotal = useMemo(() => 
    state.cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0),
    [state.cartItems]
  );

  // Delivery charge state and calculation
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [loadingDeliveryCharge, setLoadingDeliveryCharge] = useState(false);

  // Calculate delivery charge when subtotal changes
  useEffect(() => {
    const calculateDeliveryCharge = async () => {
      if (subtotal <= 0) {
        setDeliveryCharge(0);
        return;
      }
      
      setLoadingDeliveryCharge(true);
      try {
        const data = await deliveryChargeApi.calculate(subtotal);
        setDeliveryCharge(data.deliveryCharge || 0);
      } catch (err) {
        console.error('Failed to calculate delivery charge:', err);
        // Default to 0 if calculation fails
        setDeliveryCharge(0);
      } finally {
        setLoadingDeliveryCharge(false);
      }
    };

    calculateDeliveryCharge();
  }, [subtotal]);

  // Calculate total including delivery charge
  const total = useMemo(() => 
    subtotal + deliveryCharge,
    [subtotal, deliveryCharge]
  );

  return (
    <CartContext.Provider value={{ 
      ...state, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      loadCart,
      mergeGuestCart,
      subtotal,
      deliveryCharge,
      loadingDeliveryCharge,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
