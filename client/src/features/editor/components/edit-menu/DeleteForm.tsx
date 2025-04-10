import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import useAppStore from '../../../../store/useAppStore';
import { DialogDescription, DialogTrigger, DialogTitle } from '../../../../components/ui/dialog';
import { deletecomponentsAPI } from '../../lib/designAPI';


function DeleteForm() {

    const { menuOf, components, setComponents, generateHierarchy, setUndoStack, setRedoStack } = useAppStore();
    const { id } = useParams();

    const tempcomponents = JSON.parse(JSON.stringify(components));

    const updatedValue = menuOf.length === 3 ? tempcomponents[menuOf[0]].options[menuOf[1]].options[menuOf[2]] : menuOf.length === 2 ? tempcomponents[menuOf[0]].options[menuOf[1]] : tempcomponents[menuOf[0]];


    const deleteValue = () => {
        if (menuOf.length === 3) {
            if (tempcomponents[menuOf[0]].options[menuOf[1]].selected === menuOf[menuOf.length - 1]) {
                tempcomponents[menuOf[0]].options[menuOf[1]].selected = " "
            }
            delete tempcomponents[menuOf[0]].options[menuOf[1]].options[menuOf[menuOf.length - 1]];
        } else if (menuOf.length === 2) {
            if (tempcomponents[menuOf[0]].selected === menuOf[menuOf.length - 1]) {
                tempcomponents[menuOf[0]].selected = "none"
            }
            delete tempcomponents[menuOf[0]].options[menuOf[menuOf.length - 1]];
        } else if (menuOf.length === 1) {
            delete tempcomponents[menuOf[menuOf.length - 1]];
        }

        return tempcomponents;
    };

    function extractPaths() {
        let paths = [];

        function traverse(current) {
            if (typeof current === 'object' && current !== null) {
                if (current.fileId&& current.fileId!== "none") {
                    paths.push(current.path);
                }
                for (let key in current) {
                    if (current[key]) {
                        traverse(current[key]);
                    }
                }
            }
        }

        traverse(updatedValue);
        return paths;
    }

    const handleDelete = async () => {

        let attributes = deleteValue()
        let structure = generateHierarchy({
            updatedComponents: attributes
        })
        
        
        const body = {
            structure: structure,
            filesToDelete: extractPaths()
        }

        try {
            setUndoStack([]);
            setRedoStack([]);
            const { data } = await deletecomponentsAPI(id, body);
            if (data.success) {
                setComponents(tempcomponents)
                toast.success(data.status);
                document.querySelector("#close").click();
            }
            else {
                toast.error(data.status);
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong. F");
        }
    }


    return (
        <div className='flex flex-col gap-1 w-[350px]'>
            <DialogTitle className="text-dark font-medium capitalize text-xl pt-1">Delete <span className='text-red-700'>{menuOf[menuOf.length - 1]}</span>?</DialogTitle>
            <h1 className='pb-2'>This action cannot be undone. It will also delete all associated files. Are you sure?</h1>
            <div className='flex items-center justify-start gap-2 text-sm'>
                <button onClick={handleDelete} type='button' className='font-medium hover:bg-red-400/75 hover:border-dark border bg-red-300 py-1.5 px-4 rounded-md'>Yes</button>
                <button onClick={() => {
                    document.getElementById("close").click();
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