import { useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types'
import { LucideEllipsisVertical } from "lucide-react";
import ContextMenuOptions from "../edit-menu/EditMenu";
import useStore from "../../../../store/useStore";


const RenderOptions = ({ pushToUndoStack, attribute, options, handleToggleContextMenu, setDialogType, menuVisible }) => {
    const { designAttributes, updateSelectedSubOption, updateSelectedOption } = useStore();
    const [openSubSubOptions, setOpenSubSubOptions] = useState([]);
    const [scrollPosition, setScrollPosition] = useState(0);
    const divRef = useRef(null);

    const handleOptionChange = (option) => {
        pushToUndoStack(); // Push the current state before the change

        //store function
        updateSelectedOption(attribute, option)
        // setDesignAttributes((prevModel) => ({
        //     ...prevModel,
        //     [attribute]: {
        //         ...prevModel[attribute],
        //         selectedOption: option,
        //     },
        // }));

    };

    const handleSubOptionChange = (option, subOption) => {
        pushToUndoStack(); // Push the current state before the change
        
        //store function
        updateSelectedSubOption(attribute, option, subOption)
        // setDesignAttributes((prevModel) => ({
        //     ...prevModel,
        //     [attribute]: {
        //         options: {
        //             ...prevModel[attribute].options,
        //             [option]: {
        //                 ...prevModel[attribute].options[option],
        //                 selectedOption: subOption,
        //             },
        //         },
        //         selectedOption: option, // Ensure the parent option is also selected
        //     },
        // }));
    };


    const handleToggleSubOptions = (subOption, subValue) => {
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

        // Cleanup event listener on component unmount
        return () => {
            if (divElement) {
                divElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return <div className="overflow-y-scroll max-h-[50vh] pl-2">
        {Object.entries(options).map(([subOption, subValue]) => (
            <div key={subOption} className="">
                <div className={`group flex items-center justify-between px-2 gap-1 select-none rounded-full cursor-pointer ${(menuVisible === `${attribute}>$>${subOption}` && 'bg-blue-50/80')}`}>
                    <label className="group rounded-lg select-none">
                        <input
                            type="radio"
                            checked={designAttributes[attribute].selectedOption === subOption}
                            onChange={() => handleOptionChange(subOption)}
                            hidden
                        />
                        <div className="flex px-2 items-center cursor-pointer gap-2.5 w-full" onClick={() => {
                            handleToggleSubOptions(subOption, subValue);
                        }}>
                            <span className={`h-5 w-5 flex items-center justify-center cursor-pointer rounded-full ${designAttributes[attribute].selectedOption === subOption ? "bg-green-300/60" : "bg-design/30"}`}>
                                {(subValue.selectedOption) && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-[12px] text-dark ${openSubSubOptions.includes(subOption) ? "rotate-180" : "rotate-0"}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>}
                                {(designAttributes[attribute].selectedOption === subOption && !subValue.selectedOption) && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-[12px] text-dark">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>}
                            </span>
                            <span className="py-0 text-dark text-xs cursor-pointer capitalize font-[430]">{subOption}</span>
                        </div>
                    </label>


                    {subOption !== "none" && <span onClick={() => {
                        if (subOption === "none") {
                            return;
                        }
                        handleToggleContextMenu(attribute, subOption)
                    }} className='hover:bg-dark/5 p-1 rounded-full'>
                        <LucideEllipsisVertical strokeWidth={1.5} className={`opacity-0 h-4 w-4 flex items-center justify-center group-hover:opacity-100`} />
                    </span>}

                    {(menuVisible === `${attribute}>$>${subOption}`) && (
                        <div
                            className="absolute -right-[112px] border border-gray-300 rounded-lg mt-1 bg-white z-30 min-w-max">
                            <ContextMenuOptions setDialogType={setDialogType} attributeOption={menuVisible} />
                        </div>
                    )}
                </div>
                {
                    subValue.selectedOption && subValue.options && (
                        <div className={`duration-1000 transition-transform group ml-6 pl-3 border-l border-gray-400/25 ${(openSubSubOptions.includes(subOption)) ? "h-full" : "h-0 overflow-hidden"}`}>
                            {Object.entries(subValue.options).map(([subSubOption]) => (
                                <div className={`group/subsubOption flex items-center justify-between pl-2 pr-1 gap-1 select-none rounded-full cursor-pointer ${(menuVisible === `${attribute}>$>${subOption}>$>${subSubOption}` && 'bg-blue-50/80')}`} key={subSubOption}>
                                    <label className="group flex px-2 items-center cursor-pointer gap-2.5 rounded-lg select-none">
                                        <input
                                            type="radio"
                                            checked={subValue.selectedOption === subSubOption}
                                            onClick={() => handleSubOptionChange(subOption, subSubOption)}
                                            readOnly
                                            hidden
                                        />
                                        <span className={`h-5 w-5 flex items-center justify-center cursor-pointer rounded-full ${(subValue.selectedOption === subSubOption && designAttributes[attribute].selectedOption === subOption) ? "bg-green-300/60" : "bg-design/30"}`}>
                                            {subValue.selectedOption === subSubOption &&
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-[12px] text-dark">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                </svg>}
                                        </span>
                                        <span className="py-0 text-dark text-xs cursor-pointer capitalize font-[430]">{subSubOption}</span>
                                    </label>

                                    <span onClick={() => {
                                        handleToggleContextMenu(attribute, subOption, subSubOption)
                                    }} className='hover:bg-dark/5 p-1 rounded-full'>
                                        <LucideEllipsisVertical strokeWidth={1.5} className='opacity-0 group-hover/subsubOption:opacity-100 h-4 w-4 flex items-center justify-center' />
                                    </span>

                                    {(menuVisible === `${attribute}>$>${subOption}>$>${subSubOption}`) && (
                                        <div
                                            className={`absolute -right-[112px] -top-[${scrollPosition}px] border border-gray-300 rounded-lg mt-1 bg-white z-30 min-w-max`}>
                                            <ContextMenuOptions setDialogType={setDialogType} attributeOption={menuVisible} />
                                        </div>
                                    )}
                                </div>
                            ))}

                        </div>
                    )
                }
            </div >
        ))}
    </div>;
};

RenderOptions.propTypes = {
    pushToUndoStack: PropTypes.func.isRequired,
    attribute: PropTypes.string.isRequired,
    menuVisible: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool
    ]).isRequired,
    handleToggleContextMenu: PropTypes.func.isRequired,
    setDialogType: PropTypes.func.isRequired,
    options: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object
    ]).isRequired,
};

export default RenderOptions;
