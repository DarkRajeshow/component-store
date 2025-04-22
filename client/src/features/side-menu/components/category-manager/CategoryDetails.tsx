// components/category-manager/CategoryDetails.tsx
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { FileImage, Layers } from "lucide-react";
import { useCategoryManager } from "../../hooks/category-manager/useCategoryManager";

interface CategoryDetailsProps {
    selectedCategoryId: string;
}

const CategoryDetails: React.FC<CategoryDetailsProps> = ({
    selectedCategoryId,
}) => {
    const { tempHierarchy, getPagePreviewUrl } = useCategoryManager({
        setSideMenuType: () => { },
        setIsPopUpOpen: () => { },
    });

    // State for page preview URLs
    const [pagePreviewUrls, setPagePreviewUrls] = useState<Record<string, string | false>>({});

    // Get category data from hierarchy
    const categoryData = selectedCategoryId ? tempHierarchy.categories[selectedCategoryId] : null;

    // Get pages for this category
    const pages = React.useMemo(() => 
        categoryData?.pages
            ? Object.entries(categoryData.pages).map(([name, id]) => ({
                name,
                id,
            }))
            : []
    , [categoryData?.pages]);

    // Get components for this category
    const components = categoryData?.components
        ? Object.entries(categoryData.components).map(([name, component]) => {
            if ('value' in component) {
                // Handle normal component
                return {
                    name,
                    type: 'normal',
                    value: component.value,
                    fileId: component.fileId,
                };
            } else {
                // Handle nested component
                return {
                    name,
                    type: 'nested',
                    selected: component.selected,
                    optionsCount: Object.keys(component.options).length,
                };
            }
        })
        : [];

    // Load preview URLs
    useEffect(() => {
        const loadPreviewUrls = async () => {
            const newPreviewUrls: Record<string, string | false> = {};
            
            for (const page of pages) {
                try {
                    const previewUrl = await getPagePreviewUrl(selectedCategoryId, page.id);
                    newPreviewUrls[page.id] = previewUrl;
                } catch (error) {
                    console.error('Error loading preview URL:', error);
                    newPreviewUrls[page.id] = false;
                }
            }
            
            setPagePreviewUrls(newPreviewUrls);
        };

        loadPreviewUrls();
    }, [selectedCategoryId, pages, getPagePreviewUrl]);

    if (!categoryData) {
        return <div>No category selected</div>;
    }

    return (
        <Tabs defaultValue="overview" className="min-h-[300px] h-full flex flex-col">
            <TabsList className="mb-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pages">Pages ({pages.length})</TabsTrigger>
                <TabsTrigger value="components">Components ({components.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex-grow">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium mb-2">Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4">
                                <h4 className="text-sm font-medium text-gray-500">Pages</h4>
                                <p className="text-2xl font-bold">{pages.length}</p>
                            </Card>
                            <Card className="p-4">
                                <h4 className="text-sm font-medium text-gray-500">Components</h4>
                                <p className="text-2xl font-bold">{components.length}</p>
                            </Card>
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="pages" className="flex-grow h-[calc(100%-40px)]">
                <ScrollArea className="h-full">
                    <div className="grid grid-cols-2 gap-4">
                        {pages.length > 0 ? (
                            pages.map((page) => (
                                <Card key={page.id} className="p-3 overflow-hidden">
                                    <h4 className="font-medium mb-2 truncate" title={page.name}>
                                        {page.name}
                                    </h4>
                                    {pagePreviewUrls[page.id] ? (
                                        <div className="h-32 border rounded overflow-hidden bg-gray-50">
                                            <img
                                                src={pagePreviewUrls[page.id] as string}
                                                alt={page.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-32 border rounded flex items-center justify-center bg-gray-50">
                                            <div className="text-center text-gray-400">
                                                <FileImage className="h-8 w-8 mx-auto mb-1 opacity-40" />
                                                <p className="text-xs">No preview</p>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-2 flex flex-col items-center justify-center py-10 text-gray-500">
                                <FileImage className="h-12 w-12 mb-2 opacity-50" />
                                <p>No pages found in this category</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </TabsContent>

            <TabsContent value="components" className="flex-grow h-[calc(100%-40px)]">
                <ScrollArea className="h-full">
                    <div className="space-y-3">
                        {components.length > 0 ? (
                            components.map((component, index) => (
                                <Card key={index} className="p-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium">{component.name}</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {component.type === 'normal' ? (
                                                    <>Value: {component.value ? 'True' : 'False'}</>
                                                ) : (
                                                    <>
                                                        Selected: <span className="font-medium">{component.selected}</span>
                                                        <div className="text-xs mt-1">
                                                            {component.optionsCount} options available
                                                        </div>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                        <div className="bg-gray-100 rounded-full px-2 py-1 text-xs">
                                            {component.type === 'normal' ? 'Simple' : 'Nested'}
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                                <Layers className="h-12 w-12 mb-2 opacity-50" />
                                <p>No components found in this category</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </TabsContent>
        </Tabs>
    );
};

export default CategoryDetails;