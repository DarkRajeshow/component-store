// types/design.types.ts
import mongoose, { Document } from 'mongoose';
import { IUser } from './user.types';
// import { IComponents, IFileInfo } from './project.types';


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

export interface IStructure {
  pages: {
    [key: string]: string; // UUID
  };
  baseDrawing: IFileInfo;
  components: IComponents;
}

export interface IDesign extends Document {
  user: mongoose.Types.ObjectId | string | IUser;
  project: mongoose.Types.ObjectId | string;
  sourceDesign: mongoose.Types.ObjectId | string;
  folder: string;
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