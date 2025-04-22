import React, { useCallback } from "react";
import {
    DialogDescription,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import CategorySelection from "./CategorySelection";
import FileUploadSection from "./FileUploadSection";
import ActionButtons from "./ActionButtons";
import useAppStore from "@/store/useAppStore";
import { useModel } from "@/contexts/ModelContext";
import Pages from "./Pages";
import { usePageManager } from "../../hooks/page-manager/usePageManager";
import { IProject } from "@/types/project.types";


interface IPageManagerProps {
    setSideMenuType: (updatedMenuType: "" | "pageManager" | "categoryManager") => void;
    isPopUpOpen: boolean;
    setIsPopUpOpen: (value: boolean) => void;
    allowedToClose: boolean | undefined
}


function PageManager({
    setSideMenuType,
    isPopUpOpen,
    setIsPopUpOpen,
    allowedToClose
}: IPageManagerProps) {
    // Get params and store values
    const {
        modelType,
        contentFolder,
        baseFolderPath
    } = useModel()

    const {
        content,
        fileVersion,
    } = useAppStore();


    // Use the custom hook to manage state and logic
    const {
        tempSelectedCategory,
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
        resetSideBarState,
        handleFileChange,
        handleDrop,
        toggleDialog,
        openDeleteConfirmation,
        handleDelete,
        addNewPage,
        handleCategoryChange,
        updateBaseDrawingFunc
    } = usePageManager({
        setSideMenuType,
        setIsPopUpOpen
    });

    // Memoize handlers
    const memoizedToggleDialog = useCallback(() => {
        toggleDialog();
        resetSideBarState();
        setIsPopUpOpen(!isPopUpOpen);
        setSideMenuType("")
    }, [toggleDialog, setIsPopUpOpen, isPopUpOpen, resetSideBarState, setSideMenuType]);


    if (!contentFolder) {
        return null;
    }

    return (
        <div>
            {allowedToClose && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={memoizedToggleDialog}
                    className="absolute top-3 right-3 shadow-none"
                >
                    <X className="size-6" />
                </Button>
            )}

            <DialogDescription hidden />

            {modelType && (content) && (
                <div className='group flex flex-col gap-4 w-full'>
                    <DialogTitle className="text-xl font-semibold text-dark/70 text-center py-2">
                        Upload / Change Base Drawing
                    </DialogTitle>

                    {modelType === "project" && (content as IProject) && (
                        <CategorySelection
                            categoryMapping={(content as IProject).hierarchy && (content as IProject).hierarchy.categoryMapping}
                            tempSelectedCategory={tempSelectedCategory}
                            handleCategoryChange={handleCategoryChange}
                        />
                    )}

                    <Pages
                        newPageName={newPageName}
                        setNewPageName={setNewPageName}
                        addNewPage={addNewPage}
                        choosenPage={choosenPage}
                        fileExistenceStatus={fileExistenceStatus}
                        openDeleteConfirmation={openDeleteConfirmation}
                        setChoosenPage={setChoosenPage}
                        tempPages={tempPages}
                        openPageDeleteWarning={openPageDeleteWarning}
                        setOpenPageDeleteWarning={setOpenPageDeleteWarning}
                        handleDelete={handleDelete}
                    />

                    <FileUploadSection
                        choosenPage={choosenPage}
                        tempBaseDrawing={tempBaseDrawing}
                        handleFileChange={handleFileChange}
                        handleDrop={handleDrop}
                        tempPages={tempPages}
                        content={content}
                        fileExistenceStatus={fileExistenceStatus}
                        newBaseDrawingFiles={newBaseDrawingFiles}
                        baseFolderPath={baseFolderPath}
                        tempSelectedCategory={tempSelectedCategory}
                        fileVersion={fileVersion}
                    />

                    <ActionButtons
                        saveLoading={saveLoading}
                        tempBaseDrawing={tempBaseDrawing?.fileId}
                        newBaseDrawingFiles={newBaseDrawingFiles}
                        updateBaseDrawing={updateBaseDrawingFunc}
                        allowedToClose={allowedToClose as boolean}
                        memoizedToggleDialog={memoizedToggleDialog}
                    />
                </div>
            )}
        </div>
    );
}

export default React.memo(PageManager);