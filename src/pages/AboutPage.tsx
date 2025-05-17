import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, Shield, Recycle } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Luxe Maroc</title>
        <meta name="description" content="Discover the story behind Luxe Maroc, our commitment to craftsmanship, and our vision for luxury goods." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg" 
            alt="Luxury craftsmanship" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">Our Story</h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            A journey of passion, craftsmanship, and timeless luxury
          </p>
        </div>
      </section>

      {/* Our Heritage */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-serif text-luxury-black mb-6">Our Heritage</h2>
              <p className="text-luxury-gray mb-4">
              Founded in 2019 in the heart of Casablanca, Luxe Maroc was created with a simple mission: to bring the world’s most iconic luxury brands closer to discerning Moroccan customers.
                 </p>
              <p className="text-luxury-gray mb-4">
              From the beginning, our focus has been on curation, not creation, carefully selecting timeless, high-end fashion pieces that blend global elegance with local sophistication.
                </p>
              <p className="text-luxury-gray">
              What started as a passion project has grown into a trusted destination for authentic luxury. Today, Luxe Maroc proudly offers a handpicked selection of designer items that reflect excellence, exclusivity, and effortless style.
                   </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img 
                src="https://images.pexels.com/photos/1036856/pexels-photo-1036856.jpeg" 
                alt="Luxe Maroc heritage" 
                className="w-full h-auto"
              />
              <div className="absolute -bottom-6 -left-6 bg-luxury-gold p-4 md:p-6">
                <p className="font-serif text-2xl text-luxury-black"> 2019</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Philosophy */}
      <section className="py-16 bg-luxury-cream">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif text-luxury-black mb-6">Our Philosophy</h2>
            <p className="text-luxury-gray mb-8">
            At Luxe Maroc, we believe that luxury is not just about price. It's about purpose, provenance, and presence. Our mission is to connect our customers with pieces that embody timeless style, exclusivity, and authenticity.
               </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Curation",
                  icon: <Search className="w-8 h-8 text-luxury-gold" />,
                  description: "We handpick every item with care. From iconic staples to rare drops, each piece reflects our standard of elegance and prestige."
                },
                {
                  title: "Authenticity",
                  icon: <Shield className="w-8 h-8 text-luxury-gold" />,
                  description: "All our products are sourced from trusted luxury houses and verified for their quality, origin, and condition. Trust is at the heart of luxury."
                },
                {
                  title: "Responsibility",
                  icon: <Recycle className="w-8 h-8 text-luxury-gold" />,
                  description: "We promote sustainability by responsibly sourcing and giving luxury fashion a second life through curated resale and limited editions"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 border border-gray-100 hover:border-luxury-gold/30 transition-colors text-center flex flex-col items-center"
                >
                  <div className="mb-5 w-16 h-16 rounded-full bg-luxury-black/5 flex items-center justify-center shadow-sm border border-luxury-gold/10">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-serif text-luxury-black mb-3">{item.title}</h3>
                  <p className="text-luxury-gray">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship Process
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-serif text-luxury-black text-center mb-10">Our Craftsmanship</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Design",
                description: "Our creative team blends traditional Moroccan aesthetics with contemporary style to create timeless designs.",
                image: "https://images.pexels.com/photos/3774903/pexels-photo-3774903.jpeg"
              },
              {
                title: "Material Selection",
                description: "We source the finest materials, from premium leathers to exquisite textiles, ensuring exceptional quality.",
                image: "https://images.pexels.com/photos/5692315/pexels-photo-5692315.jpeg"
              },
              {
                title: "Handcrafting",
                description: "Skilled artisans cut, stitch, and assemble each piece by hand, ensuring precision and attention to detail.",
                image: "https://images.pexels.com/photos/4254073/pexels-photo-4254073.jpeg"
              },
              {
                title: "Finishing",
                description: "Each creation undergoes rigorous quality control before receiving the final Luxe Maroc seal of approval.",
                image: "https://images.pexels.com/photos/8148446/pexels-photo-8148446.jpeg"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="overflow-hidden"
              >
                <div className="aspect-square overflow-hidden mb-4">
                  <img 
                    src={step.image} 
                    alt={step.title} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <h3 className="text-xl font-serif text-luxury-black mb-2">{step.title}</h3>
                <p className="text-luxury-gray">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      

     
    </>
  );
};

export default AboutPage;