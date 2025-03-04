// types/design.types.ts
import { Document } from 'mongoose';

export interface IDesignInfo {
  // Add specific fields based on your designInfo structure
  [key: string]: any;
}

export interface IStructure {
  // Add specific fields based on your structure
  [key: string]: any;
}

export interface IDesign extends Document {
  user: string;
  code: number;
  folder: string;
  selectedCategory: string;
  selectedPage: string;
  designType: 'motor' | 'smiley';
  designInfo: IDesignInfo;
  structure: IStructure;
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