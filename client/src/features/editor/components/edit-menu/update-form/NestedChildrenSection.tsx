import { IComponent, IFileInfo } from "@/types/project.types";
import UpdateChild from "./UpdateChild";
import { memo } from "react";

// NestedChildrenSection component for displaying nested children
const NestedChildrenSection = memo(({
    value,
    option,
    renamedOption,
    updatedValue,
    setUpdatedValue,
    fileCounts,
    setFileCounts,
}: {
    value: IComponent | IFileInfo;
    option: string;
    renamedOption: string;
    updatedValue: any;
    setUpdatedValue: (value: any) => void;
    fileCounts: Record<string, { fileUploads: number; selectedPagesCount: number }>;
    setFileCounts: (counts: Record<string, { fileUploads: number; selectedPagesCount: number }>) => void;
    // fileId: string;
}) => {
    if (!value?.options) return null;

    return (
        <div className="pl-2 py-3">
            <p className='pb-2 font-medium text-lg'>Nested Childs</p>
            <div className='pl-3 ml-3 border-l-2 border-dark/10 my-2'>
                {Object.entries(value.options).map(([subOption, subValue]) => (
                    <UpdateChild
                        key={subOption}
                        setFileCounts={setFileCounts}
                        fileCounts={fileCounts}
                        parentOption={option}
                        nestedIn={renamedOption}
                        updatedValue={updatedValue}
                        setUpdatedValue={setUpdatedValue}
                        option={subOption}
                        value={subValue as IComponent | IFileInfo}
                        // fileId={fileId}
                    />
                ))}
            </div>
        </div>
    );
});

NestedChildrenSection.displayName = 'NestedChildrenSection';

export default NestedChildrenSection;