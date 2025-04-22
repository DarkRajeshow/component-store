// hooks/useAddChild.tsx
import useAppStore from "@/store/useAppStore";
import { IComponent, INestedChildLevel1, INestedChildLevel2, INestedParentLevel1 } from "@/types/project.types";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface UseAddChildProps {
    nestedIn?: string;
    setOperation: (operation: "" | "update" | "delete" | "add") => void;
    updatedValue: IComponent | INestedParentLevel1 | INestedChildLevel2 | INestedChildLevel1 | null
}

export const useAddChild = ({ nestedIn = "", setOperation, updatedValue }: UseAddChildProps) => {
    const {
        menuOf,
        newFiles,
        updatedComponents,
        structure,
        uniqueFileName,
        setUniqueFileName,
        setNewFiles,
        setUpdatedComponents,
    } = useAppStore();

    const [optionName, setOptionName] = useState("");
    const [isParent, setIsParent] = useState(false);
    const [isComponentAlreadyExist, setIsComponentAlreadyExist] = useState(false);
    const [selectedPages, setSelectedPages] = useState<string[]>([]);

    // Memoized handlers
    const handleOptionNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newOptionName = e.target.value;
        const optionsToCheck = (updatedValue as IComponent)?.options;

        if (optionsToCheck && optionsToCheck[newOptionName]) {
            toast.error(`Option name "${newOptionName}" already exists! Please choose a different name.`);
            setIsComponentAlreadyExist(true);
        } else {
            setIsComponentAlreadyExist(false);
        }

        setOptionName(newOptionName);
    }, [updatedValue]);

    const handleSetIsParent = useCallback((value: boolean) => {
        setIsParent(value);
    }, []);

    const handlePageSelection = useCallback((pageName: string) => {
        if (selectedPages.includes(pageName)) {
            const updatedNewFiles = { ...newFiles };
            delete updatedNewFiles[structure.pages[pageName]];
            setNewFiles(updatedNewFiles);

            setSelectedPages((prev) => prev.filter((page) => page !== pageName));
            return;
        }
        setSelectedPages((prev) => [pageName, ...prev]);
    }, [selectedPages, newFiles, structure.pages, setNewFiles]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, page: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === 'image/svg+xml' || file.type === 'application/pdf') {
                setNewFiles({
                    ...newFiles,
                    [uniqueFileName]: {
                        ...newFiles?.[uniqueFileName],
                        [structure.pages[page]]: file
                    },
                });
            } else {
                toast.error('Please choose a svg or pdf file.');
            }
        }
    }, [newFiles, setNewFiles, uniqueFileName, structure.pages]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, page: string) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'image/svg+xml' || file.type === 'application/pdf') {
                setNewFiles({
                    ...newFiles,
                    [uniqueFileName]: {
                        ...newFiles?.[uniqueFileName],
                        [structure.pages[page]]: file
                    },
                });
            } else {
                toast.error('Please choose a svg or pdf file.');
            }
        }
    }, [newFiles, setNewFiles, uniqueFileName, structure.pages]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    // Core logic functions
    const updateValue = useCallback((prev: any) => {
        const tempComponents = { ...prev };

        if (menuOf.length === 3) {
            tempComponents[menuOf[0]].options[menuOf[1]].options[menuOf[menuOf.length - 1]] = updatedValue;
        } else if (menuOf.length === 2) {
            tempComponents[menuOf[0]].options[menuOf[menuOf.length - 1]] = updatedValue;
        } else if (menuOf.length === 1) {
            tempComponents[menuOf[menuOf.length - 1]] = updatedValue;
        }

        return tempComponents;
    }, [menuOf, updatedValue]);

    const removeFile = useCallback((page: string) => {
        const updatedFiles = { ...newFiles };
        if (uniqueFileName && updatedFiles[uniqueFileName]) {
            delete updatedFiles[uniqueFileName][structure.pages[page]];
        }
        setNewFiles(updatedFiles);
    }, [newFiles, structure.pages, setNewFiles, uniqueFileName]);

    const handleAdd = useCallback(() => {
        // Validation
        if (optionName === "") {
            toast.error("Must add name for customization");
            return;
        }

        if (!isParent && !newFiles?.[uniqueFileName]) {
            toast.error("Must upload associated SVG file.");
            return;
        }

        if (selectedPages.length === 0) {
            toast.error('You must select at least 1 page.');
            return;
        }

        if (!isParent && (!newFiles?.[uniqueFileName] || (selectedPages.length !== Object.keys(newFiles?.[uniqueFileName]).length))) {
            toast.error(`You need to upload ${selectedPages.length} files, but you've only uploaded ${Object.keys(newFiles?.[uniqueFileName] || {}).length}.`);
            return;
        }

        // Update components
        const tempComponents = updateValue(updatedComponents);

        const tempUpdateFunc = () => {
            if (nestedIn) {
                if (menuOf.length === 2) {
                    if (!tempComponents[menuOf[0]]?.options[menuOf[1]]?.options) {
                        tempComponents[menuOf[0]].options[menuOf[1]].options = {};
                    }
                    tempComponents[menuOf[0]].options[menuOf[1]].options[nestedIn].options[optionName] = {
                        fileId: uniqueFileName
                    };
                } else if (menuOf.length === 1) {
                    if (!tempComponents[menuOf[0]].options[nestedIn].options) {
                        tempComponents[menuOf[0]].options[nestedIn].options = {};
                    }
                    tempComponents[menuOf[0]].options[nestedIn].options[optionName] = {
                        fileId: uniqueFileName
                    };
                }
            } else {
                if (isParent) {
                    if (menuOf.length === 2) {
                        tempComponents[menuOf[0]].options[menuOf[1]].options[optionName] = {
                            selected: " ",
                            options: {},
                        };
                    } else if (menuOf.length === 1) {
                        tempComponents[menuOf[0]].options[optionName] = {
                            selected: " ",
                            options: {},
                        };
                    }
                } else {
                    if (menuOf.length === 2) {
                        if (!tempComponents[menuOf[0]]?.options[menuOf[1]]?.options) {
                            tempComponents[menuOf[0]].options[menuOf[1]].options = {};
                        }

                        tempComponents[menuOf[0]].options[menuOf[1]].options[optionName] = {
                            fileId: uniqueFileName
                        };
                    } else if (menuOf.length === 1) {
                        if (!tempComponents[menuOf[0]]?.options) {
                            tempComponents[menuOf[0]].options = {};
                        }
                        tempComponents[menuOf[0]].options[optionName] = {
                            fileId: uniqueFileName
                        };
                    }
                }
            }

            return tempComponents;
        };

        const newUpdatedComponents = tempUpdateFunc();
        setUpdatedComponents(newUpdatedComponents);
        setUniqueFileName();
        setOperation("");
    }, [
        optionName,
        isParent,
        newFiles,
        uniqueFileName,
        selectedPages,
        updateValue,
        updatedComponents,
        nestedIn,
        menuOf,
        setUpdatedComponents,
        setUniqueFileName,
        setOperation
    ]);


    const handleCancel = useCallback(() => {
        setOperation("");
        const updatedNewFiles = { ...newFiles };
        delete updatedNewFiles[uniqueFileName];
        setNewFiles(updatedNewFiles);
    }, [setOperation, newFiles, uniqueFileName, setNewFiles]);

    useEffect(() => {
        const firstPage = structure?.pages ? Object.keys(structure?.pages)[0] : undefined
        if (firstPage) {
            setSelectedPages([firstPage])
        }
    }, [structure.pages])

    
    return {
        optionName,
        isParent,
        isComponentAlreadyExist,
        selectedPages,
        menuOf,
        uniqueFileName,
        newFiles,
        handleOptionNameChange,
        handleSetIsParent,
        handlePageSelection,
        handleFileChange,
        handleDrop,
        handleDragOver,
        handleAdd,
        handleCancel,
        pages: structure.pages,
        removeFile
    };
};