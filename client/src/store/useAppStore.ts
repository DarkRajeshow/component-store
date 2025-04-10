// src/store/useAppStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import createUserSlice from './slices/userSlice';
import createDesignSlice from './slices/designSlice';
import createFileSlice from './slices/fileSlice';
import createRecentDesignSlice from './slices/recentDesignSlice';
import createUISlice from './slices/uiSlice';
import createProjectSlice from './slices/projectSlice';
import createEditorSlice from './slices/editorSlice';
import { toast } from 'sonner';
import { getDesignByIdAPI, getProjectByIdAPI } from "@/lib/globalAPI";
import { StoreState } from '@/types/store.types';
import { IComponent, IComponents, IFileInfo, IHierarchy, INormalComponent } from '@/types/project.types';

const useAppStore = create<StoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...createUserSlice(set, get),
        ...createDesignSlice(set, get),
        ...createFileSlice(set, get),
        ...createRecentDesignSlice(set, get),
        ...createUISlice(set, get),
        ...createProjectSlice(set, get),
        ...createEditorSlice(set, get),

        fetchProject: async (id) => {
          set({ loading: true });
          try {
            const response = await getProjectByIdAPI(id);
            if (response.success) {
              const selectedCategory = response.project?.selectedCategory;
              set({
                project: response.project,
                category: selectedCategory,
                selectedPage: response.project?.selectedPage
              });

              const hierarchy = response.project?.hierarchy;

              if (hierarchy) {
                const selectedCategoryId = hierarchy?.categoryMapping[selectedCategory as string];
                const selectedCategoryData = hierarchy?.categories[selectedCategoryId];
                set({
                  components: selectedCategoryData.components || {},
                  baseDrawing: selectedCategoryData?.baseDrawing || null,
                  pages: selectedCategoryData?.pages || {}
                });
              }
              else {
                console.log("Hierarchy not found in project response:", response.project);
              }
            } else {
              toast.error(response.status);
            }
          } catch (error) {
            console.error('Error fetching project:', error);
          } finally {
            set({ loading: false });
          }
        },

        fetchDesign: async (id) => {
          set({ loading: true });
          try {
            const response = await getDesignByIdAPI(id);
            if (response.success) {
              set({
                design: response.design,
                category: response.design?.category,
                selectedPage: response.design?.selectedPage
              });
              // Set components and drawing based on design type
              const structure = response.design?.structure;

              set({
                components: structure?.components || {},
                baseDrawing: structure?.baseDrawing || null,
                pages: structure?.pages || {}
              });

            } else {
              toast.error(response.status);
            }
          } catch (error) {
            console.error('Error fetching project:', error);
          } finally {
            set({ loading: false });
          }
        },

        generateHierarchy: ({
          updatedComponents = null,
          updatedBaseDrawing = null,
          updatedCategory = null,
          updatedPages = null
        } = {}): IHierarchy => {
          const { components, baseDrawing, category, project, pages } = get();

          const finalComponents = updatedComponents || components;
          const finalBaseDrawing = updatedBaseDrawing || baseDrawing;
          const finalCategory = updatedCategory || category;
          const finalPages = updatedPages || pages;

          const hierarchy = project?.hierarchy || {} as IHierarchy;


          const categoryId = hierarchy?.categoryMapping[finalCategory as string];

          hierarchy.categories = {
            ...hierarchy.categories,
            [categoryId]: {
              ...hierarchy.categories?.[categoryId],
              pages: finalPages || {},
              components: finalComponents || {},
              baseDrawing: finalBaseDrawing as IFileInfo,
            }
          };

          return hierarchy;
        },

        // Toggle attribute value (simplified from toggle function)
        toggleComponentValue: (key: string) => set((state) => ({
          components: {
            ...state.components,
            [key]: {
              ...(state.components as IComponents)[key],
              value: !((state.components)[key] as INormalComponent)?.value,
            },
          },
        })),

        // Update selected option within a specific component and push to undo stack
        updateselected: (component, option) => {
          get().pushToUndoStack();
          set((state) => ({
            components: {
              ...state.components,
              [component]: {
                ...(state.components[component] as IComponent),
                selected: option,
              },
            },
          }));
        },

        updateSelectedSubOption: (component, option, subOption) => {
          get().pushToUndoStack(); // Push current state before making changes
          set((state) => ({
            components: {
              ...state.components,
              [component]: {
                ...state.components[component],
                options: {
                  ...(state.components[component] as IComponent).options,
                  [option]: {
                    ...(state.components[component] as IComponent).options[option],
                    selected: subOption,
                  },
                },
                selected: option, // Ensure the parent option is also selected
              },
            },
          }));
        },

        // Undo/redo functions with simplified stack management
        pushToUndoStack: () => set((state) => ({
          undoStack: [...state.undoStack, state.components],
          redoStack: [], // Clear redo stack on new action
        })),

        handleUndo: () => set((state) => {
          if (state.undoStack.length === 0) return {};

          const previousState = state.undoStack[state.undoStack.length - 1];
          const updatedUndoStack = state.undoStack.slice(0, -1);

          return {
            components: previousState,
            undoStack: updatedUndoStack,
            redoStack: [...state.redoStack, state.components],
          };
        }),

        handleRedo: () => set((state) => {
          if (state.redoStack.length === 0) return {};

          const nextState = state.redoStack[state.redoStack.length - 1];
          const updatedRedoStack = state.redoStack.slice(0, -1);

          return {
            components: nextState,
            redoStack: updatedRedoStack,
            undoStack: [...state.undoStack, state.components],
          };
        }),

        checkFileExists: (page, fileName) => {
          const fileList = get().fileList;
          return fileList[page]?.includes(fileName) || false;
        }
      }),
      {
        name: "app-storage",
        partialize: (state: StoreState) => ({
          user: state.user,
          design: state.design,
          undoStack: state.undoStack,
          redoStack: state.redoStack,
        }),
      }
    )
  )
);

export default useAppStore;