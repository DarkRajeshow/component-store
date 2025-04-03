import { LucideEllipsisVertical } from "lucide-react";

interface OptionItemProps {
    option: string;
    isSelected: boolean;
    showDropdownIcon?: boolean;
    isOpen?: boolean;
    isNone?: boolean;
    menuVisible: string | boolean;
    menuPath: string;
    onOptionClick: () => void;
    onMenuClick: () => void;
    className?: string;
}

const OptionItem = ({
    option,
    isSelected,
    showDropdownIcon,
    isOpen,
    isNone,
    menuVisible,
    menuPath,
    onOptionClick,
    onMenuClick,
    className = ""
}: OptionItemProps) => {
    return (
        <div className={`group flex items-center justify-between px-2 gap-1 select-none rounded-full ${menuVisible === menuPath ? 'bg-blue-50/80' : ''} ${className}`}>
            <label className="group rounded-lg select-none">
                <input
                    type="radio"
                    checked={isSelected}
                    onChange={onOptionClick}
                    hidden
                />
                <div className="flex px-2 items-center cursor-pointer gap-2.5 w-full" onClick={onOptionClick}>
                    <span className={`h-5 w-5 flex items-center justify-center cursor-pointer rounded-full ${isSelected ? "bg-green-300/60" : "bg-design/30"}`}>
                        {showDropdownIcon && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-[12px] text-dark ${isOpen ? "rotate-180" : "rotate-0"}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>}
                        {(isSelected && !showDropdownIcon) && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-[12px] text-dark">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>}
                    </span>
                    <span className="py-0 text-dark text-xs cursor-pointer capitalize font-[430]">{option}</span>
                </div>
            </label>

            {!isNone && <span onClick={onMenuClick} className='hover:bg-dark/5 p-1 rounded-full'>
                <LucideEllipsisVertical strokeWidth={1.5} className={`opacity-0 h-4 w-4 flex items-center justify-center group-hover:opacity-100`} />
            </span>}
        </div>
    );
};

export default OptionItem;