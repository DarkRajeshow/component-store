// components/OptionTypeSelector.tsx
import React from "react";

interface OptionTypeSelectorProps {
    isParent: boolean;
    setIsParent: (isParent: boolean) => void;
}

const OptionTypeSelector: React.FC<OptionTypeSelectorProps> = ({
    isParent,
    setIsParent
}) => {
    return (
        <div className="w-full grid grid-cols-2 h-12 mb-2 rounded-lg bg-design/50 items-center justify-center text-center gap-1 font-medium p-1">
            <div
                onClick={() => setIsParent(false)}
                id="child"
                className={`bg-white h-full flex items-center justify-center rounded-lg cursor-pointer ${!isParent ? "bg-white" : "bg-white/5"
                    }`}
            >
                Child
            </div>
            <div
                onClick={() => setIsParent(true)}
                id="parent"
                className={`bg-white h-full flex items-center justify-center rounded-lg cursor-pointer ${isParent ? "bg-white" : "bg-white/5"
                    }`}
            >
                <span>Parent</span>
            </div>
        </div>
    );
};

export default OptionTypeSelector;