import PropTypes from 'prop-types'
import { useEffect } from 'react';
import useAppStore from '../../../../store/useAppStore';
import { DialogTrigger } from '@/components/ui/dialog';


const EditMenu = ({ componentOption, setDialogType }) => {

    const { menuOf, setMenuOf, setUniqueFileName } = useAppStore()

    useEffect(() => {
        const ComponentPath = componentOption.split(">$>");
        setMenuOf(ComponentPath);
    }, [componentOption, setMenuOf])

    if (menuOf.length === 1) {
        return (
            <div className="flex flex-col gap-1 p-1 w-28 min-w-max font-medium">
                <div className='rotate-45 rounded-tl-sm h-4 w-4 bg-white border-t border-l border-gray-300  absolute -top-[8.5px] left-1/2 -translate-x-1/2 -z-10' />
                <DialogTrigger onClick={() => {
                    setDialogType('rename');
                }} className='text-left flex bg-dark/5 px-2 py-1.5 rounded-md items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5  mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                    </svg>
                    Rename</DialogTrigger>
                <DialogTrigger
                    onClick={() => {
                        setDialogType('update');
                    }} className='text-left flex bg-dark/5 px-2 py-1.5 rounded-md items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5  mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                    </svg>
                    Update</DialogTrigger>
                <DialogTrigger onClick={() => {
                    setDialogType('delete');
                }} className='text-left flex bg-dark/5 px-2 py-1.5 rounded-md items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5  mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z" />
                    </svg>
                    Delete</DialogTrigger>
            </div >
        )
    }

    else {
        return (
            <div className="flex flex-col gap-1 p-1 w-28 min-w-max font-medium">
                <div className='rotate-45 rounded-bl-sm h-4 w-4 bg-white border-b border-l border-gray-300  absolute -left-[8.5px] top-1/2 -translate-y-1/2 -z-10' />
                <DialogTrigger onClick={() => {
                    setDialogType('rename');
                }} className='text-left flex bg-dark/5 px-2 py-1.5 rounded-md items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5  mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                    </svg>
                    Rename</DialogTrigger>
                <DialogTrigger
                    onClick={() => {
                        setUniqueFileName();
                        setDialogType('update');
                    }} className='text-left flex bg-dark/5 px-2 py-1.5 rounded-md items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5  mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                    </svg>
                    Update</DialogTrigger>
                <DialogTrigger onClick={() => {
                    setDialogType('delete');
                }} className='text-left flex bg-dark/5 px-2 py-1.5 rounded-md items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5  mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z" />
                    </svg>
                    Delete</DialogTrigger>
            </div >
        );

    }

};

EditMenu.propTypes = {
    componentOption: PropTypes.string.isRequired,
    setDialogType: PropTypes.func.isRequired
};

export default EditMenu;
