// Simple test script to verify Supabase connection
import { testSupabaseConnection } from './src/lib/testSupabase.js';

console.log('Starting Supabase connection test...');

testSupabaseConnection()
  .then(result => {
    console.log('Test completed!');
    if (result.success) {
      console.log('✅ Successfully connected to Supabase!');
      console.log('Tables verified:');
      console.log('- orders table: OK');
      console.log('- order_items table: OK');
    } else {
      console.log('❌ Failed to connect to Supabase.');
      console.log('Error:', result.error);
    }
  })
  .catch(err => {
    console.error('Error running test:', err);
  });
