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

            if (response.success && response.project) {
              const hierarchy = response.project?.hierarchy;

              if (!hierarchy) {
                console.log("Hierarchy not found in project response:", response.project);
                return;
              }

              const selectedCategory = response.project?.selectedCategory;
              const categoryId = hierarchy?.categoryMapping[selectedCategory];
              const structure = hierarchy?.categories?.[categoryId];

              // Only update if values are different from current state
              set((state) => {
                const needsUpdate = state.project?._id !== response.project?._id ||
                  state.category !== selectedCategory ||
                  JSON.stringify(state.structure) !== JSON.stringify(structure);

                return needsUpdate ? {
                  project: response.project,
                  category: selectedCategory,
                  structure: structure,
                  selectedPage: response.project?.selectedPage,
                  components: structure?.components || {},
                  baseDrawing: structure?.baseDrawing || null,
                  pages: structure?.pages || {}
                } : {};
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

        fetchDesign: async (id) => {
          set({ loading: true });
          try {
            const response = await getDesignByIdAPI(id);
            if (response.success) {
              const structure = response.design?.structure;
              set({
                design: response.design,
                category: response.design?.category,
                selectedPage: response.design?.selectedPage,
                structure: structure,
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

        setProjectStates: async (project) => {
          set({ loading: true });
          if (project) {
            const hierarchy = project?.hierarchy;

            if (!hierarchy) {
              console.log("Hierarchy not found in project response:", project);
              return;
            }

            const selectedCategory = project?.selectedCategory;
            const categoryId = hierarchy?.categoryMapping[selectedCategory];
            const structure = hierarchy?.categories?.[categoryId];

            // Only update if values are different from current state
            set((state) => {
              const needsUpdate = state.project?._id !== project?._id ||
                state.selectedCategory !== selectedCategory ||
                JSON.stringify(state.structure) !== JSON.stringify(structure);

              return needsUpdate ? {
                project: project,
                selectedCategory, 
                structure: structure,
                selectedPage: Object.keys(structure.pages)[0],
                components: structure?.components || {},
                baseDrawing: structure?.baseDrawing || null,
                pages: structure?.pages || {}
              } : {};
            });
          }
          set({ loading: false });
        },

        setDesignStates: async (design) => {
          set({ loading: true });
          if (design) {
            const structure = design.structure;
            set({
              design: design,
              category: design.category,
              selectedPage: design.selectedPage,
              structure: structure,
              components: structure?.components || {},
              baseDrawing: structure?.baseDrawing || null,
              pages: structure?.pages || {}
            });
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