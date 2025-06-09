import { memo, useState, Dispatch, SetStateAction } from 'react';
import AddChild from './AddChild';
import { IComponent, IFileInfo, INestedChildLevel1, INestedChildLevel2, INestedParentLevel1 } from '@/types/project.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    PencilIcon,
    PlusIcon,
    Trash2Icon,
    Lock,
    Shield,
    AlertTriangle,
    Info,
    Eye,
    EyeOff
} from 'lucide-react';
import {
    TooltipProvider,
} from '@/components/ui/tooltip';

import FileUploader from './FileUploader';
import PageSelector from './PageSelector';
import RenameSection from './RenameSection';
import NestedChildrenSection from './NestedChildrenSection';
import DeleteConfirmation from './DeleteConfirmation';
import { useUpdateChild } from '@/features/editor/hooks/edit-menu/useUpdateChild';
import ActionButton from './ActionButton';

interface FileCountsRecord {
    fileUploads: number;
    selectedPagesCount: number;
}

type ComponentType = IComponent | INestedParentLevel1 | INestedChildLevel2 | INestedChildLevel1 | null;

interface UpdateChildProps {
    parentOption?: string;
    nestedIn?: string;
    option: string;
    value: ComponentType;
    isLocked: boolean;
    updatedValue: ComponentType;
    componentPath: string;
    setUpdatedValue: Dispatch<SetStateAction<ComponentType>>;
    lockStatus?: {
        isLocked: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canRename: boolean;
        reason: string;
        lockingPath?: string;
        selectedOption?: string;
    };
}

// Main UpdateChild component
const UpdateChild = memo(({
    parentOption = "",
    nestedIn = "",
    option,
    value,
    updatedValue,
    setUpdatedValue,
    componentPath,
    // isLocked,
    lockStatus
}: UpdateChildProps) => {
    const [, setFileCounts] = useState<Record<string, FileCountsRecord>>({});
    const [showLockDetails, setShowLockDetails] = useState(false);

    // Use the custom hook to handle all the logic
    const {
        renamedOption,
        operation,
        fileExistenceStatus,
        selectedPages,
        baseContentPath,
        pages,
        newFiles,
        handleFileChange,
        handleDrop,
        handleDelete,
        handleRename,
        togglePageSelection,
        removeFile,
        setOperation,
        shouldRender
    } = useUpdateChild({
        parentOption,
        nestedIn,
        option,
        value,
        updatedValue,
        setFileCounts: setFileCounts,
        setUpdatedValue: setUpdatedValue
    });

    // Don't render if this option doesn't exist in the updated value
    if (!shouldRender()) {
        return null;
    }

    const canEdit = !lockStatus?.isLocked || lockStatus?.canEdit;
    const canDelete = !lockStatus?.isLocked || lockStatus?.canDelete;
    const canRename = !lockStatus?.isLocked || lockStatus?.canRename;
    const canAddChildren = !lockStatus?.isLocked || lockStatus?.canEdit;

    return (
        <TooltipProvider>
            <div className="w-full mb-3">
                <div className="group flex items-center flex-col justify-between gap-0.5 select-none w-full">
                    {/* Option header with enhanced lock status */}
                    <div className={`
                        flex items-center justify-between py-3 px-4 rounded-lg border-2 w-full transition-all duration-200
                        ${lockStatus?.isLocked
                            ? 'bg-amber-50 border-amber-200 hover:border-amber-300'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }
                    `}>
                        <div className="flex items-center gap-3 flex-1">
                            <h1
                                onClick={() => !lockStatus?.isLocked && setOperation(op => op === "update" ? "" : "update")}
                                className={`
                                    font-medium uppercase cursor-pointer transition-colors
                                    ${lockStatus?.isLocked
                                        ? 'text-amber-700 cursor-not-allowed'
                                        : 'text-green-700 hover:text-green-800'
                                    }
                                `}
                            >
                                {renamedOption}
                            </h1>

                            {/* Lock status indicators */}
                            {lockStatus?.isLocked && (
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Protected
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        type='button'
                                        onClick={() => setShowLockDetails(!showLockDetails)}
                                        className="h-6 px-2 text-amber-700 hover:text-amber-800"
                                    >
                                        {showLockDetails ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                        <span className="text-xs ml-1">
                                            {showLockDetails ? 'Hide' : 'Why?'}
                                        </span>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className='flex items-center gap-2'>
                            {(value as IComponent)?.selected && (
                                <ActionButton
                                    icon={PlusIcon}
                                    onClick={() => setOperation(op => op === "add" ? "" : "add")}
                                    isActive={operation === "add"}
                                    isDisabled={!canAddChildren}
                                    title="Add Child Component"
                                    disabledReason={lockStatus?.reason}
                                />
                            )}

                            <ActionButton
                                icon={PencilIcon}
                                onClick={() => setOperation(op => op === "update" ? "" : "update")}
                                isActive={operation === "update"}
                                isDisabled={!canEdit && !canRename}
                                title="Edit Component"
                                disabledReason={lockStatus?.reason}
                            />

                            <ActionButton
                                icon={Trash2Icon}
                                onClick={() => {
                                    console.log(lockStatus);

                                    setOperation(op => op === "delete" ? "" : "delete")
                                }}
                                isActive={operation === "delete"}
                                isDisabled={!canDelete}
                                title="Delete Component"
                                variant="destructive"
                                disabledReason={lockStatus?.reason}
                            />
                        </div>
                    </div>

                    {/* Lock details alert */}
                    {lockStatus?.isLocked && showLockDetails && (
                        <Alert className="w-full bg-amber-50 border-amber-200 mb-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                                <div className="space-y-2">
                                    <div className="font-medium">Component Protection Details:</div>
                                    <div className="text-sm">{lockStatus.reason}</div>
                                    {lockStatus.lockingPath && (
                                        <div className="text-xs bg-amber-100 p-2 rounded border">
                                            <strong>Selection Path:</strong> {lockStatus.lockingPath} → {lockStatus.selectedOption}
                                        </div>
                                    )}
                                    <div className="flex gap-2 text-xs">
                                        <span className={`px-2 py-1 rounded ${canEdit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            Edit: {canEdit ? 'Allowed' : 'Blocked'}
                                        </span>
                                        <span className={`px-2 py-1 rounded ${canDelete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            Delete: {canDelete ? 'Allowed' : 'Blocked'}
                                        </span>
                                        <span className={`px-2 py-1 rounded ${canRename ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            Rename: {canRename ? 'Allowed' : 'Blocked'}
                                        </span>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Content section */}
                    <div className='w-full transition-all'>
                        {operation === "update" && (
                            <div className='pl-3 ml-3 border-l-2 border-gray-200 my-2'>
                                <Card className="overflow-hidden">
                                    <CardContent className="p-4">
                                        {/* Rename section - conditionally enabled */}
                                        {canRename ? (
                                            <RenameSection renamedOption={renamedOption} handleRename={handleRename} />
                                        ) : (
                                            <Alert className="bg-gray-50 border-gray-200 mb-4">
                                                <Info className="h-4 w-4" />
                                                <AlertDescription>
                                                    Renaming is disabled for this component as it's part of the original design selection.
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {/* File upload section - conditionally enabled */}
                                        {((value as IFileInfo)?.fileId && option !== "none") && (
                                            <div className="mt-4">
                                                {canEdit ? (
                                                    <>
                                                        <PageSelector
                                                            pages={pages}
                                                            selectedPages={selectedPages}
                                                            onPageSelect={togglePageSelection}
                                                        />

                                                        <div className='flex flex-col gap-4'>
                                                            {selectedPages.map(page => {
                                                                const valuePath = (value as IFileInfo).fileId || "";
                                                                const pagePath = pages[page];
                                                                const selectedFile = valuePath && newFiles?.[valuePath]?.[pagePath]
                                                                    ? newFiles[valuePath][pagePath]
                                                                    : null;

                                                                return (
                                                                    <FileUploader
                                                                        key={`${componentPath}-${option}-${page}-${valuePath}`}
                                                                        pagePath={pagePath}
                                                                        page={page}
                                                                        handleFileChange={handleFileChange}
                                                                        handleDrop={handleDrop}
                                                                        selectedFile={selectedFile}
                                                                        fileExists={fileExistenceStatus[page]}
                                                                        baseContentPath={baseContentPath}
                                                                        valuePath={valuePath}
                                                                        removeFile={removeFile}
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <Alert className="bg-blue-50 border-blue-200">
                                                        <Lock className="h-4 w-4 text-blue-600" />
                                                        <AlertDescription className="text-blue-800">
                                                            File editing is disabled for this component. It's part of the original design selection and modifying it would change the design output.
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Nested children section */}
                                {(value as IComponent)?.options && (
                                    <NestedChildrenSection
                                        value={value}
                                        componentPath={`${componentPath}.${option}`}
                                        option={option}
                                        renamedOption={renamedOption}
                                        updatedValue={updatedValue}
                                        setUpdatedValue={setUpdatedValue}
                                    />
                                )}
                            </div>
                        )}

                        {/* Delete confirmation - conditionally enabled */}
                        {operation === "delete" && (
                            <>
                                {canDelete ? (
                                    <DeleteConfirmation
                                        onDelete={handleDelete}
                                        onCancel={() => setOperation("")}
                                    />
                                ) : (
                                    <Alert className="bg-red-50 border-red-200">
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                        <AlertDescription className="text-red-800">
                                            <div className="font-medium mb-2">Cannot Delete Protected Component</div>
                                            <div className="text-sm">{lockStatus?.reason}</div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setOperation("")}
                                                className="mt-3 text-red-700 hover:text-red-800"
                                            >
                                                Cancel
                                            </Button>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </>
                        )}

                        {/* Add child section - conditionally enabled */}
                        {operation === "add" && (
                            <>
                                {canAddChildren ? (
                                    <Card className="bg-green-50 border-green-200">
                                        <CardContent className="py-4 px-4 flex flex-col gap-3">
                                            <h1 className="text-green-800">
                                                Add child component in <span className='font-medium'>{renamedOption}</span>
                                            </h1>
                                            <AddChild
                                                updatedValue={updatedValue}
                                                nestedIn={option}
                                                setOperation={setOperation}
                                            />
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Alert className="bg-amber-50 border-amber-200">
                                        <Lock className="h-4 w-4 text-amber-600" />
                                        <AlertDescription className="text-amber-800">
                                            <div className="font-medium mb-2">Cannot Add Children to Protected Component</div>
                                            <div className="text-sm">{lockStatus?.reason}</div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setOperation("")}
                                                className="mt-3 text-amber-700 hover:text-amber-800"
                                            >
                                                Cancel
                                            </Button>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
});

UpdateChild.displayName = 'UpdateChild';

export default UpdateChild;