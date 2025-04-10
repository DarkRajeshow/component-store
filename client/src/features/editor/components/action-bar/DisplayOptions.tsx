import { IAttribute, IAttributeOption } from '../../../../types/request.types';
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
    components: Record<string, IAttribute>;
}

const DisplayOptions: React.FC<DisplayOptionsProps> = ({ level, isNestedLevel2 = false, levelOneNest }) => {
    const { components } = useAppStore() as DesignStore;

    if (!components) {
        return null;
    }

    const hasselected = (attribute: IAttribute): boolean => {
        if (!attribute.options) return false;

        // Check if the current attribute has a selected option that meets the condition
        if (attribute.selected && attribute.options[attribute.selected]?.selected) {
            return true;
        }

        // Check all nested options
        for (const key in attribute.options) {
            const option = attribute.options[key] as IAttributeOption;
            if (typeof option === 'object' && option.selected) {
                if (option.selected) {
                    return true;
                }
            } else if (Array.isArray(attribute.options)) {
                for (const opt of attribute.options as IAttributeOption[]) {
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
                        {Object.entries(components).map(([attribute, value]) => {
                            if (hasselected(value)) {
                                return (
                                    <SelectItem key={attribute} value={attribute}>
                                        {attribute}
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
                    {Object.entries(components).map(([attribute, value]) => {
                        if (value.selected) {
                            return (
                                <SelectItem key={attribute} value={attribute}>
                                    {attribute}
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
                        {Object.entries(parent.options).map(([attribute, value]) => {
                            const optionValue = value as IAttributeOption;
                            if (optionValue?.selected) {
                                return (
                                    <SelectItem key={attribute} value={attribute}>
                                        {attribute}
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