import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Brand } from '../lib/brandService';
import { FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';

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
  
  // Edit state
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  // Auto-generate slug from name (only if not editing an existing brand)
  useEffect(() => {
    if (!isEditing) {
      setSlug(name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }, [name, isEditing]);

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

  const handleEditClick = (brand: Brand) => {
    setIsEditing(true);
    setEditingBrand(brand);
    setName(brand.name);
    setSlug(brand.slug);
    setDescription(brand.description || '');
    setImage(brand.image || '');
    setError(null);
    setSuccessMessage('');
    
    // Smooth scroll to form
    document.getElementById('brand-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingBrand(null);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setImage('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setError(null);

    try {
      // Get current timestamp for created_at and updated_at
      const now = new Date().toISOString();
      
      if (isEditing && editingBrand) {
        // Handle update
        console.log('Updating brand:', { id: editingBrand.id, name, slug, description, image });

        // Check if slug already exists (but ignore the current brand)
        const { data: existingBrand, error: checkError } = await supabase
          .from('brands')
          .select('id')
          .eq('slug', slug)
          .neq('id', editingBrand.id)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking for existing brand:', checkError);
          throw new Error(`Database error while checking slug: ${checkError.message}`);
        }

        if (existingBrand) {
          setError('A brand with this slug already exists');
          return;
        }

        // Update existing brand
        const { error: updateError } = await supabase
          .from('brands')
          .update({
            name,
            slug,
            description: description || null,
            image: image || null,
            updated_at: now
          })
          .eq('id', editingBrand.id);

        if (updateError) {
          console.error('Supabase update error:', updateError);
          throw new Error(`Failed to update brand: ${updateError.message}`);
        }

        setSuccessMessage('Brand updated successfully!');
        setIsEditing(false);
        setEditingBrand(null);
      } else {
        // Handle new brand creation
        console.log('Creating new brand:', { name, slug, description, image });
        
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

        setSuccessMessage('Brand added successfully!');
      }
      
      // Reset form and refresh brand list
      resetForm();
      fetchBrands();
    } catch (err: any) {
      console.error('Error saving brand:', err);
      setError(err.message || 'Failed to save brand');
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
        <div id="brand-form" className="bg-white shadow-md rounded-lg p-6 border-t-4 border-amber-400">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            {isEditing ? (
              <>
                <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Update Brand:</span> 
                <span className="ml-2">{editingBrand?.name}</span>
              </>
            ) : (
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Add New Brand</span>
            )}
          </h2>
          
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
                readOnly={!isEditing}
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

            <div className="flex justify-end space-x-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out hover:bg-gray-100 flex items-center"
                >
                  <FiX className="mr-2" /> Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className={`${isEditing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50 flex items-center shadow-md`}
              >
                {submitting ? (
                  isEditing ? 'Updating...' : 'Adding...'
                ) : (
                  <>
                    {isEditing ? (
                      <><FiSave className="mr-2" /> Update Brand</>
                    ) : (
                      'Add Brand'
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Brands List */}
        <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-amber-400">
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Existing Brands</h2>
          
          {loading ? (
            <p className="text-gray-500">Loading brands...</p>
          ) : brands.length === 0 ? (
            <p className="text-gray-500">No brands found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-100 shadow-sm">
                <thead className="bg-gradient-to-r from-amber-50 to-amber-100">
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
                <tbody className="bg-white divide-y divide-gray-200 text-gray-800">
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditClick(brand)}
                          className="text-amber-600 hover:text-amber-900 inline-flex items-center transition-colors"
                          title="Edit Brand"
                        >
                          <FiEdit2 className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center transition-colors"
                          title="Delete Brand"
                        >
                          <FiTrash2 className="mr-1" /> Delete
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
