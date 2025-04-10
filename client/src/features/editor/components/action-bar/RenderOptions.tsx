import { useEffect, useRef, useState } from "react";
import EditMenu from "./EditMenu";
import useAppStore from "../../../../store/useAppStore";
import { IAttributeOption } from "../../../../types/request.types";
import OptionItem from "./OptionItem";
import { cn } from "@/lib/utils";

interface RenderOptionsProps {
    pushToUndoStack: () => void;
    attribute: string;
    options: Record<string, IAttributeOption>;
    handleToggleContextMenu: (attribute: string, option: string, subOption?: string) => void;
    setDialogType: (type: string) => void;
    menuVisible: string | boolean;
}

const RenderOptions = ({ pushToUndoStack, attribute, options, handleToggleContextMenu, setDialogType, menuVisible }: RenderOptionsProps) => {
    const { components, updateSelectedSubOption, updateselected } = useAppStore();
    const [openSubSubOptions, setOpenSubSubOptions] = useState<string[]>([]);
    const [scrollPosition, setScrollPosition] = useState(0);
    const divRef = useRef<HTMLDivElement>(null);

    const handleOptionChange = (option: string) => {
        pushToUndoStack(); // Push the current state before the change
        updateselected(attribute, option);
    };

    const handleSubOptionChange = (option: string, subOption: string) => {
        pushToUndoStack(); // Push the current state before the change
        updateSelectedSubOption(attribute, option, subOption);
    };

    const handleToggleSubOptions = (subOption: string, subValue: IAttributeOption) => {
        if (subValue?.options) {
            if (openSubSubOptions.includes(subOption)) {
                setOpenSubSubOptions(openSubSubOptions.filter(option => option !== subOption));
            } else {
                setOpenSubSubOptions([...openSubSubOptions, subOption]);
            }
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (divRef.current) {
                setScrollPosition(divRef.current.scrollTop);
            }
        };

        const divElement = divRef.current;
        if (divElement) {
            divElement.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (divElement) {
                divElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return <div className="overflow-y-scroll max-h-[50vh] pl-2" ref={divRef}>
        {Object.entries(options).map(([subOption, subValue]) => (
            <div key={subOption}>
                <OptionItem
                    option={subOption}
                    isSelected={components[attribute].selected === subOption}
                    showDropdownIcon={!!subValue.selected}
                    isOpen={openSubSubOptions.includes(subOption)}
                    isNone={subOption === "none"}
                    menuVisible={menuVisible}
                    menuPath={`${attribute}>$>${subOption}`}
                    onOptionClick={() => {
                        handleOptionChange(subOption);
                        handleToggleSubOptions(subOption, subValue);
                    }}
                    onMenuClick={() => handleToggleContextMenu(attribute, subOption)}
                />

                {(menuVisible === `${attribute}>$>${subOption}`) && (
                    <div className={cn("absolute -right-[112px] border -top-0 border-gray-300 rounded-lg mt-1 bg-white z-30 min-w-max", { [`-top-[${scrollPosition - 50}px]`]: true })}>
                        <EditMenu setDialogType={setDialogType} attributeOption={menuVisible} />
                    </div>
                )}

                {subValue.selected && subValue.options && (
                    <div className={`duration-1000 transition-transform group ml-6 pl-3 border-l border-gray-400/25 ${(openSubSubOptions.includes(subOption)) ? "h-full" : "h-0 overflow-hidden"}`}>
                        {Object.entries(subValue.options).map(([subSubOption]) => (
                            <div key={subSubOption}>
                                <OptionItem
                                    option={subSubOption}
                                    isSelected={subValue.selected === subSubOption}
                                    menuVisible={menuVisible}
                                    menuPath={`${attribute}>$>${subOption}>$>${subSubOption}`}
                                    onOptionClick={() => handleSubOptionChange(subOption, subSubOption)}
                                    onMenuClick={() => handleToggleContextMenu(attribute, subOption, subSubOption)}
                                    className="group/subsubOption"
                                />

                                {(menuVisible === `${attribute}>$>${subOption}>$>${subSubOption}`) && (
                                    <div className={cn("absolute -right-[112px] border border-gray-300 rounded-lg mt-1 bg-white z-30 min-w-max", { [`-top-[${scrollPosition}px]`]: true })}>
                                        <EditMenu setDialogType={setDialogType} attributeOption={menuVisible} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ))}
    </div>;
};

export default RenderOptions;
