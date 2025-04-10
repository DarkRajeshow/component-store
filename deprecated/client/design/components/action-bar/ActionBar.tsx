import PropTypes from 'prop-types';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, InfoIcon, PlusIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { popUpQuestions } from '../../../../constants';
import AttributesList from './components/AttributesList';
import DesignInfoPanel from './components/DesignInfoPanel';
import AddForm from '../addform/AddForm';
import RenameForm from '../edit-menu/RenameForm';
import DeleteForm from '../edit-menu/DeleteForm';
import UpdateForm from '../edit-menu/UpdateForm';
import ExportForm from './ExportForm';
import { ATTRIBUTE_TYPES, useActionBar } from '../../hooks/action-bar/useActionBar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ActionBarProps {
    generatePDF: () => void;
}

function ActionBar({ generatePDF }: ActionBarProps) {
    const {
        // State
        loading,
        components,
        design,
        openDropdown,
        attributeFileName,
        dialogType,
        levelOneNest,
        levelTwoNest,
        menuVisible,
        attributeType,
        infoOpen,
        tempSelectedCategory,
        tempcomponents,
        contextMenuRef,
        infoContext,

        // Actions
        setOpenDropdown,
        setAttributeFileName,
        setDialogType,
        setLevelOneNest,
        setLevelTwoNest,
        setOldAttributeFileName,
        setAttributeType,
        setInfoOpen,
        setTempSelectedCategory,
        setUniqueFileName,

        // Functions
        handleToggle,
        toggleDropdown,
        handleToggleContextMenu,
        shiftCategory,
        pushToUndoStack
    } = useActionBar();

    // Determine which dialog content to show
    const renderDialogContent = () => {
        switch (dialogType) {
            case 'add':
                return (
                    <AddForm
                        attributeFileName={attributeFileName}
                        attributeType={attributeType}
                        levelOneNest={levelOneNest}
                        levelTwoNest={levelTwoNest}
                        setLevelOneNest={setLevelOneNest}
                        setLevelTwoNest={setLevelTwoNest}
                        setOldAttributeFileName={setOldAttributeFileName}
                        setAttributeFileName={setAttributeFileName}
                        newAttributeTypes={ATTRIBUTE_TYPES}
                        setAttributeType={setAttributeType}
                        tempcomponents={tempcomponents}
                    />
                );
            case 'update':
                return <UpdateForm />;
            case 'rename':
                return <RenameForm />;
            case 'delete':
                return <DeleteForm />;
            case 'export':
                return <ExportForm generatePDF={generatePDF} />;
            default:
                return null;
        }
    };

    return (
        <Dialog className="rounded-lg col-span-3 overflow-hidden">
            <div
                className="pt-3 flex items-center justify-between px-6 select-none"
                onMouseLeave={() => {
                    if (!menuVisible) {
                        setOpenDropdown("");
                    }
                }}
            >
                {/* Left section - Home and Design Info */}
                <div className="w-40 flex justify-center items-center gap-2">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-700 hover:text-black">
                            <HomeIcon className="h-5 w-5" />
                        </Button>
                    </Link>

                    <div className="flex items-center gap-1 relative" ref={infoContext}>
                        <p className="logo font-medium text-center text-purple-700 capitalize">
                            {design?.designType || 'Design'}
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
                                <p>Design Information</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Design info panel */}
                        {infoOpen && (
                            <DesignInfoPanel
                                design={design}
                                popUpQuestions={popUpQuestions}
                                tempSelectedCategory={tempSelectedCategory}
                                setTempSelectedCategory={setTempSelectedCategory}
                                shiftCategory={shiftCategory}
                            />
                        )}
                    </div>
                </div>

                {/* Dialog content for forms */}
                <DialogContent className="bg-theme max-h-[80vh] w-auto overflow-y-scroll p-6 select-none">
                    {renderDialogContent()}
                </DialogContent>

                {/* Main attributes list */}
                <div className="flex gap-1 rounded-md h-[88%] justify-center" ref={contextMenuRef}>
                    {!loading && components && (
                        <AttributesList
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
                        className="bg-blue-200 hover:bg-green-300 py-2 rounded-full px-6 text-dark font-medium"
                    >
                        Export
                    </DialogTrigger>
                </header>
            </div>
        </Dialog>
    );
}

ActionBar.propTypes = {
    generatePDF: PropTypes.func.isRequired,
};

export default memo(ActionBar);