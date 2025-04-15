import { toast } from "sonner";
import { getRecentDesignsAPI } from "../../lib/globalAPI";
import { StateCreator } from 'zustand';
import { StoreState } from '../../../../deprecated/client/types/store.types';
import { IDesign } from "@/types/design.types";

// Define types for the recent design slice
interface RecentDesignState {
  recentDesigns: IDesign[];
  RecentDesignLoading: boolean;
}

interface RecentDesignActions {
  fetchRecentDesigns: () => Promise<void>;
}

export type RecentDesignSlice = RecentDesignState & RecentDesignActions;

// Slice for recent designs and related loading state
const createRecentDesignSlice: StateCreator<StoreState, [], [], RecentDesignSlice> = (set) => ({
  recentDesigns: [],
  RecentDesignLoading: false,
  fetchRecentDesigns: async () => {
    set({ RecentDesignLoading: true });
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
      set({ RecentDesignLoading: false });
    }
  },
});

export default createRecentDesignSlice;