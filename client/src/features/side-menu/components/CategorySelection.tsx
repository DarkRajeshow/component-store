import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { popUpQuestions } from "@/constants";

interface Option {
    value: string;
    label: string;
}

interface Question {
    label: string;
    options: Option[];
}

interface CategorySelectionProps {
    designType: keyof typeof popUpQuestions;
    tempSelectedCategory: string;
    handleCategoryChange: (event: { target: { value: string } }) => void;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({
    designType,
    tempSelectedCategory,
    handleCategoryChange
}) => {
    const questions: Question[] = popUpQuestions[designType].questions;

    return (
        <>
            {questions.map((question, index) => (
                <div key={index} className="pb-1 space-y-2">
                    <Label className="text-black font-medium">{question.label}</Label>
                    <Select
                        value={tempSelectedCategory}
                        onValueChange={(value) => handleCategoryChange({ target: { value } })}
                    >
                        <SelectTrigger className="w-full bg-white/80">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="relative z-50">
                            {question.options.map((option, idx) => (
                                <SelectItem key={idx} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ))}
        </>
    );
};

export default React.memo(CategorySelection);