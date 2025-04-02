import React from 'react';

interface FilePreviewProps {
    selectedFile: File | null;
    existingFileUrl?: string;
    hasExistingFile: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({ selectedFile, existingFileUrl, hasExistingFile }) => {
    return (
        <div className="flex gap-2 flex-col">
            <p className="font-medium text-gray-600">File Preview</p>
            <div className='aspect-square p-5 bg-zinc-100 border-2 border-gray-400 w-full overflow-hidden items-center justify-center flex flex-col'>
                {selectedFile ? (
                    selectedFile?.type === "application/pdf" ? (
                        <embed
                            src={URL.createObjectURL(selectedFile)}
                            type="application/pdf"
                            width="100%"
                            height="500px"
                        />
                    ) : (
                        <img
                            src={URL.createObjectURL(selectedFile)}
                            alt="preview"
                            className="w-full rounded-xl"
                        />
                    )
                ) : (
                    hasExistingFile ? (
                        <img
                            src={existingFileUrl}
                            alt="existing file"
                            className="w-full rounded-xl"
                        />
                    ) : (
                        <p className="text-gray-500">Upload PDF or SVG File.</p>
                    )
                )}
            </div>
        </div>
    );
};

export default FilePreview;