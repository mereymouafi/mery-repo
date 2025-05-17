import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { HelpCircle, ChevronDown, ChevronUp, Phone, Mail } from 'lucide-react';

// FAQ Accordion Component
const FAQItem: React.FC<{
  question: string;
  answer: string | React.ReactNode;
}> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 py-4">
      <button
        className="flex w-full justify-between items-center text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="font-serif text-lg text-luxury-black">{question}</h3>
        <span className="text-luxury-gold ml-2">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>
      
      <div
        className={`mt-2 text-luxury-gray overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {typeof answer === 'string' ? <p>{answer}</p> : answer}
      </div>
    </div>
  );
};

const FAQPage: React.FC = () => {
  const faqs = {
    orders: [
      {
        question: "How can I track my order?",
        answer: "Once your order ships, you'll receive a confirmation email with tracking information. You can also track your order by logging into your account or visiting our Order Tracking page with your order number and email."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. For Moroccan customers, we also offer cash on delivery and mobile payment options."
      },
      {
        question: "Can I modify or cancel my order?",
        answer: "Orders can be modified or canceled within 1 hour of placement. Please contact our customer service team immediately if you need to make changes."
      },
      {
        question: "Do you offer gift wrapping?",
        answer: "Yes, we offer premium gift wrapping services. You can select this option during checkout for an additional fee."
      }
    ],
    products: [
      {
        question: "How do I know the products are authentic?",
        answer: "All products sold by Luxe Maroc are 100% authentic. We source directly from brands or authorized retailers and provide authenticity documentation with each purchase."
      },
      {
        question: "What if the item I want is out of stock?",
        answer: "You can sign up for stock notifications on the product page. Alternatively, contact our concierge service who may be able to source the item for you."
      },
      {
        question: "Do you offer product customization?",
        answer: "For select luxury items, we do offer personalization services. Please contact our customer service team to discuss your specific requirements."
      },
      {
        question: "How do I care for my luxury items?",
        answer: "Each product comes with specific care instructions. For additional guidance, our customer service team can provide specialized advice for your particular item."
      }
    ],
    shipping: [
      {
        question: "How long will it take to receive my order?",
        answer: "Delivery times vary based on your location. Within Morocco, standard delivery takes 1-3 business days. International shipping typically takes 3-14 business days depending on the destination."
      },
      {
        question: "Do you ship internationally?",
        answer: "Yes, we ship to select countries worldwide. Shipping rates and delivery times vary by destination."
      },
      {
        question: "Is shipping free?",
        answer: "We offer free standard shipping on domestic orders over 1000 MAD. International shipping and express delivery options are available at an additional cost."
      }
    ],
    returns: [
      {
        question: "What is your return policy?",
        answer: "Eligible items can be returned within 7 days of delivery. Items must be in original condition with all tags attached and original packaging."
      },
      {
        question: "How do I return an item?",
        answer: "Contact our customer service at returns@luxemaroc.com to initiate the return process. We'll provide you with a return authorization and shipping instructions."
      },
      {
        question: "How long do refunds take to process?",
        answer: "Once we receive your return, it takes 1-2 business days to inspect the item. After approval, refunds typically take 5-7 business days to appear on your original payment method."
      },
      {
        question: "Are there any items that cannot be returned?",
        answer: "Special orders, customized items, and final sale items cannot be returned. Please check product descriptions for any return policy exceptions."
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | Luxe Maroc</title>
        <meta name="description" content="Find answers to common questions about Luxe Maroc products, orders, shipping, and returns." />
      </Helmet>

      {/* Header Section */}
      <section className="py-16 bg-luxury-cream">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6 p-4 rounded-full bg-white shadow-sm border border-luxury-gold/20 flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-luxury-gold" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-luxury-black mb-4">FAQ</h1>
            <p className="text-luxury-gray max-w-2xl mx-auto">
              Have questions? We've got answers — from sizing and payment to delivery and authenticity.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <h2 className="text-2xl font-serif text-luxury-black mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-luxury-gold/10 flex items-center justify-center mr-3 text-luxury-gold text-sm">1</span>
                Orders & Payment
              </h2>
              <div className="bg-white p-6 shadow-sm">
                {faqs.orders.map((faq, index) => (
                  <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-serif text-luxury-black mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-luxury-gold/10 flex items-center justify-center mr-3 text-luxury-gold text-sm">2</span>
                Products & Authenticity
              </h2>
              <div className="bg-white p-6 shadow-sm">
                {faqs.products.map((faq, index) => (
                  <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-serif text-luxury-black mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-luxury-gold/10 flex items-center justify-center mr-3 text-luxury-gold text-sm">3</span>
                Shipping & Delivery
              </h2>
              <div className="bg-white p-6 shadow-sm">
                {faqs.shipping.map((faq, index) => (
                  <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-serif text-luxury-black mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-luxury-gold/10 flex items-center justify-center mr-3 text-luxury-gold text-sm">4</span>
                Returns & Refunds
              </h2>
              <div className="bg-white p-6 shadow-sm">
                {faqs.returns.map((faq, index) => (
                  <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>

            <div className="text-center mt-16 py-8 bg-luxury-cream">
              <h3 className="text-xl font-serif text-luxury-black mb-3">Still have questions?</h3>
              <p className="text-luxury-gray mb-6">
                Our customer service team is ready to assist you with any inquiries.
              </p>
              <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                <a 
                  href="tel:0675-597187" 
                  className="inline-flex items-center px-6 py-3 bg-luxury-gold text-white hover:bg-luxury-gold/90 transition-colors"
                >
                  <Phone size={16} className="mr-2" />
                  0675‑597187
                </a>
                <a 
                  href="mailto:contact@luxemaroc.com" 
                  className="inline-flex items-center px-6 py-3 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors"
                >
                  <Mail size={16} className="mr-2" />
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQPage;
