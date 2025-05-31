import { ComponentTypes, IComponent, IFileInfo, INestedChildLevel1, INestedChildLevel2, INestedParentLevel1 } from "@/types/project.types";
import UpdateChild from "./UpdateChild";
import { Dispatch, memo, SetStateAction } from "react";


// NestedChildrenSection component for displaying nested children
const NestedChildrenSection = memo(({
    value,
    option,
    renamedOption,
    updatedValue,
    setUpdatedValue,
}: {
    value: IComponent | INestedParentLevel1 | INestedChildLevel2 | INestedChildLevel1 | null;
    option: string;
    renamedOption: string;
    updatedValue: IComponent | INestedParentLevel1 | INestedChildLevel2 | INestedChildLevel1 | null;
    setUpdatedValue: Dispatch<SetStateAction<ComponentTypes>>;
    // fileCounts: Record<string, { fileUploads: number; selectedPagesCount: number }>;
    // setFileCounts: (counts: Record<string, { fileUploads: number; selectedPagesCount: number }>) => void;
    // fileId: string;
}) => {
    if (!(value as IComponent)?.options) return null;

    return (
        <div className="pl-2 py-3">
            <p className='pb-2 font-medium text-lg'>Nested Childs</p>
            <div className='pl-3 ml-3 border-l-2 border-dark/10 my-2'>
                {Object.entries((value as IComponent).options).map(([subOption, subValue]) => (
                    <UpdateChild
                        key={subOption}
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