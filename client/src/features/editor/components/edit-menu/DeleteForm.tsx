import { toast } from 'sonner';
import useAppStore from '../../../../store/useAppStore';
import { DialogDescription, DialogTrigger, DialogTitle } from '../../../../components/ui/dialog';
import { IStructure } from '@/types/design.types';
import { useModel } from '@/contexts/ModelContext';
import { IComponent, IComponents, INormalComponent, INestedParentLevel1, IFileInfo } from '@/types/project.types';


function DeleteForm() {

    const { menuOf, structure, setStructureElements, setUndoStack, setRedoStack } = useAppStore();
    const { deleteComponent } = useModel();
    const tempcomponents = JSON.parse(JSON.stringify(structure.components)) as IComponents;

    const getUpdatedValue = () => {
        if (menuOf.length === 3) {
            const component = tempcomponents[menuOf[0]] as IComponent;
            const nestedComponent = component.options[menuOf[1]] as INestedParentLevel1;
            return nestedComponent.options[menuOf[2]];
        } else if (menuOf.length === 2) {
            const component = tempcomponents[menuOf[0]] as IComponent;
            return component.options[menuOf[1]];
        }
        return tempcomponents[menuOf[0]];
    };

    const updatedValue = getUpdatedValue();

    const deleteValue = () => {
        if (menuOf.length === 3) {
            const component = tempcomponents[menuOf[0]] as IComponent;
            const nestedComponent = component.options[menuOf[1]] as INestedParentLevel1;
            if (nestedComponent.selected === menuOf[menuOf.length - 1]) {
                nestedComponent.selected = " ";
            }
            delete nestedComponent.options[menuOf[menuOf.length - 1]];
        } else if (menuOf.length === 2) {
            const component = tempcomponents[menuOf[0]] as IComponent;
            if (component.selected === menuOf[menuOf.length - 1]) {
                component.selected = "none";
            }
            delete component.options[menuOf[menuOf.length - 1]];
        } else if (menuOf.length === 1) {
            delete tempcomponents[menuOf[menuOf.length - 1]];
        }

        return tempcomponents;
    };

    function extractPaths() {
        const paths: string[] = [];

        function traverse(current: IComponent | INormalComponent | INestedParentLevel1 | IFileInfo | undefined) {
            if (!current || typeof current !== 'object') return;

            // Check if it's a component with fileId
            if ('fileId' in current && current.fileId && current.fileId !== "none") {
                paths.push(current.fileId);
            }

            // If it's a component with options, traverse them
            if ('options' in current && current.options) {
                Object.values(current.options).forEach(option => {
                    traverse(option as IComponent | INormalComponent | INestedParentLevel1 | IFileInfo);
                });
            }
        }

        traverse(updatedValue as IComponent | INormalComponent | INestedParentLevel1 | IFileInfo);
        return paths;
    }

    const handleDelete = async () => {

        const updatedComponents = deleteValue()

        const updatedStructure: IStructure = {
            ...structure,
            components: updatedComponents
        }

        const body = {
            structure: updatedStructure,
            filesToDelete: extractPaths()
        }

        try {
            setUndoStack([]);
            setRedoStack([]);
            const data = await deleteComponent(body);

            if (data && data.success) {
                setStructureElements({ updatedComponents: tempcomponents })
                toast.success(data.status);
                (document.querySelector("#close") as HTMLElement)?.click();
            }
            else {
                toast.error(data ? data.status : "Error deleting component.");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong.");
        }
    }


    return (
        <div className='flex flex-col gap-1 w-[350px]'>
            <DialogTitle className="text-dark font-medium capitalize text-xl pt-1">Delete <span className='text-red-700'>{menuOf[menuOf.length - 1]}</span>?</DialogTitle>
            <h1 className='pb-2'>This action cannot be undone. It will also delete all associated files. Are you sure?</h1>
            <div className='flex items-center justify-start gap-2 text-sm'>
                <button onClick={handleDelete} type='button' className='font-medium hover:bg-red-400/75 hover:border-dark border bg-red-300 py-1.5 px-4 rounded-md'>Yes</button>
                <button onClick={() => {
                    document.getElementById("close")?.click();
                }} type='button' className='bg-white hover:border-dark border hover:bg-white/60 font-normal py-1.5 px-4 rounded-md'>Cancel</button>
            </div>
            <DialogTrigger id='close' className='absolute top-3 right-3 shadow-none'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </DialogTrigger>
            <DialogDescription hidden />
        </div>
    )
}

export default DeleteForm