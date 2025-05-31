import { IComponent, INormalComponent } from '@/types/project.types';
import { DesignStore } from '@/features/canvas/types/viewTypes';
import useAppStore from '../../../../store/useAppStore';
import {
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
} from "@/components/ui/select";

interface DisplayOptionsProps {
    level: number;
    isNestedLevel2?: boolean;
    levelOneNest: string;
}

const DisplayOptions: React.FC<DisplayOptionsProps> = ({ level, isNestedLevel2 = false, levelOneNest }) => {
    const store = useAppStore();
    const components = (store as unknown as DesignStore).components;

    if (!components) {
        return null;
    }

    const hasselected = (component: IComponent | INormalComponent): boolean => {
        if ('value' in component) return false; // Handle INormalComponent case
        
        if (!component.options) return false;

        // Check if the current component has a selected option that meets the condition
        const selectedOption = component.selected && component.options[component.selected];
        if (selectedOption && 'selected' in selectedOption) {
            return true;
        }

        // Check all nested options
        for (const key in component.options) {
            const option = component.options[key];
            if ('selected' in option && option.selected) {
                return true;
            }
        }

        return false;
    };

    if (level === 0) {
        // Render level 0 options
        if (isNestedLevel2) {
            return (
                <SelectContent>
                    <SelectGroup>
                        {Object.entries(components).map(([component, value]) => {
                            if (hasselected(value)) {
                                return (
                                    <SelectItem key={component} value={component}>
                                        {component}
                                    </SelectItem>
                                );
                            }
                            return null;
                        })}
                    </SelectGroup>
                </SelectContent>
            );
        }

        return (
            <SelectContent>
                <SelectGroup>
                    {Object.entries(components).map(([component, value]) => {
                        if ('selected' in value && value.selected) {
                            return (
                                <SelectItem key={component} value={component}>
                                    {component}
                                </SelectItem>
                            );
                        }
                        return null;
                    })}
                </SelectGroup>
            </SelectContent>
        );

    } else if (level === 1 && levelOneNest) {
        // Render level 1 options
        const parent = components[levelOneNest];
        if ('options' in parent && parent.options) {
            return (
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>{levelOneNest} Options</SelectLabel>
                        {Object.entries(parent.options).map(([component, value]) => {
                            if ('selected' in value) {
                                return (
                                    <SelectItem key={component} value={component}>
                                        {component}
                                    </SelectItem>
                                );
                            }
                            return null;
                        })}
                    </SelectGroup>
                </SelectContent>
            );
        }
    }
    return null;
};

export default DisplayOptions;