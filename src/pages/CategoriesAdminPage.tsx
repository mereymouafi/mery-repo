import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { importExistingCategories } from '../lib/importExistingCategories';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  created_at: string;
}

const CategoriesAdminPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCategories();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('categories-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' }, 
        () => {
          fetchCategories();
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

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase error fetching categories:', error);
        throw error;
      }

      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(`Failed to fetch categories: ${err.message || err}`);
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
      console.log('Submitting category:', { name, slug, description, image });
      
      // Check if slug already exists
      const { data: existingCategory, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing category:', checkError);
        throw new Error(`Database error while checking slug: ${checkError.message}`);
      }

      if (existingCategory) {
        setError('A category with this slug already exists');
        return;
      }

      // Insert new category
      const { error: insertError } = await supabase
        .from('categories')
        .insert([
          {
            name,
            slug,
            description: description || null,
            image: image || null,
          }
        ])
        .select();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw new Error(`Failed to add category: ${insertError.message}`);
      }

      // Reset form
      setName('');
      setSlug('');
      setDescription('');
      setImage('');
      setSuccessMessage('Category added successfully!');
      
      // Refresh the category list
      fetchCategories();
    } catch (err: any) {
      console.error('Error adding category:', err);
      setError(err.message || 'Failed to add category');
    } finally {
      setSubmitting(false);
    }
  };

  // Import all existing categories from products.ts
  const handleImportCategories = async () => {
    if (!window.confirm('This will import all existing categories from the website. Continue?')) {
      return;
    }

    setImporting(true);
    setError(null);
    setSuccessMessage('');

    try {
      const result = await importExistingCategories();
      
      if (result.success) {
        setSuccessMessage('Existing categories imported successfully!');
        fetchCategories(); // Refresh the categories list
      } else {
        setError(`Failed to import categories: ${result.error}`);
      }
    } catch (err: any) {
      console.error('Error importing categories:', err);
      setError(`Error importing categories: ${err.message || err}`);
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category and ALL of its associated products?')) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // First, get all products in this category
      const { data: productsInCategory, error: fetchError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id);
        
      if (fetchError) {
        throw fetchError;
      }
      
      // Delete all products in this category
      if (productsInCategory && productsInCategory.length > 0) {
        const { error: deleteProductsError } = await supabase
          .from('products')
          .delete()
          .eq('category_id', id);
          
        if (deleteProductsError) {
          throw deleteProductsError;
        }
        
        console.log(`Deleted ${productsInCategory.length} products from category ${id}`);
      }
      
      // Now delete the category itself
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Filter out the deleted category from the state
      setCategories(categories.filter(category => category.id !== id));
      setSuccessMessage(`Category and ${productsInCategory?.length || 0} associated products deleted successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <Helmet>
        <title>Category Management | Maroc Luxe Admin</title>
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <button
          onClick={handleImportCategories}
          disabled={importing}
          className="bg-luxury-gold hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50"
        >
          {importing ? 'Importing...' : 'Import Existing Categories'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Category Form */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
          
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name*
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug (auto-generated)
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                readOnly
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com/image.jpg"
              />
              {image && (
                <div className="mt-2">
                  <img src={image} alt="Preview" className="h-24 w-auto object-contain border rounded" />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Categories</h2>
          
          {loading ? (
            <p className="text-gray-500">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500">No categories found</p>
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
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {category.image && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img className="h-10 w-10 rounded-full object-cover" src={category.image} alt={category.name} />
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Link 
                          to={`/admin/products?categoryId=${category.id}`}
                          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs transition-colors"
                        >
                          View Products
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(category.id)}
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

export default CategoriesAdminPage;
