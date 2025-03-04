import { StateCreator } from 'zustand';
import { StoreState } from '../../types/store';

// Define types for the user slice
interface UserState {
    user: Record<string, any>;
}

interface UserActions {
    setUser: (userData: Record<string, any>) => void;
}

export type UserSlice = UserState & UserActions;

// User Slice
const createUserSlice: StateCreator<StoreState, [], [], UserSlice> = (set) => ({
    user: {},
    setUser: (userData) => set({ user: userData }),
});

export default createUserSlice;