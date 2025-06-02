import React, { useMemo } from 'react';
import {
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useUpdateForm } from '../../../hooks/edit-menu/useUpdateForm';
import { IComponent } from '@/types/design.types';
import { IFileInfo, INestedChildLevel1, INestedChildLevel2, INestedParentLevel1 } from '@/types/project.types';
import PageSelector from './PageSelector';
import ComponentFileSection from './ComponentFileSection';
import AddChild from './AddChild';
import DeleteConfirmation from './DeleteConfirmation';
import UpdateChild from './UpdateChild';


const UpdateForm: React.FC = () => {
    const {
        updateLoading,
        operation,
        newComponentName,
        updatedValue,
        selectedComponentValue,
        fileExistenceStatus,
        selectedPages,
        baseContentPath,
        pages,
        newFiles,
        menuOf,

        setOperation,
        setNewComponentName,
        setUpdatedValue,
        handleFileChange,
        handleDrop,
        handleUpdate,
        handleDelete,
        handlePageSelection,
        removeSelectedFile,
        resetStates
    } = useUpdateForm();

    // Memoize child components for better performance
    const childComponents = useMemo(() => {
        if (!(selectedComponentValue as IComponent)?.options) return null;

        return Object.entries((selectedComponentValue as IComponent).options).map(([option, value]) => {
            if (option !== "none") {
                return (
                    <UpdateChild
                        key={option}
                        // path={[...menuOf, option]}
                        updatedValue={updatedValue}
                        setUpdatedValue={setUpdatedValue}
                        option={option}
                        value={value}
                    />
                );
            }
            return null;
        });
    }, [selectedComponentValue, updatedValue, setUpdatedValue]);

    // Handle close dialog with reset
    const handleCloseDialog = () => {
        resetStates();
        const closeButton = document.querySelector("#close");
        if (closeButton instanceof HTMLElement) {
            closeButton.click();
        }
    };

    return (
        <form onSubmit={handleUpdate} className='flex flex-col gap-4 w-[60vw] p-6 pb-0 bg-slate-50'>
            <div className='flex items-center justify-between'>
                <DialogTitle className="text-gray-700 font-medium py-2">Update Component</DialogTitle>
                <DialogTrigger id='close' hidden></DialogTrigger>
                <Button
                    type='button'
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseDialog}
                    className="absolute top-3 right-3"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Component Header with Operations */}
            <Card className="border-2 border-gray-100">
                <CardContent className="px-4 flex items-center justify-between">
                    <h1 className='font-medium text-xl uppercase text-blue-700'>{newComponentName}</h1>
                    <div className='flex items-center gap-3'>
                        {(updatedValue as IComponent)?.selected && (
                            <Button
                                type='button'
                                variant="ghost"
                                size="icon"
                                onClick={() => setOperation(operation === "add" ? "" : "add")}
                                title="Add child component"
                                className={`${operation === "add" ? "bg-green-100" : ""}`}
                            >
                                <Plus className="h-5 w-5 text-green-600" />
                            </Button>
                        )}

                        <Button
                            type='button'
                            variant="ghost"
                            size="icon"
                            onClick={() => setOperation("update")}
                            title="Edit component"
                            className={`${operation === "update" ? "bg-blue-100" : ""}`}
                        >
                            <Pencil className="h-5 w-5 text-blue-600" />
                        </Button>

                        <Button
                            type='button'
                            variant="ghost"
                            size="icon"
                            onClick={() => setOperation(operation === "delete" ? "" : "delete")}
                            title="Delete component"
                            className={`${operation === "delete" ? "bg-red-100" : ""}`}
                        >
                            <Trash2 className="h-5 w-5 text-red-600" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Operation-specific content */}
            <div className='w-full transition-all'>
                {operation === "update" && (
                    <Card className="border-2 border-gray-100">
                        <CardContent className="px-6">
                            <div className="mb-6">
                                <h2 className='pb-2 font-medium text-lg'>Rename Component</h2>
                                <div className="flex gap-2">
                                    <div className="p-2 bg-slate-200 rounded-md">
                                        <Pencil className="h-5 w-5 text-gray-700" />
                                    </div>
                                    <Input
                                        id='newComponentName'
                                        required
                                        type="text"
                                        value={newComponentName}
                                        onChange={(e) => setNewComponentName(e.target.value)}
                                        placeholder="e.g my-design"
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            {/* File Upload Section */}
                            {(selectedComponentValue as IFileInfo)?.fileId && (
                                <div className="mt-6">
                                    <PageSelector
                                        pages={pages}
                                        selectedPages={selectedPages}
                                        onPageSelect={handlePageSelection}
                                    />

                                    <div className='flex flex-col gap-4'>
                                        {selectedPages.map((page) => {
                                            const selectedFile = newFiles?.[(selectedComponentValue as IFileInfo)?.fileId]?.[pages[page]] || null;
                                            const fileExists = fileExistenceStatus[page];

                                            return (
                                                <ComponentFileSection
                                                    key={page}
                                                    page={page}
                                                    pages={pages}
                                                    selectedFile={selectedFile}
                                                    baseContentPath={baseContentPath}
                                                    componentPath={(selectedComponentValue as IFileInfo).fileId}
                                                    fileExists={fileExists}
                                                    onFileChange={(e) => handleFileChange(e, page)}
                                                    onDrop={(e) => handleDrop(e, page)}
                                                    onRemoveFile={() => removeSelectedFile(page)}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {operation === "add" && (
                    <Card className="border-2 border-gray-100">
                        <CardContent className="p-6">
                            <h2 className='text-lg font-medium mb-4'>
                                Add component in <span className='text-blue-600'>{menuOf[menuOf.length - 1]}</span>
                            </h2>
                            <AddChild
                                updatedValue={updatedValue as IComponent | INestedParentLevel1 | INestedChildLevel2 | INestedChildLevel1 | null}
                                setOperation={setOperation}
                            />
                        </CardContent>
                    </Card>
                )}

                {operation === "delete" && (
                    <DeleteConfirmation
                        onDelete={handleDelete}
                        onCancel={() => setOperation("")}
                    />
                )}
            </div>

            {/* Child Components Section */}
            {(selectedComponentValue as IComponent)?.options && (
                <Card className="border-2 border-gray-100">
                    <CardContent className="p-6">
                        <h2 className='text-lg font-medium mb-4'>Child Components</h2>
                        <div className="space-y-4">
                            {childComponents}
                            {!childComponents?.length && (
                                <p className="text-gray-500">No nested options added yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Form Actions */}
            <DialogFooter className="sm:justify-between gap-4">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={resetStates}
                    disabled={updateLoading}
                >
                    Reset
                </Button>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseDialog}
                        disabled={updateLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={updateLoading}
                        className="min-w-[120px]"
                    >
                        {updateLoading ? (
                            <>
                                Saving...
                                <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </div>
            </DialogFooter>
        </form>
    );
};

export default UpdateForm;