import PropTypes from 'prop-types'


const PageList = ({
    tempPages,
    choosenPage,
    fileExistenceStatus,
    setChoosenPage,
    openDeleteConfirmation
}) => {
    return (
        <div>
            <p className='font-medium mb-3 capitalize'>Pages</p>
            <div className="grid grid-cols-3 gap-2">
                {Object.keys(tempPages).map((pageName) => (
                    <div
                        key={pageName}
                        className={`text-center px-4 uppercase transition-none font-medium cursor-pointer relative border 
                            ${fileExistenceStatus[pageName] ? "bg-exists/30" : "bg-notExists/20"} 
                            ${choosenPage === pageName ? 'border-black' : 'border-transparent'}`}
                    >
                        <p
                            className="mx-4 py-3"
                            onClick={() => setChoosenPage(pageName)}
                        >
                            {pageName}
                        </p>

                        {pageName !== 'gad' && (
                            <svg
                                onClick={() => openDeleteConfirmation(pageName)}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-5 rounded-full cursor-pointer transition-all absolute right-2 top-2 text-red-700"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// const memorizedPageList = React.memo(PageList)
PageList.propTypes = {
    tempPages: PropTypes.objectOf(PropTypes.any).isRequired,
    choosenPage: PropTypes.string.isRequired,
    fileExistenceStatus: PropTypes.objectOf(PropTypes.bool).isRequired,
    setChoosenPage: PropTypes.func.isRequired,
    openDeleteConfirmation: PropTypes.func.isRequired,
};

export default PageList;