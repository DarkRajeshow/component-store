// components/category-manager/CategoryManager.tsx
import React, { useCallback } from "react";
import {
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Plus,
    X,
    FolderOpen,
} from "lucide-react";
import { useCategoryManager } from "../../hooks/category-manager/useCategoryManager";
import { ScrollArea } from "@/components/ui/scroll-area";
import CategoryCard from "./CategoryCard";
import CategoryDetails from "./CategoryDetails";
import AddCategoryModal from "./AddCategoryModal";
import RenameCategoryModal from "./RenameCategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";

interface ICategoryManagerProps {
    setSideMenuType: (updatedMenuType: "" | "pageManager" | "categoryManager") => void;
    isPopUpOpen: boolean;
    setIsPopUpOpen: (value: boolean) => void;
    allowedToClose: boolean | undefined;
}

function CategoryManager({
    setSideMenuType,
    setIsPopUpOpen,
    allowedToClose,
}: ICategoryManagerProps) {
    // Use the custom hook to manage state and logic
    const {
        toggleDialog,
        categoryList,
        selectedCategoryId,
        isLoading,
        selectedCategory,
        tempSelectedCategory,
        handleSelectCategory,
        handleShiftCategory,
        openAddCategoryModal,
        openRenameCategoryModal,
        openDeleteConfirmation,
        isAddCategoryModalOpen,
        setIsAddCategoryModalOpen,
        newCategoryName,
        setNewCategoryName,
        handleAddCategory,
        isRenameCategoryModalOpen,
        setIsRenameCategoryModalOpen,
        handleRenameCategory,
        categoryToRename,
        isConfirmDeleteOpen,
        setIsConfirmDeleteOpen,
        handleDeleteCategory,
        categoryToDelete
    } = useCategoryManager({
        setSideMenuType,
        setIsPopUpOpen,
    });

    // Memoize handlers
    const memoizedToggleDialog = useCallback(() => {
        toggleDialog();
    }, [toggleDialog]);

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

            <DialogTitle className="text-xl font-semibold text-dark/70 text-center py-2">
                Manage Categories
            </DialogTitle>

            <div className="flex flex-col gap-4 mt-4">
                {/* Left side - Category List */}
                <div className="border rounded-md p-4 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium">Categories</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={openAddCategoryModal}
                            disabled={isLoading}
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                    </div>

                    <ScrollArea className="flex-grow">
                        <div className="space-y-2">
                            {categoryList.length > 0 ? (
                                categoryList.map((category) => (
                                    <CategoryCard
                                        key={category.id}
                                        category={category}
                                        isSelected={selectedCategoryId === category.id}
                                        onSelect={() => handleSelectCategory(category.id, category.code)}
                                        onRename={() => openRenameCategoryModal(category.id, category.code, category.name)}
                                        onDelete={() => openDeleteConfirmation(category.id, category.code)}
                                        disabled={isLoading}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                                    <FolderOpen className="h-12 w-12 mb-2 opacity-50" />
                                    <p>No categories found</p>
                                    <p className="text-sm">Add a new category to get started</p>
                                </div>
                            )}
                        </div>

                        <Button
                            disabled={selectedCategory === tempSelectedCategory}
                            onClick={handleShiftCategory}
                            variant={"outline"}
                            className="w-full bg-green-300/80 transition-all text-black hover:bg-green-300 text-sm font-medium py-1 h-auto mt-2"
                        >
                            Shift Category
                        </Button>
                    </ScrollArea>
                </div>


                {/* chetan.merugu@crompton.co.in */}

                {/* Right side - Category Details */}
                <div className="border rounded-md p-4 h-full">
                    {selectedCategoryId ? (
                        <CategoryDetails
                            selectedCategoryId={selectedCategoryId}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <FolderOpen className="h-16 w-16 mb-3 opacity-50" />
                            <p className="text-lg">Select a category to view details</p>
                        </div>
                    )}
                </div>


            </div>

            {/* Modals */}
            <AddCategoryModal
                isAddCategoryModalOpen={isAddCategoryModalOpen}
                setIsAddCategoryModalOpen={setIsAddCategoryModalOpen}
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
                handleAddCategory={handleAddCategory}
                isLoading={isLoading}
            />
            <RenameCategoryModal
                isRenameCategoryModalOpen={isRenameCategoryModalOpen}
                setIsRenameCategoryModalOpen={setIsRenameCategoryModalOpen}
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
                handleRenameCategory={handleRenameCategory}
                isLoading={isLoading}
                categoryToRename={categoryToRename}
            />
            <DeleteCategoryModal
                isConfirmDeleteOpen={isConfirmDeleteOpen}
                setIsConfirmDeleteOpen={setIsConfirmDeleteOpen}
                handleDeleteCategory={handleDeleteCategory}
                isLoading={isLoading}
                categoryToDelete={categoryToDelete}
            />
        </div>
    );
}

export default React.memo(CategoryManager);