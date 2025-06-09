import { memo } from 'react';
import { LucideEllipsisVertical, LucideLock } from 'lucide-react';
import { getComponentLockStatus } from '../../utils/ComponentTracker';
import { IComponent, INormalComponent } from '@/types/project.types';
import { IDesignSnapshot } from '@/types/design.types';
import { useModel } from '@/contexts/ModelContext';

interface ComponentOptionProps {
    component: string;
    componentPath: string; // New: full path for nested components
    value: IComponent | INormalComponent;
    openDropdown: string | null;
    toggleDropdown: (component: string) => void;
    handleToggle: (component: string) => void;
    handleToggleContextMenu: (component: string) => void;
    menuVisible: string | boolean;
    designSnapshot?: IDesignSnapshot; // New: for design mode
}

const ComponentOption = memo(({
    component,
    componentPath,
    value,
    openDropdown,
    toggleDropdown,
    handleToggle,
    handleToggleContextMenu,
    menuVisible,
    designSnapshot,
}: ComponentOptionProps) => {
    const { modelType } = useModel();
    const isDesignMode = modelType == 'design';

    const isBase = component === "base";
    const isBoolean = typeof (value as INormalComponent).value === 'boolean';
    const isChecked = isBoolean ? (value as INormalComponent).value : (value as IComponent)?.selected !== 'none';

    // Get lock status for this component
    const lockStatus = designSnapshot ?
        getComponentLockStatus(componentPath, value as (IComponent | INormalComponent), designSnapshot) :
        { isLocked: false, canEdit: true, canDelete: true, canRename: true, reason: '', lockedOptions: [] };

    const isLocked = isDesignMode && lockStatus.isLocked;
    const showLockIcon = isLocked && !lockStatus.canEdit;

    return (
        <div
            className={`group flex items-center justify-between pl-2 pr-1 gap-1 select-none border border-gray-400/25 rounded-lg cursor-pointer ${isBase ? "cursor-auto !border-dark/50 opacity-40" :
                showLockIcon ? "border-orange-300 bg-orange-50" :
                    ""
                } ${!showLockIcon && !isBase ? 'bg-white' : ''}`}
            title={isLocked ? lockStatus.reason : ''}
        >
            <label className={`flex items-center gap-2 cursor-pointer`}>
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                        // if (isBase || showLockIcon) return;
                        if (isBase) return;
                        if (isBoolean) {
                            handleToggle(component);
                        } else {
                            if (menuVisible) handleToggleContextMenu(component);
                            toggleDropdown(component);
                        }
                    }}
                    hidden
                // disabled={showLockIcon}
                />
                <div className='flex items-center gap-2'>
                    <span className={`h-5 w-5 flex items-center justify-center rounded-full ${openDropdown === component ? "border border-dark" : ""
                        } ${isChecked ? "bg-green-300/60" : "bg-design/30"} ${(showLockIcon && isChecked) ? "bg-orange-200" : ""
                        }`}>
                        {showLockIcon ? (
                            <LucideLock className="size-[10px] text-orange-600" />
                        ) : (
                            <>
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
                            </>
                        )}
                    </span>
                    <span className={`py-0 flex items-center gap-1 text-dark text-xs cursor-pointer capitalize font-[430] ${showLockIcon ? 'text-orange-700' : ''
                        }`}>
                        {isLocked && lockStatus.lockedOptions.length > 0 && (
                            <span className="ml-1 text-[10px] text-orange-600">
                                <LucideLock className="size-[11px] text-dark-600" />
                            </span>
                        )}
                        {component}
                    </span>
                </div>
            </label>

            <span
                onClick={() => {
                    // if (!lockStatus.canEdit && !lockStatus.canRename && !lockStatus.canDelete) return;
                    handleToggleContextMenu(component);
                }}
                className={`hover:bg-dark/5 p-1 rounded-full`}
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