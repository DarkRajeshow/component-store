import React, { useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// import useAppStore from "../../../../store/useAppStore";
// import { sideMenuTypes } from "../../../../constants";
// import { useSideMenu } from "../../hooks/sidemenu/useSideMenu";
import SideMenuTriggers from "./SideMenuTriggers";
import CategorySelection from "./CategorySelection";
import PageManagement from "./PageManagement";
import FileUploadSection from "./FileUploadSection";
import ActionButtons from "./ActionButtons";
import { useSideMenu } from "../hooks/useSideMenu";
import useAppStore from "@/store/useAppStore";
import { sideMenuTypes } from "@/constants";
import { useModel } from "@/contexts/ModelContext";

function SideMenu() {
  // Get params and store values
  const { modelType, baseContentPath } = useModel()

  const {
    design,
    project,
    selectedCategory,
    incrementFileVersion,
    setBaseDrawing,
    generateHierarchy,
    fileVersion,
    loading,
    structure,
  } = useAppStore();


  // Use the custom hook to manage state and logic
  const {
    sideMenuType,
    setSideMenuType,
    tempSelectedCategory,
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
    resetSideBarState,
    allowedToClose,
    handleFileChange,
    handleDrop,
    toggleDialog,
    openDeleteConfirmation,
    handleDelete,
    addNewPage,
    handleCategoryChange,
    updateBaseDrawingFunc
  } = useSideMenu({
    folder: `${modelType === "project" ? project?.folder : design?.folder}`,
    modelType,
    selectedCategory,
    incrementFileVersion,
    fileVersion,
    structure,
    setBaseDrawing,
    loading,
    generateHierarchy,
    baseContentPath,
  });


  // Memoize dialog open state  
  const dialogOpen = useMemo(() => {
    return isPopUpOpen;
  }, [isPopUpOpen]);

  // Memoize handlers
  const memoizedToggleDialog = useCallback(() => {
    toggleDialog();
    resetSideBarState();
    setIsPopUpOpen(!isPopUpOpen);
  }, [toggleDialog, setIsPopUpOpen, isPopUpOpen, resetSideBarState]);

  if (!design) {
    return null;
  }

  return (
    <Dialog open={dialogOpen}>
      <SideMenuTriggers
        sideMenuTypes={sideMenuTypes}
        sideMenuType={sideMenuType}
        setSideMenuType={setSideMenuType}
        isPopUpOpen={isPopUpOpen}
        setIsPopUpOpen={setIsPopUpOpen}
      />

      <DialogTrigger id='closeButtonSideMenu' hidden></DialogTrigger>

      <DialogContent className="select-none bg-white max-h-[80vh] min-h-[40vh] w-[750px] overflow-y-auto p-6">
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

        {modelType && (project || design) && (
          <div className='group flex flex-col gap-4 w-full'>
            <DialogTitle className="text-xl font-semibold text-dark/70 text-center py-2">
              Upload / Change Base Drawing
            </DialogTitle>

            {modelType === "project" && project && (
              <CategorySelection
                categoryMapping={project.hierarchy && project.hierarchy.categoryMapping}
                tempSelectedCategory={tempSelectedCategory}
                handleCategoryChange={handleCategoryChange}
              />
            )}

            <PageManagement
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
              fileExistenceStatus={fileExistenceStatus}
              newBaseDrawingFiles={newBaseDrawingFiles}
              baseContentPath={baseContentPath}
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
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(SideMenu);