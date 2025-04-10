import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import useAppStore from '../../../../store/useAppStore';
import { shiftToSelectedCategoryAPI } from '../../lib/designAPI';

export const ATTRIBUTE_TYPES = [
    { value: "normal", Description: "A standard attribute with no nested options." },
    { value: "nestedChildLevel1", Description: "Nested inside a parent attribute (Level 1)." },
    { value: "nestedChildLevel2", Description: "Nested inside a Level 1 nested attribute (Level 2)." },
    { value: "nestedParentLevel0", Description: "A parent attribute with nested options (Level 1)." },
    { value: "nestedParentLevel1", Description: "A Level 1 nested attribute with further nested options (Level 2)." }
];

export function useActionBar() {
    const { id } = useParams();
    const {
        loading,
        components,
        uniqueFileName,
        setUniqueFileName,
        design,
        fetchProject,
        selectedCategory,
        toggleComponentValue,
        pushToUndoStack,
        handleUndo,
        handleRedo
    } = useAppStore();

    const [openDropdown, setOpenDropdown] = useState("");
    const [attributeFileName, setAttributeFileName] = useState('');
    const [dialogType, setDialogType] = useState("");
    const [levelOneNest, setLevelOneNest] = useState("");
    const [levelTwoNest, setLevelTwoNest] = useState("");
    const [oldAttributeFileName, setOldAttributeFileName] = useState('');
    const [menuVisible, setMenuVisible] = useState("");
    const [attributeType, setAttributeType] = useState("normal");
    const [infoOpen, setInfoOpen] = useState(false);
    const [tempSelectedCategory, setTempSelectedCategory] = useState(selectedCategory);
    const [tempcomponents, setTempcomponents] = useState(components);

    const contextMenuRef = useRef<HTMLDivElement>(null);
    const infoContext = useRef<HTMLDivElement>(null);

    // Set up keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            }
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    // Update tempcomponents when components change
    useEffect(() => {
        setTempcomponents(components);
    }, [attributeType, components]);

    // Update tempSelectedCategory when selectedCategory changes
    useEffect(() => {
        setTempSelectedCategory(selectedCategory);
    }, [selectedCategory]);

    // Reset nesting levels when attribute type changes
    useEffect(() => {
        setLevelOneNest("");
        setLevelTwoNest("");
    }, [attributeType]);

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (infoContext.current && !infoContext.current.contains(event.target as Node)) {
                setInfoOpen(false);
            }
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                setMenuVisible("");
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = useCallback((key: string) => {
        pushToUndoStack(); // Push the current state before the change
        toggleComponentValue(key);
    }, [pushToUndoStack, toggleComponentValue]);

    const toggleDropdown = useCallback((attribute: string) => {
        setOpenDropdown(prevDropdown => prevDropdown === attribute ? "" : attribute);
    }, []);

    const handleToggleContextMenu = useCallback((attribute: string, subOption?: string, subSubOption?: string) => {
        let toggleOption;

        if (subSubOption && subOption && attribute) {
            toggleOption = `${attribute}>$>${subOption}>$>${subSubOption}`;
        } else if (subOption && attribute) {
            toggleOption = `${attribute}>$>${subOption}`;
        } else if (attribute) {
            toggleOption = attribute;
        } else {
            return;
        }

        setMenuVisible(prevMenuVisible => prevMenuVisible === toggleOption ? "" : toggleOption);

        if (!subOption && !subSubOption) {
            setOpenDropdown("");
        }
    }, []);

    const handleAttributeFileNameChange = useCallback(() => {
        const newInput = attributeFileName;
        const updatedcomponents = JSON.parse(JSON.stringify(components));

        switch (attributeType) {
            case 'normal':
                updatedcomponents[newInput] = { value: true, path: uniqueFileName };
                break;
            case 'nestedChildLevel1':
                if (levelOneNest) {
                    updatedcomponents[levelOneNest] = {
                        ...updatedcomponents[levelOneNest],
                        options: {
                            ...updatedcomponents[levelOneNest]?.options,
                            [newInput]: { path: uniqueFileName }
                        }
                    };
                }
                break;
            case 'nestedChildLevel2':
                if (levelOneNest && levelTwoNest) {
                    const parentOptions = updatedcomponents[levelOneNest]?.options || {};
                    const nestedLevelOneOption = parentOptions[levelTwoNest];
                    const nestedLevelTwoOptions = nestedLevelOneOption?.options || {};

                    if (nestedLevelTwoOptions[oldAttributeFileName]) {
                        delete nestedLevelTwoOptions[oldAttributeFileName];
                    }

                    nestedLevelTwoOptions[newInput] = { path: uniqueFileName };

                    updatedcomponents[levelOneNest] = {
                        ...updatedcomponents[levelOneNest],
                        options: {
                            ...parentOptions,
                            [levelTwoNest]: {
                                selected: newInput,
                                options: nestedLevelTwoOptions
                            }
                        },
                    };
                }
                break;
            case 'nestedParentLevel0':
                updatedcomponents[newInput] = {
                    selected: "none",
                    options: {
                        none: {
                            path: "none"
                        }
                    },
                };
                break;
            case 'nestedParentLevel1':
                if (levelOneNest) {
                    const newNestedOptions = updatedcomponents[levelOneNest]?.options || {};

                    if (newNestedOptions[oldAttributeFileName]) {
                        delete newNestedOptions[oldAttributeFileName];
                    }

                    newNestedOptions[newInput] = {
                        selected: " ",
                        options: {},
                    };

                    updatedcomponents[levelOneNest] = {
                        selected: updatedcomponents[levelOneNest]?.selected,
                        options: newNestedOptions,
                    };
                }
                break;
        }

        setTempcomponents(updatedcomponents);
    }, [attributeFileName, attributeType, levelOneNest, levelTwoNest, components, oldAttributeFileName, uniqueFileName]);

    // Update attributes when any dependencies change
    useEffect(() => {
        handleAttributeFileNameChange();
    }, [handleAttributeFileNameChange]);

    const shiftCategory = async () => {
        try {
            const { data } = await shiftToSelectedCategoryAPI(id, {
                selectedCategory: tempSelectedCategory,
            });

            if (data.success) {
                toast.success(data.status);
                fetchProject(id as string);
            } else {
                toast.error(data.status);
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong, please try again.');
        }
    };

    return {
        // State
        loading,
        components,
        design,
        openDropdown,
        attributeFileName,
        dialogType,
        levelOneNest,
        levelTwoNest,
        oldAttributeFileName,
        menuVisible,
        attributeType,
        infoOpen,
        tempSelectedCategory,
        tempcomponents,
        contextMenuRef,
        infoContext,

        // Actions
        setOpenDropdown,
        setAttributeFileName,
        setDialogType,
        setLevelOneNest,
        setLevelTwoNest,
        setOldAttributeFileName,
        setMenuVisible,
        setAttributeType,
        setInfoOpen,
        setTempSelectedCategory,
        setUniqueFileName,

        // Functions
        handleToggle,
        toggleDropdown,
        handleToggleContextMenu,
        shiftCategory,
        pushToUndoStack
    };
}