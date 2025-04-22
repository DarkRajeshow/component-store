import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useSideMenu } from "../hooks/useSideMenu";
import useAppStore from "@/store/useAppStore";
import { sideMenuTypes } from "@/constants";
import SideMenuTriggers from "./SideMenuTriggers";
import PageManager from "./page-manager";
import CategoryManager from "./category-manager/CategoryManager";
import { useModel } from "@/contexts/ModelContext";

function SideMenu() {
  // Get params and store values
  const {
    content,
  } = useAppStore();

  const { modelType } = useModel()


  // Use the custom hook to manage state and logic
  const {
    sideMenuType,
    setSideMenuType,
    isPopUpOpen,
    setIsPopUpOpen,
    allowedToClose,
  } = useSideMenu();

  // Memoize dialog open state  
  const dialogOpen = useMemo(() => {
    return isPopUpOpen;
  }, [isPopUpOpen]);

  if (!content) {
    return null;
  }

  return (
    <Dialog open={dialogOpen}>
      <SideMenuTriggers
        sideMenuTypes={sideMenuTypes}
        sideMenuType={sideMenuType}
        setSideMenuType={setSideMenuType}
        isPopUpOpen={isPopUpOpen}
        setIsPopUpOpen={setIsPopUpOpen}
      />

      <DialogTrigger id='closeButtonSideMenu' hidden></DialogTrigger>

      <DialogContent className="select-none bg-white max-h-[80vh] min-h-[40vh] w-[750px] overflow-y-auto p-6">
        {sideMenuType === "pageManager" && <PageManager
          allowedToClose={allowedToClose}
          isPopUpOpen={isPopUpOpen}
          setIsPopUpOpen={setIsPopUpOpen}
          setSideMenuType={setSideMenuType}
        />}

        {(sideMenuType === "categoryManager" && modelType === "project") && <CategoryManager
          allowedToClose={allowedToClose}
          isPopUpOpen={isPopUpOpen}
          setIsPopUpOpen={setIsPopUpOpen}
          setSideMenuType={setSideMenuType}
        />}

      </DialogContent>
    </Dialog>
  );
}

export default React.memo(SideMenu);