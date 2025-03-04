import { useState } from 'react';
import { DialogTitle, DialogTrigger } from '@radix-ui/react-alert-dialog';
import RenameInput from './update/RenameInput';
import { renameAttributeAPI } from '../../lib/designAPI';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import useStore from '../../../../store/useStore';

const RenameForm = () => {
    const { menuOf, designAttributes, setDesignAttributes, generateStructure } = useStore();

    const [newAttributeName, setNewAttributeName] = useState(menuOf[menuOf.length - 1]);
    const [renameLoading, setRenameLoading] = useState(false);
    const { id } = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newAttributeName.trim()) return;

        setRenameLoading(true);

        try {
            // Create a deep copy of designAttributes
            const updatedAttributes = JSON.parse(JSON.stringify(designAttributes));

            const renameAttribute = (attributes, keys, newKey) => {
                if (keys.length === 1) {
                    const oldKey = keys[0];
                    if (attributes[oldKey]) {
                        attributes[newKey] = attributes[oldKey];
                        delete attributes[oldKey];
                    }
                } else if (keys.length === 2) {
                    const [category, option] = keys;
                    if (attributes[category] && attributes[category].options) {
                        if (attributes[category].options[option]) {
                            attributes[category].options[newKey] = attributes[category].options[option];
                            delete attributes[category].options[option];
                        }

                        // Update selectedOption if necessary
                        if (attributes[category].selectedOption === option) {
                            attributes[category].selectedOption = newKey;
                        }
                    }
                } else if (keys.length === 3) {
                    const [category, subcategory, option] = keys;
                    if (attributes[category] && attributes[category].options &&
                        attributes[category].options[subcategory] &&
                        attributes[category].options[subcategory].options) {

                        attributes[category].options[subcategory].options[newKey] = attributes[category].options[subcategory].options[option];
                        delete attributes[category].options[subcategory].options[option];

                        // Update selectedOption if necessary
                        if (attributes[category].options[subcategory].selectedOption === option) {
                            attributes[category].options[subcategory].selectedOption = newKey;
                        }
                    }
                }
            };

            renameAttribute(updatedAttributes, menuOf, newAttributeName);


            let structure = generateStructure({ updatedAttributes: updatedAttributes })

            const body = {
                structure: structure
            }

            const { data } = await renameAttributeAPI(id, body);

            if (data.success) {
                setDesignAttributes(updatedAttributes)
                toast.success(data.status);
                document.querySelector("#close").click();
            }
            else {
                toast.error(data.status);
            }
        }

        catch (error) {
            console.error('Failed to rename attribute:', error);
        }

        setRenameLoading(false);

    };

    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
            <DialogTitle className="text-dark font-medium py-2">Rename Attribute</DialogTitle>
            <DialogTrigger id='close' className='absolute top-3 right-3 shadow-none'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </DialogTrigger>
            <RenameInput newAttributeName={newAttributeName} setNewAttributeName={setNewAttributeName} />
            <button disabled={renameLoading} type='submit' className={`flex items-center justify-center gap-3 hover:bg-green-300 py-2 px-3 rounded-full text-dark font-medium mt-4 relative ${renameLoading ? "bg-blue-300/60 hover:bg-blue-300/60" : "bg-blue-300"}`}>Rename
                {
                    renameLoading && <div className='absolute right-4 h-4 w-4 rounded-full bg-transparent border-t-transparent border-[2px] border-green-900 animate-spin' />
                }
            </button>
        </form>
    );
};

export default RenameForm;