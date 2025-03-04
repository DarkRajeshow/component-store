import { toast } from "sonner";
import { getRecentDesignsAPI } from "../../lib/globalAPI";
import { StateCreator } from 'zustand';
import { StoreState } from '../../types/store';

// Define types for the recent design slice
interface RecentDesignState {
  recentDesigns: any[];
  RecentDesignLoading: boolean;
}

interface RecentDesignActions {
  fetchRecentDesigns: (id: string) => Promise<void>;
}

export type RecentDesignSlice = RecentDesignState & RecentDesignActions;

// Slice for recent designs and related loading state
const createRecentDesignSlice: StateCreator<StoreState, [], [], RecentDesignSlice> = (set) => ({
  recentDesigns: [],
  RecentDesignLoading: false,
  fetchRecentDesigns: async (id) => {
    set({ RecentDesignLoading: true });
    try {
      const { data } = await getRecentDesignsAPI(id);
      if (data.success) {
        set({ recentDesigns: data.recentDesigns });
      } else {
        toast.error(data.status);
      }
    } catch (error) {
      console.error('Error fetching recent designs:', error);
    } finally {
      set({ RecentDesignLoading: false });
    }
  },
});

export default createRecentDesignSlice;