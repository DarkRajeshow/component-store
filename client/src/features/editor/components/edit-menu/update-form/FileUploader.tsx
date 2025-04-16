import { memo, DragEvent } from 'react';
import { handleClick, handleDragOver } from '../../../../../utils/dragDrop';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';


const FileUploader = memo(({
    page,
    pagePath,
    handleFileChange,
    handleDrop,
    selectedFile,
    fileExists = false,
    baseContentPath = "",
    valuePath = "",
    removeFile
}: {
    page: string;
    pagePath: string;
    handleFileChange: (e: any, page: string) => void;
    handleDrop: (e: any, page: string) => void;
    selectedFile: File | null | undefined;
    fileExists?: boolean;
    baseContentPath?: string;
    valuePath?: string;
    removeFile: (page: string) => void;
}) => { 
    return (
        <div className='py-6 bg-yellow-50 px-6 border border-zinc-300 rounded-md'>
            <h2 className='font-medium text-black capitalize pb-2'>
                File for <span className='uppercase'>{page}</span> Page
            </h2>

            {selectedFile && (
                <div className='px-4 py-2 rounded-lg bg-blue-200 flex items-center justify-between mb-2'>
                    <p>
                        Selected file: <span className='font-medium text-red-800'>{selectedFile.name}</span>
                    </p>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(page)}
                        className="hover:text-red-700 h-8 w-8"
                    >
                        <XIcon className="h-5 w-5" />
                    </Button>
                </div>
            )}

            <div className='grid grid-cols-2 gap-4 pt-1'>
                <div className='flex flex-col gap-2'>
                    <p className="font-medium text-gray-600">Change File</p>
                    <input
                        id={page}
                        type="file"
                        multiple
                        accept='.svg,.pdf'
                        onChange={(e) => handleFileChange(e, page)}
                        className="hidden"
                    />

                    <div
                        onClick={() => handleClick(page)}
                        onDrop={(e) => handleDrop(e, page)}
                        onDragOver={(e: DragEvent<HTMLDivElement>) => handleDragOver(e)}
                        className="w-full aspect-square p-4 border-2 border-dashed border-gray-400 cursor-pointer flex items-center justify-center min-h-72"
                    >
                        <span className='text-sm w-60 mx-auto text-center'>
                            Drag and drop the customization option in SVG format.
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 flex-col">
                    <p className="font-medium text-gray-600">File Preview</p>
                    <div className='aspect-square p-5 bg-white border-2 border-gray-400 w-full overflow-hidden items-center justify-center flex flex-col'>
                        {selectedFile ? (
                            selectedFile.type === "application/pdf" ? (
                                <embed
                                    src={URL.createObjectURL(selectedFile)}
                                    type="application/pdf"
                                    width="100%"
                                    height="500px"
                                />
                            ) : (
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="base drawing"
                                    className="w-full rounded-xl"
                                />
                            )
                        ) : (
                            fileExists ? (
                                <img
                                    src={`${baseContentPath}/${pagePath}/${valuePath}.svg`}
                                    alt="base drawing"
                                    className="w-full rounded-xl"
                                />
                            ) : (
                                <p>Upload PDF or SVG File.</p>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

FileUploader.displayName = 'FileUploader';

export default FileUploader;