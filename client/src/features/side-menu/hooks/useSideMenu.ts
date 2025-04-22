// hooks/useSideMenu.ts - A custom hook to manage SideMenu state and logic
import { useState, useEffect, useMemo } from "react";
import { FileExistenceChecker } from "../services/FileExistenceChecker";
import { FileExistenceStatus } from "../types/sideMenuTypes";
import useAppStore from "@/store/useAppStore";
import { useModel } from "@/contexts/ModelContext";
import { toast } from "sonner";

export function useSideMenu() {
    const { structure, fileVersion } = useAppStore();
    const { baseContentPath } = useModel();

    // State variables
    const [sideMenuType, setSideMenuType] = useState<"" | "pageManager" | "categoryManager">("");
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [currentBaseDrawingFileExistanceStatus, setCurrentBaseDrawingFileExistanceStatus] = useState<FileExistenceStatus>({});

    // Derived values with useMemo
    const allowedToClose = useMemo(() => {
        if (structure.baseDrawing && structure.pages && Object.keys(currentBaseDrawingFileExistanceStatus).length > 0) {
            const resultStatus = FileExistenceChecker.allowedToClose(currentBaseDrawingFileExistanceStatus, structure.baseDrawing, structure.pages)
            if (!resultStatus) {
                // setSideMenuType("pageManager");
                return false;
            }
            return true;
        }
    },
        [currentBaseDrawingFileExistanceStatus, structure?.pages, structure?.baseDrawing]
    );

    // // Reset states when design changes
    // useEffect(() => {
    //     setFileExistenceStatus({});
    //     setTempPages(structure.pages || {});
    //     const firstPage = structure?.pages ? Object.keys(structure?.pages)[0] : "gad"
    //     setChoosenPage(firstPage);
    //     setNewBaseDrawingFiles({});
    // }, [structure.pages]);

    // Reset state when baseDrawing or pages change
    // useEffect(() => {
    //     setTempBaseDrawing(structure.baseDrawing);
    //     setTempPages(structure.pages || {});
    //     setFileExistenceStatus({});
    //     setNewBaseDrawingFiles({});
    //     setChoosenPage('gad');
    //     setIsPopUpOpen(false);
    // }, [structure.baseDrawing, structure.pages]);


    // original selected catggory file existence Check
    useEffect(() => {
        if (structure?.pages && Object.keys(structure?.pages).length === 0) {
            return;
        }

        const checkFilesExistence = async () => {
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
                console.log("missingFiles");
                console.log(missingFiles);
                
                if (missingFiles && sideMenuType !== "pageManager") { // Add condition to check if popup is not already open
                    setIsPopUpOpen(true);
                    setSideMenuType("pageManager");
                    toast.warning("One or more pages in this category are missing a base drawing.");
                }
            } catch (error) {
                console.error('Error checking file existence:', error);
            }
        };

        const timeoutId = setTimeout(() => {
            checkFilesExistence();
        }, 100);

        return () => clearTimeout(timeoutId);
        // Add isPopUpOpen to dependencies array to prevent unnecessary checks when popup is open
    }, [baseContentPath, structure?.baseDrawing, structure?.pages, isPopUpOpen, fileVersion]);

    // Return all state and handlers
    return {
        sideMenuType,
        setSideMenuType,
        isPopUpOpen,
        setIsPopUpOpen,
        allowedToClose,
    };
}