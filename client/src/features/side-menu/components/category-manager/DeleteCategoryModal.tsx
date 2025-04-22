// components/category-manager/DeleteCategoryModal.tsx
import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";


// components/category-manager/DeleteCategoryModal.tsx
interface DeleteCategoryModalProps {
    isConfirmDeleteOpen: boolean;
    setIsConfirmDeleteOpen: (open: boolean) => void;
    handleDeleteCategory: () => void;
    isLoading: boolean;
    categoryToDelete: { code: string } | null; // Assuming categoryToDelete has a 'code' property
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
    isConfirmDeleteOpen,
    setIsConfirmDeleteOpen,
    handleDeleteCategory,
    isLoading,
    categoryToDelete,
}) => {
    if (!categoryToDelete) return null;
    return (
        <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the category "{categoryToDelete.code}"? This action cannot be undone and all associated pages and components will be permanently removed.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDeleteCategory();
                        }}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteCategoryModal;