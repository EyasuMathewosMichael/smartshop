import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setItems([]);
      setItemCount(0);
      setSubtotal(0);
      setTotal(0);
    }
  }, [isAuthenticated]);

  function computeTotals(cartItems) {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const sub = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setItemCount(count);
    setSubtotal(sub);
    setTotal(sub);
  }

  async function fetchCart() {
    try {
      const res = await api.get('/cart');
      const cartData = res.data.cart || res.data;
      const cartItems = cartData.items || [];
      setItems(cartItems);
      computeTotals(cartItems);
    } catch {
      setItems([]);
    }
  }

  async function addItem(productId, quantity = 1) {
    const res = await api.post('/cart/items', { productId, quantity });
    const cartData = res.data.cart || res.data;
    const cartItems = cartData.items || [];
    setItems(cartItems);
    computeTotals(cartItems);
  }

  async function updateItem(productId, quantity) {
    const res = await api.put(`/cart/items/${productId}`, { quantity });
    const cartData = res.data.cart || res.data;
    const cartItems = cartData.items || [];
    setItems(cartItems);
    computeTotals(cartItems);
  }

  async function removeItem(productId) {
    const res = await api.delete(`/cart/items/${productId}`);
    const cartData = res.data.cart || res.data;
    const cartItems = cartData.items || [];
    setItems(cartItems);
    computeTotals(cartItems);
  }

  async function clearCart() {
    await api.delete('/cart');
    setItems([]);
    setItemCount(0);
    setSubtotal(0);
    setTotal(0);
  }

  return (
    <CartContext.Provider value={{ items, itemCount, subtotal, total, addItem, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default CartContext;
