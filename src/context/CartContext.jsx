import React, { createContext, useContext, useEffect, useReducer } from 'react';

const CartContext = createContext();

const initialState = {
  cartItems: [],
};

function reducer(state, action) {
  let items;
  switch (action.type) {
    case 'LOAD_CART':
      return { ...state, cartItems: action.payload };
    case 'ADD':
      items = [...state.cartItems];
      // Check if same product with same weight already exists
      const existingIdx = items.findIndex(i => 
        i._id === action.payload._id && 
        i.selectedWeight === action.payload.selectedWeight
      );
      if (existingIdx > -1) {
        items[existingIdx].qty += action.payload.qty;
      } else {
        items.push(action.payload);
      }
      return { ...state, cartItems: items };
    case 'REMOVE':
      // Remove by unique identifier (id or id-weight combination)
      items = state.cartItems.filter((i, idx) => {
        if (typeof action.payload === 'string') {
          // If payload is just id, remove all variants
          return i._id !== action.payload;
        }
        if (typeof action.payload === 'object' && action.payload._id) {
          // If payload is object with id and weight, remove specific variant
          return !(i._id === action.payload._id && i.selectedWeight === action.payload.selectedWeight);
        }
        // Fallback: remove by index if payload is number
        return idx !== action.payload;
      });
      return { ...state, cartItems: items };
    case 'UPDATE':
      items = state.cartItems.map(i => {
        // Match by id and weight if both are provided
        if (action.payload.selectedWeight !== undefined) {
          if (i._id === action.payload._id && i.selectedWeight === action.payload.selectedWeight) {
            return { ...i, qty: action.payload.qty };
          }
        } else {
          // Match by id only (for backward compatibility)
          if (i._id === action.payload._id) {
            return { ...i, qty: action.payload.qty };
          }
        }
        return i;
      });
      return { ...state, cartItems: items };
    case 'CLEAR':
      return { ...state, cartItems: [] };
    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    dispatch({ type: 'LOAD_CART', payload: cart });
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  const addToCart = (product, qty = 1) => {
    dispatch({ type: 'ADD', payload: { ...product, qty } });
  };
  const removeFromCart = (idOrPayload) => dispatch({ type: 'REMOVE', payload: idOrPayload });
  const updateQuantity = (id, qty, selectedWeight) => dispatch({ type: 'UPDATE', payload: { _id: id, qty, selectedWeight } });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  return (
    <CartContext.Provider value={{ ...state, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
