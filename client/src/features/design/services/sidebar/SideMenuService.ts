import { checkFileExists } from "@/utils/checkFileExists";
import { shiftToSelectedCategoryAPI, updateBaseDrawingAPI } from "../../lib/designAPI";
import { BaseDrawing, Pages } from "../../types";
import { IDesign } from "@/types/types";
import { v4 as uuidv4 } from 'uuid';


// SideMenuService.ts - Service for handling API calls and business logic
export const SideMenuService = {
    async updateBaseDrawing(
        id: string,
        formData: FormData
    ): Promise<{ data: { success: boolean; status: string } }> {
        return updateBaseDrawingAPI(id, formData);
    },

    async shiftToSelectedCategory(
        id: string,
        data: {
            selectedCategory: string;
            structure: any;
            folderNames: string[];
        }
    ): Promise<{ data: { success: boolean; status: string } }> {
        return shiftToSelectedCategoryAPI(id, data);
    },

    async checkFileExists(path: string): Promise<boolean> {
        return checkFileExists(path);
    },

    validatePageName(pageName: string, existingPages: Pages): boolean {
        return !(pageName in existingPages);
    },

    createUniqueFileName(design: IDesign, tempSelectedCategory: string): string {
        let uniqueFileName = uuidv4();

        // If the base drawing is previously uploaded, use the existing path
        if (design?.designType === "motor") {
            const mountingType = design.structure.mountingTypes?.[tempSelectedCategory];
            uniqueFileName = mountingType?.baseDrawing?.path || uniqueFileName;
        } else if (design?.designType === "smiley") {
            const smileyType = design.structure.sizes?.[tempSelectedCategory];
            uniqueFileName = smileyType?.baseDrawing?.path || uniqueFileName;
        }

        return uniqueFileName;
    },

    getAttributesForCategory(design: IDesign, tempSelectedCategory: string): object {
        if (design?.designType === "motor") {
            return design.structure.mountingTypes?.[tempSelectedCategory]?.attributes || {};
        } else if (design?.designType === "smiley") {
            return design.structure.sizes?.[tempSelectedCategory]?.attributes || {};
        }
        return {};
    },

    getPagesForCategory(design: IDesign, tempSelectedCategory: string): Pages {
        if (design?.designType === "motor") {
            return design.structure.mountingTypes?.[tempSelectedCategory]?.pages || {};
        } else if (design?.designType === "smiley") {
            return design.structure.sizes?.[tempSelectedCategory]?.pages || {};
        }
        return {};
    },

    getBaseDrawingForCategory(design: IDesign, tempSelectedCategory: string): BaseDrawing | undefined {
        if (design?.designType === "motor") {
            return design.structure.mountingTypes?.[tempSelectedCategory]?.baseDrawing;
        } else if (design?.designType === "smiley") {
            return design.structure.sizes?.[tempSelectedCategory]?.baseDrawing;
        }
        return undefined;
    },

    calculateMissingPages(changedPages: Pages, tempPages: Pages): string[] {
        return Object.keys(changedPages).filter((page) => !tempPages[page]);
    },

    getMissingFolderNames(pagesNames: string[], pages: Pages): string[] {
        return pagesNames.map((page) => pages[page]);
    },
};
