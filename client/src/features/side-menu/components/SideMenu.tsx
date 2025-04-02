import React, { useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// import useStore from "../../../../store/useStore";
// import { sideMenuTypes } from "../../../../constants";
// import { useSideMenu } from "../../hooks/sidemenu/useSideMenu";
import SideMenuTriggers from "./SideMenuTriggers";
import CategorySelection from "./CategorySelection";
import PageManagement from "./PageManagement";
import FileUploadSection from "./FileUploadSection";
import ActionButtons from "./ActionButtons";
import { useSideMenu } from "../hooks/useSideMenu";
import useStore from "@/store/useStore";
import { sideMenuTypes } from "@/constants";

function SideMenu() {
  // Get params and store values
  const { id } = useParams();
  const {
    design,
    selectedCategory,
    fetchProject,
    incrementFileVersion,
    fileVersion,
    baseDrawing,
    setBaseDrawing,
    loading,
    generateStructure,
    pages
  } = useStore();

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
    baseFilePath,
    allowedToClose,
    handleFileChange,
    handleDrop,
    toggleDialog,
    openDeleteConfirmation,
    handleDelete,
    addNewPage,
    handleCategoryChange,
    updateBaseDrawing
  } = useSideMenu({
    design,
    selectedCategory,
    fetchProject,
    incrementFileVersion,
    fileVersion,
    baseDrawing,
    setBaseDrawing,
    loading,
    generateStructure,
    pages,
    id: id || "",
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

        {design.designType && (
          <div className='group flex flex-col gap-4 w-full'>
            <DialogTitle className="text-xl font-semibold text-dark/70 text-center py-2">
              Upload / Change Base Drawing
            </DialogTitle>

            <CategorySelection 
              designType={design.designType}
              tempSelectedCategory={tempSelectedCategory}
              handleCategoryChange={handleCategoryChange}
            />

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
              baseFilePath={baseFilePath}
              fileVersion={fileVersion}
            />

            <ActionButtons 
              saveLoading={saveLoading}
              tempBaseDrawing={tempBaseDrawing}
              newBaseDrawingFiles={newBaseDrawingFiles}
              updateBaseDrawing={updateBaseDrawing}
              allowedToClose={allowedToClose}
              memoizedToggleDialog={memoizedToggleDialog}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(SideMenu);