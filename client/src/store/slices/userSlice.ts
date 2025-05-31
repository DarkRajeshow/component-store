import { StateCreator } from 'zustand';
import { IUser } from '@/types/user.types';
import { StoreState } from '@/types/store.types';

// Define types for the user slice
interface UserState {
    user: IUser | null;
}

interface UserActions {
    setUser: (userData: IUser) => void;
}

export type UserSlice = UserState & UserActions;

// User Slice
const createUserSlice: StateCreator<StoreState, [], [], UserSlice> = (set) => ({
    user: {} as IUser,
    setUser: (userData) => set({ user: userData }),
});

export default createUserSlice;