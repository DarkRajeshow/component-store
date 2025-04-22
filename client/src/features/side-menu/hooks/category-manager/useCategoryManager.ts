// hooks/category-manager/useCategoryManager.ts
import { useState, useCallback, useEffect } from "react";
import useAppStore from "@/store/useAppStore";
import { useModel } from "@/contexts/ModelContext";
import {
    IProject,
    IHierarchy,
    IAddCategoryRequest,
    IRenameCategoryRequest,
    IShiftCategoryRequest,
} from "@/types/project.types";
import { toast } from "sonner";
import { checkFileExists } from "@/utils/checkFileExists";

interface IuseCategoryManagerProps {
    setSideMenuType: (updatedMenuType: "" | "pageManager" | "categoryManager") => void;
    setIsPopUpOpen: (value: boolean) => void;
}

export function useCategoryManager(props: IuseCategoryManagerProps) {
    const { setSideMenuType, setIsPopUpOpen } = props;
    const { content, setContent, selectedCategory, setSelectedCategory } = useAppStore();
    const { renameCategory, addCategory, deleteCategory, shiftCategory, baseFolderPath, refreshContent } = useModel();

    // States
    const [tempHierarchy, setTempHierarchy] = useState<IHierarchy>((content as IProject)?.hierarchy || { categoryMapping: {}, categories: {} });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [newCategoryName, setNewCategoryName] = useState<string>("");
    const [categoryToRename, setCategoryToRename] = useState<{ id: string, code: string, name: string } | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<{ id: string, code: string } | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<boolean>(false);
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState<boolean>(false);
    const [isRenameCategoryModalOpen, setIsRenameCategoryModalOpen] = useState<boolean>(false);
    const [tempSelectedCategory, setTempSelectedCategory] = useState(selectedCategory)


    // Derived state
    const project = content as IProject;
    const categoryList = tempHierarchy?.categoryMapping ?
        Object.entries(tempHierarchy.categoryMapping).map(([code, id]) => ({
            code,
            id,
            name: code, // Default to code as name
            pages: Object.keys(tempHierarchy.categories[id]?.pages || {}).length || 0,
            hasBaseDrawing: !!tempHierarchy.categories[id]?.baseDrawing?.fileId
        })) : [];

    // Initialize selected category ID on mount
    useEffect(() => {
        if (tempSelectedCategory && tempHierarchy?.categoryMapping) {
            const categoryId = tempHierarchy.categoryMapping[tempSelectedCategory];
            setSelectedCategoryId(categoryId || "");
        }
    }, [tempSelectedCategory, tempHierarchy]);

    // Update tempHierarchy when content changes
    useEffect(() => {
        if ((content as IProject)?.hierarchy) {
            setTempHierarchy((content as IProject).hierarchy);
        }
    }, [content]);

    // Close dialog helper
    const toggleDialog = useCallback(() => {
        document.getElementById("closeButtonSideMenu")?.click();
        setSideMenuType("");
        setIsPopUpOpen(false);
    }, [setSideMenuType, setIsPopUpOpen]);

    // Handle category selection
    const handleSelectCategory = useCallback((categoryId: string, categoryCode: string) => {
        setSelectedCategoryId(categoryId);
        setTempSelectedCategory(categoryCode);
    }, []);

    // Add category
    const handleAddCategory = useCallback(async () => {
        if (!newCategoryName.trim()) {
            toast.error("Category name cannot be empty");
            return;
        }

        setIsLoading(true);
        try {
            const request: IAddCategoryRequest = {
                categoryName: newCategoryName.trim(),
            };

            if (!addCategory) {
                toast.error("Add category function is missing.");
                return;
            }

            const response = await addCategory(request);

            if (response && response.success && project) {
                // Update local state with new category
                const updatedProject = { ...project };
                if (response.categoryId) {
                    // Update hierarchy with the new category from API response
                    const updatedHierarchy = { ...updatedProject.hierarchy };
                    updatedHierarchy.categoryMapping = {
                        ...updatedHierarchy.categoryMapping,
                        [newCategoryName.trim()]: response.categoryId,
                    };
                    updatedHierarchy.categories = {
                        ...updatedHierarchy.categories,
                        [response.categoryId]: {
                            pages: {
                                "gad": "random"
                            },
                            baseDrawing: { fileId: " " },
                            components: {},
                        },
                    };
                    updatedProject.hierarchy = updatedHierarchy;
                    setContent(updatedProject);
                    setTempHierarchy(updatedHierarchy);
                    setTempSelectedCategory(newCategoryName.trim());
                    setSelectedCategoryId(response.categoryId);
                }

                toast.success("Category added successfully");
                setNewCategoryName("");
                setIsAddCategoryModalOpen(false);
            } else {
                toast.error(response && response.status || "Failed to add category");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }, [newCategoryName, project, setContent, addCategory]);

    // Delete category
    const handleDeleteCategory = useCallback(async () => {
        if (!categoryToDelete) return;

        setIsLoading(true);
        try {
            const categoryId = categoryToDelete.id;

            if (!deleteCategory) {
                toast.error("Delete category function not available");
                return;
            }

            const response = await deleteCategory(categoryId);

            if (response && response.success && project) {
                // Update local state by removing the deleted category
                const updatedProject = { ...project };
                const updatedHierarchy = { ...updatedProject.hierarchy };

                // Delete from categoryMapping
                const { [categoryToDelete.code]: removed, ...restCategoryMapping } = updatedHierarchy.categoryMapping;
                updatedHierarchy.categoryMapping = restCategoryMapping;

                // Delete from categories
                const { [categoryToDelete.id]: removedCategory, ...restCategories } = updatedHierarchy.categories;
                updatedHierarchy.categories = restCategories;

                updatedProject.hierarchy = updatedHierarchy;
                setContent(updatedProject);
                setTempHierarchy(updatedHierarchy);

                // If the deleted category was selected, select another category or clear selection
                if (tempSelectedCategory === categoryToDelete.code) {
                    const firstCategory = Object.keys(updatedHierarchy.categoryMapping)[0];
                    setTempSelectedCategory(firstCategory || "");
                    setSelectedCategoryId(firstCategory ? updatedHierarchy.categoryMapping[firstCategory] : "");
                }

                // If the renamed category was selected, update the selection
                if (selectedCategory === categoryToDelete.code) {
                    const firstCategory = Object.keys(updatedHierarchy.categoryMapping)[0];
                    setSelectedCategory(firstCategory || "");
                }

                toast.success("Category deleted successfully");
            } else {
                toast.error(response && response.status || "Failed to delete category");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
            setIsConfirmDeleteOpen(false);
            setCategoryToDelete(null);
        }
    }, [categoryToDelete, project, setContent, deleteCategory, setSelectedCategory, tempSelectedCategory, selectedCategory]);

    // Rename category
    const handleRenameCategory = useCallback(async () => {
        if (!categoryToRename || !newCategoryName.trim()) {
            toast.error("Category name cannot be empty")
            return;
        }

        setIsLoading(true);
        try {
            const request: IRenameCategoryRequest = {
                oldName: categoryToRename.name,
                newName: newCategoryName.trim(),
            };

            const categoryId = categoryToRename.id

            if (!renameCategory) {
                toast.error("Rename category function not available");
                return;
            }

            const response = await renameCategory(categoryId, request);

            if (response && response.success && project) {
                // Update local state with renamed category
                const updatedProject = { ...project };
                const updatedHierarchy = { ...updatedProject.hierarchy };

                // Update categoryMapping
                const { [categoryToRename.code]: oldValue, ...restCategoryMapping } = updatedHierarchy.categoryMapping;
                updatedHierarchy.categoryMapping = {
                    ...restCategoryMapping,
                    [newCategoryName.trim()]: categoryToRename.id,
                };

                updatedProject.hierarchy = updatedHierarchy;
                setContent(updatedProject);
                setTempHierarchy(updatedHierarchy);

                // If the renamed category was selected, update the selection
                if (tempSelectedCategory === categoryToRename.code) {
                    setTempSelectedCategory(newCategoryName.trim());
                }

                if (selectedCategory === categoryToRename.code) {
                    setSelectedCategory(newCategoryName.trim());
                }

                toast.success("Category renamed successfully");
                setNewCategoryName("");
            } else {
                toast.error(response && response.status || "Failed to rename category");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
            setIsRenameCategoryModalOpen(false);
            setCategoryToRename(null);
        }
    }, [categoryToRename, newCategoryName, project, setContent, renameCategory, setSelectedCategory, tempSelectedCategory, selectedCategory]);

    // Shift category (reorder)
    const handleShiftCategory = useCallback(async () => {
        if (!selectedCategoryId) return;

        setIsLoading(true);
        try {
            const request: IShiftCategoryRequest = {
                selectedCategory: tempSelectedCategory || "",
            };

            if (!shiftCategory) {
                toast.error("Shift Category function is missing.");
                return;
            }

            const response = await shiftCategory(request)
            if (response && response.success) {
                // setSelectedCategory(tempSelectedCategory);
                // const updatedProject = { ...project };
                // updatedProject.selectedCategory = tempSelectedCategory;
                // setContent(updatedProject);
                // setProjectStates(updatedProject);
                // updateContentPath(response.categoryId)

                toast.success(response.status);
                await refreshContent();
                // setBaseContentPath(`${baseFolderPath}/${response.categoryId}`)
            } else {
                toast.error(response && response.status || `Failed to shift the category.`);
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategoryId, tempSelectedCategory, shiftCategory, refreshContent]);

    // Get base drawing URL for a category
    const getCategoryBaseDrawingUrl = useCallback((categoryId: string) => {
        if (!categoryId || !tempHierarchy.categories[categoryId] || !tempHierarchy.categories[categoryId].baseDrawing.fileId) {
            return '';
        }

        const baseDrawingFileId = tempHierarchy.categories[categoryId].baseDrawing.fileId;
        if (!baseDrawingFileId || baseDrawingFileId === 'none') return '';

        return `${baseFolderPath}/${categoryId}/${baseDrawingFileId}.svg`;
    }, [tempHierarchy, baseFolderPath]);

    // Get preview URL for a page
    const getPagePreviewUrl = useCallback(async (categoryId: string, pageId: string) => {
        if (!categoryId || !pageId || !tempHierarchy.categories[categoryId]) {
            return '';
        }
        const pagePreviewUrl = `${baseFolderPath}/${categoryId}/${pageId}/${tempHierarchy.categories[categoryId].baseDrawing.fileId}.svg`
        const isFileExists = await checkFileExists(pagePreviewUrl)
        if (!isFileExists) {
            return false;
        }

        return pagePreviewUrl;
    }, [tempHierarchy, baseFolderPath]);

    // Open add category modal
    const openAddCategoryModal = useCallback(() => {
        setNewCategoryName("");
        setIsAddCategoryModalOpen(true);
    }, []);

    // Open rename category modal
    const openRenameCategoryModal = useCallback((id: string, code: string, name: string) => {
        setCategoryToRename({ id, code, name });
        console.log(name);
        setNewCategoryName(name);
        setIsRenameCategoryModalOpen(true);
    }, []);

    // Open delete confirmation modal
    const openDeleteConfirmation = useCallback((id: string, code: string) => {
        setCategoryToDelete({ id, code });
        setIsConfirmDeleteOpen(true);
    }, []);

    useEffect(() => {
        console.log(categoryToDelete);
    }, [categoryToDelete])



    return {
        // State
        tempHierarchy,
        isLoading,
        selectedCategoryId,
        categoryList,
        newCategoryName,
        isConfirmDeleteOpen,
        isAddCategoryModalOpen,
        isRenameCategoryModalOpen,
        categoryToDelete,
        categoryToRename,
        tempSelectedCategory,
        selectedCategory,

        // Setters
        setNewCategoryName,
        setIsConfirmDeleteOpen,
        setIsAddCategoryModalOpen,
        setIsRenameCategoryModalOpen,

        // Actions
        toggleDialog,
        handleSelectCategory,
        handleAddCategory,
        handleDeleteCategory,
        handleRenameCategory,
        handleShiftCategory,
        openAddCategoryModal,
        openRenameCategoryModal,
        openDeleteConfirmation,
        getCategoryBaseDrawingUrl,
        getPagePreviewUrl,
    };
}