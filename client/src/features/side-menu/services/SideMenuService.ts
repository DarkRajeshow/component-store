import { checkFileExists } from "@/utils/checkFileExists";
import { BaseDrawing } from "../types/sideMenuTypes";
import { v4 as uuidv4 } from 'uuid';
import { IComponents, IHierarchy, IPages } from "@/types/project.types";


// SideMenuService.ts - Service for handling API calls and business logic
export const SideMenuService = {

    // async updateBaseDrawing(
    //     id: string,
    //     formData: FormData
    // ): Promise<{ data: { success: boolean; status: string } }> {
    //     return updateBaseDrawingAPI(id, formData);
    // },

    // async shiftToSelectedCategory(
    //     id: string,
    //     data: {
    //         selectedCategory: string;
    //         structure: any;
    //         folderNames: string[];
    //     }
    // ): Promise<{ data: { success: boolean; status: string } }> {
    //     return shiftToSelectedCategoryAPI(id, data);
    // },

    async checkFileExists(path: string): Promise<boolean> {
        return checkFileExists(path);
    },

    validatePageName(pageName: string, existingPages: IPages): boolean {
        return !(pageName in existingPages);
    },

    createUniqueFileName(hierarchy: IHierarchy, tempSelectedCategory: string): string {
        let uniqueFileName = uuidv4();
        // If the base drawing is previously uploaded, use the existing path
        const categoryId = hierarchy.categoryMapping[tempSelectedCategory];
        const category = hierarchy?.categories?.[categoryId];
        
        uniqueFileName = category?.baseDrawing?.fileId || uniqueFileName;

        return uniqueFileName;
    },

    getComponentsForCategory(hierarchy: IHierarchy, tempSelectedCategory: string): IComponents {
        const categoryId = hierarchy.categoryMapping[tempSelectedCategory];
        return hierarchy.categories?.[categoryId]?.components || {};
    },

    getPagesForCategory(hierarchy: IHierarchy, tempSelectedCategory: string): IPages {
        const categoryId = hierarchy.categoryMapping[tempSelectedCategory];
        return hierarchy.categories?.[categoryId]?.pages || {};
    },

    getBaseDrawingForCategory(hierarchy: IHierarchy, tempSelectedCategory: string): BaseDrawing | undefined {
        const categoryId = hierarchy.categoryMapping[tempSelectedCategory];
        return hierarchy.categories?.[categoryId]?.baseDrawing || { fileId: " " };
    },

    calculateMissingPages(changedPages: IPages, tempPages: IPages): string[] {
        return Object.keys(changedPages).filter((page) => !tempPages[page]);
    },

    getMissingFolderNames(pagesNames: string[], pages: IPages): string[] {
        return pagesNames.map((page) => pages[page]);
    },
};
