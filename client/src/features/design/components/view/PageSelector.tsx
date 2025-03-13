import React from 'react';

interface PageSelectorProps {
  pages: Record<string, string>;
  selectedPage: string;
  setSelectedPage: (page: string) => void;
  onAddPage: () => void;
  maxPages?: number;
}

const PageSelector: React.FC<PageSelectorProps> = ({
  pages,
  selectedPage,
  setSelectedPage,
  onAddPage,
  maxPages = 8
}) => {
  return (
    <div className='flex gap-2 items-center'>
      <p className='font-medium text-sm'>Pages</p>
      <div className='flex pl-2 gap-2'>
        {Object.keys(pages).map((page) => (
          <div 
            onClick={() => setSelectedPage(page)} 
            className={`py-1 px-2 bg-zinc-100 cursor-pointer uppercase text-sm font-medium border-2 border-transparent ${selectedPage === page && 'border-zinc-500'}`} 
            key={page}
          >
            {page}
          </div>
        ))}
      </div>
      {Object.keys(pages).length <= maxPages && (
        <svg
          onClick={onAddPage}
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={1.5} 
          stroke="currentColor" 
          className="h-8 w-8 p-1 hover:border-black border-2 transition-all cursor-pointer"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      )}
    </div>
  );
};

export default PageSelector; 