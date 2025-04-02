import { ReactNode } from "react";
import { IDesign } from "../../../types/types";

// Define types for the component
export interface Pages {
    [key: string]: string;
}

export interface BaseDrawing {
    path: string;
}

export interface FileExistenceStatus {
    [key: string]: boolean;
}

export interface NewBaseDrawingFiles {
    [key: string]: File;
}

export interface SideMenuProps {
    design: IDesign;
    selectedCategory: string;
    fetchProject: (id: string) => Promise<void>;
    incrementFileVersion: () => void;
    fileVersion: number;
    baseDrawing: BaseDrawing;
    setBaseDrawing: (baseDrawing: BaseDrawing) => void;
    loading: boolean;
    generateStructure: (params: GenerateStructureParams) => any;
    pages: Pages;
    id: string;
}

export interface GenerateStructureParams {
    updatedAttributes: object;
    updatedCategory: string;
    updatedPages: Pages;
    updatedBaseDrawing: BaseDrawing;
}

export interface SideMenuTypeOption {
    value: string;
    label: string;
    icon: ReactNode;
}
