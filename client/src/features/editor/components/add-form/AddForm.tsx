import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

// UI Components
import {
    DialogDescription,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// API and Utils
import { handleClick } from '../../../../utils/dragDrop';
import useAppStore from '../../../../store/useAppStore';
import DisplayOptions from '../action-bar/DisplayOptions';
import { useModel } from '@/contexts/ModelContext';
import { IComponentOperationResponse, IStructure } from '@/types/design.types';
import { IComponents } from '@/types/project.types';

interface ComponentType {
    value: string;
    Description: string;
}

interface AddFormProps {
    componentType: string;
    setOldComponentFileName: (name: string) => void;
    componentFileName: string;
    setComponentFileName: (name: string) => void;
    newComponentTypes: ComponentType[];
    setComponentType: (type: string) => void;
    levelOneNest: string;
    setLevelOneNest: (nest: string) => void;
    levelTwoNest: string;
    setLevelTwoNest: (nest: string) => void;
    tempComponents: IComponents;
}

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
                        <p>
                            Selected file: <Badge variant="outline" className="font-medium text-red-800">{newCustomizationFiles[pages[page]].name}</Badge>
                        </p>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveFile}
                            className="h-8 w-8 hover:text-red-700"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-5 w-5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
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
                                Drag and drop the customization option in SVG format.
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

// Page Selection Component
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
            setSelectedPages((prev) => [pageName, ...prev]);
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

// Component Type Selection Component
const ComponentTypeSection: React.FC<{
    componentType: string;
    setComponentType: (type: string) => void;
    componentTypes: ComponentType[];
}> = ({ componentType, setComponentType, componentTypes }) => {
    return (
        <div className="space-y-2">
            <Label htmlFor="component-type" className="text-black font-medium">
                Select Component type
            </Label>
            <Select value={componentType} onValueChange={setComponentType}>
                <SelectTrigger className="w-full bg-white/80">
                    <SelectValue placeholder="Select component type" />
                </SelectTrigger>
                <SelectContent>
                    {componentTypes.map((attType, index) => (
                        <SelectItem key={index} value={attType.value}>
                            {index + 1 + ". " + attType.Description}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

// Parent Component Selection Component
const ParentComponentSection: React.FC<{
    level: number;
    levelOneNest: string;
    setLevelOneNest: (nest: string) => void;
    levelTwoNest?: string;
    setLevelTwoNest?: (nest: string) => void;
    isNestedLevel2?: boolean;
}> = ({ level, levelOneNest, setLevelOneNest, levelTwoNest, setLevelTwoNest, isNestedLevel2 }) => {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="parent-component" className="text-black font-medium">
                    Select Parent Component
                </Label>
                <Select value={levelOneNest} onValueChange={setLevelOneNest}>
                    <SelectTrigger className="w-full bg-white/80">
                        <SelectValue placeholder="Select parent component" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value=" " disabled>Select Parent Component</SelectItem>
                        <DisplayOptions level={0} levelOneNest="" isNestedLevel2={isNestedLevel2} />
                    </SelectContent>
                </Select>
            </div>

            {level === 2 && levelOneNest && setLevelTwoNest && (
                <div className="space-y-2">
                    <Label htmlFor="nested-component" className="text-black font-medium">
                        Select Level 1 Nested Component
                    </Label>
                    <Select value={levelTwoNest || ""} onValueChange={setLevelTwoNest}>
                        <SelectTrigger className="w-full bg-white/80">
                            <SelectValue placeholder="Select level 1 nested component" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="" disabled>Select Level 1 Nested Component</SelectItem>
                            <DisplayOptions level={1} levelOneNest={levelOneNest} />
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
};

// SOLID: Main component with dependency injection and separation of concerns
const AddForm: React.FC<AddFormProps> = ({
    componentType,
    setOldComponentFileName,
    componentFileName,
    setComponentFileName,
    newComponentTypes,
    setComponentType,
    levelOneNest,
    setLevelOneNest,
    levelTwoNest,
    setLevelTwoNest,
    tempComponents
}) => {
    // Get store data
    const store = useAppStore();
    const {
        loading,
        content,
        uniqueFileName,
        structure,
        setUndoStack,
        setRedoStack,
    } = store;


    const { addComponent, addParentComponent, refreshContent } = useModel()
    const { id } = useParams<{ id: string }>();

    // Local state
    const [addComponentLoading, setAddComponentLoading] = useState<boolean>(false);
    const [selectedPages, setSelectedPages] = useState<string[]>(['gad']);
    const [newCustomizationFiles, setNewCustomizationFiles] = useState<CustomizationFiles>({});

    // Determine if this is a parent component type
    const isParentComponentType = useMemo(() => {
        return componentType === "nestedParentLevel0" || componentType === "nestedParentLevel1";
    }, [componentType]);

    // SOLID: Single Responsibility - API calls extracted to separate functions


    // Handle API response
    const handleApiResponse = useCallback((data: IComponentOperationResponse) => {
        if (data.success) {
            toast.success(data.status || 'Operation successful');
            setNewCustomizationFiles({});
            setComponentFileName("");
            refreshContent();
        } else {
            toast.error(data.status || 'Operation failed');
        }
    }, [refreshContent, setComponentFileName]);

    // Close dialog
    const closeDialog = useCallback(() => {
        const closeButton = document.getElementById("closeButton");
        if (closeButton) {
            closeButton.click();
        }
    }, []);


    // Add new parent component (no files)
    const addParentComponentOperation = useCallback(async (): Promise<void> => {
        setAddComponentLoading(true);
        try {
            const updatedStructure: IStructure = {
                ...structure,
                components: tempComponents
            }

            const data = await addParentComponent({
                structure: updatedStructure
            });

            if (data) {
                handleApiResponse(data);
            }

        } catch (error) {
            console.error(error);
            toast.error('Failed to add parent component.');
        } finally {
            setAddComponentLoading(false);
            closeDialog();
        }
    }, [addParentComponent, structure, tempComponents, closeDialog, handleApiResponse]);

    // Add new component with files
    const addComponentOperation = useCallback(async (): Promise<void> => {
        if (!id) {
            toast.error("No design ID found");
            return;
        }

        const formData = new FormData();
        setAddComponentLoading(true);

        try {
            if (!loading && content) {
                const updatedStructure: IStructure = {
                    ...structure,
                    components: tempComponents
                }

                // Passing folder, structure, and files in formdata
                formData.append('folder', content.folder);
                formData.append('structure', JSON.stringify(updatedStructure));

                for (const [pageFolder, file] of Object.entries(newCustomizationFiles)) {
                    const customName = `${pageFolder}<<&&>>${uniqueFileName}${file.name.slice(-4)}`; // Folder path + filename
                    formData.append('files', file, customName);
                }
            }

            const data = await addComponent(formData);
            if (data) {
                handleApiResponse(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to add a customization component.');
        } finally {
            setAddComponentLoading(false);
            closeDialog();
        }

    }, [id, loading, content, addComponent, structure, tempComponents, uniqueFileName, newCustomizationFiles, closeDialog, handleApiResponse]);


    // Handle form submission
    const handleAddComponentOperation = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setUndoStack([]);
        setRedoStack([]);

        if (isParentComponentType) {
            addParentComponentOperation();
        } else {
            if (!newCustomizationFiles || (selectedPages.length !== Object.keys(newCustomizationFiles).length)) {
                toast.error(`You need to upload ${selectedPages.length} files, but you've only uploaded ${Object.keys(newCustomizationFiles).length}.`);
                return;
            }
            addComponentOperation();
        }
    }, [isParentComponentType, addParentComponentOperation, addComponentOperation, selectedPages.length, newCustomizationFiles, setUndoStack, setRedoStack]);

    return (
        <form onSubmit={handleAddComponentOperation} className="flex flex-col gap-4 min-w-[715px]">
            <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-medium">Add New Customization Option</DialogTitle>
                <DialogTrigger id="closeButton" asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </Button>
                </DialogTrigger>
            </div>
            <DialogDescription hidden />

            <div className="space-y-6">
                {/* Component Name Input */}
                <div className="space-y-2">
                    <Label htmlFor="component-name" className="text-black font-medium">
                        Component Name
                    </Label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                            </svg>
                        </div>
                        <Input
                            id="component-name"
                            required
                            value={componentFileName}
                            onChange={(e) => {
                                setOldComponentFileName(componentFileName);
                                setComponentFileName(e.target.value);
                            }}
                            className="pl-10"
                            placeholder="Component name"
                        />
                    </div>
                </div>

                {/* Component Type Selection */}
                <ComponentTypeSection
                    componentType={componentType}
                    setComponentType={setComponentType}
                    componentTypes={newComponentTypes}
                />

                {/* Nested Component Selection */}
                {componentType === "nestedChildLevel1" && (
                    <ParentComponentSection
                        level={1}
                        levelOneNest={levelOneNest}
                        setLevelOneNest={setLevelOneNest}
                    />
                )}

                {componentType === "nestedChildLevel2" && (
                    <ParentComponentSection
                        level={2}
                        levelOneNest={levelOneNest}
                        setLevelOneNest={setLevelOneNest}
                        levelTwoNest={levelTwoNest}
                        setLevelTwoNest={setLevelTwoNest}
                        isNestedLevel2={true}
                    />
                )}

                {componentType === "nestedParentLevel1" && (
                    <ParentComponentSection
                        level={1}
                        levelOneNest={levelOneNest}
                        setLevelOneNest={setLevelOneNest}
                    />
                )}

                <Separator />

                {/* Parent Component Note or File Upload Section */}
                {isParentComponentType ? (
                    <div className="bg-blue-50 p-4 rounded-md">
                        <p className="text-blue-800">
                            * No need for any file uploads, add the options inside this component.
                        </p>
                    </div>
                ) : (
                    <>
                        <PageSelectionSection
                            pages={structure.pages}
                            selectedPages={selectedPages}
                            setSelectedPages={setSelectedPages}
                            newCustomizationFiles={newCustomizationFiles}
                            setNewCustomizationFiles={setNewCustomizationFiles}
                        />

                        <div className="space-y-4">
                            {selectedPages.map((page) => (
                                <FileUploadSection
                                    key={page}
                                    page={page}
                                    pages={structure.pages}
                                    newCustomizationFiles={newCustomizationFiles}
                                    setNewCustomizationFiles={setNewCustomizationFiles}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <Button
                type="submit"
                disabled={(componentType !== "nestedParentLevel0" && componentType !== "nestedParentLevel1") && selectedPages.length === 0}
                className="mt-4 self-end"
            >
                {addComponentLoading ? (
                    <>
                        <span className="mr-2">Creating...</span>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </>
                ) : (
                    "Create"
                )}
            </Button>
        </form>
    );
};

export default AddForm;