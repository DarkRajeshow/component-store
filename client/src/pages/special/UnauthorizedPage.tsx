import React from 'react';
import { Shield, ArrowLeft, Home } from 'lucide-react';

interface UnauthorizedPageProps {
  onGoBack?: () => void;
  onGoHome?: () => void;
}

const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({ 
  onGoBack = () => window.history.back(),
  onGoHome = () => window.location.href = '/'
}) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Shield className="w-24 h-24 text-black" strokeWidth={1} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-4">
          <h1 className="text-6xl font-light text-black mb-2">401</h1>
          <div className="w-16 h-px bg-black mx-auto"></div>
        </div>

        {/* Main Message */}
        <h2 className="text-2xl font-semibold text-black mb-4">
          Access Denied
        </h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          You don't have permission to access this page or resource. 
          Please contact your administrator if you believe this is an error.
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

        {/* Help Text */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need assistance? Contact support at{' '}
            <a 
              href="mailto:support@company.com" 
              className="text-black hover:underline"
            >
              support@company.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;