// components/category-manager/AddCategoryModal.tsx
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

interface IAddCategoryModalProps {
    isAddCategoryModalOpen: boolean;
    setIsAddCategoryModalOpen: (open: boolean) => void;
    newCategoryName: string;
    setNewCategoryName: (name: string) => void;
    handleAddCategory: () => void;
    isLoading: boolean;
}
const AddCategoryModal : React.FC<IAddCategoryModalProps>= ({
    isAddCategoryModalOpen,
    setIsAddCategoryModalOpen,
    newCategoryName,
    setNewCategoryName,
    handleAddCategory,
    isLoading,
}) => {
    return (
        <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="categoryName" className="mb-2 block">
                        Category Name/Code
                    </Label>
                    <Input
                        id="categoryName"
                        placeholder="Enter category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        autoFocus
                        disabled={isLoading}
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsAddCategoryModalOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleAddCategory} disabled={isLoading || !newCategoryName.trim()}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            "Add Category"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddCategoryModal;