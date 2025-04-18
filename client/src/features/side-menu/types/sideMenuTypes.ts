import { ReactNode } from "react";
import { IComponents, IFileInfo, IHierarchy, IPages } from "@/types/project.types";
import { IBaseDrawing, IStructure } from "@/types/design.types";

// Types for the side menu feature

export interface BaseDrawing {
  fileId: string;
}

export type NewBaseDrawingFiles = Record<string, File>;

export interface CategorySelection {
  value: string;
  label: string;
}

export interface FileUploadSectionProps {
  choosenPage: string;
  tempBaseDrawing: BaseDrawing;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  tempPages: IPages;
  fileExistenceStatus: Record<string, boolean>;
  newBaseDrawingFiles: NewBaseDrawingFiles;
  baseFilePath: string;
  fileVersion: number;
}

export interface CategorySelectionProps {
  categoryMapping: Record<string, string>;
  tempSelectedCategory: string;
  handleCategoryChange: (event: { target: { value: string } }) => void;
}

export interface PageManagementProps {
  newPageName: string;
  setNewPageName: (name: string) => void;
  addNewPage: () => void;
  choosenPage: string;
  fileExistenceStatus: Record<string, boolean>;
  openDeleteConfirmation: (page: string) => void;
  setChoosenPage: (page: string) => void;
  tempPages: IPages;
  openPageDeleteWarning: boolean;
  setOpenPageDeleteWarning: (open: boolean) => void;
  handleDelete: () => void;
}

export interface ActionButtonsProps {
  saveLoading: boolean;
  tempBaseDrawing: BaseDrawing;
  newBaseDrawingFiles: NewBaseDrawingFiles;
  updateBaseDrawing: () => Promise<void>;
  allowedToClose: boolean;
  memoizedToggleDialog: () => void;
}

export interface FileExistenceStatus {
  [key: string]: boolean;
}

export interface UsePageManagerProps {
  folder: string;
  modelType: "project" | "design";
  selectedCategory: string;
  baseContentPath: string;
  incrementFileVersion: () => void;
  fileVersion: number;
  setBaseDrawing: (baseDrawing: IBaseDrawing) => void;
  loading: boolean;
  generateHierarchy: (params: generateHierarchyParams) => IHierarchy;
  structure: IStructure;
  setSideMenuType: (updatedMenuType: string) => void;
  isPopUpOpen: boolean;
  setIsPopUpOpen: (value: boolean) => void;
}

export interface generateHierarchyParams {
  updatedComponents?: IComponents | null;
  updatedBaseDrawing?: IFileInfo | null;
  updatedCategory?: string | null;
  updatedPages?: IPages | null;
}

export interface SideMenuTypeOption {
  value: string;
  label: string;
  icon: ReactNode;
}
