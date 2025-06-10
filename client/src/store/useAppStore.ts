// src/store/useAppStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import createUserSlice from './slices/userSlice';
import { StoreState } from '@/types/store.types';

const useAppStore = create<StoreState>()(
  devtools(
    persist((set, get, store) => ({
      ...createUserSlice(set, get, store),
    }),
      {
        name: "app-storage",
        partialize: (state: StoreState) => ({
          // user: state.user,
          // design: state.design,
          // undoStack: state.undoStack,
          // redoStack: state.redoStack,
          // rotation: state.rotation
        }),
      }
    )
  )
);

export default useAppStore;