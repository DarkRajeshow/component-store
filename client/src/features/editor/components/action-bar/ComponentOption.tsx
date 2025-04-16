import { memo } from 'react';
import { LucideEllipsisVertical } from 'lucide-react';

interface ComponentValue {
    value?: boolean;
    selected?: string;
}

interface ComponentOptionProps {
    component: string;
    value: ComponentValue;
    openDropdown: string | null;
    toggleDropdown: (component: string) => void;
    handleToggle: (component: string) => void;
    handleToggleContextMenu: (component: string) => void;
    menuVisible: string | boolean;
}

// Single component option component
const ComponentOption = memo(({ 
    component, 
    value, 
    openDropdown, 
    toggleDropdown, 
    handleToggle, 
    handleToggleContextMenu,
    menuVisible
}: ComponentOptionProps) => {
    const isBase = component === "base";
    const isBoolean = typeof value.value === 'boolean';
    const isChecked = isBoolean ? value.value : value?.selected !== 'none';
    
    return (
        <div 
            className={`group flex items-center justify-between pl-2 pr-1 gap-1 select-none border border-gray-400/25 rounded-lg ${
                isBase ? "cursor-auto !border-dark/50 opacity-40" : "cursor-pointer"
            } bg-white`}
        >
            <label className='flex items-center gap-2 cursor-pointer'>
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                        if (isBase) return;
                        if (isBoolean) {
                            handleToggle(component);
                        } else {
                            if (menuVisible) handleToggleContextMenu(component);
                            toggleDropdown(component);
                        }
                    }}
                    hidden
                />
                <div className='flex items-center gap-2'>
                    <span className={`h-5 w-5 flex items-center justify-center rounded-full ${
                        openDropdown === component ? "border border-dark" : ""
                    } ${isChecked ? "bg-green-300/60" : "bg-design/30"}`}>
                        {isBoolean && isChecked && (
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth={1.5} 
                                stroke="currentColor" 
                                className="size-[12px] text-dark"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        )}

                        {!isBoolean && (
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth={1.5} 
                                stroke="currentColor" 
                                className={`size-[12px] text-dark ${openDropdown === component ? "rotate-180" : "rotate-0"}`}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        )}
                    </span>
                    <span className="py-0 text-dark text-xs cursor-pointer capitalize font-[430]">
                        {component}
                    </span>
                </div>
            </label>

            <span 
                onClick={() => handleToggleContextMenu(component)} 
                className='hover:bg-dark/5 p-1 rounded-full'
            >
                <LucideEllipsisVertical 
                    strokeWidth={1.5} 
                    className='opacity-0 group-hover:opacity-100 h-4 w-4 flex items-center justify-center' 
                />
            </span>
        </div>
    );
});

ComponentOption.displayName = 'ComponentOption';

export default ComponentOption;