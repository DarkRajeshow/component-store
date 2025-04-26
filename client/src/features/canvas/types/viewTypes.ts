import { IDesign } from '@/types/design.types';
import { IComponents } from '@/types/project.types';
import { RefObject } from 'react';

// Selection related types
export interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface AbsoluteSelection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface SelectionState {
  isSelecting: boolean;
  isConfirmed: boolean;
  lastMousePosition: { x: number; y: number };
  selection: SelectionBox | null;
}

// Offset and zoom types
export interface Offset {
  x: number;
  y: number;
}


export interface IDimentions {
  width: number,
  height: number
}

// View component props
export interface ViewProps {
  generatePDF: (fileName: string) => void;
  reference: RefObject<SVGSVGElement>;
  zoom: number;
  dimensions: IDimentions;
  setDimensions: (updatedDimentions: IDimentions) => void;
  setZoom: (zoom: number | ((prevZoom: number) => number)) => void;
  offset: Offset;
  setOffset: (offset: Offset | ((prevOffset: Offset) => Offset)) => void;
  selectionBox: SelectionBox | null;
}

// Store types
export interface DesignStore {
  components: IComponents;
  design: IDesign;
  loading: boolean;
  setSelectionBox: (selection: SelectionBox | null) => void;
  fileVersion: string | number;
  baseDrawing: { path: string } | null;
  selectedPage: string;
  setSelectedPage: (page: string) => void;
  pages: Record<string, string>;
  generateHierarchy: (options: { updatedPages?: Record<string, string> }) => any;
  fetchProject: (id: string) => Promise<void>;
  rotation: number;
  setRotation: (rotation: number) => void;
}

// File existence tracking
export interface ExistingFiles {
  [path: string]: boolean;
}

// Popup types
export type ViewPopUpType = 'export' | 'pages' | '';

// API response type
export interface ApiResponse {
  success: boolean;
  status: string;
  data?: any;
} 