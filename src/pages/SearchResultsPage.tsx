import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Tag, Loader } from 'lucide-react';
import { searchAll, SearchResult } from '../services/searchService';

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'products' | 'brands' | 'categories'>('all');
  
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

      <section className="bg-white py-6 border-b border-gray-200">
        <div className="container text-center">
          <h1 className="text-2xl md:text-3xl font-serif text-luxury-black">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Search'}
          </h1>
        </div>
      </section>

      <section className="py-8">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center mb-8 border-b">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 mx-1 text-sm font-medium ${activeFilter === 'all' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
            >
              All ({searchResults.length})
            </button>
            <button
              onClick={() => setActiveFilter('products')}
              className={`px-4 py-2 mx-1 text-sm font-medium ${activeFilter === 'products' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
            >
              Products ({productCount})
            </button>
            <button
              onClick={() => setActiveFilter('brands')}
              className={`px-4 py-2 mx-1 text-sm font-medium ${activeFilter === 'brands' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
            >
              Brands ({brandCount})
            </button>
            <button
              onClick={() => setActiveFilter('categories')}
              className={`px-4 py-2 mx-1 text-sm font-medium ${activeFilter === 'categories' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
            >
              Categories ({categoryCount})
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
          
          {/* Results grid */}
          {!isLoading && !error && filteredResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((result) => (
                <div 
                  key={`${result.type}-${result.id}`}
                  className="border border-gray-200 rounded-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
                  onClick={() => {
                    if (result.type === 'product') {
                      navigate(`/product/${result.id}`);
                    } else if (result.type === 'brand') {
                      navigate(`/brand/${result.slug || result.id}`);
                    } else if (result.type === 'category') {
                      navigate(`/category/${result.slug || result.id}`);
                    }
                  }}
                >
                  <div className="relative pt-[75%] bg-gray-50">
                    {result.image ? (
                      <img 
                        src={result.image} 
                        alt={result.name} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {result.type === 'product' && <ShoppingBag size={40} className="text-gray-300" />}
                        {result.type === 'brand' && <Tag size={40} className="text-gray-300" />}
                        {result.type === 'category' && <Tag size={40} className="text-gray-300" />}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 text-xs font-medium rounded shadow-sm">
                      {result.type === 'product' && 'Product'}
                      {result.type === 'brand' && 'Brand'}
                      {result.type === 'category' && 'Category'}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">{result.name}</h3>
                    {result.description && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {result.description}
                      </p>
                    )}
                    {result.price && (
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        ${result.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default SearchResultsPage;