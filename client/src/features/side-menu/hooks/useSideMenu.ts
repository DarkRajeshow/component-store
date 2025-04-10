// hooks/useSideMenu.ts - A custom hook to manage SideMenu state and logic
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { SideMenuService } from "../services/SideMenuService";
import { FileUploadService } from "../services/FileUploadService";
import { FileExistenceChecker } from "../services/FileExistenceChecker";
import filePath from "@/utils/filePath";
import { FileExistenceStatus, NewBaseDrawingFiles, Pages, SideMenuProps } from "../types/sideMenuTypes";

export function useSideMenu(props: SideMenuProps) {
    const {
        design,
        selectedCategory,
        fetchProject,
        incrementFileVersion,
        fileVersion,
        baseDrawing,
        setBaseDrawing,
        loading,
        generateHierarchy,
        pages,
        id,
    } = props;

    // State variables
    const [sideMenuType, setSideMenuType] = useState("");
    const [tempSelectedCategory, setTempSelectedCategory] = useState(selectedCategory);
    const [tempBaseDrawing, setTempBaseDrawing] = useState(baseDrawing);
    const [saveLoading, setSaveLoading] = useState(false);
    const [newBaseDrawingFiles, setNewBaseDrawingFiles] = useState<NewBaseDrawingFiles>({});
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [tempPages, setTempPages] = useState<Pages>(pages || {});
    const [newPageName, setNewPageName] = useState('');
    const [choosenPage, setChoosenPage] = useState('gad');
    const [fileExistenceStatus, setFileExistenceStatus] = useState<FileExistenceStatus>({});
    const [currentBaseDrawingFileExistanceStatus, setCurrentBaseDrawingFileExistanceStatus] = useState<FileExistenceStatus>({});
    const [openPageDeleteWarning, setOpenPageDeleteWarning] = useState('');
    const [isCheckingFiles, setIsCheckingFiles] = useState(false);

    // Derived values with useMemo
    const baseFilePath = useMemo(() => `${filePath}${design.folder}`, [design.folder]);

    const allowedToClose = useMemo(() =>
        FileExistenceChecker.allowedToClose(currentBaseDrawingFileExistanceStatus, baseDrawing, pages),
        [currentBaseDrawingFileExistanceStatus, pages, baseDrawing]
    );

    // Reset states when design changes
    useEffect(() => {
        setFileExistenceStatus({});
        setTempPages(pages || {});
        setChoosenPage('gad');
        setNewBaseDrawingFiles({});
    }, [design, pages]);

    // Reset state when baseDrawing or pages change
    useEffect(() => {
        setTempBaseDrawing(baseDrawing);
        setTempPages(pages || {});
        setFileExistenceStatus({});
        setNewBaseDrawingFiles({});
        setChoosenPage('gad');
        setIsPopUpOpen(false);
    }, [design, baseDrawing, pages]);

    // Update tempSelectedCategory when selectedCategory changes
    useEffect(() => {
        setTempSelectedCategory(selectedCategory);
    }, [selectedCategory]);

    // Reset files and chosen page when category changes
    useEffect(() => {
        setNewBaseDrawingFiles({});
        setChoosenPage('gad');
    }, [tempSelectedCategory]);

    // Check file existence

    useEffect(() => {
        if (Object.keys(tempPages).length === 0) {
            return;
        }

        const checkFilesExistence = async () => {
            setIsCheckingFiles(true);
            try {
                const tempBaseDrawingFileExistanceStatus = await FileExistenceChecker.checkAllFiles(
                    tempPages,
                    baseFilePath,
                    tempBaseDrawing
                );

                setFileExistenceStatus(tempBaseDrawingFileExistanceStatus);

                // const tempCurrentBaseDrawingFileExistanceStatus = await FileExistenceChecker.checkAllFiles(
                //     pages,
                //     baseFilePath,
                //     baseDrawing
                // );

                // setCurrentBaseDrawingFileExistanceStatus(tempCurrentBaseDrawingFileExistanceStatus)

                // // Only open popup if files are missing
                // const missingFiles = FileExistenceChecker.shouldShowPopup(statusObject);
                // if (missingFiles) {
                //     setIsPopUpOpen(true);
                // }
            } catch (error) {
                console.error('Error checking file existence:', error);
            } finally {
                setIsCheckingFiles(false);
            }
        };

        // Small delay to ensure all state updates have propagated
        const timeoutId = setTimeout(() => {
            checkFilesExistence();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [tempBaseDrawing, tempPages, baseFilePath]);

    useEffect(() => {
        if (Object.keys(tempPages).length === 0) {
            return;
        }

        const checkFilesExistence = async () => {
            setIsCheckingFiles(true);
            try {
                const currentBaseDrawingFileExistanceStatusObject = await FileExistenceChecker.checkAllFiles(
                    pages,
                    baseFilePath,
                    baseDrawing
                );

                setCurrentBaseDrawingFileExistanceStatus(currentBaseDrawingFileExistanceStatusObject)

                // Only open popup if files are missing
                const missingFiles = FileExistenceChecker.shouldShowPopup(currentBaseDrawingFileExistanceStatusObject);
                if (missingFiles) {
                    setIsPopUpOpen(true);
                }
            } catch (error) {
                console.error('Error checking file existence:', error);
            } finally {
                setIsCheckingFiles(false);
            }
        };

        // Small delay to ensure all state updates have propagated
        const timeoutId = setTimeout(() => {
            checkFilesExistence();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [baseDrawing, pages, baseFilePath]);

    // Handlers
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewBaseDrawingFiles((prev) => ({
                ...prev,
                [tempPages[choosenPage]]: e.target.files![0],
            }));
        }
    }, [tempPages, choosenPage]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        FileUploadService.handleDrop(
            e,
            newBaseDrawingFiles,
            choosenPage,
            tempPages,
            setNewBaseDrawingFiles
        );
    }, [newBaseDrawingFiles, choosenPage, tempPages]);

    const toggleDialog = useCallback(() => {
        document.getElementById("closeButtonSideMenu")?.click();
    }, []);

    const openDeleteConfirmation = useCallback((pageName: string) => {
        if (fileExistenceStatus[pageName]) {
            setOpenPageDeleteWarning(pageName);
            return;
        }

        setTempPages((prev) => {
            const updated = { ...prev };
            delete updated[pageName];
            return updated;
        });

        if (choosenPage === pageName) {
            setChoosenPage('gad');
        }
    }, [fileExistenceStatus, choosenPage]);

    const handleDelete = useCallback(() => {
        setTempPages((prev) => {
            const updated = { ...prev };
            delete updated[openPageDeleteWarning];
            return updated;
        });

        if (choosenPage === openPageDeleteWarning) {
            setChoosenPage('gad');
        }

        setOpenPageDeleteWarning('');
    }, [openPageDeleteWarning, choosenPage]);

    const addNewPage = useCallback(() => {
        if (!newPageName) return;

        if (!SideMenuService.validatePageName(newPageName, tempPages)) {
            toast.warning(`Page "${newPageName}" Already Exists`);
            return;
        }

        setTempPages((prev) => ({
            ...prev,
            [newPageName]: uuidv4(),
        }));

        setNewPageName('');
    }, [newPageName, tempPages]);

    const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = e.target.value;
        setTempSelectedCategory(newCategory);

        const baseDrawing = SideMenuService.getBaseDrawingForCategory(design, newCategory);
        if (baseDrawing) {
            setTempBaseDrawing(baseDrawing);
        }

        const categoryPages = SideMenuService.getPagesForCategory(design, newCategory);
        setTempPages(categoryPages || {});
    }, [design]);

    // Core business logic
    const updateBaseDrawing = useCallback(async () => {
        setSaveLoading(true);

        try {
            if (loading) {
                setSaveLoading(false);
                return;
            }

            // Check if all files are uploaded
            const allFilesUploaded = FileExistenceChecker.areAllFilesUploaded(
                tempPages,
                fileExistenceStatus,
                newBaseDrawingFiles
            );

            if (!allFilesUploaded) {
                toast.warning("You must upload the base drawing for all the pages to proceed.");
                setSaveLoading(false);
                return;
            }

            // If no new files, just shift to selected category
            if (!newBaseDrawingFiles || Object.keys(newBaseDrawingFiles).length === 0) {
                await handleShiftToCategory();
            } else {
                await handleUploadAndUpdateBaseDrawing();
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong, please try again.');
        } finally {
            setSaveLoading(false);
        }
    }, [
        loading,
        tempPages,
        fileExistenceStatus,
        newBaseDrawingFiles,
        tempSelectedCategory,
        tempBaseDrawing,
        design,
        id
    ]);

    // Handle shifting to a selected category without uploading new files
    const handleShiftToCategory = useCallback(async () => {
        try {
            // Get attributes for the selected category
            const attributes = SideMenuService.getAttributesForCategory(design, tempSelectedCategory);

            // Get pages for the selected category
            const changedPages = SideMenuService.getPagesForCategory(design, tempSelectedCategory);

            // Generate updated structure
            const structure = generateHierarchy({
                updatedComponents: attributes,
                updatedCategory: tempSelectedCategory,
                updatedPages: tempPages,
                updatedBaseDrawing: tempBaseDrawing,
            });

            // Calculate missing pages
            const pagesNames = SideMenuService.calculateMissingPages(changedPages, tempPages);
            const folderNames = SideMenuService.getMissingFolderNames(pagesNames, pages);

            // Call API to shift to selected category
            const { data } = await SideMenuService.shiftToSelectedCategory(id, {
                selectedCategory: tempSelectedCategory,
                structure,
                folderNames,
            });

            if (data.success) {
                toast.success(data.status);
                setNewBaseDrawingFiles({});
                await fetchProject(id);
                setSideMenuType("");
                setIsPopUpOpen(false);
            } else {
                toast.error(data.status);
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }, [
        design,
        tempSelectedCategory,
        generateHierarchy,
        tempPages,
        tempBaseDrawing,
        pages,
        id,
        fetchProject
    ]);

    const resetSideBarState = useCallback(() => {
        setTempSelectedCategory(selectedCategory);
        setTempBaseDrawing(baseDrawing);
        setTempPages(pages || {});
        setChoosenPage('gad');
    }, [selectedCategory, baseDrawing, pages]);    
    // Handle uploading and updating base drawing with new files
    const handleUploadAndUpdateBaseDrawing = useCallback(async () => {
        try {
            // Create a unique filename or use existing one
            const uniqueFileName = SideMenuService.createUniqueFileName(design, tempSelectedCategory);

            // Create FormData for the upload
            const formData = new FormData();
            formData.append('folder', design.folder);

            // Get attributes for the selected category
            const attributes = SideMenuService.getAttributesForCategory(design, tempSelectedCategory);

            // Get pages for the selected category
            const changedPages = SideMenuService.getPagesForCategory(design, tempSelectedCategory);

            // Calculate missing pages
            const pagesNames = SideMenuService.calculateMissingPages(changedPages, tempPages);
            const folderNames = SideMenuService.getMissingFolderNames(pagesNames, pages);

            // Generate updated structure
            const structure = generateHierarchy({
                updatedComponents: attributes,
                updatedBaseDrawing: {
                    path: uniqueFileName,
                },
                updatedCategory: tempSelectedCategory,
                updatedPages: tempPages,
            });

            // Add data to formData
            formData.append('selectedCategory', tempSelectedCategory);
            formData.append('folderNames', folderNames.join(','));
            formData.append('structure', JSON.stringify(structure));

            // Add files to formData
            for (const [folder, file] of Object.entries(newBaseDrawingFiles)) {
                const customName = `${folder}<<&&>>${uniqueFileName}${file.name.slice(-4)}`;
                formData.append('files', file, customName);
            }

            // Call API to update base drawing
            const { data } = await SideMenuService.updateBaseDrawing(id, formData);

            if (data.success) {
                toast.success(data.status);
                setNewBaseDrawingFiles({});
                await fetchProject(id);
                setSideMenuType("");
                setBaseDrawing({
                    path: uniqueFileName,
                });
                incrementFileVersion();
                setIsPopUpOpen(false);
            } else {
                toast.error(data.status);
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }, [
        design,
        tempSelectedCategory,
        newBaseDrawingFiles,
        tempPages,
        pages,
        generateHierarchy,
        id,
        fetchProject,
        setBaseDrawing,
        incrementFileVersion
    ]);

    // Return all state and handlers
    return {
        sideMenuType,
        setSideMenuType,
        tempSelectedCategory,
        setTempSelectedCategory,
        tempBaseDrawing,
        saveLoading,
        newBaseDrawingFiles,
        isPopUpOpen,
        setIsPopUpOpen,
        tempPages,
        newPageName,
        setNewPageName,
        choosenPage,
        setChoosenPage,
        fileExistenceStatus,
        openPageDeleteWarning,
        setOpenPageDeleteWarning,
        isCheckingFiles,
        baseFilePath,
        allowedToClose,
        handleFileChange,
        handleDrop,
        toggleDialog,
        openDeleteConfirmation,
        handleDelete,
        addNewPage,
        handleCategoryChange,
        updateBaseDrawing,
        fileVersion,
        resetSideBarState
    };
}
