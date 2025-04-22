// components/category-manager/RenameCategoryModal.tsx
import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// components/category-manager/RenameCategoryModal.tsx
interface IRenameCategoryModalProps {
    isRenameCategoryModalOpen: boolean;
    setIsRenameCategoryModalOpen: (open: boolean) => void;
    newCategoryName: string;
    setNewCategoryName: (name: string) => void;
    handleRenameCategory: () => void;
    isLoading: boolean;
    categoryToRename: { code: string } | null; // Assuming categoryToRename has a 'code' property
}

const RenameCategoryModal: React.FC<IRenameCategoryModalProps> = ({
    isRenameCategoryModalOpen,
    setIsRenameCategoryModalOpen,
    newCategoryName,
    setNewCategoryName,
    handleRenameCategory,
    isLoading,
    categoryToRename,
}) => {

    if (!categoryToRename) return null;

    return (
        <Dialog open={isRenameCategoryModalOpen} onOpenChange={setIsRenameCategoryModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rename Category</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <div className="mb-4">
                        <Label className="text-sm text-gray-500">Current Name</Label>
                        <div className="font-medium">{categoryToRename.code}</div>
                    </div>
                    <Label htmlFor="newCategoryName" className="mb-2 block">
                        New Category Name
                    </Label>
                    <Input
                        id="newCategoryName"
                        placeholder="Enter new category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        autoFocus
                        disabled={isLoading}
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsRenameCategoryModalOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleRenameCategory} disabled={isLoading || !newCategoryName.trim()}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Renaming...
                            </>
                        ) : (
                            "Rename Category"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RenameCategoryModal;