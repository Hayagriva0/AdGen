import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">
              Ad<span className="text-indigo-500">Gen</span>
            </h1>
            <p className="ml-4 text-gray-400 hidden md:block">Your AI Advertising Director</p>
          </div>
        </div>
      </div>
    </header>
  );
};
