import { StateCreator } from 'zustand';
import { StoreState } from '../../../../deprecated/client/types/store.types';
import { IUser } from '@/types/user.types';

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