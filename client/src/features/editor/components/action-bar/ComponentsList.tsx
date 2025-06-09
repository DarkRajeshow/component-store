// Updated ComponentsList.tsx
import { memo, useMemo } from 'react';
import ComponentOption from './ComponentOption';
import RenderOptions from './RenderOptions';
import EditMenu from './EditMenu';
import { IComponent, IComponents } from '@/types/project.types';
import { getComponentLockStatus } from '../../utils/ComponentTracker';
import { IDesignSnapshot } from '@/types/design.types';


interface ComponentsListProps {
    components: IComponents | null;
    openDropdown: string;
    menuVisible: string | boolean;
    handleToggle: (key: string) => void;
    toggleDropdown: (component: string) => void;
    handleToggleContextMenu: (component: string, subOption?: string, subSubOption?: string) => void;
    pushToUndoStack: () => void;
    setDialogType: (type: string) => void;
    // New props for design mode
    designSnapshot?: IDesignSnapshot;
    onSelectionChange?: (hasChanged: boolean) => void; // Callback when selection changes
}

const ComponentsList = memo(({
    components,
    openDropdown,
    menuVisible,
    handleToggle,
    toggleDropdown,
    handleToggleContextMenu,
    pushToUndoStack,
    setDialogType,
    designSnapshot,
    // onSelectionChange
}: ComponentsListProps) => {

    // Check if current selection has changed from original design
    // const selectionChanged = useMemo(() => {
    //     if (!isDesignMode || !designSnapshot || !components) return false;
    //     return hasSelectionChanged(components, designSnapshot);
    // }, [components, designSnapshot, isDesignMode]);

    // Notify parent component of selection changes
    // useMemo(() => {
    //     if (onSelectionChange) {
    //         onSelectionChange(selectionChanged);
    //     }
    // }, [selectionChanged, onSelectionChange]);

    const sortedComponents = useMemo(() => {
        if (!components) return [];

        return Object.entries(components)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([component, value]) => ({
                component,
                value,
                componentPath: component // For nested components, this would be more complex
            }));
    }, [components]);

    if (!components || sortedComponents.length === 0) {
        return <div className="flex items-center justify-center p-4">No components found</div>;
    }

    return (
        <>
            {/* Show selection change notification for designs */}
            {/* {isDesignMode && selectionChanged && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-blue-800">
                            Selection has changed from original design. You can export this as a new design.
                        </span>
                    </div>
                </div>
            )} */}

            {sortedComponents.map(({ component, value, componentPath }) => (
                <div
                    className="relative text-xs"
                    key={component}
                >
                    <ComponentOption
                        component={component}
                        componentPath={componentPath}
                        value={value}
                        openDropdown={openDropdown}
                        toggleDropdown={toggleDropdown}
                        handleToggle={handleToggle}
                        handleToggleContextMenu={handleToggleContextMenu}
                        menuVisible={menuVisible}
                        designSnapshot={designSnapshot}
                    />

                    {openDropdown === component && (value as IComponent).options && (
                        <div
                            onMouseLeave={() => handleToggleContextMenu('')}
                            className="absolute border border-gray-300 rounded-lg mt-1 bg-white z-30 min-w-max py-2"
                        >
                            <RenderOptions
                                setDialogType={setDialogType}
                                menuVisible={menuVisible}
                                pushToUndoStack={pushToUndoStack}
                                handleToggleContextMenu={handleToggleContextMenu}
                                component={component}
                                componentPath={componentPath}
                                options={(value as IComponent).options}
                                designSnapshot={designSnapshot}
                            />
                        </div>
                    )}

                    {menuVisible === component && (
                        <div className="absolute -right-[40px] border border-gray-300 rounded-lg mt-1 bg-white z-30 min-w-max">
                            <EditMenu
                                setDialogType={setDialogType}
                                componentOption={menuVisible}
                                lockStatus={designSnapshot ?
                                    getComponentLockStatus(componentPath, value, designSnapshot) :
                                    undefined
                                }
                            />
                        </div>
                    )}
                </div>
            ))}
        </>
    );
});

ComponentsList.displayName = 'ComponentsList';

export default ComponentsList;