import { useState } from 'react';
import { DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import RenameInput from './update-form/RenameInput';
import { toast } from 'sonner';
import useAppStore from '../../../../store/useAppStore';
import { useModel } from '@/contexts/ModelContext';
import { IStructure } from '@/types/design.types';
import { IComponents } from '@/types/project.types';
import { X } from 'lucide-react';

const RenameForm = () => {
    const { menuOf, structure, setStructureElements } = useAppStore();

    const { renameComponent } = useModel()

    const [newComponentName, setNewComponentName] = useState(menuOf[menuOf.length - 1]);
    const [renameLoading, setRenameLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComponentName.trim()) return;

        setRenameLoading(true);

        try {
            // Create a deep copy of components
            const updatedComponents = JSON.parse(JSON.stringify(structure.components));

            const renameComponentFunc = (components: IComponents, keys, newKey) => {
                if (keys.length === 1) {
                    const oldKey = keys[0];
                    if (components[oldKey]) {
                        components[newKey] = components[oldKey];
                        delete components[oldKey];
                    }
                } else if (keys.length === 2) {
                    const [category, option] = keys;
                    if (components[category] && components[category].options) {
                        if (components[category].options[option]) {
                            components[category].options[newKey] = components[category].options[option];
                            delete components[category].options[option];
                        }

                        // Update selected if necessary
                        if (components[category].selected === option) {
                            components[category].selected = newKey;
                        }
                    }
                } else if (keys.length === 3) {
                    const [category, subcategory, option] = keys;
                    if (components[category] && components[category].options &&
                        components[category].options[subcategory] &&
                        components[category].options[subcategory].options) {

                        components[category].options[subcategory].options[newKey] = components[category].options[subcategory].options[option];
                        delete components[category].options[subcategory].options[option];

                        // Update selected if necessary
                        if (components[category].options[subcategory].selected === option) {
                            components[category].options[subcategory].selected = newKey;
                        }
                    }
                }
            };

            renameComponentFunc(updatedComponents, menuOf, newComponentName);


            // let structure = generateHierarchy({ updatedComponents: updatedComponents })

            const updatedStructure: IStructure = {
                ...structure,
                components: updatedComponents
            }
            const body = {
                structure: updatedStructure
            }

            const data = await renameComponent(body);

            if (data && data.success) {
                setStructureElements({ updatedComponents: updatedComponents })
                toast.success(data.status);
                (document.querySelector("#close") as HTMLElement)?.click();
                // await refreshContent();
            }
            else {
                toast.error(data ? data.status : "Error renaming component.");
            }
        }

        catch (error) {
            console.error('Failed to rename component:', error);
        }

        setRenameLoading(false);

    };

    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
            <DialogTitle className="text-dark font-medium py-2">Rename Component</DialogTitle>
            <DialogTrigger id='close' className='absolute top-3 right-3 shadow-none'>
                <X className='size-6'/>
            </DialogTrigger>
            <RenameInput newComponentName={newComponentName} setNewComponentName={setNewComponentName} />
            <button disabled={renameLoading} type='submit' className={`flex items-center justify-center gap-3 hover:bg-green-300 py-2 px-3 rounded-full text-dark font-medium mt-4 relative ${renameLoading ? "bg-blue-300/60 hover:bg-blue-300/60" : "bg-blue-300"}`}>Rename
                {
                    renameLoading && <div className='absolute right-4 h-4 w-4 rounded-full bg-transparent border-t-transparent border-[2px] border-green-900 animate-spin' />
                }
            </button>
        </form>
    );
};

export default RenameForm;