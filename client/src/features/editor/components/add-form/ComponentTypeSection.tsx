import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface ComponentType {
    value: string;
    Description: string;
}

// Component Type Selection Component
const ComponentTypeSection: React.FC<{
    componentType: string;
    setComponentType: (type: string) => void;
    componentTypes: ComponentType[];
}> = ({ componentType, setComponentType, componentTypes }) => {
    return (
        <div className="space-y-2">
            <Label htmlFor="component-type" className="text-black font-medium">
                Select Component type
            </Label>
            <Select value={componentType} onValueChange={setComponentType}>
                <SelectTrigger className="w-full bg-white/80">
                    <SelectValue placeholder="Select component type" />
                </SelectTrigger>
                <SelectContent>
                    {componentTypes.map((attType, index) => (
                        <SelectItem key={index} value={attType.value}>
                            {index + 1 + ". " + attType.Description}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};


export default ComponentTypeSection;