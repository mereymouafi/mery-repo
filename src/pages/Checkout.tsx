import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, createOrderItems } from '../lib/orderService';
import type { OrderInsert, OrderItemInsert } from '../lib/orderService';
import { CartContext } from '../context/CartContext';

// Checkout form interface
interface CheckoutForm {
  customerName: string;
  phone: string;
  address: string;
}

// Using CartItem interface from CartContext

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<CheckoutForm>({
    customerName: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get cart items from CartContext
  const { cartItems, clearCart } = useContext(CartContext);

  // Calculate total
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('Starting checkout process...');
    console.log('Cart items:', cartItems);

    if (!cartItems.length) {
      setError('Your cart is empty. Please add items before checking out.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order in Supabase
      const orderData: OrderInsert = {
        customer_name: form.customerName,
        phone: form.phone,
        address: form.address,
        total_amount: cartTotal,
        payment_method: 'cod',
        payment_status: 'pending'
      };

      console.log('Creating order with data:', orderData);
      const { data: order, error: orderError } = await createOrder(orderData);
      
      if (orderError) {
        console.error('Failed to create order:', orderError);
        throw new Error(orderError?.message || 'Failed to create order');
      }
      
      if (!order) {
        console.error('Order created but no data returned');
        throw new Error('Failed to create order - no order data returned');
      }

      console.log('Order created successfully:', order);

      // 2. Create order items in Supabase
      const orderItems: OrderItemInsert[] = cartItems.map(item => {
        const orderItem: OrderItemInsert = {
          order_id: order.id,
          product_id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || null,
          size: item.size || null
        };
        return orderItem;
      });

      console.log('Preparing to create order items:', orderItems);
      
      // Create the order items
      const { data: itemsData, error: itemsError } = await createOrderItems(orderItems);
      
      if (itemsError) {
        console.error('Failed to create order items:', itemsError);
        throw new Error(`Failed to create order items: ${itemsError.message || 'Unknown error'}`);
      }

      console.log('Order items created successfully:', itemsData);

      // 3. Clear cart and navigate to success page
      console.log('Clearing cart and redirecting to confirmation page');
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="customerName" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={form.customerName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="address" className="block text-sm font-medium mb-1">
                Delivery Address
              </label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Payment Method</h3>
              <div className="bg-gray-100 p-3 rounded flex items-center">
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  checked
                  readOnly
                  className="mr-2"
                />
                <label htmlFor="cod" className="font-medium">
                  Cash on Delivery (COD)
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition disabled:bg-indigo-300"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
        
        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="font-medium">
                  {item.price.toLocaleString()} MAD
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{cartTotal.toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{cartTotal.toLocaleString()} MAD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
