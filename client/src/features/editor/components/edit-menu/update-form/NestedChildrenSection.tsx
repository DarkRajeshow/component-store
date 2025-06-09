import { ComponentTypes, IComponent, IFileInfo, INestedChildLevel1, INestedChildLevel2, INestedParentLevel1 } from "@/types/project.types";
import UpdateChild from "./UpdateChild";
import { Dispatch, memo, SetStateAction } from "react";
import { useModel } from "@/contexts/ModelContext";
import useAppStore from "@/store/useAppStore";
import { IDesign } from "@/types/design.types";
import { getOptionLockStatus, isOptionLocked } from "@/features/editor/utils/ComponentTracker";


// NestedChildrenSection component for displaying nested children
const NestedChildrenSection = memo(({
    value,
    option,
    renamedOption,
    updatedValue,
    setUpdatedValue,
    componentPath
}: {
    value: IComponent | INestedParentLevel1 | INestedChildLevel2 | INestedChildLevel1 | null;
    option: string;
    renamedOption: string;
    updatedValue: IComponent | INestedParentLevel1 | INestedChildLevel2 | INestedChildLevel1 | null;
    setUpdatedValue: Dispatch<SetStateAction<ComponentTypes>>;
    componentPath: string;
    // fileCounts: Record<string, { fileUploads: number; selectedPagesCount: number }>;
    // setFileCounts: (counts: Record<string, { fileUploads: number; selectedPagesCount: number }>) => void;
    // fileId: string;
}) => {
    const { modelType } = useModel();
    const { content } = useAppStore();
    if (!(value as IComponent)?.options) return null;

    const isDesignMode = modelType == 'design';
    const designSnapshot = (content as IDesign).snapshot;
    return (
        <div className="pl-2 py-3">
            <p className='pb-2 font-medium text-lg'>Nested Childs</p>
            <div className='pl-3 ml-3 border-l-2 border-dark/10 my-2'>
                {Object.entries((value as IComponent).options).map(([subOption, subValue]) => {

                    console.log(componentPath);
                    
                    const nestedLockStatus = designSnapshot && isDesignMode
                        ? getOptionLockStatus(componentPath, subOption, designSnapshot)
                        : { isLocked: false, canEdit: true, canDelete: true, canRename: true, reason: '' };

                    const isNestedOptionLocked = designSnapshot && isDesignMode
                        ? isOptionLocked(componentPath, subOption, designSnapshot)
                        : false;

                    console.log(nestedLockStatus);

                    return (
                        <UpdateChild
                            key={subOption}
                            parentOption={option}
                            nestedIn={renamedOption}
                            updatedValue={updatedValue}
                            setUpdatedValue={setUpdatedValue}
                            option={subOption}
                            isLocked={isNestedOptionLocked}
                            componentPath={componentPath}
                            lockStatus={nestedLockStatus}
                            value={subValue as IComponent | IFileInfo}
                        // fileId={fileId}
                        />)
                })}
            </div>
        </div>
    );
});

NestedChildrenSection.displayName = 'NestedChildrenSection';

export default NestedChildrenSection;