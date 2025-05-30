// hooks/usePageManager.ts - A custom hook to manage SideMenu state and logic
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { SideMenuService } from "../../services/SideMenuService";
import { FileUploadService } from "../../services/FileUploadService";
import { FileExistenceChecker } from "../../services/FileExistenceChecker";
import { FileExistenceStatus, NewBaseDrawingFiles } from "../../types/sideMenuTypes";
import { IPages, IProject } from "@/types/project.types";
import useAppStore from "@/store/useAppStore";
import { useModel } from "@/contexts/ModelContext";
import { IDesign, IStructure } from "@/types/design.types";


interface IUsePageManagerProps {
    setSideMenuType: (updatedMenuType: "" | "pageManager" | "categoryManager") => void;
    setIsPopUpOpen: (value: boolean) => void;
}
export function usePageManager(props: IUsePageManagerProps) {
    const {
        setSideMenuType,
        setIsPopUpOpen
    } = props;
    const { content, structure, selectedCategory, incrementFileVersion, fileVersion,
        setBaseDrawing,
        loading,
        generateHierarchy } = useAppStore();
    const { updateBaseDrawing, shiftCategory, refreshContent, contentFolder, baseFolderPath, baseContentPath, modelType } = useModel();

    // State variables
    const [tempSelectedCategory, setTempSelectedCategory] = useState(selectedCategory);
    const [tempBaseDrawing, setTempBaseDrawing] = useState(structure.baseDrawing);
    const [saveLoading, setSaveLoading] = useState(false);
    const [newBaseDrawingFiles, setNewBaseDrawingFiles] = useState<NewBaseDrawingFiles>({});
    const [tempPages, setTempPages] = useState<IPages>(structure.pages || {});
    const [newPageName, setNewPageName] = useState('');
    const firstPage = structure?.pages ? Object.keys(structure?.pages)[0] : "gad"
    const [choosenPage, setChoosenPage] = useState(firstPage);

    const [fileExistenceStatus, setFileExistenceStatus] = useState<FileExistenceStatus>({});
    const [openPageDeleteWarning, setOpenPageDeleteWarning] = useState('');
    const [isCheckingFiles, setIsCheckingFiles] = useState(false);


    // Reset states when design changes
    useEffect(() => {
        setFileExistenceStatus({});
        setTempPages(structure.pages || {});
        const firstPage = structure?.pages ? Object.keys(structure?.pages)[0] : "gad"
        setChoosenPage(firstPage);
        setNewBaseDrawingFiles({});
    }, [structure.pages]);

    // // Reset state when baseDrawing or pages change
    useEffect(() => {
        setTempBaseDrawing(structure.baseDrawing);
        setTempPages(structure.pages || {});
        setFileExistenceStatus({});
        setNewBaseDrawingFiles({});
        setChoosenPage('gad');
        // setIsPopUpOpen(false);
    }, [structure.baseDrawing, structure.pages, setIsPopUpOpen]);

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
                let completeCategoryPath = baseContentPath;

                if (modelType === "project" && (content as IProject).hierarchy) {
                    const project = content as IProject;
                    const tempSelectedCategoryId = project.hierarchy.categoryMapping[tempSelectedCategory];
                    completeCategoryPath = `${baseFolderPath}/${tempSelectedCategoryId}`
                }

                const tempBaseDrawingFileExistanceStatus = await FileExistenceChecker.checkAllFiles(
                    tempPages,
                    completeCategoryPath,
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
    }, [tempBaseDrawing, tempPages, baseFolderPath, fileVersion, tempSelectedCategory, content, modelType]);

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

            // Update chosen page if the deleted page was selected
            if (choosenPage === pageName) {
                const remainingPages = Object.keys(updated);
                setChoosenPage(remainingPages.length > 0 ? remainingPages[0] : 'gad');
            }

            return updated;
        });
    }, [fileExistenceStatus, choosenPage]);

    const handleDelete = useCallback(() => {
        setTempPages((prev) => {
            const updated = { ...prev };
            delete updated[openPageDeleteWarning];
            return updated;
        });

        if (choosenPage === openPageDeleteWarning) {
            const firstPage = tempPages ? Object.keys(tempPages)[0] : "gad"
            setChoosenPage(firstPage);
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

        if (!(content as IProject)?.hierarchy) {
            return toast.error("Error : Project hierarchy not found.");
        }
        const baseDrawing = SideMenuService.getBaseDrawingForCategory((content as IProject)?.hierarchy, newCategory);
        if (baseDrawing) {
            setTempBaseDrawing(baseDrawing);
        }

        const categoryPages = SideMenuService.getPagesForCategory((content as IProject)?.hierarchy, newCategory);
        setTempPages(categoryPages || {});
    }, [content]);

    // Handle shifting to a selected category without uploading new files
    const handleShiftToCategory = useCallback(async () => {
        try {
            if (!(content as IProject)?.hierarchy) {
                return toast.error("Error : Project hierarchy not found.");
            }
            const components = SideMenuService.getComponentsForCategory((content as IProject)?.hierarchy, tempSelectedCategory);
            const changedPages = SideMenuService.getPagesForCategory((content as IProject)?.hierarchy, tempSelectedCategory);
            const updatedHierarchy = generateHierarchy({
                updatedComponents: components,
                updatedCategory: tempSelectedCategory,
                updatedPages: tempPages,
                updatedBaseDrawing: tempBaseDrawing,
            });

            const pageNames = SideMenuService.calculateMissingPages(changedPages, tempPages);
            const folderNames = SideMenuService.getMissingFolderNames(pageNames, structure.pages);

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
                setSideMenuType("");
            } else {
                toast.error(data ? data.status : "Error while shifting category.");
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }, [
        content,
        tempSelectedCategory,
        shiftCategory,
        generateHierarchy,
        tempPages,
        tempBaseDrawing,
        refreshContent,
        structure.pages,
        setSideMenuType,
        setIsPopUpOpen
    ]);

    // Handle uploading and updating base drawing with new files
    const handleUploadAndUpdateBaseDrawingForProject = useCallback(async () => {
        try {
            if (!(content as IProject)?.hierarchy) {
                return toast.error("handleUploadAndUpdateBaseDrawingForProject Error : Project hierarchy not found.");
            }
            const uniqueFileName = SideMenuService.createUniqueFileName((content as IProject)?.hierarchy, tempSelectedCategory);
            const formData = new FormData();
            formData.append('folder', contentFolder);

            const components = SideMenuService.getComponentsForCategory((content as IProject)?.hierarchy, tempSelectedCategory);
            const changedPages = SideMenuService.getPagesForCategory((content as IProject)?.hierarchy, tempSelectedCategory);
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
            formData.append('hierarchy', JSON.stringify(updatedHierarchy));

            formData.append('selectedCategory', tempSelectedCategory);
            formData.append('folderNames', folderNames.join(','));

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
        contentFolder,
        content,
        updateBaseDrawing,
        tempSelectedCategory,
        newBaseDrawingFiles,
        tempPages,
        refreshContent,
        structure.pages,
        generateHierarchy,
        setBaseDrawing,
        incrementFileVersion,
        setIsPopUpOpen,
        setSideMenuType
    ]);


    const handleUploadAndUpdateBaseDrawingForDesign = useCallback(async () => {
        try {
            if (!(content as IDesign)?.structure) {
                return toast.error("handleUploadAndUpdateBaseDrawingForDesign Error : Design structure not found.");
            }
            const uniqueFileName = structure?.baseDrawing?.fileId || uuidv4();
            const formData = new FormData();

            const components = structure.components;
            const originalPages = structure.pages;
            const pagesNames = SideMenuService.calculateMissingPages(originalPages, tempPages);
            const folderNames = SideMenuService.getMissingFolderNames(pagesNames, structure.pages);

            const updatedStructure: IStructure = {
                ...structure,
                components: components,
                baseDrawing: {
                    fileId: uniqueFileName,
                },
                pages: tempPages
            }

            formData.append('folder', contentFolder);
            formData.append('structure', JSON.stringify(updatedStructure));
            formData.append('folderNames', folderNames.join(','));

            for (const [folder, file] of Object.entries(newBaseDrawingFiles)) {
                const customName = `${folder}<<&&>>${uniqueFileName}${file.name.slice(-4)}`;
                formData.append('files', file, customName);
            }

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
            } else {
                toast.error(data ? data.status : "Error while updating the base drawing.");
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }, [
        contentFolder,
        content,
        updateBaseDrawing,
        newBaseDrawingFiles,
        tempPages,
        refreshContent,
        setBaseDrawing,
        incrementFileVersion,
        setIsPopUpOpen,
        structure,
        setSideMenuType
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
                return;
            }

            // If no new files, just shift to selected category
            if (modelType === "design") {
                handleUploadAndUpdateBaseDrawingForDesign();
                return;
            }
            else if (!newBaseDrawingFiles || Object.keys(newBaseDrawingFiles).length === 0 && modelType === "project") {
                await handleShiftToCategory();
            }
            else if (modelType === "project") {
                await handleUploadAndUpdateBaseDrawingForProject();
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
        handleUploadAndUpdateBaseDrawingForProject,
        handleUploadAndUpdateBaseDrawingForDesign,
        fileExistenceStatus,
        newBaseDrawingFiles,
        modelType
    ]);

    const resetSideBarState = useCallback(() => {
        setTempSelectedCategory(selectedCategory);
        setTempBaseDrawing(structure.baseDrawing);
        setTempPages(structure.pages || {});
        setChoosenPage('gad');
    }, [selectedCategory, structure.baseDrawing, structure.pages]);

    // Return all state and handlers
    return {
        tempSelectedCategory,
        setTempSelectedCategory,
        tempBaseDrawing,
        saveLoading,
        newBaseDrawingFiles,
        tempPages,
        newPageName,
        setNewPageName,
        choosenPage,
        setChoosenPage,
        fileExistenceStatus,
        openPageDeleteWarning,
        setOpenPageDeleteWarning,
        isCheckingFiles,
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