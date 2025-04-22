import React from "react";
import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SideMenuType {
    value: string;
    label: string;
    icon: React.ReactNode;
}

interface SideMenuTriggersProps {
    sideMenuTypes: SideMenuType[];
    sideMenuType: string;
    setSideMenuType: (value: "" | "pageManager" | "categoryManager") => void;
    isPopUpOpen: boolean;
    setIsPopUpOpen: (value: boolean) => void;
}

const SideMenuTriggers: React.FC<SideMenuTriggersProps> = ({
    sideMenuTypes,
    sideMenuType,
    setSideMenuType,
    isPopUpOpen,
    setIsPopUpOpen
}) => {
    return (
        <TooltipProvider delayDuration={300}>
            <div className="absolute select-none rounded-full flex items-center flex-col bg-white/95 backdrop-blur-lg shadow-lg border -translate-y-1/2 top-1/2 left-6 z-40 p-1.5 gap-2">
                {sideMenuTypes.map((type, index) => (
                    <Tooltip key={index}>
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <Button
                                    variant={sideMenuType === type.value ? "secondary" : "ghost"}
                                    size="icon"
                                    onClick={() => {
                                        setSideMenuType(type.value as "" | "pageManager" | "categoryManager");
                                        setIsPopUpOpen(!isPopUpOpen);
                                    }}
                                    className={`w-10 h-10 rounded-full transition-all ${sideMenuType === type.value
                                            ? "text-dark bg-dark/10 hover:bg-dark/15"
                                            : "text-dark/60 hover:text-dark/80 hover:bg-dark/5"
                                        }`}
                                >
                                    {type.icon}
                                </Button>
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                            {type.label}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
};

export default React.memo(SideMenuTriggers);