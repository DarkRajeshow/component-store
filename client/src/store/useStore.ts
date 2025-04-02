// src/store/useStore.ts
import { devtools, persist } from 'zustand/middleware';
import createUserSlice from './slices/userSlice';
import createDesignSlice from './slices/designSlice';
import createFileSlice from './slices/fileSlice';
import createRecentDesignSlice from './slices/recentDesignSlice';
import createUISlice from './slices/uiSlice';
import { create } from 'zustand';
import { toast } from 'sonner';
import { getDesignByIdAPI } from "../lib/globalAPI";
import { StoreState } from '../types/store';

// Zustand Store
const useStore = create<StoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...createUserSlice(set, get),
        ...createDesignSlice(set, get),
        ...createFileSlice(set, get),
        ...createRecentDesignSlice(set, get),
        ...createUISlice(set, get),

        fetchProject: async (id) => {
          set({ loading: true });
          try {
            const { data } = await getDesignByIdAPI(id);
            if (data.success) {
              set({
                design: data.design,
                selectedCategory: data.design?.selectedCategory,
                selectedPage: data.design?.selectedPage
              });
              // Set attributes and drawing based on design type
              const designType = data.design.designType;
              const structure = data.design?.structure;
              const category = data.design?.selectedCategory;
              if (designType === "motor") {
                set({
                  designAttributes: structure?.mountingTypes[category]?.attributes || {},
                  baseDrawing: structure?.mountingTypes[category]?.baseDrawing || '',
                  pages: structure?.mountingTypes[category]?.pages || []
                });
              } else if (designType === "smiley") {
                set({
                  designAttributes: structure?.sizes[category]?.attributes || {},
                  baseDrawing: structure?.sizes[category]?.baseDrawing || '',
                  pages: structure?.sizes[category]?.pages || []
                });
              }
            } else {
              toast.error(data.status);
            }
          } catch (error) {
            console.error('Error fetching project:', error);
          } finally {
            set({ loading: false });
          }
        },

        generateStructure: ({
          updatedAttributes = null,
          updatedBaseDrawing = null,
          updatedCategory = null,
          updatedPages = null
        } = {}) => {
          const { designAttributes, baseDrawing, selectedCategory, design, pages } = get();

          // Use store state values if parameters are not provided
          const finalAttributes = updatedAttributes || designAttributes;
          const finalBaseDrawing = updatedBaseDrawing || baseDrawing;
          const finalCategory = updatedCategory || selectedCategory;
          const finalPages = updatedPages || pages;

          const structure = design.structure;

          // Conditional assignment based on design type
          if (design?.designType === "motor") {
            structure.mountingTypes[finalCategory] = {
              ...structure.mountingTypes[finalCategory],
              pages: finalPages,
              attributes: finalAttributes,
              baseDrawing: finalBaseDrawing
            };
          } else if (design?.designType === "smiley") {
            structure.sizes[finalCategory] = {
              ...structure.sizes[finalCategory],
              pages: finalPages,
              attributes: finalAttributes,
              baseDrawing: finalBaseDrawing
            };
          }

          return structure;
        },

        // Toggle attribute value (simplified from toggle function)
        toggleAttributeValue: (key: string) => set((state) => ({
          designAttributes: {
            ...state.designAttributes,
            [key]: {
              ...state.designAttributes[key],
              value: !state.designAttributes[key]?.value,
            },
          },
        })),

        // Update selected option within a specific attribute and push to undo stack
        updateSelectedOption: (attribute, option) => {
          get().pushToUndoStack();
          set((state) => ({
            designAttributes: {
              ...state.designAttributes,
              [attribute]: {
                ...state.designAttributes[attribute],
                selectedOption: option,
              },
            },
          }));
        },

        updateSelectedSubOption: (attribute, option, subOption) => {
          get().pushToUndoStack(); // Push current state before making changes
          set((state) => ({
            designAttributes: {
              ...state.designAttributes,
              [attribute]: {
                ...state.designAttributes[attribute],
                options: {
                  ...state.designAttributes[attribute].options,
                  [option]: {
                    ...state.designAttributes[attribute].options[option],
                    selectedOption: subOption,
                  },
                },
                selectedOption: option, // Ensure the parent option is also selected
              },
            },
          }));
        },

        // Undo/redo functions with simplified stack management
        pushToUndoStack: () => set((state) => ({
          undoStack: [...state.undoStack, state.designAttributes],
          redoStack: [], // Clear redo stack on new action
        })),

        handleUndo: () => set((state) => {
          if (state.undoStack.length === 0) return {};

          const previousState = state.undoStack[state.undoStack.length - 1];
          const updatedUndoStack = state.undoStack.slice(0, -1);

          return {
            designAttributes: previousState,
            undoStack: updatedUndoStack,
            redoStack: [...state.redoStack, state.designAttributes],
          };
        }),

        handleRedo: () => set((state) => {
          if (state.redoStack.length === 0) return {};

          const nextState = state.redoStack[state.redoStack.length - 1];
          const updatedRedoStack = state.redoStack.slice(0, -1);

          return {
            designAttributes: nextState,
            redoStack: updatedRedoStack,
            undoStack: [...state.undoStack, state.designAttributes],
          };
        }),

        checkFileExists: (page, fileName) => {
          const fileList = get().fileList;
          return fileList[page]?.includes(fileName) || false;
        }
      }),
      {
        name: "app-storage", // Store name for localStorage

        // The `partialize` function specifies which parts of the state to persist
        partialize: (state) => ({
          // From User Slice
          user: state.user,

          // From Design slice
          rotation: state.rotation,

          // From history slice
          undoStack: state.undoStack,
          redoStack: state.redoStack,
        }),
      }
    )
  )
);

export default useStore;