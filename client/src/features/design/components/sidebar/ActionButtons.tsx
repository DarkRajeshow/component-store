import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const ActionButtons = ({
    saveLoading,
    tempBaseDrawing,
    newBaseDrawingFiles,
    updateBaseDrawing,
    allowedToClose,
    memoizedToggleDialog
}) => {
    const isDisabled = saveLoading || (typeof tempBaseDrawing === "string" && tempBaseDrawing === " " && !newBaseDrawingFiles);

    return (
        <div className="flex items-center justify-between gap-3 py-3 px-2">
            <Button
                variant="default"
                disabled={isDisabled}
                onClick={updateBaseDrawing}
                className={`w-1/2 bg-[#6B26DB]/90 hover:bg-[#6B26DB] ${isDisabled ? "opacity-60" : ""}`}
            >
                {saveLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    'Save & Shift'
                )}
            </Button>

            {allowedToClose && (
                <Button
                    variant="secondary"
                    onClick={memoizedToggleDialog}
                    disabled={saveLoading}
                    className="w-1/2"
                >
                    Cancel
                </Button>
            )}
        </div>
    );
};

export default React.memo(ActionButtons);