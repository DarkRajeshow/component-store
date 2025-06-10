import { memo, DragEvent } from 'react';
import { handleClick, handleDragOver } from '../../../../../utils/dragDrop';
import { Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';


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
                <div className="mb-4 p-3 rounded-lg bg-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className="flex items-center gap-2 text-base">
                            Selected file: <Badge variant="secondary" className="font-medium text-red-800 text-sm">{selectedFile.name}</Badge>
                        </p>
                        <Button
                            variant="ghost"
                            size="icon"
                            type='button'
                            onClick={() => {
                                navigator.clipboard.writeText(selectedFile.name);
                                toast.success('Filename copied to clipboard');
                            }}
                            className="h-8 w-8 hover:text-blue-700"
                        >
                            <Copy className="h-5 w-5" />
                        </Button>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        type='button'
                        onClick={() => {
                            removeFile(page)
                        }}
                        className="h-8 w-8 hover:text-red-700"
                    >
                        <X className="h-5 w-5" />
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