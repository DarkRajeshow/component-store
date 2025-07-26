export interface ISelectionPath {
    componentPath: string;
    selectedOption: string;
    fileId: string;
}

export interface IDesignSnapshot {
    selectionPaths: ISelectionPath[];
}

export interface IComponent {
    value?: boolean;
    fileId?: string;
    selected?: string;
    options?: Record<string, any>;
}

export interface INormalComponent {
    value?: boolean;
    fileId?: string;
    selected?: string;
    options?: Record<string, any>;
}

export interface IComponents {
    [key: string]: IComponent | INormalComponent;
} 