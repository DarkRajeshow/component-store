import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState, useMemo, memo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LucideEllipsisVertical } from 'lucide-react';
import { popUpQuestions } from '../../../../constants';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import AddForm from './AddForm';
import RenameForm from '../edit-menu/RenameForm';
import DeleteForm from '../edit-menu/DeleteForm';
import UpdateForm from '../edit-menu/UpdateForm';
import ExportForm from './ExportForm';
import EditMenu from '../edit-menu/EditMenu';
import useStore from '../../../../store/useStore';
import RenderOptions from './RenderOptions';
import { shiftToSelectedCategoryAPI } from '../../lib/designAPI';

const MemoizedRenderOptions = memo(RenderOptions);
const MemoizedEditMenu = memo(EditMenu);

function ActionBar({ generatePDF }) {

    const { loading, designAttributes, uniqueFileName, setUniqueFileName, design, fetchProject, selectedCategory, toggleAttributeValue, pushToUndoStack, handleUndo, handleRedo } = useStore();

    const [openDropdown, setOpenDropdown] = useState(null);
    const [attributeFileName, setAttributeFileName] = useState('');
    const [dialogType, setDialogType] = useState("");
    const [levelOneNest, setLevelOneNest] = useState("");
    const [levelTwoNest, setLevelTwoNest] = useState("");
    const [oldAttributeFileName, setOldAttributeFileName] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const [attributeType, setAttributeType] = useState("normal");
    const [infoOpen, setInfoOpen] = useState(false)
    const [tempSelectedCategory, setTempSelectedCategory] = useState(selectedCategory)
    const [tempDesignAttributes, setTempDesignAttributes] = useState(designAttributes);


    const { id } = useParams()

    const newAttributeTypes = [
        { value: "normal", Description: "A standard attribute with no nested options." },
        { value: "nestedChildLevel1", Description: "Nested inside a parent attribute (Level 1)." },
        { value: "nestedChildLevel2", Description: "Nested inside a Level 1 nested attribute (Level 2)." },
        { value: "nestedParentLevel0", Description: "A parent attribute with nested options (Level 1)." },
        { value: "nestedParentLevel1", Description: "A Level 1 nested attribute with further nested options (Level 2)." }
    ];


    const contextMenuRef = useRef(null);
    const infoContext = useRef(null);


    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                handleUndo(); // Ctrl+Z for Undo
            }
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                handleRedo(); // Ctrl+Y for Redo
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleUndo, handleRedo]);




    const handleToggle = useCallback((key) => {
        pushToUndoStack(); // Push the current state before the change
        toggleAttributeValue(key)

    }, [pushToUndoStack, toggleAttributeValue]);

    const toggleDropdown = useCallback((attribute) => {
        setOpenDropdown(prevDropdown => prevDropdown === attribute ? null : attribute);
    }, []);


    const handleAttributeFileNameChange = useCallback(() => {
        const newInput = attributeFileName;
        let updatedDesignAttributes = JSON.parse(JSON.stringify(designAttributes));

        switch (attributeType) {
            case 'normal':
                updatedDesignAttributes[newInput] = { value: true, path: uniqueFileName };
                break;
            case 'nestedChildLevel1':
                if (levelOneNest) {
                    updatedDesignAttributes[levelOneNest] = {
                        ...updatedDesignAttributes[levelOneNest],
                        options: {
                            ...updatedDesignAttributes[levelOneNest]?.options,
                            [newInput]: { path: uniqueFileName }
                        }
                    };
                }
                break;
            case 'nestedChildLevel2':
                if (levelOneNest && levelTwoNest) {
                    const parentOptions = updatedDesignAttributes[levelOneNest]?.options || {};
                    const nestedLevelOneOption = parentOptions[levelTwoNest];
                    let nestedLevelTwoOptions = nestedLevelOneOption?.options || {};

                    if (nestedLevelTwoOptions[oldAttributeFileName]) {
                        delete nestedLevelTwoOptions[oldAttributeFileName];
                    }

                    nestedLevelTwoOptions[newInput] = { path: uniqueFileName };

                    updatedDesignAttributes[levelOneNest] = {
                        ...updatedDesignAttributes[levelOneNest],
                        options: {
                            ...parentOptions,
                            [levelTwoNest]: {
                                selectedOption: newInput,
                                options: nestedLevelTwoOptions
                            }
                        },
                    };
                }
                break;
            case 'nestedParentLevel0':
                updatedDesignAttributes[newInput] = {
                    selectedOption: "none",
                    options: {
                        none: {
                            path: "none"
                        }
                    },
                };
                break;
            case 'nestedParentLevel1':
                if (levelOneNest) {
                    let newNestedOptions = updatedDesignAttributes[levelOneNest]?.options || {};

                    if (newNestedOptions[oldAttributeFileName]) {
                        delete newNestedOptions[oldAttributeFileName];
                    }

                    newNestedOptions[newInput] = {
                        selectedOption: " ",
                        options: {},
                    };

                    updatedDesignAttributes[levelOneNest] = {
                        selectedOption: updatedDesignAttributes[levelOneNest]?.selectedOption,
                        options: newNestedOptions,
                    };
                }
                break;
        }

        setTempDesignAttributes(updatedDesignAttributes);
    }, [attributeFileName, attributeType, levelOneNest, levelTwoNest, designAttributes, oldAttributeFileName, uniqueFileName]);


    useEffect(() => {
        setTempDesignAttributes(designAttributes)
    }, [attributeType, designAttributes]);


    // useEffect(() => {
    //     console.log("DesignAttributes");
    //     console.log(designAttributes);
    // }, [designAttributes]);

    useEffect(() => {
        setLevelOneNest("");
        setLevelTwoNest("");
    }, [attributeType]);


    useEffect(() => {
        setTempSelectedCategory(selectedCategory);
    }, [selectedCategory]);


    useEffect(() => {
        handleAttributeFileNameChange();
    }, [handleAttributeFileNameChange]);

    const handleToggleContextMenu = useCallback((attribute, subOption, subSubOption) => {
        let toggleOption;

        if (subSubOption && subOption && attribute) {
            toggleOption = `${attribute}>$>${subOption}>$>${subSubOption}`;
        } else if (subOption && attribute) {
            toggleOption = `${attribute}>$>${subOption}`;
        } else if (attribute) {
            toggleOption = attribute;
        } else {
            return;
        }

        setMenuVisible(prevMenuVisible => prevMenuVisible === toggleOption ? false : toggleOption);

        if (!subOption && !subSubOption) {
            setOpenDropdown(false);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (infoContext.current && !infoContext.current.contains(event.target)) {
                setInfoOpen(false);
            }
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setMenuVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const shiftCategory = async () => {
        try {
            const { data } = await shiftToSelectedCategoryAPI(id, {
                selectedCategory: tempSelectedCategory,

            });
            if (data.success) {
                toast.success(data.status);
                fetchProject(id);
            } else {
                toast.error(data.status);
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong, please try again.');
        }
    }

    const memoizedDesignAttributes = useMemo(() => {
        return designAttributes && Object.entries(designAttributes).sort(([a], [b]) => a.localeCompare(b)).map(([attribute, value]) => (
            <div className='relative text-xs' key={attribute}
                onMouseEnter={() => {
                    if (attribute === 'base' || menuVisible) {
                        return;
                    }
                    setOpenDropdown(attribute);
                }}
            >

                {/* single option */}
                <div className={`group flex items-center justify-between pl-2 pr-1 gap-1 select-none border border-gray-400/25 rounded-lg ${attribute === "base" ? "cursor-auto !border-dark/50 opacity-40" : "cursor-pointer"} bg-white`}>
                    <label className='flex items-center gap-2 cursor-pointer'>
                        <input
                            type="checkbox"
                            checked={value?.options ? value?.selectedOption !== 'none' : value.value}
                            onChange={() => {
                                if (attribute === 'base') {
                                    return;
                                }
                                else if (typeof value.value === 'boolean') {
                                    handleToggle(attribute);
                                } else {
                                    if (menuVisible) setMenuVisible(false);
                                    toggleDropdown(attribute);
                                }
                            }}
                            hidden
                        />
                        <div className='flex items-center gap-2'>
                            <span className={`h-5 w-5 flex items-center justify-center rounded-full ${openDropdown === attribute && "border border-dark"} ${typeof value.value === 'boolean' ? (value.value ? "bg-green-300/60" : "bg-design/30") : (value?.selectedOption !== 'none' ? "bg-green-300/60" : "bg-design/30")}`}>
                                {(typeof value.value === 'boolean' && value) && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-[12px] text-dark">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>}

                                {(typeof value.value !== 'boolean') && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-[12px] text-dark ${openDropdown === attribute ? "rotate-180" : "rotate-0"}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>}
                            </span>
                            <span className="py-0 text-dark text-xs cursor-pointer capitalize font-[430]">
                                {attribute}
                            </span>
                        </div>
                    </label>

                    <span onClick={() => handleToggleContextMenu(attribute)} className='hover:bg-dark/5 p-1 rounded-full'>
                        <LucideEllipsisVertical strokeWidth={1.5} className='opacity-0 group-hover:opacity-100 h-4 w-4 flex items-center justify-center' />
                    </span>
                </div>
                {/* further nested options */}
                {openDropdown === attribute && value.options && (
                    <div onMouseLeave={() => setMenuVisible(false)} className="absolute border border-gray-300 rounded-lg mt-1 bg-white z-30 min-w-max py-2">
                        <MemoizedRenderOptions setDialogType={setDialogType} menuVisible={menuVisible} pushToUndoStack={pushToUndoStack} handleToggleContextMenu={handleToggleContextMenu} attribute={attribute} options={value.options} />
                    </div>
                )}
                {(menuVisible === attribute) && (
                    <div className="absolute -right-[40px] border border-gray-300 rounded-lg mt-1 bg-white z-30 min-w-max">
                        <MemoizedEditMenu setDialogType={setDialogType} attributeOption={menuVisible} />
                    </div>
                )}
            </div>
        ));
    }, [designAttributes, openDropdown, menuVisible, handleToggle, toggleDropdown, handleToggleContextMenu, pushToUndoStack]);

    return (
        <Dialog className='rounded-lg col-span-3 overflow-hidden h-[10vh]'>
            <div className="pt-4 flex items-center justify-between px-6 pb-2 select-none"
                onMouseLeave={() => {
                    if (!menuVisible) {
                        setOpenDropdown(null);
                    }
                }}>

                <div className='w-40 flex flex-col items-start gap-1'>
                    <Link to={"/"}> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-gray-700 hover:text-black hover:scale-105 cursor-pointer">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg></Link>
                    <div className='flex items-center gap-1 relative' title='Design info' ref={infoContext}>
                        <p className='logo font-medium text-center text-purple-700 capitalize'>{design.designType}</p>
                        <svg onClick={() => setInfoOpen(!infoOpen)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-blue-400 hover:text-blue-600 hover:scale-105 cursor-pointer">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>

                        {/* designDetails popup */}
                        {infoOpen && <div className='absolute text-md top-full left-[90%] z-40 min-w-52 border-2 border-dark/20 rounded-md p-2 bg-[#FFFFFF]'>
                            <label className='text-sm font-medium'>Design Details</label>
                            {design?.designInfo && Object.entries(design?.designInfo).map(([key, value]) => (
                                <span key={key} className='capitalize text-sm font-medium text-gray-600'>{key.replace(/([A-Z])/g, ' $1').trim()} : {value} </span>
                            ))}

                            <div className='capitalize mt-4 text-sm font-medium'>
                                <label className='text-sm font-medium'>Change Variety</label>


                                {popUpQuestions[design.designType].questions.map((question, index) => (
                                    <div key={index} className='pb-2 text-sm'>
                                        <label className='text-gray-600 text-xs pt-1'>{question.label}</label>
                                        <select
                                            required
                                            value={tempSelectedCategory}
                                            onChange={(e) => {
                                                setTempSelectedCategory(e.target.value);
                                            }}
                                            className="py-1.5 px-1.5 text-xs text-gray-600 bg-white/80 rounded-md border w-full outline-none"
                                        >
                                            {question.options.map((option, index) => (
                                                <option className='hover:bg-white text-xs text-gray-600' value={option.value} key={index}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}

                                <button className='text-sm mt-2 font-medium w-full text-center bg-green-200 py-1 rounded-md' onClick={shiftCategory}>Shift</button>
                            </div>
                        </div>}
                    </div>
                </div>

                <DialogContent className={'bg-theme max-h-[80vh] w-auto overflow-y-scroll p-6 select-none'}>
                    {(dialogType === "add") && (
                        <AddForm
                            attributeFileName={attributeFileName}
                            attributeType={attributeType}
                            levelOneNest={levelOneNest}
                            levelTwoNest={levelTwoNest}
                            setLevelOneNest={setLevelOneNest}
                            setLevelTwoNest={setLevelTwoNest}
                            setOldAttributeFileName={setOldAttributeFileName}
                            setAttributeFileName={setAttributeFileName}
                            newAttributeTypes={newAttributeTypes}
                            setAttributeType={setAttributeType}
                            tempDesignAttributes={tempDesignAttributes}
                        />
                    )}
                    {dialogType === 'update' && <UpdateForm />}
                    {dialogType === 'rename' && <RenameForm />}
                    {dialogType === "delete" && <DeleteForm />}
                    {dialogType === "export" && <ExportForm generatePDF={generatePDF} />}
                </DialogContent>

                <div className="flex gap-1 rounded-md h-[88%] justify-center" ref={contextMenuRef}>
                    {!loading && designAttributes && memoizedDesignAttributes}
                </div>

                <header className='px-5 gap-2 flex items-center justify-end w-40'>
                    <DialogTrigger onClick={() => {
                        setUniqueFileName();
                        setDialogType("add");
                    }} id='exportBtn' className='bg-white hover:border-dark border p-3 rounded-full text-dark font-medium'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </DialogTrigger>
                    <DialogTrigger onClick={() => { setDialogType("export") }} id='exportBtn' className='bg-blue-200 hover:bg-green-300 py-2 rounded-full px-6 text-dark font-medium'>Export</DialogTrigger>
                </header>
            </div>
        </Dialog>
    );
}

ActionBar.propTypes = {
    generatePDF: PropTypes.func.isRequired,
};

export default ActionBar;


