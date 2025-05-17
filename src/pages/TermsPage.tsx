import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions | Luxe Maroc</title>
        <meta name="description" content="Review the terms and conditions for shopping with Luxe Maroc." />
      </Helmet>

      {/* Header Section */}
      <section className="py-16 bg-luxury-cream">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6 p-4 rounded-full bg-white shadow-sm border border-luxury-gold/20 flex items-center justify-center">
              <FileText className="w-8 h-8 text-luxury-gold" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-luxury-black mb-4">Terms & Conditions</h1>
            <p className="text-luxury-gray max-w-2xl mx-auto">
              Our commitment to transparent and fair business practices
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 shadow-sm">
              <p className="text-luxury-gray mb-6">
                By shopping with Luxe Maroc, you agree to our terms regarding pricing, availability, order processing, and the use of our platform. Please take a moment to familiarize yourself with these terms.
              </p>
              
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-serif text-luxury-black mb-3 pb-2 border-b border-luxury-gold/30">
                    General Terms
                  </h2>
                  <p className="text-luxury-gray mb-4">
                    These terms and conditions govern your use of the Luxe Maroc website and services. By accessing our website or placing an order, you agree to be bound by these terms and conditions.
                  </p>
                  <p className="text-luxury-gray">
                    Luxe Maroc reserves the right to modify these terms at any time. Changes will be effective immediately upon posting on the website. Your continued use of the website constitutes your acceptance of the modified terms.
                  </p>
                </div>
                
                <div>
                  <h2 className="text-xl font-serif text-luxury-black mb-3 pb-2 border-b border-luxury-gold/30">
                    Products & Pricing
                  </h2>
                  <p className="text-luxury-gray mb-4">
                    All products are subject to availability. We reserve the right to discontinue any product at any time. If a product is unavailable after you place your order, we will notify you and offer a refund or alternative.
                  </p>
                  <p className="text-luxury-gray mb-4">
                    Prices for products are subject to change without notice. We make every effort to display accurate pricing, but errors may occur. If we discover an error in the price of products you have ordered, we will inform you and give you the option of continuing with the order at the correct price or canceling it.
                  </p>
                  <p className="text-luxury-gray">
                    All prices are displayed in Moroccan Dirhams (MAD) and include applicable taxes unless otherwise stated.
                  </p>
                </div>
                
                <div>
                  <h2 className="text-xl font-serif text-luxury-black mb-3 pb-2 border-b border-luxury-gold/30">
                    Order Acceptance & Processing
                  </h2>
                  <p className="text-luxury-gray mb-4">
                    Receipt of your order confirmation does not constitute our acceptance of your order. We reserve the right to accept or decline your order for any reason up until the point of shipping.
                  </p>
                  <p className="text-luxury-gray">
                    Once your order is confirmed, you will receive an email confirmation with your order details. You can also view your order status in your account dashboard.
                  </p>
                </div>
                
                <div>
                  <h2 className="text-xl font-serif text-luxury-black mb-3 pb-2 border-b border-luxury-gold/30">
                    Payment Terms
                  </h2>
                  <p className="text-luxury-gray">
                    Payment for all orders must be made in full at the time of purchase. We accept various payment methods as listed on our website. For security purposes, we may verify your payment information before processing your order.
                  </p>
                </div>
                
                <div>
                  <h2 className="text-xl font-serif text-luxury-black mb-3 pb-2 border-b border-luxury-gold/30">
                    Shipping & Delivery
                  </h2>
                  <p className="text-luxury-gray mb-4">
                    Shipping times and costs vary based on destination and shipping method selected. Estimated delivery times are provided at checkout but are not guaranteed. Delays may occur due to customs, weather, or other factors beyond our control.
                  </p>
                  <p className="text-luxury-gray">
                    Risk of loss and title for items purchased pass to you upon delivery of the items to the carrier. You are responsible for filing any claims with carriers for damaged or lost shipments.
                  </p>
                </div>
                
                <div>
                  <h2 className="text-xl font-serif text-luxury-black mb-3 pb-2 border-b border-luxury-gold/30">
                    Returns & Refunds
                  </h2>
                  <p className="text-luxury-gray">
                    Our return policy allows for returns within 7 days of delivery for most items. Please refer to our Shipping & Returns page for detailed information about our return process, eligible items, and refund procedures.
                  </p>
                </div>
                
                <div>
                  <h2 className="text-xl font-serif text-luxury-black mb-3 pb-2 border-b border-luxury-gold/30">
                    Intellectual Property
                  </h2>
                  <p className="text-luxury-gray">
                    All content on the Luxe Maroc website, including text, graphics, logos, images, and software, is the property of Luxe Maroc or its content suppliers and is protected by international copyright laws. Unauthorized use of any materials on our website may violate copyright, trademark, and other laws.
                  </p>
                </div>
                
                <div>
                  <h2 className="text-xl font-serif text-luxury-black mb-3 pb-2 border-b border-luxury-gold/30">
                    Limitation of Liability
                  </h2>
                  <p className="text-luxury-gray">
                    Luxe Maroc shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of our website or services. Our liability is limited to the amount paid for the product or service that is the subject of the claim.
                  </p>
                </div>
                
                <div>
                  <h2 className="text-xl font-serif text-luxury-black mb-3 pb-2 border-b border-luxury-gold/30">
                    Contact Information
                  </h2>
                  <p className="text-luxury-gray">
                    If you have any questions about these Terms & Conditions, please contact us at legal@luxemaroc.com or call us at +212 675597187.
                  </p>
                </div>
              </div>
              
              <div className="mt-10 text-center">
                <p className="text-luxury-gray text-sm italic">
                  Last updated: May 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TermsPage;
