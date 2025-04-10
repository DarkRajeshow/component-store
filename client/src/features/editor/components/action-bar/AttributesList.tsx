import { memo, useMemo } from 'react';
import AttributeOption from './AttributeOption';
import RenderOptions from './RenderOptions';
import EditMenu from './EditMenu';
import { IAttributeOption } from '@/types/request.types';

interface DesignAttribute {
    options?: Record<string, IAttributeOption>; // You might want to define a more specific type for options
    value?: boolean | undefined;     // Define specific type based on your needs
}

interface components {
    [key: string]: DesignAttribute;
}

interface AttributesListProps {
    components: components | null;
    openDropdown: string;
    menuVisible: string | boolean;
    handleToggle: (key: string) => void;
    toggleDropdown: (attribute: string) => void;
    handleToggleContextMenu: (attribute: string, subOption?: string, subSubOption?: string) => void;
    pushToUndoStack: () => void;
    setDialogType: (type: string) => void;
}

const AttributesList = memo(({
    components,
    openDropdown,
    menuVisible,
    handleToggle,
    toggleDropdown,
    handleToggleContextMenu,
    pushToUndoStack,
    setDialogType
}: AttributesListProps) => {
    const sortedAttributes = useMemo(() => {
        if (!components) return [];

        return Object.entries(components)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([attribute, value]) => ({
                attribute,
                value
            }));
    }, [components]);

    if (!components || sortedAttributes.length === 0) {
        return <div className="flex items-center justify-center p-4">No attributes found</div>;
    }

    return (
        <>
            {sortedAttributes.map(({ attribute, value }) => (
                <div
                    className="relative text-xs"
                    key={attribute}
                    onMouseEnter={() => {
                        if (attribute === 'base' || menuVisible) return;
                        toggleDropdown(attribute);
                    }}
                >
                    <AttributeOption
                        attribute={attribute}
                        value={value}
                        openDropdown={openDropdown}
                        toggleDropdown={toggleDropdown}
                        handleToggle={handleToggle}
                        handleToggleContextMenu={handleToggleContextMenu}
                        menuVisible={menuVisible}
                    />

                    {openDropdown === attribute && value.options && (
                        <div
                            onMouseLeave={() => handleToggleContextMenu('')}
                            className="absolute border border-gray-300 rounded-lg mt-1 bg-white z-30 min-w-max py-2"
                        >
                            <RenderOptions
                                setDialogType={setDialogType}
                                menuVisible={menuVisible}
                                pushToUndoStack={pushToUndoStack}
                                handleToggleContextMenu={handleToggleContextMenu}
                                attribute={attribute}
                                options={value.options}
                            />
                        </div>
                    )}

                    {menuVisible === attribute && (
                        <div className="absolute -right-[40px] border border-gray-300 rounded-lg mt-1 bg-white z-30 min-w-max">
                            <EditMenu
                                setDialogType={setDialogType}
                                attributeOption={menuVisible}
                            />
                        </div>
                    )}
                </div>
            ))}
        </>
    );
});

AttributesList.displayName = 'AttributesList';

export default AttributesList;