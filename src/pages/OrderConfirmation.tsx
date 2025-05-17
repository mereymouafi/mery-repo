import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderWithItems } from '../lib/orderService';
import type { Order, OrderItem } from '../lib/orderService';

const OrderConfirmation: React.FC = () => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { orderId } = useParams<{ orderId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('Order ID not found');
        setLoading(false);
        return;
      }

      try {
        const { order, items, error } = await getOrderWithItems(orderId);
        
        if (error) {
          throw new Error(error.message || 'Failed to load order details');
        }

        if (!order) {
          throw new Error('Order not found');
        }

        setOrder(order);
        setItems(items || []);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="h-64 bg-gray-100 rounded max-w-lg mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-red-700 mb-3">Error</h1>
          <p className="text-red-600 mb-6">{error || 'Could not find order information'}</p>
          <Link to="/" className="inline-block bg-indigo-600 text-white py-2 px-6 rounded hover:bg-indigo-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-50 p-6 border-b border-green-100">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-center text-gray-600">
            Thank you for your order. Your order has been received and is being processed.
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold mb-3">Order Information</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p className="mb-1"><span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
                <p className="mb-1"><span className="font-medium">Payment Method:</span> Cash on Delivery</p>
                
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-3">Shipping Information</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p className="mb-1"><span className="font-medium">Name:</span> {order.customer_name}</p>
                <p className="mb-1"><span className="font-medium">Phone:</span> {order.phone}</p>
                <p><span className="font-medium">Address:</span> {order.address}</p>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
          <div className="border rounded overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded mr-3" />
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{item.price.toLocaleString()} MAD</td>
                    <td className="px-4 py-3">{(item.price * item.quantity).toLocaleString()} MAD</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-medium">Total</td>
                  <td className="px-4 py-3 font-bold">{order.total_amount.toLocaleString()} MAD</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-center">
            <button 
              onClick={() => generatePDF(order, items)} 
              className="mb-6 text-indigo-600 font-medium hover:text-indigo-800 hover:underline flex items-center justify-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Download your order receipt here
            </button>
            <Link to="/" className="inline-block bg-indigo-600 text-white py-2 px-6 rounded hover:bg-indigo-700 transition">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Function to generate and download the PDF receipt
const generatePDF = (order: Order, items: OrderItem[]) => {
  // Create a hidden canvas element to render receipt content
  const canvas = document.createElement('canvas');
  canvas.width = 595; // A4 width in pixels at 72 DPI
  canvas.height = 842; // A4 height in pixels at 72 DPI
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    alert('Unable to create PDF. Please try again.');
    return;
  }
  
  // Set white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Set text properties
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  
  // Draw header
  ctx.fillText('Maroc Luxe', canvas.width / 2, 40);
  ctx.font = '16px Arial';
  ctx.fillText('Order Receipt', canvas.width / 2, 70);
  
  // Draw confirmation box
  ctx.fillStyle = '#f0fff4';
  ctx.fillRect(40, 90, canvas.width - 80, 60);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Order Confirmed!', canvas.width / 2, 120);
  ctx.font = '14px Arial';
  ctx.fillText('Thank you for your order. It has been received and is being processed.', canvas.width / 2, 140);
  
  // Reset text alignment for left-aligned text
  ctx.textAlign = 'left';
  
  // Order Information
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Order Information', 50, 190);
  ctx.font = '14px Arial';
  ctx.fillText(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 50, 220);
  ctx.fillText('Payment Method: Cash on Delivery', 50, 240);
  
  // Shipping Information
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Shipping Information', canvas.width / 2 + 20, 190);
  ctx.font = '14px Arial';
  ctx.fillText(`Name: ${order.customer_name}`, canvas.width / 2 + 20, 220);
  ctx.fillText(`Phone: ${order.phone}`, canvas.width / 2 + 20, 240);
  ctx.fillText(`Address: ${order.address}`, canvas.width / 2 + 20, 260);
  
  // Order Summary
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Order Summary', 50, 310);
  
  // Table headers
  ctx.fillStyle = '#f7fafc';
  ctx.fillRect(50, 325, canvas.width - 100, 30);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Item', 60, 345);
  ctx.fillText('Qty', 280, 345);
  ctx.fillText('Price', 340, 345);
  ctx.fillText('Total', 440, 345);
  
  // Table content
  let yPos = 375;
  ctx.font = '14px Arial';
  
  items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    
    // Alternate row background for better readability
    if (index % 2 === 1) {
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(50, yPos - 15, canvas.width - 100, 30);
      ctx.fillStyle = '#000000';
    }
    
    ctx.fillText(item.name, 60, yPos);
    if (item.size) {
      ctx.font = '12px Arial';
      ctx.fillText(`Size: ${item.size}`, 60, yPos + 15);
      ctx.font = '14px Arial';
    }
    
    ctx.fillText(item.quantity.toString(), 280, yPos);
    ctx.fillText(`${item.price.toLocaleString()} MAD`, 340, yPos);
    ctx.fillText(`${itemTotal.toLocaleString()} MAD`, 440, yPos);
    
    yPos += item.size ? 50 : 30;
  });
  
  // Total row
  ctx.fillStyle = '#f7fafc';
  ctx.fillRect(50, yPos - 15, canvas.width - 100, 30);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Total', 340, yPos);
  ctx.fillText(`${order.total_amount.toLocaleString()} MAD`, 440, yPos);
  
  // Footer
  yPos += 50;
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Maroc Luxe - Premium Products', canvas.width / 2, yPos);
  ctx.fillText('Thank you for shopping with us!', canvas.width / 2, yPos + 20);
  ctx.fillText(`Receipt generated on: ${new Date().toLocaleDateString()}`, canvas.width / 2, yPos + 40);
  
  // Convert canvas to data URL and create a download link
  try {
    const imageData = canvas.toDataURL('image/png');
    
    // Create a PDF-like document using the canvas image
    const link = document.createElement('a');
    link.download = `MarocLuxe-Receipt-${new Date().toLocaleDateString().replace(/\//g, '-')}.png`;
    link.href = imageData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error generating receipt:', error);
    alert('Failed to generate receipt. Please try again.');
  }
};

export default OrderConfirmation;
