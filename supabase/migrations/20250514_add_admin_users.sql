-- Create a secure table for admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users table
-- Only authenticated users can read admin users
CREATE POLICY "Authenticated users can read admin_users" ON admin_users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only super_admin can insert/update/delete admin users
CREATE POLICY "Only super_admin can insert admin_users" ON admin_users
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT id FROM admin_users WHERE role = 'super_admin'
  ));

CREATE POLICY "Only super_admin can update admin_users" ON admin_users
  FOR UPDATE USING (auth.uid() IN (
    SELECT id FROM admin_users WHERE role = 'super_admin'
  ));

CREATE POLICY "Only super_admin can delete admin_users" ON admin_users
  FOR DELETE USING (auth.uid() IN (
    SELECT id FROM admin_users WHERE role = 'super_admin'
  ));

-- Create function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add RLS to orders table to restrict access to admins only
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders table
CREATE POLICY "Admins can read all orders" ON orders
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (is_admin(auth.uid()));

-- Add RLS to order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for order_items table
CREATE POLICY "Admins can read all order_items" ON order_items
  FOR SELECT USING (is_admin(auth.uid()));

-- Comment: After running this migration, you'll need to create the first super_admin user
-- through the Supabase dashboard or API, then use that user to create additional admin users.
