import React from "react";
import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SideMenuType {
    value: string;
    label: string;
    icon: React.ReactNode;
}

interface SideMenuTriggersProps {
    sideMenuTypes: SideMenuType[];
    sideMenuType: string;
    setSideMenuType: (value: string) => void;
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
        <div className="absolute select-none w-12 rounded-full flex items-center flex-col bg-white backdrop-blur-lg border-2 -translate-y-1/2 top-1/2 left-10 z-40 p-1 gap-1">
            {sideMenuTypes.map((type, index) => (
                <DialogTrigger
                    asChild
                    key={index}
                >
                    <Button
                        variant={sideMenuType === type.value ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => {
                            setSideMenuType(type.value);
                            if (type.value === "masterDrawing") {
                                setIsPopUpOpen(!isPopUpOpen);
                            }
                        }}
                        title={type.label}
                        className={`w-full aspect-square rounded-full ${sideMenuType === type.value ? "text-dark bg-dark/5" : "text-dark/60"
                            }`}
                    >
                        <span className="p-1">{type.icon}</span>
                    </Button>
                </DialogTrigger>
            ))}
        </div>
    );
};

export default React.memo(SideMenuTriggers);