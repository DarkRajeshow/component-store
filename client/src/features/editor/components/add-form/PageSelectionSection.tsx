// Page Selection Component
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CustomizationFiles {
    [key: string]: File;
}

const PageSelectionSection: React.FC<{
    pages: Record<string, string>;
    selectedPages: string[];
    setSelectedPages: React.Dispatch<React.SetStateAction<string[]>>;
    newCustomizationFiles: CustomizationFiles;
    setNewCustomizationFiles: React.Dispatch<React.SetStateAction<CustomizationFiles>>;
}> = ({ pages, selectedPages, setSelectedPages, newCustomizationFiles, setNewCustomizationFiles }) => {

    const handlePageToggle = useCallback((pageName: string) => {
        if (selectedPages.includes(pageName)) {
            // Remove page and its associated file
            const updatedNewFiles = { ...newCustomizationFiles };
            delete updatedNewFiles[pages[pageName]];
            setNewCustomizationFiles(updatedNewFiles);

            const tempSelectedPages = selectedPages.filter((page) => page !== pageName);
            setSelectedPages(tempSelectedPages);
        } else {
            // Add page
            setSelectedPages((prev) => [...prev, pageName]);
        }
    }, [pages, selectedPages, setSelectedPages, newCustomizationFiles, setNewCustomizationFiles]);

    return (
        <div className="space-y-2">
            <Label className="text-black font-medium">Select impacted pages</Label>
            <div className="grid grid-cols-4 gap-1.5">
                {Object.keys(pages).map((pageName) => (
                    <Button
                        key={pageName}
                        type="button"
                        variant={selectedPages.includes(pageName) ? "default" : "outline"}
                        className={`h-12 uppercase text-sm font-medium ${selectedPages.includes(pageName) ? 'bg-green-200 hover:bg-green-300 text-black border-zinc-400' : 'bg-blue-50 hover:bg-blue-100 text-black'
                            }`}
                        onClick={() => handlePageToggle(pageName)}
                    >
                        {pageName}
                    </Button>
                ))}
            </div>
        </div>
    );
};


export default PageSelectionSection;