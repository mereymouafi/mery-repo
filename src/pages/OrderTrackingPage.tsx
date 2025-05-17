import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Package, CheckCircle, Clock, Truck, AlertCircle } from 'lucide-react';

const OrderTrackingPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // This would actually connect to your order tracking system
  // For now, it just simulates a response with demo data
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate inputs
    if (!orderNumber.trim() || !email.trim()) {
      setError('Please enter both order number and email.');
      setLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };
  
  const resetForm = () => {
    setOrderNumber('');
    setEmail('');
    setIsSubmitted(false);
    setError('');
  };

  // Demo order status for display purposes
  const demoOrder = {
    number: 'LM10254789',
    date: 'May 15, 2025',
    status: 'In Transit',
    items: [
      { id: 1, name: 'ZEGNA TRIPLE STITCH', brand: 'Zegna', price: 2400, image: 'https://images.pexels.com/photos/19090/pexels-photo.jpg' },
      { id: 2, name: 'Loro Piana Summer Walk Loafer', brand: 'Loro Piana', price: 2099, image: 'https://images.pexels.com/photos/2562992/pexels-photo-2562992.png' }
    ],
    shipping: {
      method: 'Express Delivery',
      trackingNumber: 'TRK5789632145',
      estimatedDelivery: 'May 19, 2025'
    },
    timeline: [
      { status: 'Order Placed', date: 'May 15, 2025 - 10:23 AM', icon: <CheckCircle className="w-5 h-5 text-green-500" />, completed: true },
      { status: 'Payment Confirmed', date: 'May 15, 2025 - 10:25 AM', icon: <CheckCircle className="w-5 h-5 text-green-500" />, completed: true },
      { status: 'Processing', date: 'May 16, 2025 - 09:15 AM', icon: <CheckCircle className="w-5 h-5 text-green-500" />, completed: true },
      { status: 'Shipped', date: 'May 17, 2025 - 11:30 AM', icon: <CheckCircle className="w-5 h-5 text-green-500" />, completed: true },
      { status: 'In Transit', date: 'Current Status', icon: <Truck className="w-5 h-5 text-luxury-gold" />, completed: false },
      { status: 'Delivered', date: 'Estimated: May 19, 2025', icon: <Clock className="w-5 h-5 text-gray-400" />, completed: false }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Track Your Order | Luxe Maroc</title>
        <meta name="description" content="Track the status of your Luxe Maroc order and view estimated delivery dates." />
      </Helmet>

      {/* Header Section */}
      <section className="py-16 bg-luxury-cream">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6 p-4 rounded-full bg-white shadow-sm border border-luxury-gold/20 flex items-center justify-center">
              <Package className="w-8 h-8 text-luxury-gold" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-luxury-black mb-4">Track Your Order</h1>
            <p className="text-luxury-gray max-w-2xl mx-auto">
              Monitor your order status and estimated delivery date
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            {!isSubmitted ? (
              <div className="bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-serif text-luxury-black mb-6 text-center">Enter Your Order Details</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <p>{error}</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="orderNumber" className="block text-luxury-black mb-2">
                      Order Number*
                    </label>
                    <input
                      type="text"
                      id="orderNumber"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="e.g., LM10254789"
                      className="w-full p-3 border border-gray-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold outline-none"
                      required
                    />
                    <p className="text-sm text-luxury-gray mt-1">
                      You can find your order number in your confirmation email
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-luxury-black mb-2">
                      Email Address*
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email used for your order"
                      className="w-full p-3 border border-gray-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold outline-none"
                      required
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-luxury-gold text-white hover:bg-luxury-gold/90 transition-colors flex items-center justify-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-2" />
                          Track Order
                        </>
                      )}
                    </button>
                  </div>
                </form>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-luxury-black font-medium mb-3">Need Help?</h3>
                  <p className="text-luxury-gray">
                    If you're having trouble locating your order information or have any questions, please contact our customer service team at{' '}
                    <a href="mailto:orders@luxemaroc.com" className="text-luxury-gold hover:underline">
                      orders@luxemaroc.com
                    </a>{' '}
                    or call us at 0675‑597187.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 shadow-sm mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif text-luxury-black">Order #{demoOrder.number}</h2>
                  <span className="px-4 py-1 bg-luxury-gold/10 text-luxury-gold font-medium">
                    {demoOrder.status}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-sm font-medium text-luxury-gray uppercase mb-2">Order Date</h3>
                      <p className="text-luxury-black">{demoOrder.date}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-luxury-gray uppercase mb-2">Estimated Delivery</h3>
                      <p className="text-luxury-black">{demoOrder.shipping.estimatedDelivery}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-luxury-gray uppercase mb-2">Shipping Method</h3>
                      <p className="text-luxury-black">{demoOrder.shipping.method}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-luxury-gray uppercase mb-2">Tracking Number</h3>
                      <p className="text-luxury-black">{demoOrder.shipping.trackingNumber}</p>
                    </div>
                  </div>
                  
                  <div className="mb-10">
                    <h3 className="text-lg font-serif text-luxury-black mb-4">Shipping Timeline</h3>
                    <div className="relative">
                      {demoOrder.timeline.map((step, index) => (
                        <div key={index} className="flex mb-6 relative">
                          {/* Vertical line connecting steps */}
                          {index < demoOrder.timeline.length - 1 && (
                            <div className={`absolute left-[12px] top-6 w-0.5 h-full ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                          )}
                          
                          {/* Step icon */}
                          <div className="mr-4 flex-shrink-0">{step.icon}</div>
                          
                          {/* Step details */}
                          <div>
                            <h4 className={`font-medium ${step.completed ? 'text-luxury-black' : index === 4 ? 'text-luxury-gold' : 'text-gray-400'}`}>
                              {step.status}
                            </h4>
                            <p className={`text-sm ${step.completed ? 'text-luxury-gray' : 'text-gray-400'}`}>
                              {step.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-serif text-luxury-black mb-4">Items in Your Order</h3>
                    <div className="space-y-4">
                      {demoOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center border-b border-gray-100 pb-4">
                          <div className="w-20 h-20 flex-shrink-0 overflow-hidden">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="ml-4 flex-grow">
                            <p className="text-xs text-luxury-gray">{item.brand}</p>
                            <h4 className="text-luxury-black font-medium">{item.name}</h4>
                            <p className="text-luxury-gold">{item.price.toLocaleString()} MAD</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={resetForm}
                    className="px-6 py-2 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors inline-flex items-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Track Another Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderTrackingPage;
