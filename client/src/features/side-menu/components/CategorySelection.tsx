import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ICategoryMapping } from "@/types/project.types";

interface CategorySelectionProps {
    categoryMapping: ICategoryMapping;
    tempSelectedCategory: string;
    handleCategoryChange: (newCategory: string) => void;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({
    categoryMapping,
    tempSelectedCategory,
    handleCategoryChange
}) => {

    return (
        <>
            <div className="pb-1 space-y-2">
                <Label className="text-black font-medium capitalize">Select/Change Category</Label>
                <Select
                    value={tempSelectedCategory}
                    onValueChange={(value) => handleCategoryChange(value)}
                >
                    <SelectTrigger className="w-full bg-white/80">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="relative z-50">
                        {categoryMapping && Object.entries(categoryMapping).map(([categoryName, categoryId]) => (
                            <SelectItem value={categoryName} key={categoryId}>
                                {categoryName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div >
        </>
    );
};

export default React.memo(CategorySelection);