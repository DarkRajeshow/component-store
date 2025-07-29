import { UserSlice } from '@/store/slices/userSlice';      // Fixed relative path
// Additional types for the store
interface StoreActions {
  // Add store actions here when needed
}

// Combined store state type
export type StoreState = UserSlice & StoreActions;


export interface ISelectionBox {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}
