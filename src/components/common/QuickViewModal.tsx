import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Check } from 'lucide-react';

import { Product, brands } from '../../data/products';
import { CartContext } from '../../context/CartContext';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  
  // Get cart context
  const { addToCart } = useContext(CartContext);
  
  // Get brand name if available
  const brandName = product?.brand ? 
    brands.find(b => b.id === product.brand)?.name : null;
  
  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedImage(0);
      setIsAddingToCart(false);
      setSizeError(false);
      
      // Set default size for footwear
      if (product.category === 'footwear' && product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[2]); // Default to size 42 (index 2)
      } else {
        setSelectedSize(null);
      }
    }
  }, [product]);
  
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity > 0 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Make sure we have a product
    if (!product) return;
    
    // Check if size is selected for footwear
    if (product.category === 'footwear' && !selectedSize) {
      setSizeError(true);
      return;
    }
    
    // Add to cart context
    addToCart({
      id: Date.now(), // Generate a unique ID for the cart item
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
      brand: product.brand,
      size: selectedSize
    });
    
    setIsAddingToCart(true);
    
    // Reset the "Added" confirmation after 2 seconds
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 2000);
  };

  // Close modal when clicking overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Early return if no product
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 text-luxury-gray hover:text-luxury-black"
              >
                <X size={24} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Images */}
                <div>
                  <div className="aspect-square overflow-hidden mb-4">
                    <img 
                      src={product.images[selectedImage]} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    {product.images.map((image, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer border-2 ${
                          selectedImage === index ? 'border-luxury-gold' : 'border-transparent'
                        }`}
                        onClick={() => setSelectedImage(index)}
                      >
                        <img 
                          src={image} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-16 h-16 object-cover"
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
                  
                  <h2 className="text-2xl font-serif text-luxury-black mb-3">
                    {product.name}
                  </h2>
                  
                  <div className="text-xl text-luxury-gold font-medium mb-4">
                    {product.price.toLocaleString()} MAD
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-luxury-gray">
                      {product.description.substring(0, 150)}
                      {product.description.length > 150 ? '...' : ''}
                    </p>
                    <Link to={`/product/${product.id}`} className="text-luxury-gold hover:underline text-sm mt-2 inline-block">
                      View Full Details
                    </Link>
                  </div>
                  
                  {/* Size selector for footwear */}
                  {product.category === 'footwear' && product.sizes && (
                    <div className="mb-6">
                      <div className="text-sm font-medium text-luxury-black mb-2">Size</div>
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
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex">
                      <div className="w-24 text-sm text-luxury-gray">Color:</div>
                      <div className="text-sm">{product.color}</div>
                    </div>
                    <div className="flex">
                      <div className="w-24 text-sm text-luxury-gray">Material:</div>
                      <div className="text-sm">{product.material}</div>
                    </div>
                    <div className="flex">
                      <div className="w-24 text-sm text-luxury-gray">Made in:</div>
                      <div className="text-sm">{product.madeIn}</div>
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
                  
                  {/* Add to Cart button */}
                  <div className="mb-6">
                    <button
                      onClick={handleAddToCart}
                      className={`w-full py-3 flex items-center justify-center focus:outline-none transition-colors duration-300 ${
                        isAddingToCart 
                          ? 'bg-green-600 text-white' 
                          : 'bg-luxury-black text-white hover:bg-luxury-black/90'
                      }`}
                    >
                      {isAddingToCart ? (
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
                  </div>
                  
                  <div className="text-center">
                    <Link 
                      to={`/product/${product.id}`} 
                      className="text-luxury-gold hover:underline"
                      onClick={onClose}
                    >
                      View Full Product Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal; 