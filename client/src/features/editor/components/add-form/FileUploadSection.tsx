import { useCallback } from 'react';
import { toast } from 'sonner';


import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// API and Utils
import { handleClick } from '../../../../utils/dragDrop';
import { Copy, X } from 'lucide-react';

interface CustomizationFiles {
    [key: string]: File;
}


// SOLID: Single Responsibility Principle - Separate components for different parts of the form
// File Upload Component
const FileUploadSection: React.FC<{
    page: string;
    pages: Record<string, string>;
    newCustomizationFiles: CustomizationFiles;
    setNewCustomizationFiles: React.Dispatch<React.SetStateAction<CustomizationFiles>>;
}> = ({ page, pages, newCustomizationFiles, setNewCustomizationFiles }) => {
    // Handle file selection
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewCustomizationFiles((prev) => ({
                ...prev,
                [pages[page]]: e.target.files![0]
            }));
        }
    }, [page, pages, setNewCustomizationFiles]);

    // Handle file drop
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files[0].type === 'image/svg+xml' || e.dataTransfer.files[0].type === 'application/pdf') {
            setNewCustomizationFiles((prev) => ({
                ...prev,
                [pages[page]]: e.dataTransfer.files[0]
            }));
        } else {
            toast.error('Please choose a pdf/svg file.');
        }
    }, [page, pages, setNewCustomizationFiles]);

    // Handle file removal
    const handleRemoveFile = useCallback(() => {
        setNewCustomizationFiles((prev) => {
            const updatedFiles = { ...prev };
            delete updatedFiles[pages[page]];
            return updatedFiles;
        });
    }, [page, pages, setNewCustomizationFiles]);

    return (
        <Card className="border border-zinc-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium capitalize">
                    File for <span className="uppercase">{page}</span> Page
                </CardTitle>
            </CardHeader>
            <CardContent>
                {newCustomizationFiles?.[pages[page]] && (
                    <div className="mb-4 p-3 rounded-lg bg-blue-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <p className="flex items-center gap-2 text-base">
                                Selected file: <Badge variant="secondary" className="font-medium text-red-800 text-sm">{newCustomizationFiles[pages[page]].name}</Badge>
                            </p>
                            <Button
                                variant="ghost"
                                size="icon"
                                type='button'
                                onClick={() => {
                                    navigator.clipboard.writeText(newCustomizationFiles[pages[page]].name);
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
                            onClick={handleRemoveFile}
                            className="h-8 w-8 hover:text-red-700"
                        >
                            <X className="h-5 w-5" />
                            {/* 
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-5 w-5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg> */}
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-gray-600">Change File</Label>
                        <input
                            id={page}
                            type="file"
                            accept='.svg,.pdf'
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <div
                            onClick={() => handleClick(page)}
                            onDrop={handleDrop}
                            onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            className="w-full aspect-square p-4 border-2 border-dashed border-gray-400 cursor-pointer flex items-center justify-center min-h-72 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <span className='text-sm w-60 mx-auto text-center'>
                                Drag and drop the component in SVG format.
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-600">File Preview</Label>
                        <div className='aspect-square p-5 bg-gray-50 border border-gray-300 rounded-md w-full overflow-hidden items-center justify-center flex flex-col'>
                            {newCustomizationFiles?.[pages[page]] ? (
                                newCustomizationFiles[pages[page]].type === "application/pdf" ? (
                                    <embed
                                        src={URL.createObjectURL(newCustomizationFiles[pages[page]])}
                                        type="application/pdf"
                                        width="100%"
                                        height="500px"
                                    />
                                ) : (
                                    <img
                                        src={URL.createObjectURL(newCustomizationFiles[pages[page]])}
                                        alt="base drawing"
                                        className="w-full rounded-xl"
                                    />
                                )
                            ) : (
                                <p className="text-gray-500">Upload pdf or svg file to preview</p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default FileUploadSection;