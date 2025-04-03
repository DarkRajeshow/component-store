import React from 'react';

interface PageSelectorProps {
    pages: { [key: string]: string };
    selectedPages: string[];
    onPageSelect: (pageName: string) => void;
}

const PageSelector: React.FC<PageSelectorProps> = ({ pages, selectedPages, onPageSelect }) => {
    return (
        <div className='my-6'>
            <label className='text-black text-lg font-medium'>Select impacted pages</label>
            <div className="grid grid-cols-4 gap-1.5 mt-2 mb-4">
                {Object.keys(pages).map((pageName) => (
                    <div
                        key={pageName}
                        className={`text-center uppercase text-sm rounded-md font-medium cursor-pointer relative border-2 
              ${selectedPages.includes(pageName)
                                ? 'border-zinc-400 bg-green-200 hover:bg-green-300'
                                : 'border-transparent bg-blue-50 hover:bg-blue-100'} 
              transition-colors`}
                    >
                        <p
                            className="px-4 py-3"
                            onClick={() => onPageSelect(pageName)}
                        >
                            {pageName}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PageSelector;