// hooks/useSideMenu.ts - A custom hook to manage SideMenu state and logic
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { SideMenuService } from "../services/SideMenuService";
import { FileUploadService } from "../services/FileUploadService";
import { FileExistenceChecker } from "../services/FileExistenceChecker";
import filePath from "@/utils/filePath";
import { FileExistenceStatus, NewBaseDrawingFiles, SideMenuProps } from "../types/sideMenuTypes";
import { IPages } from "@/types/project.types";
import useAppStore from "@/store/useAppStore";
import { useModel } from "@/contexts/ModelContext";

export function useSideMenu(props: SideMenuProps) {
    const {
        folder,
        modelType,
        structure,
        selectedCategory,
        baseContentPath,
        incrementFileVersion,
        fileVersion,
        setBaseDrawing,
        loading,
        generateHierarchy,
    } = props;

    const { project } = useAppStore();
    const { updateBaseDrawing, shiftCategory, refreshContent } = useModel();

    // State variables
    const [sideMenuType, setSideMenuType] = useState("");
    const [tempSelectedCategory, setTempSelectedCategory] = useState(selectedCategory);
    const [tempBaseDrawing, setTempBaseDrawing] = useState(structure.baseDrawing);
    const [saveLoading, setSaveLoading] = useState(false);
    const [newBaseDrawingFiles, setNewBaseDrawingFiles] = useState<NewBaseDrawingFiles>({});
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [tempPages, setTempPages] = useState<IPages>(structure.pages || {});
    const [newPageName, setNewPageName] = useState('');
    const [choosenPage, setChoosenPage] = useState('gad');
    const [fileExistenceStatus, setFileExistenceStatus] = useState<FileExistenceStatus>({});
    const [currentBaseDrawingFileExistanceStatus, setCurrentBaseDrawingFileExistanceStatus] = useState<FileExistenceStatus>({});
    const [openPageDeleteWarning, setOpenPageDeleteWarning] = useState('');
    const [isCheckingFiles, setIsCheckingFiles] = useState(false);

    // Derived values with useMemo
    const baseFilePath = useMemo(() => `${filePath}/${modelType + "s"}/${folder}`, [folder, modelType]);

    const allowedToClose = useMemo(() => {
        if (structure.baseDrawing && structure.pages) {
            return FileExistenceChecker.allowedToClose(currentBaseDrawingFileExistanceStatus, structure.baseDrawing, structure.pages)
        }
    },
        [currentBaseDrawingFileExistanceStatus, structure.pages, structure.baseDrawing]
    );

    // Reset states when design changes
    useEffect(() => {
        setFileExistenceStatus({});
        setTempPages(structure.pages || {});
        setChoosenPage('gad');
        setNewBaseDrawingFiles({});
    }, [structure.pages]);

    // Reset state when baseDrawing or pages change
    useEffect(() => {
        setTempBaseDrawing(structure.baseDrawing);
        setTempPages(structure.pages || {});
        setFileExistenceStatus({});
        setNewBaseDrawingFiles({});
        setChoosenPage('gad');
        setIsPopUpOpen(false);
    }, [structure.baseDrawing, structure.pages]);

    // Update tempSelectedCategory when selectedCategory changes
    useEffect(() => {
        setTempSelectedCategory(selectedCategory);
    }, [selectedCategory]);

    // Reset files and chosen page when category changes
    useEffect(() => {
        setNewBaseDrawingFiles({});
        setChoosenPage('gad');
    }, [tempSelectedCategory]);



    // temp category selection file existence check
    useEffect(() => {
        if (Object.keys(tempPages).length === 0) {
            return;
        }

        const checkFilesExistence = async () => {
            setIsCheckingFiles(true);
            try {
                const tempBaseDrawingFileExistanceStatus = await FileExistenceChecker.checkAllFiles(
                    tempPages,
                    baseContentPath,
                    tempBaseDrawing,
                    fileVersion
                );

                setFileExistenceStatus(tempBaseDrawingFileExistanceStatus);

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
    }, [tempBaseDrawing, tempPages, baseContentPath, fileVersion]);

    // original selected catggory file existence Check
    useEffect(() => {
        if (Object.keys(tempPages).length === 0) {
            return;
        }

        const checkFilesExistence = async () => {
            setIsCheckingFiles(true);
            try {
                const currentBaseDrawingFileExistanceStatusObject = await FileExistenceChecker.checkAllFiles(
                    structure.pages,
                    baseContentPath,
                    structure.baseDrawing,
                    fileVersion
                );

                setCurrentBaseDrawingFileExistanceStatus(currentBaseDrawingFileExistanceStatusObject)

                // Only open popup if files are missing and not already open
                const missingFiles = FileExistenceChecker.shouldShowPopup(currentBaseDrawingFileExistanceStatusObject);
                if (missingFiles && !isPopUpOpen) { // Add condition to check if popup is not already open
                    setIsPopUpOpen(true);
                }
            } catch (error) {
                console.error('Error checking file existence:', error);
            } finally {
                setIsCheckingFiles(false);
            }
        };

        const timeoutId = setTimeout(() => {
            checkFilesExistence();
        }, 100);

        return () => clearTimeout(timeoutId);
        // Add isPopUpOpen to dependencies array to prevent unnecessary checks when popup is open
    }, [baseContentPath, structure.baseDrawing, structure.pages, tempPages, isPopUpOpen, fileVersion]);

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

    const handleCategoryChange = useCallback((newCategory: string) => {
        setTempSelectedCategory(newCategory);

        if (!project?.hierarchy) {
            return toast.error("Error : Project hierarchy not found.");
        }
        const baseDrawing = SideMenuService.getBaseDrawingForCategory(project?.hierarchy, newCategory);
        if (baseDrawing) {
            setTempBaseDrawing(baseDrawing);
        }

        const categoryPages = SideMenuService.getPagesForCategory(project?.hierarchy, newCategory);
        setTempPages(categoryPages || {});
    }, [project?.hierarchy]);

    // Handle shifting to a selected category without uploading new files
    const handleShiftToCategory = useCallback(async () => {
        try {
            if (!project?.hierarchy) {
                return toast.error("Error : Project hierarchy not found.");
            }
            const components = SideMenuService.getComponentsForCategory(project?.hierarchy, tempSelectedCategory);
            const changedPages = SideMenuService.getPagesForCategory(project?.hierarchy, tempSelectedCategory);
            const updatedHierarchy = generateHierarchy({
                updatedComponents: components,
                updatedCategory: tempSelectedCategory,
                updatedPages: tempPages,
                updatedBaseDrawing: tempBaseDrawing,
            });

            const pagesNames = SideMenuService.calculateMissingPages(changedPages, tempPages);
            const folderNames = SideMenuService.getMissingFolderNames(pagesNames, structure.pages);

            if (!shiftCategory) {
                toast.error("Error: shifting category due to missing functions.");
                return;
            }

            const data = await shiftCategory({
                selectedCategory: tempSelectedCategory,
                hierarchy: updatedHierarchy,
                folderNames,
            });

            if (data && data.success) {
                toast.success(data.status);
                await refreshContent()

                setNewBaseDrawingFiles({});
                setIsPopUpOpen(false);
            } else {
                toast.error(data ? data.status : "Error while shifting category.");
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }, [
        project?.hierarchy,
        tempSelectedCategory,
        shiftCategory,
        generateHierarchy,
        tempPages,
        tempBaseDrawing,
        refreshContent,
        structure.pages,
    ]);

    // Handle uploading and updating base drawing with new files
    const handleUploadAndUpdateBaseDrawing = useCallback(async () => {
        try {
            console.log("this is calling");

            if (!project?.hierarchy) {
                return toast.error("handleUploadAndUpdateBaseDrawing Error : Project hierarchy not found.");
            }

            const uniqueFileName = SideMenuService.createUniqueFileName(project?.hierarchy, tempSelectedCategory);
            const formData = new FormData();
            formData.append('folder', folder);

            const components = SideMenuService.getComponentsForCategory(project?.hierarchy, tempSelectedCategory);
            const changedPages = SideMenuService.getPagesForCategory(project?.hierarchy, tempSelectedCategory);
            const pagesNames = SideMenuService.calculateMissingPages(changedPages, tempPages);
            const folderNames = SideMenuService.getMissingFolderNames(pagesNames, structure.pages);

            const updatedHierarchy = generateHierarchy({
                updatedComponents: components,
                updatedBaseDrawing: {
                    fileId: uniqueFileName,
                },
                updatedCategory: tempSelectedCategory,
                updatedPages: tempPages,
            });

            formData.append('selectedCategory', tempSelectedCategory);
            formData.append('folderNames', folderNames.join(','));
            formData.append('hierarchy', JSON.stringify(updatedHierarchy));

            for (const [folder, file] of Object.entries(newBaseDrawingFiles)) {
                const customName = `${folder}<<&&>>${uniqueFileName}${file.name.slice(-4)}`;
                formData.append('files', file, customName);
            }
            // /projects/7ed67452-9386-42ef-a9cf-a7ad01c60465/e96e43a8-3419-40d9-9627-a084cf84ed1d/668ec1dd-bbf2-465b-bb66-0c2494094348.svg
            const data = await updateBaseDrawing(formData);

            if (data && data.success) {
                toast.success(data.status);
                await refreshContent()

                setNewBaseDrawingFiles({});
                setSideMenuType("");
                setBaseDrawing({
                    fileId: uniqueFileName,
                });
                incrementFileVersion();
                setIsPopUpOpen(false);

                //refresh page.
            } else {
                toast.error(data ? data.status : "Error while updating the base drawing.");
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }, [
        folder,
        project?.hierarchy,
        updateBaseDrawing,
        tempSelectedCategory,
        newBaseDrawingFiles,
        tempPages,
        refreshContent,
        structure.pages,
        generateHierarchy,
        setBaseDrawing,
        incrementFileVersion
    ]);

    // Core business logic
    const updateBaseDrawingFunc = useCallback(async () => {
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
        handleShiftToCategory,
        handleUploadAndUpdateBaseDrawing,
        fileExistenceStatus,
        newBaseDrawingFiles,
    ]);

    const resetSideBarState = useCallback(() => {
        setTempSelectedCategory(selectedCategory);
        setTempBaseDrawing(structure.baseDrawing);
        setTempPages(structure.pages || {});
        setChoosenPage('gad');
    }, [selectedCategory, structure.baseDrawing, structure.pages]);

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
        updateBaseDrawingFunc,
        fileVersion,
        resetSideBarState
    };
}
