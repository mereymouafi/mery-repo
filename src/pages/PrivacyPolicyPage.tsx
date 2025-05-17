import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, LockIcon } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Luxe Maroc</title>
        <meta name="description" content="Learn about our privacy practices and how we protect your personal information at Luxe Maroc." />
      </Helmet>

      {/* Header Section */}
      <section className="py-16 bg-luxury-cream">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6 p-4 rounded-full bg-white shadow-sm border border-luxury-gold/20 flex items-center justify-center">
              <LockIcon className="w-8 h-8 text-luxury-gold" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-luxury-black mb-4">Privacy Policy</h1>
            <p className="text-luxury-gray max-w-2xl mx-auto">
              Your trust and privacy are our highest priorities
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="prose max-w-none"
            >
              <div className="space-y-6 text-center">
                <p className="text-luxury-gray leading-relaxed">
                  At Luxe Maroc, we value discretion as much as we value style. When you shop with us, you're not just purchasing a luxury item, you're trusting us with your information, and that trust means everything.
                </p>
                
                <p className="text-luxury-gray leading-relaxed">
                  We handle your personal data with care, only using it to deliver your orders, assist you when needed, and offer you a seamless shopping experience.
                </p>
                
                <p className="text-luxury-gray leading-relaxed">
                  We do not sell your information. We don't believe in spam. And we never share your details with anyone we wouldn't trust with our own.
                </p>
                
                <div className="py-4 px-6 bg-luxury-cream my-8 border-l-4 border-luxury-gold text-left">
                  <p className="text-luxury-black font-serif italic mb-1">Our promise?</p>
                  <p className="text-luxury-black font-medium">Your information stays as exclusive as the pieces we curate.</p>
                </div>
              
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <Mail className="w-5 h-5 text-luxury-gold" />
                  <p className="text-luxury-gray">
                    If you ever want to review, change, or delete your information, just reach out:&nbsp;
                    <a href="mailto:contact@luxemaroc.com" className="text-luxury-gold hover:underline">contact@luxemaroc.com</a>
                  </p>
                </div>
                
                <p className="text-center text-luxury-gray/70 text-sm mt-4">
                  Last updated: May 2025
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicyPage;
