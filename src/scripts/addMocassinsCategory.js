// Script to add the Mocassins category to Supabase
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addMocassinsCategory() {
  try {
    // Check if category already exists
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', 'mocassins')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing category:', checkError);
      return;
    }

    if (existingCategory) {
      console.log('Mocassins category already exists in the database');
      return;
    }

    // Add the new category
    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          id: 'mocassins',
          name: 'Mocassins',
          slug: 'mocassins',
          description: 'Elegant and comfortable mocassins from luxury brands'
        }
      ]);

    if (error) {
      console.error('Error adding Mocassins category:', error);
      return;
    }

    console.log('Mocassins category added successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
addMocassinsCategory();
