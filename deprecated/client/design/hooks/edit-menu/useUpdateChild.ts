import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { checkFileExists } from '@/utils/checkFileExists';
import { IAttribute, IAttributeOption } from '@/types/types';
import useStore from '@/store/useStore';
import filePath from '@/utils/filePath';

interface FileExistenceStatus {
    [key: string]: boolean;
}

interface UseUpdateChildProps {
    parentOption?: string;
    nestedIn?: string;
    option: string;
    value: IAttribute | IAttributeOption;
    setFileCounts: (counts: Record<string, { fileUploads: number; selectedPagesCount: number }>) => void;
    setUpdatedValue: (value: any) => void;
    updatedValue: any;
}

export function useUpdateChild({
    parentOption = "",
    nestedIn = "",
    option,
    value,
    setFileCounts,
    setUpdatedValue,
    updatedValue
}: UseUpdateChildProps) {
    const {
        design,
        newFiles,
        setNewFiles,
        pages,
        loading,
        filesToDelete,
        setFilesToDelete,
        deleteFilesOfPages,
        setDeleteFilesOfPages
    } = useStore();

    const [renamedOption, setRenamedOption] = useState(option);
    const [operation, setOperation] = useState("");
    const [fileExistenceStatus, setFileExistenceStatus] = useState<FileExistenceStatus>({});
    const [selectedPages, setSelectedPages] = useState(['gad']);

    const baseFilePath = `${filePath}${design.folder}`;

    const handleFileChange = useCallback((e, page) => {
        const file = e.target.files[0];

        if (!file) return;

        if (file.type === 'image/svg+xml' || file.type === 'application/pdf') {
            setNewFiles({
                ...newFiles,
                [value?.path]: {
                    ...newFiles?.[value?.path],
                    [pages[page]]: file
                },
            });
        } else {
            toast.error('Please choose a SVG or PDF file.');
        }
    }, [newFiles, pages, setNewFiles, value?.path]);

    const handleDrop = useCallback((e, page) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];

        if (!file) return;

        if (file.type === 'image/svg+xml' || file.type === 'application/pdf') {
            setNewFiles({
                ...newFiles,
                [value?.path]: {
                    ...newFiles?.[value?.path],
                    [pages[page]]: file
                },
            });
        } else {
            toast.error('Please choose a SVG or PDF file.');
        }
    }, [newFiles, pages, setNewFiles, value?.path]);

    const handleDelete = useCallback(() => {
        // Deep copy
        const tempUpdateValue = JSON.parse(JSON.stringify(updatedValue));
        if (parentOption) {
            if (tempUpdateValue.options[parentOption].selectedOption === renamedOption) {
                tempUpdateValue.options[parentOption].selectedOption = " ";
            }

            if (value?.path) {
                let updatedFiles = [...filesToDelete];
                updatedFiles = [...updatedFiles, value.path];
                setFilesToDelete(updatedFiles);
            }

            delete tempUpdateValue.options[parentOption].options[renamedOption];
        } else {
            if (value?.path) {
                let updatedFiles = [...filesToDelete];
                updatedFiles = [...updatedFiles, value.path];
                setFilesToDelete(updatedFiles);
            } else if (value?.options) {
                for (const subValue of Object.values(value?.options)) {
                    if (subValue?.path) {
                        let updatedFiles = [...filesToDelete];
                        updatedFiles = [...updatedFiles, subValue.path];
                        setFilesToDelete(updatedFiles);
                    }
                }
            }
            if (tempUpdateValue.selectedOption === renamedOption) {
                tempUpdateValue.selectedOption = "none";
            }
            delete tempUpdateValue.options[renamedOption];
        }
        setUpdatedValue(tempUpdateValue);
    }, [parentOption, renamedOption, setFilesToDelete, setUpdatedValue, updatedValue, value]);

    const handleRename = useCallback((e) => {
        const newOptionName = e.target.value;
        const tempUpdateValue = JSON.parse(JSON.stringify(updatedValue));

        // Check if the new option name already exists in the parent options
        const optionsToCheck = parentOption
            ? tempUpdateValue.options[parentOption].options
            : tempUpdateValue.options;

        if (optionsToCheck[newOptionName] && newOptionName !== renamedOption) {
            toast.error(`Option name "${newOptionName}" already exists! Please choose a different name.`);
            return; // Exit the function to prevent further processing
        }

        // Proceed with renaming the option since it doesn't exist
        if (parentOption) {
            tempUpdateValue.options[parentOption].options[newOptionName] = tempUpdateValue.options[parentOption].options[renamedOption];
            delete tempUpdateValue.options[parentOption].options[renamedOption];

            if (tempUpdateValue.options[parentOption].selectedOption === renamedOption) {
                tempUpdateValue.options[parentOption].selectedOption = newOptionName;
            }
        } else {
            tempUpdateValue.options[newOptionName] = tempUpdateValue.options[renamedOption];
            delete tempUpdateValue.options[renamedOption];

            if (tempUpdateValue.selectedOption === renamedOption) {
                tempUpdateValue.selectedOption = newOptionName;
            }
        }

        setUpdatedValue(tempUpdateValue);
        setRenamedOption(newOptionName);
    }, [parentOption, renamedOption, setUpdatedValue, updatedValue]);

    const removeSelectedPage = useCallback((pageName) => {
        // Update newFiles to remove the file for this page
        const updatedNewFiles = { ...newFiles };
        const fileName = value.path;
        if (fileName && updatedNewFiles[fileName]) {
            delete updatedNewFiles[fileName][pages[pageName]];
        }
        setNewFiles(updatedNewFiles);

        // Add to deleteFilesOfPages if file exists on server
        if (fileExistenceStatus[pageName]) {
            const tempUpdateDeleteFileOfPages = [...deleteFilesOfPages, `${pages[pageName]}<<&&>>${value.path}`];
            setDeleteFilesOfPages(tempUpdateDeleteFileOfPages);
        }

        // Update selected pages
        const tempSelectedPages = selectedPages.filter((page) => page !== pageName);
        setSelectedPages(tempSelectedPages);
    }, [fileExistenceStatus, newFiles, pages, selectedPages, setDeleteFilesOfPages, setNewFiles, value.path]);

    const addSelectedPage = useCallback((pageName) => {
        // Remove from deleteFilesOfPages if it was previously scheduled for deletion
        const tempDeleteFileOfPages = deleteFilesOfPages.filter(
            (path) => path !== `${pages[pageName]}<<&&>>${value.path}`
        );
        setDeleteFilesOfPages(tempDeleteFileOfPages);

        // Add to selected pages
        setSelectedPages((prev) => [pageName, ...prev]);
    }, [deleteFilesOfPages, pages, setDeleteFilesOfPages, value.path]);

    const togglePageSelection = useCallback((pageName) => {
        if (selectedPages.includes(pageName)) {
            removeSelectedPage(pageName);
        } else {
            addSelectedPage(pageName);
        }
    }, [addSelectedPage, removeSelectedPage, selectedPages]);

    const removeFile = useCallback((page) => {
        const updatedFiles = { ...newFiles };
        if (value.path && updatedFiles[value.path]) {
            delete updatedFiles[value.path][pages[page]];
        }
        setNewFiles(updatedFiles);
    }, [newFiles, pages, setNewFiles, value.path]);

    // Check which files exist on the server
    useEffect(() => {
        const checkFilesExistence = async () => {
            if (!value?.path) {
                setFileExistenceStatus({});
                return;
            }

            const alreadySelectedPages = [];

            const results = await Promise.all(
                Object.keys(pages).map(async (page) => {
                    const exists = await checkFileExists(`${baseFilePath}/${pages[page]}/${value?.path}.svg`);
                    if (exists) {
                        alreadySelectedPages.push(page);
                    }
                    return { [page]: exists };
                })
            );

            // Convert array of objects to a single object with pageFolder as keys
            const statusObject = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});

            // Update state with the full object
            setFileExistenceStatus(statusObject);
            setSelectedPages(alreadySelectedPages);
        };

        if (!loading) {
            checkFilesExistence();
        }
    }, [loading, pages, baseFilePath, value?.path]);

    // Update file counts for parent component
    const updateFileCount = useCallback(() => {
        if (value?.path) {
            const fileUploadCount = selectedPages.reduce((count, page) => {
                const exists = fileExistenceStatus[page];
                if (exists) {
                    return count + 1;
                }
                return count;
            }, 0);

            const newFileUploadCount = newFiles?.[value?.path] ? Object.keys(newFiles?.[value?.path]).length : 0;

            setFileCounts((prev) => {
                const newCounts: Record<string, { fileUploads: number; selectedPagesCount: number }> = {
                    ...prev,
                    [option]: {
                        fileUploads: (newFileUploadCount + fileUploadCount),
                        selectedPagesCount: Object.keys(selectedPages).length
                    }
                };
                return newCounts;
            });
        }
    }, [selectedPages, newFiles, value?.path, option, fileExistenceStatus, setFileCounts]);

    useEffect(() => {
        updateFileCount();
    }, [updateFileCount]);

    // Check if component should be rendered
    const shouldRender = useCallback(() => {
        if (nestedIn) {
            return !!updatedValue?.options[nestedIn]?.options[renamedOption];
        } else {
            return !!updatedValue?.options[renamedOption];
        }
    }, [nestedIn, renamedOption, updatedValue?.options]);

    return {
        renamedOption,
        operation,
        fileExistenceStatus,
        selectedPages,
        handleFileChange,
        handleDrop,
        handleDelete,
        handleRename,
        togglePageSelection,
        removeFile,
        setOperation,
        pages,
        newFiles,
        baseFilePath,
        shouldRender
    };
}