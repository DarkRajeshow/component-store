// hooks/useAddChild.tsx
import useStore from "@/store/useStore";
import { IAttribute } from "@/types/types";
import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UseAddChildProps {
    nestedIn?: string;
    setOperation: (operation: string) => void;
    updatedValue: {
        options?: {
            [key: string]: IAttribute;
        };
    };
}

export const useAddChild = ({ nestedIn = "", setOperation, updatedValue }: UseAddChildProps) => {
    const {
        menuOf,
        newFiles,
        setNewFiles,
        setUpdatedComponents,
        updatedComponents,
        uniqueFileName,
        setUniqueFileName,
        pages
    } = useStore();

    const [optionName, setOptionName] = useState("");
    const [isParent, setIsParent] = useState(false);
    const [isAttributeAlreadyExist, setIsAttributeAlreadyExist] = useState(false);
    const [selectedPages, setSelectedPages] = useState(['gad']);

    // Memoized handlers
    const handleOptionNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newOptionName = e.target.value;
        const optionsToCheck = updatedValue?.options;

        if (optionsToCheck && optionsToCheck[newOptionName]) {
            toast.error(`Option name "${newOptionName}" already exists! Please choose a different name.`);
            setIsAttributeAlreadyExist(true);
        } else {
            setIsAttributeAlreadyExist(false);
        }

        setOptionName(newOptionName);
    }, [updatedValue?.options]);

    const handleSetIsParent = useCallback((value: boolean) => {
        setIsParent(value);
    }, []);

    const handlePageSelection = useCallback((pageName: string) => {
        if (selectedPages.includes(pageName)) {
            const updatedNewFiles = { ...newFiles };
            delete updatedNewFiles[pages[pageName]];
            setNewFiles(updatedNewFiles);

            setSelectedPages((prev) => prev.filter((page) => page !== pageName));
            return;
        }
        setSelectedPages((prev) => [pageName, ...prev]);
    }, [selectedPages, newFiles, pages, setNewFiles]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, page: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === 'image/svg+xml' || file.type === 'application/pdf') {
                setNewFiles({
                    ...newFiles,
                    [uniqueFileName]: {
                        ...newFiles?.[uniqueFileName],
                        [pages[page]]: file
                    },
                });
            } else {
                toast.error('Please choose a svg or pdf file.');
            }
        }
    }, [newFiles, setNewFiles, uniqueFileName, pages]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, page: string) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'image/svg+xml' || file.type === 'application/pdf') {
                setNewFiles({
                    ...newFiles,
                    [uniqueFileName]: {
                        ...newFiles?.[uniqueFileName],
                        [pages[page]]: file
                    },
                });
            } else {
                toast.error('Please choose a svg or pdf file.');
            }
        }
    }, [newFiles, setNewFiles, uniqueFileName, pages]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    // Core logic functions
    const updateValue = useCallback((prev: any) => {
        const tempAttributes = { ...prev };

        if (menuOf.length === 3) {
            tempAttributes[menuOf[0]].options[menuOf[1]].options[menuOf[menuOf.length - 1]] = updatedValue;
        } else if (menuOf.length === 2) {
            tempAttributes[menuOf[0]].options[menuOf[menuOf.length - 1]] = updatedValue;
        } else if (menuOf.length === 1) {
            tempAttributes[menuOf[menuOf.length - 1]] = updatedValue;
        }

        return tempAttributes;
    }, [menuOf, updatedValue]);

    const removeFile = useCallback((page: string) => {
        const updatedFiles = { ...newFiles };
        if (uniqueFileName && updatedFiles[uniqueFileName]) {
            delete updatedFiles[uniqueFileName][pages[page]];
        }
        setNewFiles(updatedFiles);
    }, [newFiles, pages, setNewFiles, uniqueFileName]);

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

        // Update attributes
        const tempAttributes = updateValue(updatedComponents);

        const tempUpdateFunc = () => {
            if (nestedIn) {
                if (menuOf.length === 2) {
                    if (!tempAttributes[menuOf[0]]?.options[menuOf[1]]?.options) {
                        tempAttributes[menuOf[0]].options[menuOf[1]].options = {};
                    }
                    tempAttributes[menuOf[0]].options[menuOf[1]].options[nestedIn].options[optionName] = {
                        path: uniqueFileName
                    };
                } else if (menuOf.length === 1) {
                    if (!tempAttributes[menuOf[0]].options[nestedIn].options) {
                        tempAttributes[menuOf[0]].options[nestedIn].options = {};
                    }
                    tempAttributes[menuOf[0]].options[nestedIn].options[optionName] = {
                        path: uniqueFileName
                    };
                }
            } else {
                if (isParent) {
                    if (menuOf.length === 2) {
                        tempAttributes[menuOf[0]].options[menuOf[1]].options[optionName] = {
                            selectedOption: " ",
                            options: {},
                        };
                    } else if (menuOf.length === 1) {
                        tempAttributes[menuOf[0]].options[optionName] = {
                            selectedOption: " ",
                            options: {},
                        };
                    }
                } else {
                    if (menuOf.length === 2) {
                        if (!tempAttributes[menuOf[0]]?.options[menuOf[1]]?.options) {
                            tempAttributes[menuOf[0]].options[menuOf[1]].options = {};
                        }

                        tempAttributes[menuOf[0]].options[menuOf[1]].options[optionName] = {
                            path: uniqueFileName
                        };
                    } else if (menuOf.length === 1) {
                        if (!tempAttributes[menuOf[0]]?.options) {
                            tempAttributes[menuOf[0]].options = {};
                        }
                        tempAttributes[menuOf[0]].options[optionName] = {
                            path: uniqueFileName
                        };
                    }
                }
            }

            return tempAttributes;
        };

        const newupdatedComponents = tempUpdateFunc();
        setUpdatedComponents(newupdatedComponents);
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

    return {
        optionName,
        isParent,
        isAttributeAlreadyExist,
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
        pages,
        removeFile
    };
};