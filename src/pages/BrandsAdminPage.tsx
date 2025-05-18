import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Brand } from '../lib/brandService';

const BrandsAdminPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchBrands();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('brands-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'brands' }, 
        () => {
          fetchBrands();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    setSlug(name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  }, [name]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase error fetching brands:', error);
        throw error;
      }

      setBrands(data || []);
    } catch (err: any) {
      console.error('Error fetching brands:', err);
      setError(`Failed to fetch brands: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setError(null);

    try {
      console.log('Submitting brand:', { name, slug, description, image });
      
      // Check if slug already exists
      const { data: existingBrand, error: checkError } = await supabase
        .from('brands')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing brand:', checkError);
        throw new Error(`Database error while checking slug: ${checkError.message}`);
      }

      if (existingBrand) {
        setError('A brand with this slug already exists');
        return;
      }

      // Get current timestamp for created_at and updated_at
      const now = new Date().toISOString();

      // Insert new brand
      const { error: insertError } = await supabase
        .from('brands')
        .insert([
          {
            name,
            slug,
            description: description || null,
            image: image || null,
            created_at: now,
            updated_at: now
          }
        ])
        .select();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw new Error(`Failed to add brand: ${insertError.message}`);
      }

      // Reset form
      setName('');
      setSlug('');
      setDescription('');
      setImage('');
      setSuccessMessage('Brand added successfully!');
      
      // Refresh the brand list
      fetchBrands();
    } catch (err: any) {
      console.error('Error adding brand:', err);
      setError(err.message || 'Failed to add brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      
      // Check if the brand is used in any products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('brand_id', id)
        .limit(1);
        
      if (productsError) {
        console.error('Error checking products:', productsError);
        throw new Error(`Error checking if brand is used in products: ${productsError.message}`);
      }
      
      if (products && products.length > 0) {
        setError('Cannot delete this brand because it is used in one or more products');
        return;
      }

      // Delete the brand
      const { error: deleteError } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting brand:', deleteError);
        throw new Error(`Failed to delete brand: ${deleteError.message}`);
      }

      // Show success message
      setSuccessMessage('Brand deleted successfully');
      
      // Refresh brands list
      fetchBrands();
    } catch (err: any) {
      console.error('Error in delete operation:', err);
      setError(err.message || 'An error occurred while deleting the brand');
    }
  };

  return (
    <div className="admin-page brands-admin">
      <Helmet>
        <title>Manage Brands | MarocLuxe Admin</title>
      </Helmet>
      
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Brands</h1>
        <p className="text-gray-600 mt-1">Add, edit or remove brands from your store</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Form */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Brand</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                Brand Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter brand name"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="slug" className="block text-gray-700 text-sm font-medium mb-2">
                Slug
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                placeholder="brand-slug"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-generated from name. Used in URLs.
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter brand description"
                rows={3}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="image" className="block text-gray-700 text-sm font-medium mb-2">
                Image URL (Optional)
              </label>
              <input
                id="image"
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="https://example.com/image.jpg"
              />
              {image && (
                <div className="mt-2">
                  <img 
                    src={image} 
                    alt="Brand preview" 
                    className="h-16 w-16 object-cover border rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Brand'}
              </button>
            </div>
          </form>
        </div>

        {/* Brands List */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Brands</h2>
          
          {loading ? (
            <p className="text-gray-500">Loading brands...</p>
          ) : brands.length === 0 ? (
            <p className="text-gray-500">No brands found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {brand.image && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={brand.image} 
                                alt={brand.name} 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image';
                                }}
                              />
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {brand.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Link 
                          to={`/admin/products?brandId=${brand.id}`}
                          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs transition-colors"
                        >
                          View Products
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(brand.id)}
                          className="text-red-600 hover:text-red-900 ml-2"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandsAdminPage;
