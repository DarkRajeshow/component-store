import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { checkFileExists } from '@/utils/checkFileExists';
import { IComponent, IFileInfo, INestedChildLevel1, INestedChildLevel2, INestedParentLevel1 } from '@/types/project.types';
import useAppStore from '@/store/useAppStore';
import { useModel } from '@/contexts/ModelContext';

interface FileExistenceStatus {
    [key: string]: boolean;
}

type ComponentType = IComponent | INestedParentLevel1 | INestedChildLevel2 | INestedChildLevel1 | null;

interface UseUpdateChildProps {
    parentOption?: string;
    nestedIn?: string;
    option: string;
    value: ComponentType;
    updatedValue: ComponentType;
    setFileCounts: React.Dispatch<React.SetStateAction<Record<string, FileCountsRecord>>>;
    setUpdatedValue: (value: ComponentType) => void;
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

interface FileCountsRecord {
    fileUploads: number;
    selectedPagesCount: number;
}

function isFileInfo(value: ComponentType | unknown): value is IFileInfo {
    return value !== null && typeof value === 'object' && 'fileId' in value;
}

function isComponent(value: ComponentType | unknown): value is IComponent {
    return value !== null && typeof value === 'object' && 'options' in value;
}

function isNestedParentLevel1(value: ComponentType | unknown): value is INestedParentLevel1 {
    return value !== null && typeof value === 'object' && 'options' in value && 'selected' in value;
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
    const [selectedPages, setSelectedPages] = useState<string[]>([]);
    const { baseContentPath } = useModel();

    useEffect(() => {
        console.log(newFiles);
    }, [newFiles])


    const handleFileChange = useCallback((e: FileChangeEvent, page: string): void => {
        const file: File = e.target.files[0];
        if (!file || !isFileInfo(value)) return;

        if (file.type === 'image/svg+xml' || file.type === 'application/pdf') {
            const fileId = value.fileId;
            setNewFiles({
                ...newFiles,
                [fileId]: {
                    ...newFiles?.[fileId],
                    [structure.pages[page]]: file
                },
            } as FileUpdateStructure);
        } else {
            toast.error('Please choose a SVG or PDF file.');
        }
    }, [newFiles, structure.pages, setNewFiles, value]);

    const handleDrop = useCallback((e: React.DragEvent, page: string) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file || !isFileInfo(value)) return;

        if (file.type === 'image/svg+xml' || file.type === 'application/pdf') {
            const fileId = value.fileId;
            setNewFiles({
                ...newFiles,
                [fileId]: {
                    ...newFiles?.[fileId],
                    [structure.pages[page]]: file
                },
            });
        } else {
            toast.error('Please choose a SVG or PDF file.');
        }
    }, [newFiles, structure.pages, setNewFiles, value]);

    const handleDelete = useCallback(() => {
        if (!updatedValue) return;

        // Deep copy
        const tempUpdateValue = JSON.parse(JSON.stringify(updatedValue));
        if (parentOption && isComponent(tempUpdateValue)) {
            const parentComponent = tempUpdateValue.options[parentOption];
            if (isNestedParentLevel1(parentComponent)) {
                if (parentComponent.selected === renamedOption) {
                    parentComponent.selected = " ";
                }
                if (isFileInfo(value) && value.fileId) {
                    setFilesToDelete([...filesToDelete, value.fileId]);
                }
                delete parentComponent.options[renamedOption];
            }
        } else if (isComponent(tempUpdateValue)) {
            if (isFileInfo(value) && value.fileId) {
                setFilesToDelete([...filesToDelete, value.fileId]);
            } else if (isComponent(value)) {
                Object.values(value.options).forEach(subValue => {
                    if (isFileInfo(subValue) && subValue.fileId) {
                        setFilesToDelete([...filesToDelete, subValue.fileId]);
                    }
                });
            }

            if (tempUpdateValue.selected === renamedOption) {
                tempUpdateValue.selected = "none";
            }
            delete tempUpdateValue.options[renamedOption];
        }
        setUpdatedValue(tempUpdateValue);
    }, [parentOption, renamedOption, setFilesToDelete, setUpdatedValue, updatedValue, value, filesToDelete]);

    const handleRename = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!updatedValue || !isComponent(updatedValue)) return;

        const newOptionName = e.target.value;
        const tempUpdateValue = JSON.parse(JSON.stringify(updatedValue)) as IComponent;

        const parentComponent = parentOption ? tempUpdateValue.options[parentOption] : null;
        const optionsToCheck = parentOption && isNestedParentLevel1(parentComponent)
            ? parentComponent.options
            : tempUpdateValue.options;

        if (optionsToCheck[newOptionName] && newOptionName !== renamedOption) {
            toast.error(`Option name "${newOptionName}" already exists! Please choose a different name.`);
            return;
        }

        if (parentOption && isNestedParentLevel1(parentComponent)) {
            parentComponent.options[newOptionName] = parentComponent.options[renamedOption];
            delete parentComponent.options[renamedOption];

            if (parentComponent.selected === renamedOption) {
                parentComponent.selected = newOptionName;
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
            if (!isFileInfo(value) || !value.fileId) {
                setFileExistenceStatus({});
                setSelectedPages([]);
                return;
            }

            const fileId = value.fileId;
            const alreadySelectedPages: string[] = [];
            const statusChecks = Object.keys(structure.pages).map(async (page) => {
                const exists = await checkFileExists(`${baseContentPath}/${structure.pages[page]}/${fileId}.svg`);
                if (exists) {
                    alreadySelectedPages.push(page);
                }
                return { [page]: exists };
            });

            const results = await Promise.all(statusChecks);
            const statusObject = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});

            // Get pages that have new files uploaded
            const newFilePages = Object.entries(structure.pages)
                .filter(([, pageId]) => newFiles[fileId]?.[pageId])
                .map(([page]) => page);

            // Combine existing and new file pages, removing duplicates
            const allSelectedPages = [...new Set([...alreadySelectedPages, ...newFilePages])];

            setFileExistenceStatus(statusObject);
            setSelectedPages(allSelectedPages);
        };

        if (!loading) {
            checkFilesExistence();
        }
    }, [loading, structure.pages, baseContentPath, value, newFiles]);

    // Update file counts for parent component
    const updateFileCount = useCallback(() => {
        if (!isFileInfo(value) || !value.fileId) return;

        const fileUploadCount = selectedPages.reduce((count, page) => {
            const exists = fileExistenceStatus[page];
            return exists ? count + 1 : count;
        }, 0);

        const fileId = value.fileId;
        const newFileUploadCount = newFiles?.[fileId] ? Object.keys(newFiles[fileId]).length : 0;

        setFileCounts((prev: Record<string, FileCountsRecord>) => ({
            ...prev,
            [option]: {
                fileUploads: (newFileUploadCount + fileUploadCount),
                selectedPagesCount: selectedPages.length
            }
        }));
    }, [selectedPages, newFiles, value, option, fileExistenceStatus, setFileCounts]);

    useEffect(() => {
        updateFileCount();
    }, [updateFileCount]);

    // Check if component should be rendered
    const shouldRender = useCallback(() => {
        if (!updatedValue || !isComponent(updatedValue)) return false;

        if (nestedIn) {
            const nestedComponent = updatedValue.options[nestedIn];
            return isComponent(nestedComponent) && !!nestedComponent.options[renamedOption];
        }
        return !!updatedValue.options[renamedOption];
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