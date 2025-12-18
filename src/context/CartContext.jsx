import React, { createContext, useContext, useEffect, useReducer, useCallback, useMemo, useState } from 'react';
import { cartApi } from '../services/cartApi.js';
import { deliveryChargeApi } from '../services/deliveryChargeApi.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

const initialState = {
  cartItems: [],
  loading: false,
  addingToCart: false,
  updatingQuantity: false,
  removingFromCart: false,
  clearingCart: false,
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
    case 'START_ADD_TO_CART':
      return { ...state, addingToCart: true, error: null };
    case 'ADD_SUCCESS':
      return {
        ...state,
        cartItems: action.payload.items || [],
        addingToCart: false,
        error: null
      };
    case 'START_UPDATE_QUANTITY':
      return { ...state, updatingQuantity: true, error: null };
    case 'UPDATE_SUCCESS':
      return {
        ...state,
        cartItems: action.payload.items || [],
        updatingQuantity: false,
        error: null
      };
    case 'START_REMOVE_FROM_CART':
      return { ...state, removingFromCart: true, error: null };
    case 'REMOVE_SUCCESS':
      return {
        ...state,
        cartItems: action.payload.items || [],
        removingFromCart: false,
        error: null
      };
    case 'START_CLEAR_CART':
      return { ...state, clearingCart: true, error: null };
    case 'CLEAR_SUCCESS':
      return {
        ...state,
        cartItems: [],
        clearingCart: false,
        error: null
      };
    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        addingToCart: false,
        updatingQuantity: false,
        removingFromCart: false,
        clearingCart: false,
        error: action.payload
      };
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

  // Load cart from API
  const loadCart = useCallback(async () => {
    console.log('CartContext: loadCart called');
    dispatch({ type: 'LOADING' });
    try {
      const data = await cartApi.getCart();
      const transformedItems = transformCartItems(data.items);
      console.log('CartContext: Cart loaded successfully, items:', transformedItems.length);
      dispatch({ type: 'LOAD_CART_SUCCESS', payload: { items: transformedItems } });
    } catch (err) {
      console.error('Load cart error:', err);
      // If cart doesn't exist, that's okay - start with empty cart
      if (err.response?.status === 404 || err.response?.status === 400) {
        console.log('CartContext: Cart not found, setting empty cart');
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

  // Initialize session ID on mount
  useEffect(() => {
    const sessionId = getSessionId();
    dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
  }, []);


  // Merge guest cart with user cart (called on login) - simplified
  const mergeGuestCart = useCallback(async () => {
    console.log('CartContext: mergeGuestCart called');
    try {
      const sessionId = getSessionId();
      const data = await cartApi.mergeCart(sessionId);
      const transformedItems = transformCartItems(data.items);
      console.log('CartContext: Guest cart merged successfully, items:', transformedItems.length);
      dispatch({ type: 'LOAD_CART_SUCCESS', payload: { items: transformedItems } });

      // Clear session ID after merge
      localStorage.removeItem('cartSessionId');
    } catch (err) {
      console.error('Merge cart error:', err);
      // On merge failure, just load the current user's cart
      await loadCart();
    }
  }, [loadCart]);


  // Load cart whenever user state changes (login/logout) or on initial mount
  useEffect(() => {
    const loadCurrentUserCart = async () => {
      console.log('CartContext: Loading cart for user:', user ? user.name : 'guest');

      try {
        await loadCart();
        console.log('CartContext: Cart loaded successfully');
      } catch (error) {
        console.error('CartContext: Failed to load cart:', error);
      }
    };

    // Always load cart when user state changes
    loadCurrentUserCart();
  }, [user, loadCart]);

  // Debug: Log cart state changes
  useEffect(() => {
    console.log('CartContext: Cart items changed, count:', state.cartItems.length, 'loading:', state.loading, 'error:', state.error);
    if (state.cartItems.length > 0) {
      console.log('CartContext: Current cart items:', state.cartItems.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        selectedWeight: item.selectedWeight
      })));
    }
  }, [state.cartItems, state.loading, state.error]);

  const addToCart = async (product, qty = 1) => {
    console.log('CartContext: Adding to cart:', product.name, 'qty:', qty, 'current cart items:', state.cartItems.length);
    dispatch({ type: 'START_ADD_TO_CART' });
    try {
      const payload = {
        productId: product._id,
        qty: Number(qty),
        price: product.price,
        originalPrice: product.originalPrice,
        weight: product.selectedWeight
      };

      console.log('CartContext: API call payload:', payload);
      const data = await cartApi.addItem(payload);
      const transformedItems = transformCartItems(data.items);
      console.log('CartContext: Item added successfully, total items:', transformedItems.length);
      console.log('CartContext: Cart items after add:', transformedItems.map(item => ({ name: item.name, qty: item.qty })));
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
    dispatch({ type: 'START_REMOVE_FROM_CART' });
    try {
      const data = await cartApi.removeItem(itemId);
      const transformedItems = transformCartItems(data.items);
      dispatch({ type: 'REMOVE_SUCCESS', payload: { items: transformedItems } });
    } catch (err) {
      console.error('Remove from cart error:', err);
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || 'Failed to remove item from cart' });
    }
  };

  const updateQuantity = async (itemId, qty) => {
    dispatch({ type: 'START_UPDATE_QUANTITY' });
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
    dispatch({ type: 'START_CLEAR_CART' });
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
      total,
      isAnyLoading: state.loading || state.addingToCart || state.updatingQuantity || state.removingFromCart || state.clearingCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
