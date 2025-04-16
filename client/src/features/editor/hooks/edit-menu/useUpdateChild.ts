import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { checkFileExists } from '@/utils/checkFileExists';
import { IComponent, IFileInfo, INestedChildLevel1, INestedChildLevel2, INestedParentLevel1 } from '@/types/project.types';
import useAppStore from '@/store/useAppStore';
import { useModel } from '@/contexts/ModelContext';

interface FileExistenceStatus {
    [key: string]: boolean;
}

interface UseUpdateChildProps {
    parentOption?: string;
    nestedIn?: string;
    option: string;
    value: IComponent | INestedParentLevel1 | INestedChildLevel2 | INestedChildLevel1 | null;
    updatedValue: IComponent | INestedParentLevel1 | INestedChildLevel2 | INestedChildLevel1 | null;
    setFileCounts: (counts: Record<string, { fileUploads: number; selectedPagesCount: number }>) => void;
    setUpdatedValue: (value: IComponent | INestedParentLevel1 | INestedChildLevel2 | INestedChildLevel1 | null) => void;
}

interface FileChangeEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & {
        files: FileList;
    };
}

interface FileUpdateStructure {
    [fileId: string]: {
        [pagePath: string]: File;
    };
}


export function useUpdateChild({
    parentOption = "",
    nestedIn = "",
    option,
    value,
    updatedValue,
    setFileCounts,
    setUpdatedValue,
}: UseUpdateChildProps) {
    const {
        newFiles,
        structure,
        loading,
        filesToDelete,
        deleteFilesOfPages,
        setFilesToDelete,
        setNewFiles,
        setDeleteFilesOfPages
    } = useAppStore();

    const [renamedOption, setRenamedOption] = useState(option);
    const [operation, setOperation] = useState("");
    const [fileExistenceStatus, setFileExistenceStatus] = useState<FileExistenceStatus>({});
    const [selectedPages, setSelectedPages] = useState(['gad']);

    const { baseContentPath } = useModel();



    const handleFileChange = useCallback((e: FileChangeEvent, page: string): void => {
        const file: File = e.target.files[0];

        if (!file) return;

        if (file.type === 'image/svg+xml' || file.type === 'application/pdf') {
            setNewFiles({
                ...newFiles,
                [(value as IFileInfo)?.fileId]: {
                    ...newFiles?.[(value as IFileInfo)?.fileId],
                    [structure.pages[page]]: file
                },
            } as FileUpdateStructure);
        } else {
            toast.error('Please choose a SVG or PDF file.');
        }
    }, [newFiles, structure.pages, setNewFiles, value]);

    const handleDrop = useCallback((e, page: string) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];

        if (!file) return;

        if (file.type === 'image/svg+xml' || file.type === 'application/pdf') {
            setNewFiles({
                ...newFiles,
                [(value as IFileInfo)?.fileId]: {
                    ...newFiles?.[(value as IFileInfo)?.fileId],
                    [structure.pages[page]]: file
                },
            });
        } else {
            toast.error('Please choose a SVG or PDF file.');
        }
    }, [newFiles, structure.pages, setNewFiles, value]);

    const handleDelete = useCallback(() => {
        // Deep copy
        const tempUpdateValue = JSON.parse(JSON.stringify(updatedValue));
        if (parentOption) {
            if (tempUpdateValue.options[parentOption].selected === renamedOption) {
                tempUpdateValue.options[parentOption].selected = " ";
            }

            if ((value as IFileInfo)?.fileId) {
                let updatedFiles = [...filesToDelete];
                updatedFiles = [...updatedFiles, (value as IFileInfo).fileId];
                setFilesToDelete(updatedFiles);
            }

            delete tempUpdateValue.options[parentOption].options[renamedOption];
        } else {
            if ((value as IFileInfo)?.fileId) {
                let updatedFiles = [...filesToDelete];
                updatedFiles = [...updatedFiles, (value as IFileInfo).fileId];
                setFilesToDelete(updatedFiles);
            } else if ((value as IComponent)?.options) {
                for (const subValue of Object.values((value as IComponent)?.options)) {
                    if ((subValue as IFileInfo)?.fileId) {
                        let updatedFiles = [...filesToDelete];
                        updatedFiles = [...updatedFiles, (subValue as IFileInfo).fileId];
                        setFilesToDelete(updatedFiles);
                    }
                }
            }
            if (tempUpdateValue.selected === renamedOption) {
                tempUpdateValue.selected = "none";
            }
            delete tempUpdateValue.options[renamedOption];
        }
        setUpdatedValue(tempUpdateValue);
    }, [parentOption, renamedOption, setFilesToDelete, setUpdatedValue, updatedValue, value, filesToDelete]);

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

            if (tempUpdateValue.options[parentOption].selected === renamedOption) {
                tempUpdateValue.options[parentOption].selected = newOptionName;
            }
        } else {
            tempUpdateValue.options[newOptionName] = tempUpdateValue.options[renamedOption];
            delete tempUpdateValue.options[renamedOption];

            if (tempUpdateValue.selected === renamedOption) {
                tempUpdateValue.selected = newOptionName;
            }
        }

        setUpdatedValue(tempUpdateValue);
        setRenamedOption(newOptionName);
    }, [parentOption, renamedOption, setUpdatedValue, updatedValue]);

    const removeSelectedPage = useCallback((pageName: string) => {
        // Update newFiles to remove the file for this page
        const updatedNewFiles = { ...newFiles };
        const fileName = (value as IFileInfo).fileId;
        if (fileName && updatedNewFiles[fileName]) {
            delete updatedNewFiles[fileName][structure.pages[pageName]];
        }
        setNewFiles(updatedNewFiles);

        // Add to deleteFilesOfPages if file exists on server
        if (fileExistenceStatus[pageName]) {
            const tempUpdateDeleteFileOfPages = [...deleteFilesOfPages, `${structure.pages[pageName]}<<&&>>${(value as IFileInfo).fileId}`];
            setDeleteFilesOfPages(tempUpdateDeleteFileOfPages);
        }

        // Update selected pages
        const tempSelectedPages = selectedPages.filter((page) => page !== pageName);
        setSelectedPages(tempSelectedPages);
    }, [fileExistenceStatus, newFiles, structure.pages, selectedPages, setDeleteFilesOfPages, setNewFiles, deleteFilesOfPages, value]);

    const addSelectedPage = useCallback((pageName: string) => {
        // Remove from deleteFilesOfPages if it was previously scheduled for deletion
        const tempDeleteFileOfPages = deleteFilesOfPages.filter(
            (path) => path !== `${structure.pages[pageName]}<<&&>>${(value as IFileInfo).fileId}`
        );
        setDeleteFilesOfPages(tempDeleteFileOfPages);

        // Add to selected pages
        setSelectedPages((prev) => [pageName, ...prev]);
    }, [deleteFilesOfPages, structure.pages, setDeleteFilesOfPages, value]);

    const togglePageSelection = useCallback((pageName: string) => {
        if (selectedPages.includes(pageName)) {
            removeSelectedPage(pageName);
        } else {
            addSelectedPage(pageName);
        }
    }, [addSelectedPage, removeSelectedPage, selectedPages]);

    const removeFile = useCallback((page: string) => {
        const updatedFiles = { ...newFiles };
        if ((value as IFileInfo).fileId && updatedFiles[(value as IFileInfo).fileId]) {
            delete updatedFiles[(value as IFileInfo).fileId][structure.pages[page]];
        }
        setNewFiles(updatedFiles);
    }, [newFiles, structure.pages, setNewFiles, value]);

    // Check which files exist on the server
    useEffect(() => {
        const checkFilesExistence = async () => {
            if (!(value as IFileInfo)?.fileId) {
                setFileExistenceStatus({});
                return;
            }

            const alreadySelectedPages: string[] = [];

            const results = await Promise.all(
                Object.keys(structure.pages).map(async (page) => {
                    const exists = await checkFileExists(`${baseContentPath}/${structure.pages[page]}/${(value as IFileInfo)?.fileId}.svg`);
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
    }, [loading, structure.pages, baseContentPath, value]);

    // Update file counts for parent component
    const updateFileCount = useCallback(() => {
        if ((value as IFileInfo)?.fileId) {
            const fileUploadCount = selectedPages.reduce((count, page) => {
                const exists = fileExistenceStatus[page];
                if (exists) {
                    return count + 1;
                }
                return count;
            }, 0);

            const newFileUploadCount = newFiles?.[(value as IFileInfo)?.fileId] ? Object.keys(newFiles?.[(value as IFileInfo)?.fileId]).length : 0;

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
    }, [selectedPages, newFiles, value, option, fileExistenceStatus, setFileCounts]);

    useEffect(() => {
        updateFileCount();
    }, [updateFileCount]);

    // Check if component should be rendered
    const shouldRender = useCallback(() => {
        if (nestedIn) {
            return !!((updatedValue as IComponent)?.options[nestedIn] as IComponent)?.options[renamedOption];
        } else {
            return !!(updatedValue as IComponent)?.options[renamedOption];
        }
    }, [nestedIn, renamedOption, updatedValue]);

    return {
        renamedOption,
        operation,
        fileExistenceStatus,
        selectedPages,
        pages: structure.pages,
        newFiles,
        baseContentPath,
        handleFileChange,
        handleDrop,
        handleDelete,
        handleRename,
        togglePageSelection,
        removeFile,
        setOperation,
        shouldRender
    };
}