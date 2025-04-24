import { memo } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useAppStore from '@/store/useAppStore';
import { useModel } from '@/contexts/ModelContext';
import { IDesign } from '@/types/design.types';
import { IProject } from '@/types/project.types';

interface DesignInfoPanelProps {
    tempSelectedCategory: string;
    setTempSelectedCategory: (value: string) => void;
    shiftToSelectedCategory: () => void;
}

const DesignInfoPanel = memo(({
    tempSelectedCategory,
    setTempSelectedCategory,
    shiftToSelectedCategory
}: DesignInfoPanelProps) => {
    const { content } = useAppStore();
    const { modelType } = useModel();

    if (!content) return null;

    const selectedCategory = modelType === "design" ? (content as IDesign).category : (content as IProject).selectedCategory;

    return (
        <Card className="absolute text-md top-full left-[90%] gap-3 z-40 min-w-[280px] py-2 border-2 border-dark/20 bg-white">
            <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-sm font-medium">
                    {modelType === "design" ? "Design Details" : "Project Details"}
                </CardTitle>
            </CardHeader>

            <CardContent className="pb-1 pt-0">
                <div className="space-y-2">
                    {modelType === "design" ? (
                        <>
                            <InfoItem label="Name" value={(content as IDesign).name} />
                            <InfoItem label="Type" value={(content as IDesign).type} />
                            <InfoItem label="Category" value={(content as IDesign).category} />
                            <InfoItem label="Code" value={(content as IDesign).code} />
                            {(content as IDesign).description && <InfoItem label="Description" value={(content as IDesign)?.description ?? ''} />}
                        </>
                    ) : (
                        <>
                            <InfoItem label="Name" value={(content as IProject).name} />
                            <InfoItem label="Type" value={(content as IProject).type} />
                            <InfoItem label="Category" value={(content as IProject).selectedCategory} />

                            {(content as IProject)?.description && <InfoItem label="Description" value={(content as IProject).description ?? ''} />}
                        </>
                    )}
                </div>

                {modelType === "project" && <div className="mt-4">
                    <label className="text-sm font-medium mb-2 block">Change Category</label>
                    <select
                        value={tempSelectedCategory}
                        onChange={(e) => setTempSelectedCategory(e.target.value)}
                        className="w-full h-auto py-1.5 px-1.5 text-xs text-gray-600 rounded-md border border-input bg-white ring-offset-background focus:outline-none"
                    >
                        {Object.keys(((content as IProject).hierarchy.categoryMapping)).map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>}
            </CardContent>

            <CardFooter className="pt-1 pb-3">
                {modelType === 'project' && <Button
                    disabled={selectedCategory === tempSelectedCategory}
                    onClick={shiftToSelectedCategory}
                    className="w-full text-sm bg-green-200 hover:bg-green-300 text-dark font-medium py-1 h-auto"
                >
                    Shift Category
                </Button>}
            </CardFooter>
        </Card>
    );
});

const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <div className="text-sm">
        <span className="font-medium text-gray-700">{label}: </span>
        <span className="text-gray-600">{value}</span>
    </div>
);

DesignInfoPanel.displayName = 'DesignInfoPanel';

export default DesignInfoPanel;