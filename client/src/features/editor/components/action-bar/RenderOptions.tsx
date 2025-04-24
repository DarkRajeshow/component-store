import { useEffect, useRef, useState } from "react";
import EditMenu from "./EditMenu";
import useAppStore from "../../../../store/useAppStore";
import OptionItem from "../../../dashboard/OptionItem";
import { cn } from "@/lib/utils";
import { IComponent, IComponentOptions, IFileInfo, INestedParentLevel1 } from "@/types/project.types";

interface RenderOptionsProps {
    pushToUndoStack: () => void;
    component: string;
    options: IComponentOptions;
    handleToggleContextMenu: (component: string, option: string, subOption?: string) => void;
    setDialogType: (type: string) => void;
    menuVisible: string | boolean;
}

const RenderOptions = ({ pushToUndoStack, component, options, handleToggleContextMenu, setDialogType, menuVisible }: RenderOptionsProps) => {
    const { structure, updateSelectedSubOption, updateSelected } = useAppStore();
    const [openSubSubOptions, setOpenSubSubOptions] = useState<string[]>([]);
    const [scrollPosition, setScrollPosition] = useState(0);
    const divRef = useRef<HTMLDivElement>(null);

    const components = structure.components

    const handleOptionChange = (option: string) => {
        pushToUndoStack(); // Push the current state before the change
        updateSelected(component, option);
    };

    const handleSubOptionChange = (option: string, subOption: string) => {
        pushToUndoStack(); // Push the current state before the change
        updateSelectedSubOption(component, option, subOption);
    };

    const handleToggleSubOptions = (subOption: string, subValue: IFileInfo | INestedParentLevel1) => {
        if ((subValue as INestedParentLevel1)?.options) {
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
                    isSelected={(components[component] as IComponent).selected === subOption}
                    showDropdownIcon={!!(subValue as INestedParentLevel1).selected}
                    isOpen={openSubSubOptions.includes(subOption)}
                    isNone={subOption === "none"}
                    menuVisible={menuVisible}
                    menuPath={`${component}>$>${subOption}`}
                    onOptionClick={() => {
                        handleOptionChange(subOption);
                        handleToggleSubOptions(subOption, subValue);
                    }}
                    onMenuClick={() => handleToggleContextMenu(component, subOption)}
                />

                {(menuVisible === `${component}>$>${subOption}`) && (
                    <div className={cn("absolute -right-[112px] border -top-0 border-gray-300 rounded-lg mt-1 bg-white z-30 min-w-max", { [`-top-[${scrollPosition - 50}px]`]: true })}>
                        <EditMenu setDialogType={setDialogType} componentOption={menuVisible} />
                    </div>
                )}

                {(subValue as IComponent).selected && (subValue as IComponent).options && (
                    <div className={`duration-1000 transition-transform group ml-6 pl-3 border-l border-gray-400/25 ${(openSubSubOptions.includes(subOption)) ? "h-full" : "h-0 overflow-hidden"}`}>
                        {Object.entries((subValue as IComponent).options).map(([subSubOption]) => (
                            <div key={subSubOption}>
                                <OptionItem
                                    option={subSubOption}
                                    isSelected={(subValue as IComponent).selected === subSubOption}
                                    isParentSelected={(components[component] as IComponent).selected === subOption}
                                    menuVisible={menuVisible}
                                    menuPath={`${component}>$>${subOption}>$>${subSubOption}`}
                                    onOptionClick={() => handleSubOptionChange(subOption, subSubOption)}
                                    onMenuClick={() => handleToggleContextMenu(component, subOption, subSubOption)}
                                    className="group/subsubOption"
                                />

                                {(menuVisible === `${component}>$>${subOption}>$>${subSubOption}`) && (
                                    <div className={cn("absolute -right-[112px] border border-gray-300 rounded-lg mt-1 bg-white z-30 min-w-max", { [`-top-[${scrollPosition}px]`]: true })}>
                                        <EditMenu setDialogType={setDialogType} componentOption={menuVisible} />
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
