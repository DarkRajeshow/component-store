import { toast } from "sonner";
import { getRecentDesignsAPI, getRecentProjectsAPI } from "../../lib/globalAPI";
import { StateCreator } from 'zustand';
import { IDesign } from "@/types/design.types";
import { IProject } from "@/types/project.types";
import { StoreState } from "@/types/store.types";

// Define types for the recent design slice
interface RecentDesignState {
  recentDesigns: IDesign[];
  recentProjects: IProject[];
  recentDesignLoading: boolean;
  recentProjectLoading: boolean;
}

interface RecentDesignActions {
  fetchRecentDesigns: () => Promise<void>;
  fetchRecentProjects: () => Promise<void>;
}

export type FetchRecentSlice = RecentDesignState & RecentDesignActions;

// Slice for recent designs and related loading state
const createFetchRecentSlice: StateCreator<StoreState, [], [], FetchRecentSlice> = (set) => ({
  recentDesigns: [],
  recentProjects: [],
  recentDesignLoading: false,
  recentProjectLoading: false,
  fetchRecentDesigns: async () => {
    set({ recentDesignLoading: true });
    try {
      const response = await getRecentDesignsAPI();
      if (response.success) {
        set({ recentDesigns: response.designs });
      } else {
        toast.error(response.status);
      }
    } catch (error) {
      console.error('Error fetching recent designs:', error);
    } finally {
      set({ recentDesignLoading: false });
    }
  },

  fetchRecentProjects: async () => {
    set({ recentDesignLoading: true });
    try {
      const response = await getRecentProjectsAPI();
      if (response.success) {
        set({ recentProjects: response.projects });
      } else {
        toast.error(response.status);
      }
    } catch (error) {
      console.error('Error fetching recent designs:', error);
    } finally {
      set({ recentDesignLoading: false });
    }
  },
});

export default createFetchRecentSlice;