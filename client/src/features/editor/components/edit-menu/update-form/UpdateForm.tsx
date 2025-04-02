import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
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
import { IAttribute } from '@/types/types';
import {
    AddChild,
    UpdateChild,
    DeleteConfirmation,
    PageSelector,
    AttributeFileSection
} from '.';


const UpdateForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const {
        updateLoading,
        operation,
        setOperation,
        newAttributeName,
        setNewAttributeName, 
        updatedValue,
        setUpdatedValue,
        selectedAttributeValue,
        fileExistenceStatus,
        selectedPages,
        baseFilePath,
        pages,
        newFiles,
        fileCounts,
        setFileCounts,
        menuOf,
        handleFileChange,
        handleDrop,
        handleUpdate,
        handleDelete,
        handlePageSelection,
        removeSelectedFile,
        resetStates
    } = useUpdateForm({ id });

    // Memoize child components for better performance
    const childComponents = useMemo(() => {
        if (!selectedAttributeValue?.options) return null;

        return Object.entries(selectedAttributeValue.options).map(([option, value]) => {
            if (option !== "none") {
                return (
                    <UpdateChild
                        key={option}
                        fileCounts={fileCounts}
                        setFileCounts={setFileCounts}
                        path={[...menuOf, option]}
                        updatedValue={updatedValue}
                        setUpdatedValue={setUpdatedValue}
                        option={option}
                        value={value}
                    />
                );
            }
            return null;
        });
    }, [selectedAttributeValue?.options, menuOf, updatedValue, fileCounts, setFileCounts, setUpdatedValue]);

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
                <DialogTitle className="text-gray-700 font-medium py-2">Update Attribute</DialogTitle>
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

            {/* Attribute Header with Operations */}
            <Card className="border-2 border-gray-100">
                <CardContent className="px-4 flex items-center justify-between">
                    <h1 className='font-medium text-xl uppercase text-blue-700'>{newAttributeName}</h1>
                    <div className='flex items-center gap-3'>
                        {updatedValue?.selectedOption && (
                            <Button
                                type='button'
                                variant="ghost"
                                size="icon"
                                onClick={() => setOperation(operation === "add" ? "" : "add")}
                                title="Add child attribute"
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
                            title="Edit attribute"
                            className={`${operation === "update" ? "bg-blue-100" : ""}`}
                        >
                            <Pencil className="h-5 w-5 text-blue-600" />
                        </Button>

                        <Button
                            type='button'
                            variant="ghost"
                            size="icon"
                            onClick={() => setOperation(operation === "delete" ? "" : "delete")}
                            title="Delete attribute"
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
                                <h2 className='pb-2 font-medium text-lg'>Rename Attribute</h2>
                                <div className="flex gap-2">
                                    <div className="p-2 bg-slate-200 rounded-md">
                                        <Pencil className="h-5 w-5 text-gray-700" />
                                    </div>
                                    <Input
                                        id='newAttributeName'
                                        required
                                        type="text"
                                        value={newAttributeName}
                                        onChange={(e) => setNewAttributeName(e.target.value)}
                                        placeholder="e.g my-design"
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            {/* File Upload Section */}
                            {selectedAttributeValue?.path && (
                                <div className="mt-6">
                                    <PageSelector
                                        pages={pages}
                                        selectedPages={selectedPages}
                                        onPageSelect={handlePageSelection}
                                    />

                                    <div className='flex flex-col gap-4'>
                                        {selectedPages.map((page) => {
                                            const selectedFile = newFiles?.[selectedAttributeValue?.path]?.[pages[page]] || null;
                                            const fileExists = fileExistenceStatus[page];

                                            return (
                                                <AttributeFileSection
                                                    key={page}
                                                    page={page}
                                                    pages={pages}
                                                    selectedFile={selectedFile}
                                                    baseFilePath={baseFilePath}
                                                    attributePath={selectedAttributeValue.path}
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
                                Add attribute in <span className='text-blue-600'>{menuOf[menuOf.length - 1]}</span>
                            </h2>
                            <AddChild 
                                updatedValue={updatedValue as { options?: { [key: string]: IAttribute } }} 
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

            {/* Child Attributes Section */}
            {selectedAttributeValue?.options && (
                <Card className="border-2 border-gray-100">
                    <CardContent className="p-6">
                        <h2 className='text-lg font-medium mb-4'>Child Attributes</h2>
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