import mongoose, { Document } from 'mongoose';

export interface IFileInfo {
    fileId: string;
}

export interface ICategoryMapping {
    [key: string]: string; // code to UUID mapping
}

export interface IPages {
    [key: string]: string; // page name to UUID mapping
}

export interface INestedChildLevel2 extends IFileInfo { }

export interface INestedChildLevel1 extends IFileInfo { }

export interface INestedOptionsLevel1 {
    [key: string]: INestedChildLevel2;
}

export interface INestedParentLevel1 {
    selected: string;
    options: INestedOptionsLevel1;
}

export interface IComponentOptions {
    [key: string]: IFileInfo | INestedParentLevel1;
}

export interface IComponent {
    selected: string;
    options: IComponentOptions;
}

export interface INormalComponent extends IFileInfo { }

export interface IComponents {
    [key: string]: IComponent | INormalComponent;
}

export interface ICategoryData {
    pages: IPages;
    baseDrawing: IFileInfo;
    components: IComponents;
}

export interface ICategories {
    [key: string]: ICategoryData; // UUID to category data mapping
}

export interface IHierarchy {
    categoryMapping: ICategoryMapping;
    categories: ICategories;
}

export interface IProject extends Document {
    user: mongoose.Types.ObjectId | string;
    name: string;
    folder: string;
    selectedCategory: string;
    selectedPage: string;
    type: string;
    description?: string;
    hierarchy: IHierarchy;
    accessTo: Array<{
        userId: string;
        permissions: 'edit' | 'view';
    }>;
    derivedDesigns: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IProjectResponse {
    success: boolean;
    status: string;
    project?: IProject;
    projects?: IProject[];
    id?: string;
}