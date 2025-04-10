import { memo } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IDesign } from '@/types/request.types';

interface Question {
    label: string;
    options: Array<{
        label: string;
        value: string;
    }>;
}

// interface Design {
//     designType: string;
//     selectedCategory: string;
//     designInfo?: Record<string, string>;
// }

interface PopUpQuestions {
    [key: string]: {
        questions: Question[];
    };
}

interface DesignInfoPanelProps {
    design: IDesign;
    popUpQuestions: PopUpQuestions;
    tempSelectedCategory: string;
    setTempSelectedCategory: (value: string) => void;
    shiftCategory: () => void;
}

const DesignInfoPanel = memo(({
    design,
    popUpQuestions,
    tempSelectedCategory,
    setTempSelectedCategory,
    shiftCategory
}: DesignInfoPanelProps) => {
    if (!design || !popUpQuestions[design.designType]) {
        return null;
    }
    const selectedCategory = design.selectedCategory; // Assuming designType is the selected category

    return (
        <Card className="absolute text-md top-full left-[90%] gap-3 z-40 min-w-[280px] py-2 border-2 border-dark/20 bg-white">
            <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-sm font-medium">Design Details</CardTitle>
            </CardHeader>

            <CardContent className="pb-1 pt-0">
                {design?.designInfo &&
                    Object.entries(design.designInfo).map(([key, value]) => (
                        <div key={key} className="capitalize text-sm font-medium text-gray-600 mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()} : {value}
                        </div>
                    ))
                }

                <div className="capitalize mt-4 text-sm font-medium">
                    <div className="text-sm font-medium mb-2">Change Variety</div>

                    {popUpQuestions[design.designType].questions.map((question, index) => (
                        <div key={index} className="pb-2 text-sm">
                            <label className="text-gray-600 text-xs block mb-1">{question.label}</label>
                            <select
                                value={tempSelectedCategory}
                                onChange={(e) => setTempSelectedCategory(e.target.value)}
                                className="w-full h-auto py-1.5 px-1.5 text-xs text-gray-600 rounded-md border border-input bg-white ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {question.options.map((option, idx) => (
                                    <option
                                        key={idx}
                                        value={option.value}
                                        className="text-xs text-gray-600"
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="pt-1 pb-3">
                <Button
                    disabled={selectedCategory == tempSelectedCategory}
                    onClick={shiftCategory}
                    className="w-full text-sm bg-green-200 hover:bg-green-300 text-dark font-medium py-1 h-auto"
                >
                    Shift
                </Button>
            </CardFooter>
        </Card>
    );
});

DesignInfoPanel.displayName = 'DesignInfoPanel';

export default DesignInfoPanel;