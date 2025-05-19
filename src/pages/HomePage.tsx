import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import { getBrands, Brand } from '../lib/brandService';
import { getCategories, Category } from '../lib/categoryService';
import { getLatestProducts, Product as SupabaseProduct } from '../lib/productService';

// Using external luxury image URLs for slideshow

// Function to generate a slug from a product name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// Luxury Slideshow Component with Swiper for mobile optimization
const LuxurySlideshow: React.FC = () => {
  // Premium product images for the slideshow
  const slides = [
    {
      image: "https://www.mrporter.com/variants/images/1647597339854985/ou/w960_q80.jpg",
      alt: "Premium Jacquemus shirt with detailed craftsmanship"
    },
    {
      image: "https://www.mrporter.com/variants/images/1647597339854985/cu/w960_q80.jpg",
      alt: "Luxury Jacquemus shirt detail view"
    },
    {
      image: "https://www.prada.com/content/dam/pradabkg_products/2/2DE/2DE127/055F0002/2DE127_055_F0002_F_G000_MDL.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg",
      alt: "Elegant Prada footwear with premium design"
    },
    {
      image: "https://www.prada.com/content/dam/pradabkg_products/2/2DE/2DE127/055F0002/2DE127_055_F0002_F_G000_SLT.jpg/_jcr_content/renditions/cq5dam.web.hebebed.1000.1000.jpg",
      alt: "Prada luxury footwear detail shot"
    },
    {
      image: "https://brattelifamilystores.com/cdn/shop/files/0400021093619_BLACKFOLIAGE_A1_540x.webp?v=1734120080",
      alt: "Premium black foliage design accessory"
    }
  ];

  // Using Swiper for mobile-optimized slideshow
  useEffect(() => {
    // Import Swiper and modules dynamically to ensure they load only on client-side
    const loadSwiper = async () => {
      try {
        const Swiper = await import('swiper');
        const { Pagination, Autoplay, EffectFade } = await import('swiper/modules');
        
        // Initialize Swiper
        const swiper = new Swiper.default('.luxury-swiper', {
          modules: [Pagination, Autoplay, EffectFade],
          slidesPerView: 1,
          effect: 'fade',
          fadeEffect: {
            crossFade: true
          },
          speed: 1500,
          loop: true,
          autoplay: {
            delay: 5000,
            disableOnInteraction: false,
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
            renderBullet: function (index, className) {
              return `<span class="${className} w-12 h-[2px] bg-white/40 hover:bg-luxury-gold transition-all duration-300"></span>`;
            },
          },
        });
        
        return () => {
          swiper.destroy();
        };
      } catch (error) {
        console.error('Failed to load Swiper:', error);
      }
    };
    
    loadSwiper();
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Golden overlay for warm luxury lighting effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-luxury-gold/10 to-transparent opacity-40 z-10 pointer-events-none mix-blend-overlay"></div>
      
      {/* Swiper container */}
      <div className="luxury-swiper w-full h-full">
        <div className="swiper-wrapper">
          {slides.map((slide, index) => (
            <div key={index} className="swiper-slide">
              <div className="relative w-full h-full">
                <img 
                  src={slide.image} 
                  alt={slide.alt}
                  className="w-full h-full object-cover filter brightness-[0.97] contrast-[1.05]" 
                  loading="lazy"
                  style={{ objectPosition: 'center center' }}
                />
                
                {/* Mobile-optimized caption overlay - only visible on smaller screens */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-sm md:hidden">
                  <p className="text-white/90 text-sm font-serif italic">{slide.alt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Custom pagination with gold accent for active slide */}
        <div className="swiper-pagination absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2"></div>
      </div>
    </div>
  );
};

// Brands Display Component
const BrandsDisplay: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        console.log('BrandsDisplay: Starting brand fetch');
        
        const { data, error } = await getBrands();
        
        if (error) {
          console.error('BrandsDisplay: Error from getBrands:', error);
          setDebugInfo(`Error details: ${error.message}`);
          setError('Failed to load brands. Check console for details.');
          return;
        }
        
        console.log('BrandsDisplay: Received data:', data);
        
        if (data && data.length > 0) {
          console.log(`BrandsDisplay: Setting ${data.length} brands`);
          setBrands(data);
        } else {
          console.log('BrandsDisplay: No brands found in data');
          setBrands([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('BrandsDisplay: Exception in fetchBrands:', err);
        setDebugInfo(`Exception: ${errorMessage}`);
        setError('Failed to load brands. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border border-luxury-gold/20"></div>
          <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-t-2 border-luxury-gold delay-150"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-luxury-gold/10 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="border border-luxury-gold/10 bg-white p-8 shadow-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-luxury-black/5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-luxury-gold" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-serif text-luxury-black mb-2">Unable to Load Brands</h3>
          <p className="text-luxury-gray mb-4">{error}</p>
          {debugInfo && (
            <p className="text-xs text-luxury-gray/70 mb-6 px-4 py-2 bg-luxury-black/5 rounded-sm">{debugInfo}</p>
          )}
          <button 
            className="mt-2 px-6 py-2.5 bg-white border border-luxury-gold text-luxury-gold text-sm tracking-wider uppercase hover:bg-luxury-gold hover:text-white transition-colors duration-300"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="border border-luxury-gold/10 bg-white p-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-luxury-black/5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-luxury-gold" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-serif text-luxury-black mb-2">No Luxury Brands Found</h3>
          <p className="text-luxury-gray mb-1">Your collection awaits its first exclusive brand.</p>
          <p className="text-sm text-luxury-gray/70">Please add brands to your Supabase database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex flex-wrap justify-center items-center gap-8">
        {brands.map((brand) => (
          <Link 
            key={brand.id} 
            to={`/shop?brand=${brand.slug}`} 
            className="group"
          >
            <motion.div 
              className="relative bg-white border border-gray-100 rounded-none overflow-hidden transition-all duration-500 hover:border-luxury-gold/30 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)]"
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="pt-8 px-10 pb-6 flex flex-col items-center">
                {brand.image ? (
                  <div className="h-24 w-full flex items-center justify-center mb-6">
                    <img 
                      src={brand.image} 
                      alt={brand.name} 
                      className="max-h-full max-w-full object-contain transition-all duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 flex items-center justify-center mb-6 bg-luxury-black/5 rounded-full">
                    <span className="text-luxury-gold text-2xl font-serif">{brand.name.charAt(0)}</span>
                  </div>
                )}
                
                <h3 className="text-center text-luxury-black text-lg font-serif tracking-wide group-hover:text-luxury-gold transition-colors duration-300">
                  {brand.name}
                </h3>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};



const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [latestProducts, setLatestProducts] = useState<SupabaseProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const { data, error } = await getCategories();
        if (error) {
          console.error('Error fetching categories:', error);
        } else {
          // Get up to 6 categories to display
          setCategories(data?.slice(0, 6) || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch latest products from Supabase
  useEffect(() => {
    const fetchLatestProducts = async () => {
      setLoadingProducts(true);
      setProductError(null);
      try {
        const { data, error } = await getLatestProducts(4);
        if (error) {
          console.error('Error fetching latest products:', error);
          setProductError('Failed to load latest products. Please try again later.');
        } else if (data && data.length > 0) {
          // Process the data to ensure images are in the right format
          const processedData = data.map((product) => {
            // Process images
            let images = product.images;
            if (typeof images === 'string') {
              try {
                images = JSON.parse(images);
              } catch (e) {
                images = [product.image];
              }
            } else if (!images) {
              images = [product.image];
            }
            
            // Generate a slug if one doesn't exist
            const slug = product.slug || generateSlug(product.name);
            
            return {
              ...product,
              images,
              slug
            };
          });
          
          setLatestProducts(processedData);
        } else {
          setLatestProducts([]);
        }
      } catch (err) {
        console.error('Failed to fetch latest products:', err);
        setProductError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoadingProducts(false);
      }
    };
    
    fetchLatestProducts();
  }, []);

  return (
    <>
      <Helmet>
        <title>Luxe Maroc | Premium Luxury Goods</title>
        <meta name="description" content="Discover the finest luxury goods at Luxe Maroc. Elegant designs, exceptional quality, worldwide shipping." />
      </Helmet>

      {/* Hero Section with Luxury Slideshow */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden p-0 m-0">
        <div className="absolute inset-0 z-0 w-full h-full p-0 m-0">
          <LuxurySlideshow />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
        
        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-4">Exceptional Luxury</h1>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Experience the pinnacle of craftsmanship and design with our exquisite collection
            </p>
            <div className="space-x-4">
              <Link to="/shop" className="btn btn-gold">
                Shop Collection
              </Link>
              <Link to="/about" className="btn btn-secondary bg-transparent border border-white text-white hover:bg-white hover:text-luxury-black">
                Our Story
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-luxury-cream">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-luxury-black mb-3">Shop Categories</h2>
            <p className="text-luxury-gray max-w-2xl mx-auto">
              Explore our carefully curated collections of the finest luxury goods
            </p>
          </div>
          
          {loadingCategories ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-luxury-gold border-opacity-50 border-r-luxury-gold"></div>
              <p className="mt-2 text-luxury-gray">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 col-span-3">
              <p className="text-luxury-gray">No categories found. Visit the admin dashboard to add some!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden"
                >
                  <Link to={`/shop/${category.slug}`} className="block relative aspect-[3/4] overflow-hidden">
                    <img 
                      src={category.image || 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                      <h3 className="text-white font-serif text-xl mb-2">{category.name}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-white opacity-80 hover:text-luxury-gold transition-colors group-hover:opacity-100">
                          Shop Now
                        </span>
                        <ArrowRight className="text-luxury-gold" size={16} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Luxury Brands */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-luxury-black mb-3">Luxury Brands</h2>
            <p className="text-luxury-gray max-w-2xl mx-auto">
              Discover our exclusive selection of the world's most prestigious brands
            </p>
          </div>
          
          {/* Brands Display */}
          <BrandsDisplay />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-luxury-black mb-3">New Arrivals</h2>
            <p className="text-luxury-gray max-w-2xl mx-auto">
              Discover our latest additions to the Luxe Maroc collection
            </p>
          </div>
          
          {loadingProducts ? (
            <div className="flex justify-center items-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border border-luxury-gold/20"></div>
                <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-t-2 border-luxury-gold delay-150"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 bg-luxury-gold/10 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : productError ? (
            <div className="text-center py-12 max-w-md mx-auto">
              <div className="border border-luxury-gold/10 bg-white p-8 shadow-sm">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-luxury-black/5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-luxury-gold" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif text-luxury-black mb-2">Unable to Load Products</h3>
                <p className="text-luxury-gray mb-4">{productError}</p>
                <button 
                  className="mt-2 px-6 py-2.5 bg-white border border-luxury-gold text-luxury-gold text-sm tracking-wider uppercase hover:bg-luxury-gold hover:text-white transition-colors duration-300"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </button>
              </div>
            </div>
          ) : latestProducts.length === 0 ? (
            <div className="text-center py-12 max-w-md mx-auto">
              <div className="border border-luxury-gold/10 bg-white p-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-luxury-black/5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-luxury-gold" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif text-luxury-black mb-2">No Products Found</h3>
                <p className="text-luxury-gray mb-1">Your shop awaits its first product.</p>
                <p className="text-sm text-luxury-gray/70">Please add products to your Supabase database.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestProducts.map((product) => {
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="group product-card-hover"
                  >
                    <Link to={`/product/${product.slug || generateSlug(product.name)}`} className="block">
                      <div className="relative aspect-square overflow-hidden mb-4">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="btn btn-gold w-full text-sm py-2">
                            Quick View
                          </button>
                        </div>
                      </div>
                      <div className="uppercase text-xs text-luxury-gray tracking-wider mb-1">
                        {product.brand}
                      </div>
                      <h3 className="font-serif text-luxury-black text-lg mb-1">{product.name}</h3>
                      <p className="text-luxury-gold font-medium">{product.price.toLocaleString()} MAD</p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link to="/shop" className="btn btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-16 bg-luxury-black text-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <img 
                src="https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg" 
                alt="Artisan crafting a luxury bag" 
                className="w-full h-auto"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="max-w-xl"
            >
              <h2 className="text-3xl md:text-4xl font-serif text-luxury-gold mb-6">Curated Luxury. Timeless Style.</h2>
              <p className="mb-4 text-gray-300">
              At Luxe Maroc, we believe true luxury lies in the details, not just in how something is made, but in how it's chosen. Since our launch, we have been dedicated to bringing Morocco the finest selection of iconic fashion and lifestyle pieces from the world’s most prestigious brands.


                 </p>
              <p className="mb-6 text-gray-300">
              We don’t create; we curate. Each item in our collection is handpicked for its craftsmanship, exclusivity, and timeless appeal. Whether it’s a rare drop or a classic staple, Luxe Maroc is your trusted source for authentic, high-end elegance, ready to elevate your wardrobe.


                </p>
              <Link to="/about" className="btn btn-gold">
                Discover Our Story
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-luxury-black mb-3">Client Experiences</h2>
            <p className="text-luxury-gray max-w-2xl mx-auto">
              What our valued clients say about their Luxe Maroc experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                id: 1, 
                name: 'Sophia Laurent', 
                location: 'Paris, France',
                quote: 'The craftsmanship of my Luxe Maroc bag is exceptional. Every detail is perfect, and it has become my favorite accessory for every occasion.' 
              },
              { 
                id: 2, 
                name: 'Jonathan Pierce', 
                location: 'New York, USA',
                quote: 'The quality and design of Luxe Maroc products are unmatched. Their attention to detail and customer service exceed all expectations.' 
              },
              { 
                id: 3, 
                name: 'Isabella Rossi', 
                location: 'Milan, Italy',
                quote: 'As someone who appreciates fine craftsmanship, I can say that Luxe Maroc delivers on its promise of luxury and elegance.' 
              },
            ].map((testimonial) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: testimonial.id * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-6 border border-gray-100"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-luxury-gold rounded-full flex items-center justify-center text-luxury-black font-serif text-xl">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-luxury-black">{testimonial.name}</h3>
                    <p className="text-sm text-luxury-gray">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-luxury-gray italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Newsletter */}
      <section className="py-16 bg-luxury-cream">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif text-luxury-black mb-4">Join Our Community</h2>
            <p className="text-luxury-gray mb-8">
              Subscribe to our newsletter to receive updates on new collections, exclusive offers, and invitations to events.
            </p>
            
            <form className="max-w-md mx-auto">
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="luxury-input flex-grow"
                  required 
                />
                <button type="submit" className="btn btn-primary whitespace-nowrap">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-luxury-gray mt-3">
                By subscribing, you agree to our <Link to="/privacy-policy" className="underline">Privacy Policy</Link> and consent to receive updates from Luxe Maroc.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;