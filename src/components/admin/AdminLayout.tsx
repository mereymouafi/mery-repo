import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import { motion } from 'framer-motion';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AdminNavbar />
      <main className="flex-grow p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default AdminLayout;
