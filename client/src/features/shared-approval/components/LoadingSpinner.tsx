import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse text-lg">Loading dashboard...</div>
    </div>
  );
}; 