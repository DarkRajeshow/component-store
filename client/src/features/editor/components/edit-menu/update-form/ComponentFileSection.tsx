import React from 'react';
import FileUpload from './FileUpload';
import FilePreview from './FilePreview';

interface ComponentFileSectionProps {
  page: string;
  pages: { [key: string]: string };
  selectedFile: File | null;
  baseContentPath: string;
  componentPath: string;
  fileExists: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemoveFile: () => void;
}

const ComponentFileSection: React.FC<ComponentFileSectionProps> = ({
  page,
  pages,
  selectedFile,
  baseContentPath,
  componentPath,
  fileExists,
  onFileChange,
  onDrop,
  onRemoveFile
}) => {
  return (
    <div className='py-6 bg-yellow-50 px-6 border border-zinc-300 rounded-md'>
      <h2 className='font-medium text-black capitalize pb-2'>
        File for <span className='uppercase'>`{page}`</span> Page
      </h2>

      {selectedFile && (
        <div className='px-4 py-2 mb-4 rounded-lg bg-blue-200 flex items-center justify-between'>
          <p>
            Selected file: <span className='font-medium text-red-800'>{selectedFile.name}</span>
          </p>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="size-5 hover:text-red-700 cursor-pointer" 
            onClick={onRemoveFile}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </div>
      )}

      <div className='grid grid-cols-2 gap-4 pt-1'>
        <FileUpload 
          pageId={page}
          onFileChange={onFileChange}
          onDrop={onDrop}
        />
        
        <FilePreview 
          selectedFile={selectedFile}
          existingFileUrl={`${baseContentPath}/${pages[page]}/${componentPath}.svg`}
          hasExistingFile={fileExists}
        />
      </div>
    </div>
  );
};

export default ComponentFileSection;