import React from 'react';
import { LogoIcon } from './Icon';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="relative flex justify-center items-center h-16 w-16">
      <div className="absolute animate-spin rounded-full h-full w-full border-t-2 border-b-2 border-brand-lime"></div>
      <LogoIcon className="h-8 w-8 text-brand-lime/80" />
    </div>
  );
};

export default LoadingSpinner;