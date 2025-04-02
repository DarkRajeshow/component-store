import { IAttribute, IAttributeOption } from '../../../../types/types';
import useStore from '../../../../store/useStore';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

interface DisplayOptionsProps {
    level: number;
    isNestedLevel2?: boolean;
    levelOneNest: string;
}

interface DesignStore {
    designAttributes: Record<string, IAttribute>;
}

const DisplayOptions: React.FC<DisplayOptionsProps> = ({ level, isNestedLevel2 = false, levelOneNest }) => {
    const { designAttributes } = useStore() as DesignStore;

    if (!designAttributes) {
        return null;
    }

    const hasSelectedOption = (attribute: IAttribute): boolean => {
        if (!attribute.options) return false;

        // Check if the current attribute has a selected option that meets the condition
        if (attribute.selectedOption && attribute.options[attribute.selectedOption]?.selectedOption) {
            return true;
        }

        // Check all nested options
        for (const key in attribute.options) {
            const option = attribute.options[key] as IAttributeOption;
            if (typeof option === 'object' && option.selectedOption) {
                if (option.selectedOption) {
                    return true;
                }
            } else if (Array.isArray(attribute.options)) {
                for (const opt of attribute.options as IAttributeOption[]) {
                    if (opt.selectedOption) {
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
                        {Object.entries(designAttributes).map(([attribute, value]) => {
                            if (hasSelectedOption(value)) {
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
                    {Object.entries(designAttributes).map(([attribute, value]) => {
                        if (value.selectedOption) {
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
        const parent = designAttributes[levelOneNest];
        if (parent?.options) {
            return (
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>{levelOneNest} Options</SelectLabel>
                        {Object.entries(parent.options).map(([attribute, value]) => {
                            const optionValue = value as IAttributeOption;
                            if (optionValue?.selectedOption) {
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