import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Tag, Loader, Heart, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { searchAll, SearchResult } from '../services/searchService';

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'products' | 'brands' | 'categories'>('products');
  
  // Get search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else {
      // Redirect to home if no query
      navigate('/');
    }
  }, [location.search, navigate]);
  
  // Perform search
  const performSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await searchAll(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter results based on active filter
  const filteredResults = searchResults.filter(result => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'products') return result.type === 'product';
    if (activeFilter === 'brands') return result.type === 'brand';
    if (activeFilter === 'categories') return result.type === 'category';
    return true;
  });
  
  // Count results by type
  const productCount = searchResults.filter(r => r.type === 'product').length;
  const brandCount = searchResults.filter(r => r.type === 'brand').length;
  const categoryCount = searchResults.filter(r => r.type === 'category').length;
  return (
    <>
      <Helmet>
        <title>Search | Luxe Maroc</title>
      </Helmet>

      <section className="bg-white py-8 border-b border-gray-100">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-serif text-luxury-black uppercase tracking-wider mb-2">
            {searchQuery ? searchQuery.toUpperCase() : 'SEARCH'}
          </h1>
          <p className="text-sm text-gray-500">
            {searchResults.length} Results of the search
          </p>
        </div>
      </section>

      {/* Hide product IDs */}
      <style>
        {`
          /* Hide any elements that might be displaying product IDs */
          [data-product-id], .product-id, #product-id, div[data-product-id] {
            display: none !important;
          }
        `}
      </style>

      <section className="py-8">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center mb-8 border-b">
            <button
              onClick={() => setActiveFilter('products')}
              className={`px-6 py-2 mx-2 text-sm font-medium ${activeFilter === 'products' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
            >
              Products ({productCount})
            </button>
            <button
              onClick={() => setActiveFilter('brands')}
              className={`px-6 py-2 mx-2 text-sm font-medium ${activeFilter === 'brands' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
            >
              Brands ({brandCount})
            </button>
            <button
              onClick={() => setActiveFilter('categories')}
              className={`px-6 py-2 mx-2 text-sm font-medium ${activeFilter === 'categories' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
            >
              Categories ({categoryCount})
            </button>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-2 mx-2 text-sm font-medium ${activeFilter === 'all' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
            >
              All ({searchResults.length})
            </button>
          </div>
          
          {/* Sort and Filter options */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-luxury-gray">
              Showing {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
            </p>
            
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded text-sm font-medium">
              <Filter size={16} className="mr-2" />
              <span>Filter</span>
            </button>
          </div>
          
          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader className="animate-spin text-gray-400" size={30} />
              <span className="ml-3 text-gray-600 text-lg">Searching...</span>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Link to="/shop" className="inline-block bg-black text-white px-6 py-2 text-sm uppercase tracking-wider">
                Browse our collections
              </Link>
            </div>
          )}
          
          {/* No results */}
          {!isLoading && !error && filteredResults.length === 0 && (
            <div className="text-center py-8">
              <p className="text-luxury-gray mb-2">No results found for "{searchQuery}"</p>
              <p className="text-sm text-gray-500 mb-6">Try a different search term or browse our collections</p>
              <Link to="/shop" className="inline-block bg-black text-white px-6 py-2 text-sm uppercase tracking-wider">
                Browse Collections
              </Link>
            </div>
          )}
          
          {/* Results grid - Updated to match ShopPage layout */}
          {!isLoading && !error && filteredResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredResults.map((result) => (
                <motion.div
                  key={`${result.type}-${result.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="group product-card-hover"
                >
                  <div className="relative">
                    {/* Heart/Favorite button */}
                    <button className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all duration-200">
                      <Heart size={18} className="text-gray-500 hover:text-red-500 transition-colors duration-200" />
                    </button>
                    
                    {/* Product image with link */}
                    <Link 
                      to={result.type === 'product' ? `/product/${result.id}` : 
                         result.type === 'brand' ? `/brand/${result.slug || result.id}` : 
                         `/category/${result.slug || result.id}`}
                      className="block aspect-square overflow-hidden mb-4"
                    >
                      {result.image ? (
                        <img 
                          src={result.image} 
                          alt={result.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          {result.type === 'product' && <ShoppingBag size={40} className="text-gray-300" />}
                          {result.type === 'brand' && <Tag size={40} className="text-gray-300" />}
                          {result.type === 'category' && <Tag size={40} className="text-gray-300" />}
                        </div>
                      )}
                      
                      {/* Type badge - only show for non-products */}
                      {result.type !== 'product' && (
                        <div className="absolute bottom-2 left-2 bg-white px-2 py-1 text-xs font-medium">
                          {result.type === 'brand' ? 'Brand' : 'Category'}
                        </div>
                      )}
                    </Link>
                  </div>
                  
                  {/* Product info */}
                  <div className="text-center">
                    <h3 className="font-serif text-luxury-black text-lg mb-1">
                      <Link 
                        to={result.type === 'product' ? `/product/${result.id}` : 
                           result.type === 'brand' ? `/brand/${result.slug || result.id}` : 
                           `/category/${result.slug || result.id}`}
                        className="hover:underline"
                      >
                        {result.name}
                      </Link>
                    </h3>
                    {result.type === 'product' && result.price && (
                      <p className="text-luxury-gold font-medium">{result.price.toLocaleString()} MAD</p>
                    )}
                    {result.type !== 'product' && result.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{result.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default SearchResultsPage;