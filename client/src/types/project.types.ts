export interface IFileInfo {
    fileId: string;
}

export interface ICategoryMapping {
    [key: string]: string; // code to UUID mapping
}

export interface IPages {
    [key: string]: string; // page name to UUID mapping
}

export interface IFileInfo {
    fileId: string;
}

export interface INestedChildLevel2 {
    fileId: string;
}

export interface INestedChildLevel1 {
    fileId: string;
}

export interface INormalComponent extends IFileInfo {
    value: boolean
}

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

export interface IProject {
    _id: string;
    user: string;
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






// Project response types
export interface ICreateProjectResponse {
    success: boolean;
    status: string;
    project?: IProject;
}

export interface IComponentOperationResponse {
    success: boolean;
    status: string;
}

export interface IAddPageResponse {
    success: boolean;
    status: string;
}

export interface IRenamePageResponse {
    success: boolean;
    status: string;
}

export interface IDeletePageResponse {
    success: boolean;
    status: string;
}

export interface IUpdateBaseDrawingResponse {
    success: boolean;
    status: string;
}

export interface IAddCategoryResponse {
    success: boolean;
    status: string;
    categoryId?: string;
}

export interface IShiftCategoryResponse {
    success: boolean;
    status: string;
}


export interface IRenameCategoryResponse {
    success: boolean;
    status: string;
}


export interface IDeleteCategoryResponse {
    success: boolean;
    status: string;
}

export interface IDeleteProjectResponse {
    success: boolean;
    status: string;
}

export interface IGetProjectResponse {
    success: boolean;
    status: string;
    project?: IProject;
}

export interface IGetProjectsResponse {
    success: boolean;
    status: string;
    projects?: IProject[];
}

export interface IGetRecentProjectsResponse {
    success: boolean;
    status: string;
    projects?: IProject[];
}






// project request types:
export interface ICreateProjectRequest {
    name: string;
    type: string;
    description?: string;
}

export interface IAddComponentRequest {
    categoryStructure: ICategoryData;
}

export interface IRenameComponentRequest {
    categoryStructure: ICategoryData;
}

export interface IUpdateComponentRequest {
    categoryStructure: ICategoryData;
    deleteFilesOfPages: string; // JSON string
    filesToDelete: string; // JSON string
}

export interface IDeleteComponentRequest {
    categoryStructure: ICategoryData;
}

export interface IAddPageRequest {
    pageName: string;
}

export interface IRenamePageRequest {
    newName: string;
}

export interface IDeletePageRequest {
    categoryId: string;
    pageId: string;
}

export interface IUpdateBaseDrawingRequest {
    file: File;
}

export interface IAddCategoryRequest {
    categoryName: string;
}

export interface IShiftCategoryRequest {
    hierarchy: IHierarchy;
    selectedCategory: string;
    folderNames: string[];
}

export interface IRenameCategoryRequest {
    oldName: string;
    newName: string;
}

export interface IDeleteCategoryRequest {
    categoryId: string;
}

export interface IGrantAccessRequest {
    userEmail: string;
    permissions: 'edit' | 'view';
}
