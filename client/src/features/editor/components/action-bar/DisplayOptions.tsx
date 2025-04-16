import { IComponent, IComponentOption } from '../../../../types/request.types';
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

interface DesignStore {
    components: Record<string, IComponent>;
}

const DisplayOptions: React.FC<DisplayOptionsProps> = ({ level, isNestedLevel2 = false, levelOneNest }) => {
    const { components } = useAppStore() as DesignStore;

    if (!components) {
        return null;
    }

    const hasselected = (component: IComponent): boolean => {
        if (!component.options) return false;

        // Check if the current component has a selected option that meets the condition
        if (component.selected && component.options[component.selected]?.selected) {
            return true;
        }

        // Check all nested options
        for (const key in component.options) {
            const option = component.options[key] as IComponentOption;
            if (typeof option === 'object' && option.selected) {
                if (option.selected) {
                    return true;
                }
            } else if (Array.isArray(component.options)) {
                for (const opt of component.options as IComponentOption[]) {
                    if (opt.selected) {
                        return true;
                    }
                }
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
                        if (value.selected) {
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
        if (parent?.options) {
            return (
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>{levelOneNest} Options</SelectLabel>
                        {Object.entries(parent.options).map(([component, value]) => {
                            const optionValue = value as IComponentOption;
                            if (optionValue?.selected) {
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