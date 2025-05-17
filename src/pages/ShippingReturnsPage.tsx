import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Truck, RotateCcw } from 'lucide-react';

const ShippingReturnsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Shipping & Returns | Luxe Maroc</title>
        <meta name="description" content="Learn about our shipping and return policies at Luxe Maroc." />
      </Helmet>

      {/* Header Section */}
      <section className="py-16 bg-luxury-cream">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6 p-4 rounded-full bg-white shadow-sm border border-luxury-gold/20 flex items-center justify-center">
              <Truck className="w-8 h-8 text-luxury-gold" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-luxury-black mb-4">Shipping & Returns</h1>
            <p className="text-luxury-gray max-w-2xl mx-auto">
              Delivering luxury with exceptional care
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 shadow-sm">
              <div className="flex items-center mb-8">
                <div className="mr-4 p-3 rounded-full bg-luxury-gold/10">
                  <Truck className="w-6 h-6 text-luxury-gold" />
                </div>
                <h2 className="text-2xl font-serif text-luxury-black">Shipping Policy</h2>
              </div>
              
              <div className="space-y-4 mb-12">
                <p className="text-luxury-gray">
                  We offer secure delivery across Morocco and select international destinations. Every Luxe Maroc purchase is carefully packaged to ensure it reaches you in perfect condition.
                </p>
                
                <div className="bg-luxury-cream p-6 border-l-2 border-luxury-gold">
                  <h3 className="font-medium text-luxury-black mb-2">Domestic Shipping (Morocco)</h3>
                  <ul className="list-disc pl-5 text-luxury-gray space-y-1">
                    <li>Standard Delivery: 1-3 business days (Free for orders over 1000 MAD)</li>
                    <li>Express Delivery: Next business day (Available for select areas)</li>
                    <li>Casablanca Same-Day: Order before 11am for same-day delivery</li>
                  </ul>
                </div>
                
                <div className="bg-luxury-cream p-6 border-l-2 border-luxury-gold">
                  <h3 className="font-medium text-luxury-black mb-2">International Shipping</h3>
                  <ul className="list-disc pl-5 text-luxury-gray space-y-1">
                    <li>Europe: 3-5 business days</li>
                    <li>Middle East: 4-6 business days</li>
                    <li>United States & Canada: 5-7 business days</li>
                    <li>Rest of World: 7-14 business days</li>
                  </ul>
                </div>
                
                <p className="text-luxury-gray text-sm italic">
                  *All shipping timeframes are estimates and may vary based on customs clearance and local delivery conditions.
                </p>
              </div>
              
              <div className="flex items-center mb-8">
                <div className="mr-4 p-3 rounded-full bg-luxury-gold/10">
                  <RotateCcw className="w-6 h-6 text-luxury-gold" />
                </div>
                <h2 className="text-2xl font-serif text-luxury-black">Returns & Exchanges</h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-luxury-gray">
                  If you're not satisfied with your purchase, eligible items can be returned within 7 days in original condition. We want every Luxe Maroc experience to be exceptional.
                </p>
                
                <h3 className="font-medium text-luxury-black mt-6 mb-2">Return Process:</h3>
                <ol className="list-decimal pl-5 text-luxury-gray space-y-2">
                  <li>
                    <span className="font-medium">Initiate Your Return</span>
                    <p className="mt-1">Contact our customer service team at returns@luxemaroc.com to request a return authorization.</p>
                  </li>
                  <li>
                    <span className="font-medium">Packaging</span>
                    <p className="mt-1">Ensure all items are in their original condition with all tags attached and original packaging.</p>
                  </li>
                  <li>
                    <span className="font-medium">Shipping</span>
                    <p className="mt-1">Use a secure, trackable shipping method to return your items to our provided address.</p>
                  </li>
                  <li>
                    <span className="font-medium">Refund</span>
                    <p className="mt-1">Once received and inspected, your refund will be processed to your original payment method within 5-7 business days.</p>
                  </li>
                </ol>
                
                <div className="bg-luxury-cream p-6 mt-8 border-l-2 border-luxury-gold">
                  <h3 className="font-medium text-luxury-black mb-2">Return Eligibility</h3>
                  <p className="text-luxury-gray mb-3">Items must be:</p>
                  <ul className="list-disc pl-5 text-luxury-gray space-y-1">
                    <li>Unworn, unwashed, and unaltered</li>
                    <li>With original tags attached</li>
                    <li>In original packaging</li>
                    <li>Returned within 7 days of delivery</li>
                  </ul>
                </div>
                
                <p className="text-luxury-gray mt-6">
                  For special orders, customized items, and sale items, please note that different return policies may apply. Please contact customer service for details.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <p className="text-luxury-gray">
                Need more assistance? Our customer service team is ready to help.
              </p>
              <a 
                href="tel:0675-597187" 
                className="inline-block mt-3 px-8 py-3 bg-luxury-gold text-white hover:bg-luxury-gold/90 transition-colors mr-4"
              >
                Call Us: 0675‑597187
              </a>
              <a 
                href="mailto:contact@luxemaroc.com" 
                className="inline-block mt-3 px-8 py-3 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShippingReturnsPage;
