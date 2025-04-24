import { useCallback, useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import useAppStore from '../../../../store/useAppStore';
import { useModel } from '@/contexts/ModelContext';
import { IComponent, IComponents, INestedParentLevel1 } from '@/types/project.types';

export const ATTRIBUTE_TYPES = [
    { value: "normal", Description: "A standard component with no nested options." },
    { value: "nestedChildLevel1", Description: "Nested inside a parent component (Level 1)." },
    { value: "nestedChildLevel2", Description: "Nested inside a Level 1 nested component (Level 2)." },
    { value: "nestedParentLevel0", Description: "A parent component with nested options (Level 1)." },
    { value: "nestedParentLevel1", Description: "A Level 1 nested component with further nested options (Level 2)." }
];

export function useActionBar() {
    const {
        loading,
        structure,
        components,
        uniqueFileName,
        selectedCategory,

        setUniqueFileName,
        toggleComponentValue,
        setComponentSelections,
        //for undo redo 
        pushToUndoStack,
        handleUndo,
        handleRedo
    } = useAppStore();


    const {
        modelType,
        refreshContent,
        shiftCategory
    } = useModel()

    const [openDropdown, setOpenDropdown] = useState("");
    const [componentFileName, setComponentFileName] = useState('');
    const [dialogType, setDialogType] = useState("");
    const [levelOneNest, setLevelOneNest] = useState("");
    const [levelTwoNest, setLevelTwoNest] = useState("");
    const [oldComponentFileName, setOldComponentFileName] = useState('');
    const [menuVisible, setMenuVisible] = useState("");
    const [componentType, setComponentType] = useState("normal");
    const [infoOpen, setInfoOpen] = useState(false);
    const [tempSelectedCategory, setTempSelectedCategory] = useState(selectedCategory);
    const [tempComponents, setTempComponents] = useState(structure.components);

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

    // Update tempComponents when components change
    useEffect(() => {
        setTempComponents(structure.components);
    }, [componentType, structure.components]);

    // Update tempSelectedCategory when selectedCategory changes
    useEffect(() => {
        setTempSelectedCategory(selectedCategory);
    }, [selectedCategory]);

    // Reset nesting levels when component type changes
    useEffect(() => {
        setLevelOneNest("");
        setLevelTwoNest("");
    }, [componentType]);

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (infoContext.current && !infoContext.current.contains(event.target as Node)) {
                setInfoOpen(false);
            }
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                setMenuVisible("");
                setOpenDropdown("");
            }
            // if (actionBarRef.current && !actionBarRef.current.contains(event.target as Node)) {
            //     setOpenDropdown("");
            // }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = useCallback((key: string) => {
        pushToUndoStack(); // Push the current state before the change

        toggleComponentValue(key);

    }, [pushToUndoStack, toggleComponentValue]);

    const toggleDropdown = useCallback((component: string) => {
        setOpenDropdown(prevDropdown => prevDropdown === component ? "" : component);
    }, []);

    const handleToggleContextMenu = useCallback((component: string, subOption?: string, subSubOption?: string) => {
        let toggleOption;

        if (subSubOption && subOption && component) {
            toggleOption = `${component}>$>${subOption}>$>${subSubOption}`;
        } else if (subOption && component) {
            toggleOption = `${component}>$>${subOption}`;
        } else if (component) {
            toggleOption = component;
        } else {
            return;
        }

        setMenuVisible(prevMenuVisible => prevMenuVisible === toggleOption ? "" : toggleOption);

        if (!subOption && !subSubOption) {
            setOpenDropdown("");
        }
    }, []);

    const handleComponentFileNameChange = useCallback((componentsToAlter: IComponents, setComponentsFunction: (updatedComponent: IComponents) => void) => {
        const newInput = componentFileName;
        // const updatedcomponents: IComponents = components ? JSON.parse(JSON.stringify(components)) : {};
        const updatedcomponents: IComponents = componentsToAlter ? JSON.parse(JSON.stringify(componentsToAlter)) : {};

        switch (componentType) {
            case 'normal':
                updatedcomponents[newInput] = { value: false, fileId: uniqueFileName };
                break;
            case 'nestedChildLevel1':
                if (levelOneNest) {
                    updatedcomponents[levelOneNest] = {
                        ...updatedcomponents[levelOneNest],
                        options: {
                            ...(updatedcomponents[levelOneNest] as INestedParentLevel1)?.options,
                            [newInput]: { fileId: uniqueFileName }
                        }
                    };
                }
                break;
            case 'nestedChildLevel2':
                if (levelOneNest && levelTwoNest) {
                    const parentOptions = (updatedcomponents[levelOneNest] as IComponent)?.options || {};
                    const nestedLevelOneOption = parentOptions[levelTwoNest];
                    const nestedLevelTwoOptions = (nestedLevelOneOption as INestedParentLevel1)?.options || {};

                    if (nestedLevelTwoOptions[oldComponentFileName]) {
                        delete nestedLevelTwoOptions[oldComponentFileName];
                    }

                    nestedLevelTwoOptions[newInput] = { fileId: uniqueFileName };

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
                            fileId: "none"
                        }
                    },
                };
                break;
            case 'nestedParentLevel1':
                if (levelOneNest) {
                    const newNestedOptions = (updatedcomponents[levelOneNest] as IComponent)?.options || {};

                    if (newNestedOptions[oldComponentFileName]) {
                        delete newNestedOptions[oldComponentFileName];
                    }

                    newNestedOptions[newInput] = {
                        selected: " ",
                        options: {},
                    };

                    updatedcomponents[levelOneNest] = {
                        selected: (updatedcomponents[levelOneNest] as IComponent)?.selected,
                        options: newNestedOptions,
                    };
                }
                break;
        }

        setComponentsFunction(updatedcomponents);
    }, [componentFileName, componentType, levelOneNest, levelTwoNest, oldComponentFileName, uniqueFileName]);

    // Update components when any dependencies change
    useEffect(() => {
        handleComponentFileNameChange(structure.components, setComponentSelections);
    }, [handleComponentFileNameChange, setComponentSelections, structure.components]);

    useEffect(() => {
        handleComponentFileNameChange(components, setTempComponents);
    }, [handleComponentFileNameChange, setTempComponents, components]);

    const shiftToSelectedCategory = async () => {
        try {
            if (!shiftCategory) {
                toast.error("ShiftCategory Function is missing");
                return;
            }
            const data = await shiftCategory({
                selectedCategory: tempSelectedCategory,
            });

            if (data && data.success) {
                toast.success(data.status);
                refreshContent();
            } else {
                toast.error(data ? data.status : "Error while shifting category.");
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong, please try again.');
        }
    };

    return {
        // State
        loading,
        components: structure.components,
        openDropdown,
        componentFileName,
        dialogType,
        levelOneNest,
        levelTwoNest,
        oldComponentFileName,
        menuVisible,
        componentType,
        infoOpen,
        tempSelectedCategory,
        tempComponents,
        contextMenuRef,
        infoContext,
        modelType,
        // Actions
        setOpenDropdown,
        setComponentFileName,
        setDialogType,
        setLevelOneNest,
        setLevelTwoNest,
        setOldComponentFileName,
        setMenuVisible,
        setComponentType,
        setInfoOpen,
        setTempSelectedCategory,
        setUniqueFileName,

        // Functions
        handleToggle,
        toggleDropdown,
        handleToggleContextMenu,
        shiftToSelectedCategory,
        pushToUndoStack
    };
}