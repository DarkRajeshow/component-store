export interface IComponent {
    id: string;
    name: string;
    type: string;
    options?: Record<string, any>;
    selected?: string;
}

export interface IComponentOption {
    id: string;
    name: string;
    type: string;
}

export interface IComponents {
    [key: string]: IComponent;
}

export type ApiRequestMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';
