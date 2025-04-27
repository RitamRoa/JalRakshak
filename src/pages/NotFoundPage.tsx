import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Droplet, Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary-100">
              <Droplet className="h-10 w-10 text-primary-600" />
            </div>
          </div>
          
          <h2 className="mt-6 text-3xl font-display font-bold text-gray-900">404</h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            Oops! The page you're looking for isn't here.
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            It might have been moved or doesn't exist.
          </p>
          
          <div className="mt-6">
            <Link to="/">
              <Button
                variant="primary" 
                fullWidth
                icon={<Home />}
              >
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;