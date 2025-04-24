import { memo } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, InfoIcon, PlusIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { UpdateForm, RenameForm, DeleteForm } from './edit-menu';

import { ATTRIBUTE_TYPES, useActionBar } from '../hooks/action-bar/useActionBar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DesignInfoPanel, ComponentsList, ExportForm } from './action-bar'
import AddForm from './add-form';
import { Button } from '@/components/ui/button';
import useAppStore from '@/store/useAppStore';


interface ActionBarProps {
    generatePDF: (fileName: string) => void;
}

function ActionBar({ generatePDF }: ActionBarProps) {
    const {
        // State
        loading,
        components,
        openDropdown,
        componentFileName,
        dialogType,
        levelOneNest,
        levelTwoNest,
        menuVisible,
        componentType,
        infoOpen,
        tempSelectedCategory,
        tempComponents,
        contextMenuRef,
        infoContext,
        modelType,
        // Actions
        setComponentFileName,
        setDialogType,
        setLevelOneNest,
        setLevelTwoNest,
        setOldComponentFileName,
        setComponentType,
        setInfoOpen,
        setTempSelectedCategory,
        setUniqueFileName,

        // Functions
        handleToggle,
        toggleDropdown,
        handleToggleContextMenu,
        shiftToSelectedCategory,
        pushToUndoStack
    } = useActionBar();

    const { content } = useAppStore()


    // Determine which dialog content to show
    const renderDialogContent = () => {
        switch (dialogType) {
            case 'add':
                return (
                    <AddForm
                        componentFileName={componentFileName}
                        componentType={componentType}
                        levelOneNest={levelOneNest}
                        levelTwoNest={levelTwoNest}
                        setLevelOneNest={setLevelOneNest}
                        setLevelTwoNest={setLevelTwoNest}
                        setOldComponentFileName={setOldComponentFileName}
                        setComponentFileName={setComponentFileName}
                        newComponentTypes={ATTRIBUTE_TYPES}
                        setComponentType={setComponentType}
                        tempComponents={tempComponents}
                    />
                );
            case 'update':
                return <UpdateForm />;
            case 'rename':
                return <RenameForm />;
            case 'delete':
                return <DeleteForm />;
            case 'export':
                return <ExportForm onExport={generatePDF} />;
            default:
                return null;
        }
    };

    return (
        <Dialog className="rounded-lg col-span-3 overflow-hidden">
            <div
                className="pt-3 flex items-center justify-between px-6 select-none"
            // onClick={() => {
            //     if (!menuVisible) {
            //         setOpenDropdown("");
            //     }
            // }}
            >
                {/* Left section - Home and Design Info */}
                <div className="w-40 flex justify-center items-center gap-2">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-700 hover:text-black">
                            <HomeIcon className="h-5 w-5" />
                        </Button>
                    </Link>

                    <div className="flex items-center gap-1 relative" ref={infoContext}>
                        <p className="logo font-medium text-center  text-purple-700 capitalize">
                             {content && content.name}
                        </p>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 p-0 text-blue-400 hover:text-blue-600"
                                    onClick={() => setInfoOpen(!infoOpen)}
                                >
                                    <InfoIcon className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{modelType} Information</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Design info panel */}
                        {infoOpen && (
                            <DesignInfoPanel
                                tempSelectedCategory={tempSelectedCategory}
                                setTempSelectedCategory={setTempSelectedCategory}
                                shiftToSelectedCategory={shiftToSelectedCategory}
                            />
                        )}
                    </div>
                </div>

                {/* Dialog content for forms */}
                <DialogContent className="bg-theme max-h-[80vh] w-auto overflow-y-scroll p-6 select-none">
                    {renderDialogContent()}
                </DialogContent>

                {/* Main components list */}
                <div className="flex gap-1 rounded-md h-[88%] justify-center" ref={contextMenuRef}>
                    {!loading && components && (
                        <ComponentsList
                            components={components}
                            openDropdown={openDropdown}
                            menuVisible={menuVisible}
                            handleToggle={handleToggle}
                            toggleDropdown={toggleDropdown}
                            handleToggleContextMenu={handleToggleContextMenu}
                            pushToUndoStack={pushToUndoStack}
                            setDialogType={setDialogType}
                        />
                    )}
                </div>

                {/* Right section - Action buttons */}
                <header className="px-5 gap-2 flex items-center justify-end w-40">
                    <DialogTrigger
                        onClick={() => {
                            setUniqueFileName();
                            setDialogType("add");
                        }}
                        className="bg-white hover:border-dark border p-3 rounded-full text-dark font-medium"
                    >
                        <PlusIcon className="h-5 w-5" />
                    </DialogTrigger>

                    <DialogTrigger
                        onClick={() => setDialogType("export")}
                        id='exportBtn'
                        className="bg-blue-200 hover:bg-green-300 py-2 rounded-full px-6 text-dark font-medium"
                    >
                        Export
                    </DialogTrigger>
                </header>
            </div>
        </Dialog>
    );
}

export default memo(ActionBar);