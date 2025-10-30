import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { PhotoIcon } from './icons/PhotoIcon';

interface NavTabsProps {
  activeTab: 'presentation' | 'creative';
  setActiveTab: (tab: 'presentation' | 'creative') => void;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
      active
        ? 'bg-indigo-600 text-white'
        : 'text-gray-300 hover:bg-gray-700'
    }`}
  >
    {children}
  </button>
);

export const NavTabs: React.FC<NavTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mb-8 flex justify-center">
      <div className="flex p-1 space-x-1 bg-gray-800 rounded-lg">
        <TabButton active={activeTab === 'presentation'} onClick={() => setActiveTab('presentation')}>
          <SparklesIcon className="w-5 h-5" />
          Presentation Maker
        </TabButton>
        <TabButton active={activeTab === 'creative'} onClick={() => setActiveTab('creative')}>
          <PhotoIcon className="w-5 h-5" />
          Creative Studio
        </TabButton>
      </div>
    </div>
  );
};
