// User Types
export interface IUser {
    _id: string;
    username: string;
    dp: string;
    designs: string[] | IDesign[]; // Can be populated with Design objects or remain as IDs
    createdAt: Date;
    updatedAt: Date;
}

// Design Types
export interface IDesign {
    _id: string;
    user: string | IUser; // Can be populated with User object or remain as ID
    code: number;
    folder: string;
    selectedCategory: string;
    selectedPage: string;
    designType: 'motor' | 'smiley';
    designInfo: Record<string, string>; // Schema.Types.Mixed
    structure: IStructure;
    createdAt: Date;
    updatedAt: Date;
}

// Structure Types
export interface IStructure {
    mountingTypes: {
        [key: string]: IMountingType;
    };
}

export interface IMountingType {
    pages: {
        [key: string]: string;
    };
    baseDrawing: {
        path: string;
    };
    attributes?: {
        [key: string]: IAttribute;
    };
}

export interface IAttribute {
    selectedOption: string;
    options: {
        [key: string]: IAttributeOption;
    };
}

export interface IAttributeOption {
    path: string;
}

// Request/Response Types for API calls
export interface CreateDesignRequest {
    selectedCategory: string;
    selectedPage: string;
    designType: 'motor' | 'smiley';
    designInfo: Record<string, string>;
    structure: IStructure;
    folder: string;
}

export interface UpdateDesignRequest {
    selectedCategory?: string;
    selectedPage?: string;
    designInfo?: Record<string, string>;
    structure?: IStructure;
}

export interface UserLoginRequest {
    username: string;
    password: string;
}

export interface UserSignupRequest {
    username: string;
    password: string;
    dp?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// State management types (for Redux/Context)
export interface UserState {
    currentUser: IUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface DesignState {
    designs: IDesign[];
    currentDesign: IDesign | null;
    loading: boolean;
    error: string | null;
}

// Helper type for the structure example you provided
export type MountingTypeKey = 'B3' | 'B5' | 'B14' | 'B35' | 'V1';