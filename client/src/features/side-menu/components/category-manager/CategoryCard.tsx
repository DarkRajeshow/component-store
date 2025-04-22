// components/category-manager/CategoryCard.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface CategoryCardProps {
    category: {
        id: string;
        code: string;
        name: string;
        pages: number;
        hasBaseDrawing: boolean;
    };
    isSelected: boolean;
    onSelect: () => void;
    onRename: () => void;
    onDelete: () => void;
    disabled: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
    category,
    isSelected,
    onSelect,
    onRename,
    onDelete,
    disabled,
}) => {
    return (
        <Card
            className={`p-3 transition-all ${isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "hover:border-gray-300 cursor-pointer"
                }`}
            onClick={onSelect}
        >
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <h4 className="font-medium truncate" title={category.name}>
                        {category.code}
                    </h4>
                    <div className="text-xs text-gray-500 mt-1">
                        {category.pages} page{category.pages !== 1 ? "s" : ""}
                        {category.hasBaseDrawing && " • Has base drawing"}
                    </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRename();
                        }}
                        disabled={disabled}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        disabled={disabled}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default CategoryCard;