import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DisplayOptions } from "../action-bar";

// Parent Component Selection Component
const ParentComponentSection: React.FC<{
    level: number;
    levelOneNest: string;
    setLevelOneNest: (nest: string) => void;
    levelTwoNest?: string;
    setLevelTwoNest?: (nest: string) => void;
    isNestedLevel2?: boolean;
}> = ({ level, levelOneNest, setLevelOneNest, levelTwoNest, setLevelTwoNest, isNestedLevel2 }) => {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="parent-component" className="text-black font-medium">
                    Select Parent Component
                </Label>
                <Select value={levelOneNest} onValueChange={setLevelOneNest}>
                    <SelectTrigger className="w-full bg-white/80">
                        <SelectValue placeholder="Select parent component" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value=" " disabled>Select Parent Component</SelectItem>
                        <DisplayOptions level={0} levelOneNest="" isNestedLevel2={isNestedLevel2} />
                    </SelectContent>
                </Select>
            </div>

            {level === 2 && levelOneNest && setLevelTwoNest && (
                <div className="space-y-2">
                    <Label htmlFor="nested-component" className="text-black font-medium">
                        Select Level 1 Nested Component
                    </Label>
                    <Select value={levelTwoNest || ""} onValueChange={setLevelTwoNest}>
                        <SelectTrigger className="w-full bg-white/80">
                            <SelectValue placeholder="Select level 1 nested component" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value=" " disabled>Select Level 1 Nested Component</SelectItem>
                            <DisplayOptions level={1} levelOneNest={levelOneNest} />
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
};

export default ParentComponentSection;