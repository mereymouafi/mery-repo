import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Minus, Plus, Share, Heart, Check, ShoppingBag, ChevronRight, X, ZoomIn, Maximize } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Supabase client
import { supabase } from '../lib/supabase';
import { getRelatedProducts, Product as SupabaseProduct } from '../lib/productService';

// Types
import { Product } from '../data/products';
import { CartContext } from '../context/CartContext';

// Type for products coming from Supabase
type ProductWithSlug = SupabaseProduct & { slug?: string };

const ProductDetailPage: React.FC = () => {
  // Modified to use both slug and id from URL parameters
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomedImageIndex, setZoomedImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const maxZoomLevel = 2.5;
  const minZoomLevel = 0.5;
  const zoomStep = 0.25;

  // State for related products
  const [relatedProducts, setRelatedProducts] = useState<ProductWithSlug[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [relatedError, setRelatedError] = useState<string | null>(null);

  // Generate a URL-friendly slug from the product name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Get cart context
  const { addToCart } = useContext(CartContext);

  // Fetch product from Supabase
  useEffect(() => {
    const fetchProduct = async () => {
      // Exit if we don't have either a slug or an ID
      if (!slug && !id) return;

      setLoading(true);
      setError(null);

      try {
        // Start with a basic query
        let productData = null;

        // APPROACH 1: If we have an ID, use that first (backward compatibility)
        if (id) {
          const isNumeric = /^\d+$/.test(id);
          let query = supabase.from('products').select('*');
          
          if (isNumeric) {
            query = query.eq('id', parseInt(id));
          } else {
            query = query.eq('id', id);
          }
          
          const { data, error } = await query.single();
          
          if (error) {
            console.error('Error fetching product by ID:', error);
          } else if (data) {
            productData = data;
            console.log('Found product by ID:', data.name);
          }
        }
        
        // APPROACH 2: If we have a slug OR if ID search failed, try slug-based search
        if ((!productData && slug) || (slug && !id)) {
          console.log('Trying to find product by slug:', slug);
          
          // Get all products 
          const { data: allProducts, error: listError } = await supabase
            .from('products')
            .select('*');
          
          if (listError) {
            console.error('Error fetching products:', listError);
          } else if (allProducts && allProducts.length > 0) {
            console.log(`Found ${allProducts.length} products, searching for match...`);
            
            // First try: exact slug match
            const exactSlugMatch = allProducts.find(product => {
              // Check for an exact match on the slug field first
              if (product.slug && product.slug.toLowerCase() === slug.toLowerCase()) {
                return true;
              }
              
              // Also check if the slug we would generate from the name matches
              const generatedSlug = generateSlug(product.name);
              return generatedSlug === slug;
            });
            
            if (exactSlugMatch) {
              console.log('Found exact slug match:', exactSlugMatch.name);
              productData = exactSlugMatch;
            } else {
              // If exact match fails, score products by relevance to the slug
              const scoredMatches = allProducts
                .map(product => {
                  if (!product.name) return { product, score: 0 };
                  
                  const productName = product.name.toLowerCase();
                  const searchTerms = slug.split('-').filter(term => term.length >= 3);
                  
                  // Calculate a score based on how many terms match and their position in the name
                  let score = 0;
                  searchTerms.forEach(term => {
                    if (productName.includes(term.toLowerCase())) {
                      // Terms appearing earlier in the name get higher scores
                      const position = productName.indexOf(term.toLowerCase());
                      score += 10 - (position / productName.length) * 5;
                    }
                  });
                  
                  // Boost score for products with matching category terms in the slug
                  if (product.category && typeof product.category === 'string' && 
                      slug.includes(product.category.toLowerCase())) {
                    score += 5;
                  }
                  
                  return { product, score };
                })
                .filter(item => item.score > 0) // Only keep products with some match
                .sort((a, b) => b.score - a.score); // Sort by descending score
              
              console.log('Scored matches:', scoredMatches.map(m => ({ name: m.product.name, score: m.score })));
              
              if (scoredMatches.length > 0) {
                productData = scoredMatches[0].product;
                console.log('Best match by score:', productData.name, 'with score', scoredMatches[0].score);
              }
            }
          }
        }
        
        // If we found a product through any approach, process it
        if (productData) {
          // Process images (convert from string to array if needed)
          let images = productData.images;
          if (typeof images === 'string') {
            try {
              images = JSON.parse(images);
            } catch (e) {
              images = [productData.image]; 
            }
          } else if (!images || !images.length) {
            images = [productData.image];
          }

          // Process sizes (convert from string to array if needed)
          let sizes = productData.sizes;
          if (typeof sizes === 'string') {
            try {
              sizes = JSON.parse(sizes);
            } catch (e) {
              if (sizes) {
                sizes = sizes.split(',').map((size: string) => size.trim());
              } else {
                sizes = [];
              }
            }
          }
          
          // Generate slug if product doesn't have one
          const productSlug = productData.slug || generateSlug(productData.name);
          
          // If we're accessing via ID but we have a slug, redirect to the slug URL
          if (id && !slug && productSlug) {
            navigate(`/product/${productSlug}`, { replace: true });
            return;
          }

          // Create the final processed product
          const processedProduct = {
            ...productData,
            images,
            sizes,
            slug: productSlug
          };

          setProduct(processedProduct);
          document.title = `${productData.name} | Luxe Maroc`;
          
          // Fetch related products from the same category directly without depending on product state
          try {
            setLoadingRelated(true);
            setRelatedError(null);
            
            // Get related products from the same category, excluding current product
            getRelatedProducts(productData.category_id, productData.id)
              .then(({ data, error }) => {
                if (error) {
                  console.error('Error fetching related products:', error);
                  setRelatedError('Failed to load related products');
                  return;
                }
                
                if (data && data.length > 0) {
                  // Process related products to ensure proper format
                  const processedRelated = data.map(relatedProduct => {
                    // Process images
                    let images = relatedProduct.images;
                    if (typeof images === 'string') {
                      try {
                        images = JSON.parse(images);
                      } catch (e) {
                        images = [relatedProduct.image];
                      }
                    } else if (!images || !images.length) {
                      images = [relatedProduct.image];
                    }
                    
                    // Generate slug if not present
                    const slug = relatedProduct.slug || generateSlug(relatedProduct.name);
                    
                    return {
                      ...relatedProduct,
                      images,
                      slug
                    };
                  });
                  
                  setRelatedProducts(processedRelated);
                } else {
                  setRelatedProducts([]);
                }
              })
              .catch(err => {
                console.error('Failed to fetch related products:', err);
                setRelatedError('An error occurred while loading related products');
              })
              .finally(() => {
                setLoadingRelated(false);
              });
          } catch (err) {
            console.error('Error initiating related products fetch:', err);
            setRelatedError('Failed to load related products');
            setLoadingRelated(false);
          }
        } else {
          console.error('Product not found');
          setError('Product not found');
        }

        // The product processing is now handled in the code above
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, id, navigate]);

  // Get brand name if available
  const brandName = product?.brand || '';

  // Set default size when product changes
  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[2]); // Default to a middle size (typically index 2)
    } else {
      setSelectedSize(null);
    }
    setSizeError(false);
  }, [product]);

  // Show loading state
  if (loading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <p className="mt-4 text-luxury-gray">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-luxury-black mb-4">Product Not Found</h2>
          <p className="text-luxury-gray mb-6">{error}</p>
          <Link to="/shop" className="inline-block bg-luxury-gold text-luxury-black px-6 py-3 hover:bg-luxury-gold/90 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Return null if product is not loaded yet
  if (!product) {
    return null;
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity > 0 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Make sure product exists
    if (!product) return;
    
    // Check if size is selected for footwear
    if (product.category === 'footwear' && !selectedSize) {
      setSizeError(true);
      return;
    }
    
    addToCart({
      id: Date.now(), // Generate a unique ID for the cart item
      productId: product.id, 
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "",
      brand: product.brand || "",
      size: selectedSize
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleQuickBuy = () => {
    // Make sure product exists
    if (!product) return;
    
    // Check if size is selected for footwear
    if (product.category === 'footwear' && !selectedSize) {
      setSizeError(true);
      return;
    }

    // Add to cart and redirect to checkout
    handleAddToCart();
    navigate('/cart');
  };

  const toggleSizeGuide = () => {
    setShowSizeGuide(!showSizeGuide);
  };

  return (
    <>
      <Helmet>
        <title>{product.name} | Luxe Maroc</title>
        <meta name="description" content={product.description.substring(0, 160)} />
      </Helmet>

      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-3">
        <div className="container">
          <div className="flex items-center text-sm text-luxury-gray">
            <Link to="/" className="hover:text-luxury-gold transition-colors">Home</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link to="/shop" className="hover:text-luxury-gold transition-colors">Shop</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link to={`/shop/${product.category}`} className="hover:text-luxury-gold transition-colors capitalize">
              {product.category}
            </Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-luxury-black font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Hide product IDs - Enhanced targeting */}
      <style>
        {`
          /* Hide UUID formats like the one in your screenshot */
          div:empty + div:not(:has(img)):not(:has(h1)):not(:has(div.grid)):not(:has(button)):not(:has(nav)) {
            display: none !important;
          }
          /* Hide any direct spans with UUID pattern text */
          span:not(:has(*)):not([class]):not([id]) {
            display: none !important;
          }
          /* Hide product SKUs, IDs, and any other identifiers */
          [data-product-id], .product-id, #product-id, 
          [data-sku], .sku, #sku, .product-sku,
          [data-product-code], .product-code, #product-code {
            display: none !important;
          }
        `}
      </style>

      {/* Louis Vuitton Style Image Zoom Modal */}
      {zoomModalOpen && product && (
        <div 
          className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center"
          onClick={() => {
            setZoomModalOpen(false);
            setZoomLevel(1); // Reset zoom when closing modal
          }}
        >
          {/* Top Bar with controls */}
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center py-4 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {/* Zoom controls with elegant styling */}
              <div className="flex items-center space-x-1 bg-white rounded-md shadow-sm border border-gray-200 p-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (zoomLevel > minZoomLevel) {
                      setZoomLevel(prev => Math.max(prev - zoomStep, minZoomLevel));
                    }
                  }}
                  disabled={zoomLevel <= minZoomLevel}
                  className={`w-8 h-8 flex items-center justify-center transition-colors
                    ${zoomLevel <= minZoomLevel ? 'text-gray-300' : 'text-luxury-black hover:text-luxury-gold'}`}
                  aria-label="Zoom out"
                >
                  <Minus size={18} strokeWidth={1.5} />
                </button>
                
                <span className="px-2 py-1 text-sm border-l border-r border-gray-200 min-w-[60px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (zoomLevel < maxZoomLevel) {
                      setZoomLevel(prev => Math.min(prev + zoomStep, maxZoomLevel));
                    }
                  }}
                  disabled={zoomLevel >= maxZoomLevel}
                  className={`w-8 h-8 flex items-center justify-center transition-colors
                    ${zoomLevel >= maxZoomLevel ? 'text-gray-300' : 'text-luxury-black hover:text-luxury-gold'}`}
                  aria-label="Zoom in"
                >
                  <Plus size={18} strokeWidth={1.5} />
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                {`Image ${zoomedImageIndex + 1} of ${product.images.length}`}
              </div>
            </div>

            <button 
              onClick={() => {
                setZoomModalOpen(false);
                setZoomLevel(1); // Reset zoom when closing modal
              }}
              className="text-luxury-black hover:text-luxury-gold transition-colors p-2"
              aria-label="Close zoom view"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>
          
          {/* Main image container */}
          <div className="w-full h-full flex items-center justify-center overflow-auto pt-16">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              pagination={{ clickable: true }}
              initialSlide={zoomedImageIndex}
              className="w-full h-full zoom-swiper"
              onSlideChange={(swiper) => {
                setZoomedImageIndex(swiper.activeIndex);
                setZoomLevel(1); // Reset zoom when changing slides
              }}
            >
              {product.images.map((image, index) => (
                <SwiperSlide key={`zoom-${index}`}>
                  <div 
                    className="flex items-center justify-center h-full px-8 py-4 cursor-zoom-in"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle zoom levels on click
                      if (zoomLevel > 1.5) {
                        setZoomLevel(1);
                      } else if (zoomLevel > 1) {
                        setZoomLevel(maxZoomLevel);
                      } else {
                        setZoomLevel(1.5);
                      }
                    }}
                  >
                    {/* Image with smooth zoom transition */}
                    <div className="transform transition-all duration-300 ease-out">
                      <img 
                        src={image} 
                        alt={`${product.name} - Image ${index + 1}`}
                        className="max-w-full max-h-[80vh] object-contain"
                        style={{ 
                          transform: `scale(${zoomLevel})`,
                          transition: 'transform 0.3s ease-out' 
                        }}
                        onDoubleClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom navigation buttons */}
            {product.images.length > 1 && (
              <>
                <div className="swiper-button-prev absolute left-4 top-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center cursor-pointer z-10">
                  <ChevronRight size={20} className="transform rotate-180 text-luxury-black" />
                </div>
                <div className="swiper-button-next absolute right-4 top-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center cursor-pointer z-10">
                  <ChevronRight size={20} className="text-luxury-black" />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <div className="relative">
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  className="product-swiper"
                  onSlideChange={(swiper) => setSelectedImage(swiper.activeIndex)}
                  onSwiper={(swiper) => setSwiperInstance(swiper)}
                  initialSlide={selectedImage}
                >
                  {product.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <div className="aspect-square bg-gray-50 relative group">
                        <img 
                          src={image} 
                          alt={`${product.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomedImageIndex(index);
                            setZoomModalOpen(true);
                          }}
                          className="absolute top-3 right-3 bg-luxury-gold/90 hover:bg-luxury-gold text-luxury-black p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                          aria-label="Zoom image"
                        >
                          <ZoomIn size={18} />
                        </button>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Product status badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
                  {product.isNew && (
                    <div className="bg-luxury-gold px-3 py-1 text-xs text-luxury-black font-medium">
                      New
                    </div>
                  )}
                  {product.isBestSeller && (
                    <div className="bg-luxury-black px-3 py-1 text-xs text-white font-medium">
                      Best Seller
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail previews */}
              <div className="flex flex-wrap gap-2 mt-4">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer border-2 transition-all duration-200 ${
                      selectedImage === index ? 'border-luxury-gold scale-105' : 'border-transparent opacity-70'
                    }`}
                    onClick={() => {
                      setSelectedImage(index);
                      // Slide to this image if swiper is available
                      if (swiperInstance) {
                        swiperInstance.slideTo(index);
                      }
                    }}
                  >
                    <img 
                      src={image} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-16 h-16 object-cover hover:opacity-100"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div>
              {/* Brand if available */}
              {brandName && (
                <div className="text-sm text-luxury-gray uppercase tracking-wider mb-2">
                  {brandName}
                </div>
              )}
              
              <h1 className="text-3xl font-serif text-luxury-black mb-4">
                {product.name}
              </h1>
              
              <div className="text-xl text-luxury-gold font-medium mb-6">
                {product.price.toLocaleString()} MAD
              </div>
              
              <div className="mb-8">
                <p className="text-luxury-gray mb-4">
                  {product.description}
                </p>
              </div>

              <div className="space-y-6 mb-8">
                {/* Color */}
                <div>
                  <div className="text-sm font-medium text-luxury-black mb-2">Color: {product.color}</div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`w-8 h-8 rounded-full border-2 border-luxury-gold flex items-center justify-center`}
                      style={{ backgroundColor: product.color.toLowerCase() === 'black' ? '#000' : 
                                               product.color.toLowerCase() === 'white' ? '#fff' :
                                               product.color.toLowerCase() === 'cream' ? '#f5f5dc' :
                                               product.color.toLowerCase() === 'burgundy' ? '#800020' :
                                               product.color.toLowerCase() === 'navy blue' ? '#000080' :
                                               product.color.toLowerCase() === 'brown' ? '#964B00' :
                                               product.color.toLowerCase() === 'tan' ? '#D2B48C' :
                                               product.color.toLowerCase() === 'gold' ? '#FFD700' :
                                               product.color.toLowerCase() === 'dark blue' ? '#00008B' :
                                               product.color.toLowerCase() === 'medium blue' ? '#0000CD' :
                                               '#ccc' }}
                    >
                      {product.color.toLowerCase() !== 'black' && product.color.toLowerCase() !== 'burgundy' && 
                       product.color.toLowerCase() !== 'navy blue' && (
                        <Check size={16} className="text-luxury-black" />
                      )}
                      {(product.color.toLowerCase() === 'black' || product.color.toLowerCase() === 'burgundy' || 
                        product.color.toLowerCase() === 'navy blue') && (
                        <Check size={16} className="text-white" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Size selector */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-luxury-black">Size</div>
                      <button 
                        onClick={toggleSizeGuide}
                        className="text-xs text-luxury-gold underline"
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          className={`w-12 h-10 border ${
                            selectedSize === size 
                              ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-black' 
                              : 'border-gray-300 hover:border-gray-400 text-luxury-gray'
                          }`}
                          onClick={() => {
                            setSelectedSize(size);
                            setSizeError(false);
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {sizeError && (
                      <div className="mt-2 text-sm text-red-500">
                        Please select a size
                      </div>
                    )}
                  </div>
                )}

                {/* Product Features */}
                <div className="space-y-2">
                  <div className="flex">
                    <div className="w-24 text-sm text-luxury-gray">Material:</div>
                    <div className="text-sm">{product.material}</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 text-sm text-luxury-gray">Dimensions:</div>
                    <div className="text-sm">{product.dimensions}</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 text-sm text-luxury-gray">Made in:</div>
                    <div className="text-sm">{product.madeIn}</div>
                  </div>
                </div>
              </div>
              
              {/* Quantity selector */}
              <div className="mb-6">
                <div className="text-sm font-medium text-luxury-black mb-2">Quantity</div>
                <div className="inline-flex items-center">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="px-4 py-2 text-luxury-black focus:outline-none border border-luxury-gray border-r-0"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 border border-luxury-gray">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="px-4 py-2 text-luxury-black focus:outline-none border border-luxury-gray border-l-0"
                    disabled={quantity >= 10}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add to Cart & Buy Now buttons */}
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-6 flex items-center justify-center focus:outline-none transition-colors duration-300 ${
                    addedToCart 
                      ? 'bg-green-600 text-white' 
                      : 'bg-luxury-black text-white hover:bg-luxury-black/90'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check size={20} className="mr-2" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} className="mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={handleQuickBuy}
                  className="flex-1 py-3 px-6 bg-luxury-gold text-luxury-black hover:bg-luxury-gold/90 focus:outline-none transition-colors duration-300"
                >
                 Cash On Delivery 
                </button>
              </div>
                
              {/* Share */}
              <div className="flex space-x-6 mb-8">
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: `Check out ${product.name} on Luxe Maroc`,
                        url: window.location.href
                      })
                      .catch(error => console.log('Error sharing:', error));
                    } else {
                      // Fallback for browsers that don't support Web Share API
                      navigator.clipboard.writeText(window.location.href)
                        .then(() => alert('Link copied to clipboard!'))
                        .catch(err => console.error('Could not copy link: ', err));
                    }
                  }}
                  className="flex items-center text-luxury-gray hover:text-luxury-black"
                >
                  <Share size={18} className="mr-2" />
                  <span className="text-sm">Share</span>
                </button>
              </div>

              {/* Tabbed content */}
              <div className="border-t border-b border-luxury-gray py-6">
                <div className="flex border-b">
                  <button
                    className={`py-2 px-4 text-sm font-medium relative ${
                      activeTab === 'description' 
                        ? 'text-luxury-black' 
                        : 'text-luxury-gray hover:text-luxury-black'
                    }`}
                    onClick={() => setActiveTab('description')}
                  >
                    Description
                    {activeTab === 'description' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-luxury-gold"
                      />
                    )}
                  </button>
                  <button
                    className={`py-2 px-4 text-sm font-medium relative ${
                      activeTab === 'shipping' 
                        ? 'text-luxury-black' 
                        : 'text-luxury-gray hover:text-luxury-black'
                    }`}
                    onClick={() => setActiveTab('shipping')}
                  >
                    Shipping & Returns
                    {activeTab === 'shipping' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-luxury-gold"
                      />
                    )}
                  </button>
                  <button
                    className={`py-2 px-4 text-sm font-medium relative ${
                      activeTab === 'care' 
                        ? 'text-luxury-black' 
                        : 'text-luxury-gray hover:text-luxury-black'
                    }`}
                    onClick={() => setActiveTab('care')}
                  >
                    Care Instructions
                    {activeTab === 'care' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-luxury-gold"
                      />
                    )}
                  </button>
                </div>
                
                <div className="pt-4">
                  {activeTab === 'description' && (
                    <div className="text-luxury-gray">
                      <p>{product.description}</p>
                      <p className="mt-2">
                        Each {product.name.toLowerCase()} is crafted with care and attention to detail, 
                        ensuring a product of exceptional quality and durability.
                      </p>
                    </div>
                  )}
                  
                  {activeTab === 'shipping' && (
                    <div className="text-luxury-gray">
                      <p>Free standard shipping on all orders.</p>
                      <p className="mt-2">Delivery typically takes 3-5 business days depending on your location.</p>
                      <p className="mt-2">Returns accepted upon delivery for unused items in original packaging.</p>
                    </div>
                  )}
                  
                  {activeTab === 'care' && (
                    <div className="text-luxury-gray">
                      <p>To maintain the beauty of your {product.name.toLowerCase()}, we recommend:</p>
                      <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li>Store in the provided dust bag when not in use</li>
                        <li>Avoid exposure to direct sunlight and moisture</li>
                        <li>Clean with a soft, dry cloth</li>
                        <li>For leather items, apply a leather conditioner every 6 months</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-16">
            <h2 className="text-2xl font-serif text-luxury-black mb-8">You May Also Like</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loadingRelated ? (
                // Loading skeletons when fetching related products
                [...Array(4)].map((_, index) => (
                  <div key={index} className="group product-card-hover">
                    <div className="block">
                      <div className="relative aspect-square overflow-hidden mb-4 bg-gray-100 animate-pulse">
                      </div>
                      <div className="uppercase text-xs text-luxury-gray tracking-wider mb-1 w-16 h-3 bg-gray-200 animate-pulse"></div>
                      <div className="font-serif text-luxury-black text-lg mb-1 truncate w-3/4 h-5 bg-gray-200 animate-pulse"></div>
                      <div className="text-luxury-gold font-medium w-20 h-5 bg-gray-200 animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : relatedError ? (
                // Error message if related products fail to load
                <div className="col-span-full text-center py-8">
                  <p className="text-luxury-gray">{relatedError}</p>
                </div>
              ) : relatedProducts.length === 0 ? (
                // Message when no related products are found
                <div className="col-span-full text-center py-8">
                  <p className="text-luxury-gray">No related products found for this category.</p>
                </div>
              ) : (
                // Display actual related products
                relatedProducts.map((relatedProduct) => (
                  <motion.div
                    key={relatedProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="group product-card-hover"
                  >
                    <a 
                      href="javascript:void(0)"
                      className="block cursor-pointer"
                      onClick={() => {
                        // Force navigation with window.location for a complete refresh
                        window.location.href = `/product/${relatedProduct.slug}`;
                      }}
                    >
                      <div className="relative aspect-square overflow-hidden mb-4">
                        <img 
                          src={Array.isArray(relatedProduct.images) && relatedProduct.images.length > 0 
                              ? relatedProduct.images[0] 
                              : relatedProduct.image} 
                          alt={relatedProduct.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="uppercase text-xs text-luxury-gray tracking-wider mb-1">
                        {relatedProduct.brand}
                      </div>
                      <h3 className="font-serif text-luxury-black text-lg mb-1 truncate">{relatedProduct.name}</h3>
                      <p className="text-luxury-gold font-medium">{relatedProduct.price.toLocaleString()} MAD</p>
                    </a>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleSizeGuide}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white p-6 max-w-2xl w-full">
              <button
                onClick={toggleSizeGuide}
                className="absolute top-4 right-4 text-luxury-gray hover:text-luxury-black"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-serif text-luxury-black mb-4">Size Guide</h2>
              <div className="mt-4">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2">EU Size</th>
                      <th className="border border-gray-300 px-4 py-2">UK Size</th>
                      <th className="border border-gray-300 px-4 py-2">US Size</th>
                      <th className="border border-gray-300 px-4 py-2">Foot Length (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-center">40</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">6.5</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">7.5</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">25.5</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-center">41</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">7</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">8</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">26.2</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-center">42</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">8</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">9</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">26.8</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-center">43</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">9</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">10</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">27.5</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-center">44</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">10</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">11</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">28.2</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-center">45</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">10.5</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">11.5</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">28.8</td>
                    </tr>
                  </tbody>
                </table>
                <p className="mt-4 text-luxury-gray text-sm">
                  To find your perfect size, measure your foot length and compare it with the chart above. If you are between sizes, we recommend going up to the larger size.
                </p>
                    </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetailPage;