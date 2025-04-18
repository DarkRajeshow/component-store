import { memo, useMemo } from 'react';
import ComponentOption from './ComponentOption';
import RenderOptions from './RenderOptions';
import EditMenu from './EditMenu';
import { IComponentOptions } from '@/types/project.types';

interface DesignComponent {
    options?: IComponentOptions; // You might want to define a more specific type for options
    value?: boolean | undefined;     // Define specific type based on your needs
}

interface components {
    [key: string]: DesignComponent;
}

interface ComponentsListProps {
    components: components | null;
    openDropdown: string;
    menuVisible: string | boolean;
    handleToggle: (key: string) => void;
    toggleDropdown: (component: string) => void;
    handleToggleContextMenu: (component: string, subOption?: string, subSubOption?: string) => void;
    pushToUndoStack: () => void;
    setDialogType: (type: string) => void;
}

const ComponentsList = memo(({
    components,
    openDropdown,
    menuVisible,
    handleToggle,
    toggleDropdown,
    handleToggleContextMenu,
    pushToUndoStack,
    setDialogType
}: ComponentsListProps) => {
    const sortedComponents = useMemo(() => {
        if (!components) return [];

        return Object.entries(components)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([component, value]) => ({
                component,
                value
            }));
    }, [components]);
    
    if (!components || sortedComponents.length === 0) {
        return <div className="flex items-center justify-center p-4">No components found</div>;
    }

    return (
        <>
            {sortedComponents.map(({ component, value }) => (
                <div
                    className="relative text-xs"
                    key={component}
                    // onClick={() => {
                    //     if (component === 'base' || menuVisible) return;
                    //     toggleDropdown(component);
                    // }}
                >
                    <ComponentOption
                        component={component}
                        value={value}
                        openDropdown={openDropdown}
                        toggleDropdown={toggleDropdown}
                        handleToggle={handleToggle}
                        handleToggleContextMenu={handleToggleContextMenu}
                        menuVisible={menuVisible}
                    />

                    {openDropdown === component && value.options && (
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
                                options={value.options}
                            />
                        </div>
                    )}

                    {menuVisible === component && (
                        <div className="absolute -right-[40px] border border-gray-300 rounded-lg mt-1 bg-white z-30 min-w-max">
                            <EditMenu
                                setDialogType={setDialogType}
                                componentOption={menuVisible}
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