import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock } from "lucide-react";
import { memo } from "react";

// Enhanced action button component
const ActionButton = memo(({
    icon: Icon,
    onClick,
    isActive,
    isDisabled,
    title,
    variant = "ghost",
    disabledReason
}: {
    icon: React.ElementType;
    onClick: () => void;
    isActive: boolean;
    isDisabled: boolean;
    title: string;
    variant?: "ghost" | "destructive";
    disabledReason?: string;
}) => {
    const buttonElement = (
        <Button
            type='button'
            variant={isDisabled ? "ghost" : variant}
            size="icon"
            onClick={isDisabled ? undefined : onClick}
            disabled={isDisabled}
            className={`
                h-8 w-8 transition-all duration-200
                ${isActive && !isDisabled ?
                    (variant === "destructive" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700")
                    : ""
                }
                ${isDisabled ?
                    "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                    : "hover:scale-105"
                }
            `}
        >
            <Icon className="h-4 w-4" />
            {isDisabled && <Lock className="h-3 w-3 absolute top-0 right-0 bg-white rounded-full p-0.5" />}
        </Button>
    );

    if (isDisabled && disabledReason) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {buttonElement}
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-64">
                    <div className="flex items-start gap-2">
                        <Lock className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                        <div>
                            <div className="font-medium text-sm">{title} Disabled</div>
                            <div className="text-xs text-muted-foreground mt-1">{disabledReason}</div>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {buttonElement}
            </TooltipTrigger>
            <TooltipContent side="top">
                {title}
            </TooltipContent>
        </Tooltip>
    );
});

ActionButton.displayName = 'ActionButton';

export default ActionButton;