import PropTypes from 'prop-types'

const DeletePageConfirmation = ({ 
    openPageDeleteWarning, 
    handleDelete, 
    setOpenPageDeleteWarning 
}) => {
    if (!openPageDeleteWarning) return null;

    return (
        <div className='rounded-lg bg-red-50 border-red-300/40 border overflow-hidden py-4 px-4 flex flex-col gap-3 mt-4'>
            <h1 className='font-medium'>
                If you delete the page `{openPageDeleteWarning}`, all associated files will also be deleted. 
                Are you sure you want to continue?
            </h1>
            <div className='flex items-center justify-start gap-2'>
                <button 
                    onClick={handleDelete} 
                    type='button' 
                    className='bg-red-300 hover:bg-red-400 border hover:border-black transition-all font-normal py-1.5 px-4 rounded-full'
                >
                    Yes
                </button>
                <button 
                    onClick={() => setOpenPageDeleteWarning('')} 
                    type='button' 
                    className='bg-white hover:bg-blue-50 border hover:border-black font-normal py-1.5 px-4 rounded-full'
                >
                    No
                </button>
            </div>
        </div>
    );
};

DeletePageConfirmation.propTypes = {
    openPageDeleteWarning: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
    handleDelete: PropTypes.func.isRequired,
    setOpenPageDeleteWarning: PropTypes.func.isRequired,
};


export default DeletePageConfirmation;