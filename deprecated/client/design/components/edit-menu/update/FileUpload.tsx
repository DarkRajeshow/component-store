import React from 'react';
// import { Card, CardContent } from '@/components/ui/card';
import { handleClick, handleDragOver } from '../../../../../utils/dragDrop';

interface FileUploadProps {
    pageId: string;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ pageId, onFileChange, onDrop }) => {
    return (
        <div className='flex flex-col gap-2'>
            <p className="font-medium text-gray-600">Change File</p>
            <input
                id={pageId}
                type="file"
                multiple
                accept='.svg,.pdf'
                onChange={onFileChange}
                className="hidden"
            />

            <div
                onClick={() => handleClick(pageId)}
                onDrop={onDrop}
                onDragOver={handleDragOver}
                className="w-full aspect-square p-4 border-2 border-dashed border-gray-400 cursor-pointer flex items-center justify-center min-h-72 hover:border-gray-600 transition-colors"
            >
                <span className='text-sm w-60 mx-auto text-center'>
                    Drag and drop the customization option in SVG/PDF format.
                </span>
            </div>
        </div>
    );
};

export default FileUpload;