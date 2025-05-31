// types/design.types.ts
import { IUser } from './user.types';
// import { IComponents, IFileInfo } from './project.types';


export interface IFileInfo {
  fileId: string;
}

export interface IBaseDrawing {
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

export interface ICategoryMapping {
  [key: string]: string; // code to UUID mapping
}

export interface IPages {
  [key: string]: string; // page name to UUID mapping
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


export interface INestedChildLevel1 {
  fileId: string;
}

export interface IComponents {
  [key: string]: IComponent | INormalComponent;
}

export type ComponentTypes = IComponent | INestedParentLevel1 | INestedChildLevel2 | INestedChildLevel1 | null;


export interface IStructure {
  pages: {
    [key: string]: string; // UUID
  };
  baseDrawing: IBaseDrawing;
  components: IComponents;
}

export interface IDesign extends Document {
  _id: string;
  user: string | IUser;
  project: string;
  name: string;
  folder: string;
  categoryId: string;
  sourceDesign: string;
  category: string;
  code: string;
  hash: string;
  revisions: string[];
  selectedPage: string;
  accessTo: Array<{
    userId: string;
    permissions: 'edit' | 'view';
  }>;
  type: string;
  description?: string;
  structure: IStructure;
  derivedDesigns: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IDesignResponse {
  success: boolean;
  status: string;
  design?: IDesign;
  designs?: IDesign[];
  id?: string;
}



// design request types:
export interface ICreateDesignRequest {
  project: string;
  type: string;
  sourceDesign?: string;
  code: string;
  hash: string;
  folder: string;
  categoryId: string;
  name?: string;
  description?: string;
  structure?: IStructure;
  category?: string;
}

export interface IAddComponentRequest {
  structure: IStructure;
}

export interface IRenameComponentRequest {
  structure: IStructure;
}

export interface IUpdateComponentRequest {
  structure: IStructure;
  deleteFilesOfPages: string; // JSON string
  filesToDelete: string; // JSON string
}

export interface IDeleteComponentRequest {
  structure: IStructure;
  filesToDelete: string[];
}

export interface IAddPageRequest {
  pageName: string;
}

export interface IRenamePageRequest {
  newName: string;
}

export interface IDeletePageRequest {
  structure: IStructure;
  pageName: string;
}

export interface IUpdateBaseDrawingRequest {
  structure: IStructure;
  folderNames?: string[];
}

export interface IUpdateDesignRequest {
  description?: string;
  type?: string;
}

export interface IGrantAccessRequest {
  userEmail: string;
  permissions: 'edit' | 'view';
}

export interface ICreateDerivedDesignRequest {
  project: string;
  folder: string;
  type: string;
  description?: string;
  structure?: IStructure;
  category?: string;
  code: string;
  hash: string;
  sourceDesign: string;
}













// Design response types
export interface ICreateDesignResponse {
  success: boolean;
  status: string;
  design?: IDesign;
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

export interface IUpdateDesignResponse {
  success: boolean;
  status: string;
  design?: IDesign;
}

export interface IDeleteDesignResponse {
  success: boolean;
  status: string;
}

export interface IRevokeAccessResponse {
  success: boolean;
  status: string;
}

export interface IGetDesignByHashResponse {
  success: boolean;
  status: string;
  exists: boolean;
  design?: IDesign;
}

export interface IGetDesignResponse {
  success: boolean;
  status: string;
  design?: IDesign & {
    isOwner: boolean;
    hasAccess: boolean;
  };
}

export interface IGetDesignsResponse {
  success: boolean;
  status: string;
  designs?: IDesign[];
}

export interface IGetRecentDesignsResponse {
  success: boolean;
  status: string;
  designs?: IDesign[];
}

export interface ICreateDerivedDesignResponse {
  success: boolean;
  status: string;
  design?: IDesign;
}