import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Luxe Maroc</title>
      </Helmet>

      <section className="py-20 min-h-[70vh] flex items-center">
        <div className="container text-center">
          <h1 className="text-8xl font-serif text-luxury-gold mb-6">404</h1>
          <h2 className="text-3xl font-serif text-luxury-black mb-4">Page Not Found</h2>
          <p className="text-luxury-gray max-w-lg mx-auto mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Link to="/" className="btn btn-primary inline-flex items-center">
            <ArrowLeft size={18} className="mr-2" />
            Return to Homepage
          </Link>
        </div>
      </section>
    </>
  );
};

export default NotFoundPage;