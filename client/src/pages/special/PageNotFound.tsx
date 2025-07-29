import React from 'react';
import { Search, ArrowLeft, Home } from 'lucide-react';

interface PageNotFoundProps {
  onGoBack?: () => void;
  onGoHome?: () => void;
}

const PageNotFound: React.FC<PageNotFoundProps> = ({ 
  onGoBack = () => window.history.back(),
  onGoHome = () => window.location.href = '/'
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Search className="w-24 h-24 text-black dark:text-white" strokeWidth={1} />
            <div className="absolute -top-2 -right-2">
              <div className="w-8 h-8 bg-black dark:bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">?</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-4">
          <h1 className="text-6xl font-light text-black dark:text-white mb-2">404</h1>
          <div className="w-16 h-px bg-black dark:bg-white/30 mx-auto"></div>
        </div>

        {/* Main Message */}
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. 
          Please check the URL or navigate back to continue browsing.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onGoBack}
            className="w-full bg-black text-white py-3 px-6 border border-black hover:bg-white hover:text-black transition-colors duration-200 flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Go Back
          </button>
          
          <button
            onClick={onGoHome}
            className="w-full bg-white text-black py-3 px-6 border border-black hover:bg-black hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Return Home
          </button>
        </div>

        {/* Suggestions */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-black mb-3">Suggestions:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Double-check the URL for typos</li>
            <li>• Use the navigation menu</li>
            <li>• Try searching for what you need</li>
          </ul>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Still can't find what you're looking for?{' '}
            <a 
              href="mailto:help@company.com" 
              className="text-black hover:underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;