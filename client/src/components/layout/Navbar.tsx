import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import filePath from '../../utils/filePath.js';
import { v4 as uuidv4 } from 'uuid';
import { designTypes, initialSelectedCategories, initialStructure } from '../../constants/index.jsx';
import useStore from '../../store/useStore.js';
import { createEmptyDesignAPI, getUserAPI, logoutAPI } from '../../lib/globalAPI.js';
import {
    DialogContent,
    Dialog,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '../ui/dialog';


const Navbar = () => {
    const { user, setUser } = useStore();
    const [isAvatarOpen, setIsAvatarOpen] = useState(false);
    // const [baseFile, setBaseFile] = useState();

    const [selectedDesignType, setSelectedDesignType] = useState("motor");
    const [designInfo, setDesignInfo] = useState({})

    const location = useLocation();
    const navigate = useNavigate();

    const fetchLoggedUser = useCallback(async () => {
        try {
            const { data } = await getUserAPI();
            if (data.success) {
                setUser(data.user);
            }
            else {
                setUser({});
            }
        } catch (error) {
            console.log(error);
        }
    }, [setUser])

    const logoutUser = useCallback(async () => {
        try {
            const { data } = await logoutAPI();
            if (data.success) {
                setUser({});
                toast.success("You logged out successfully.")
            }
            else {
                toast.error(data.status)
            }
        } catch (error) {
            console.log(error);
        }
    }, [setUser])

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsAvatarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        fetchLoggedUser();
    }, [location.pathname, fetchLoggedUser]);

    const isAuthenticated = user.username ? true : false;

    useEffect(() => {
        const tempDesignInfo = designTypes[selectedDesignType].questions.reduce((acc, question) => {
            acc[question.name] = question.options[0];
            return acc;
        }, {});

        setDesignInfo(tempDesignInfo);
    }, [selectedDesignType])

    useEffect(() => {
        console.log(designInfo);

    }, [designInfo])

    const createEmptyDesign = async (e) => {
        e.preventDefault();

        try {
            const uniqueFolder = await uuidv4();

            const { data } = await createEmptyDesignAPI({
                designType: selectedDesignType,
                selectedCategory: initialSelectedCategories[selectedDesignType].selectedCategory,
                designInfo: designInfo,
                folder: uniqueFolder,
                selectedPage: 'gad',
                structure: initialStructure[selectedDesignType]
            });

            if (data.success) {
                toast.success(data.status);
                navigate(`/designs/${data.id}`);
            } else {
                toast.error(data.status);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to create design.');
        }
    };

    return (
        <Dialog className='rounded-lg col-span-3 overflow-hidded'>
            <DialogContent className={'bg-action-bar h-[80vh] overflow-y-scroll max-w-[700px] min-w-[400px] p-8 pb-20'}>
                <form onSubmit={createEmptyDesign} className='flex flex-col gap-2'>
                    <DialogTitle className="text-dark font-semibold py-2 text-center pb-4">Create A New Design</DialogTitle>
                    <DialogTrigger className='absolute top-3 right-3 shadow-none'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </DialogTrigger>
                    <DialogDescription className='group flex flex-col gap-4'>
                        <div>
                            <label className='text-black text-base font-medium'>Select Type of design</label>
                            <div className=' flex items-center gap-3 py-2.5 rounded-md px-2'>
                                {Object.entries(designTypes).map(([key]) => (
                                    <div
                                        onClick={() => setSelectedDesignType(key)}
                                        key={key}
                                        className={`h-32 w-32 cursor-pointer hover:bg-light/70 hover:scale-105 rounded-2xl flex justify-center items-center text-dark ${key === selectedDesignType ? "border border-dark bg-light" : "border border-dark/20 bg-light/50"}`}
                                    >
                                        <span className='font-medium text-lg capitalize text-zinc-600'>{key}</span>
                                    </div>
                                ))}
                            </div>
                        </div>


                        <div className='flex gap-4 flex-col'>
                            {designTypes[selectedDesignType].questions.map((question, indx) => (
                                <div key={indx}>
                                    <label className='text-black text-base font-medium'>{question.label}</label>
                                    <select
                                        required
                                        name={question.name}
                                        value={designInfo?.[question.name]}
                                        onChange={(e) => {
                                            setDesignInfo({
                                                ...designInfo,
                                                [e.target.name]: e.target.value
                                            });
                                        }}
                                        className="py-3 px-2 font-medium bg-white/80 rounded-md border w-full text-base outline-none text-gray-700 cursor-pointer"
                                    >
                                        {question.options.map((option, index) => (
                                            <option className='text-base text-gray-700 font-medium ' value={option} key={index}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>

                    </DialogDescription>
                    <button type='submit' className='bg-green-200 hover:bg-green-300 py-2 px-3 rounded-full text-dark font-medium mt-4'>Create</button>
                </form>
            </DialogContent>

            <nav className="border-b-2 border-dark">
                <div className="sm:text-base text-sm  container mx-auto px-4 py-5 font-medium flex items-center justify-between">
                    <div className='w-40'>
                        <Link to={"/"} className='logo text-lg font-medium text-center text-purple-700'>Flexy Draft</Link>
                    </div>
                    <div className="flex space-x-4 ">
                        <Link to="/" className={`user.usernamehover:text-blue-200 ${location.pathname == '/' && 'border-b-2 border-b-dark/40'}`}>
                            Home
                        </Link>
                        {/* <Link to="/designs" className={`user.usernamehover:text-blue-200 ${location.pathname == '/designs' && 'border-b-2 border-b-dark/40'}`}>
                            My Designs
                        </Link> */}
                    </div>
                    <div className="flex space-x-4">
                        {isAuthenticated ? (
                            <div className='relative'
                                ref={dropdownRef}
                            >
                                <div className='flex items-center justify-center gap-2'>
                                    <div onClick={() => { setIsAvatarOpen(!isAvatarOpen) }} className='w-10 h-10 rounded-full overflow-hidden cursor-pointer'>
                                        <img src={filePath + user.dp} alt="" />
                                    </div>
                                    <h1></h1>
                                    <DialogTrigger className='flex items-center justify-between gap-1 rounded-full bg-blue-200 cursor-pointer hover:bg-blue-300 px-6 py-2'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        Add
                                    </DialogTrigger>
                                </div>
                                {isAvatarOpen && (
                                    <div className='absolute right-0 bg-theme py-6 px-4 rounded-md border border-gray-300 top-11 flex flex-col gap-3 w-60'>
                                        <div>
                                            <div className='text-sm text-gray-500'>Username</div>
                                            <div className='my-0'>{user.username}</div>
                                        </div>
                                        <button className='bg-red-300 px-3 py-1.5 rounded-full text-sm' onClick={logoutUser}>Logout</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className='font-medium flex gap-2 '>
                                <Link to='/sign-in' className='bg-green-200 hover:bg-green-300 py-2 px-4 rounded-full text-dark font-medium'>Login</Link>
                                <Link to='/sign-up' className='bg-blue-200 hover:bg-blue-300 py-2 px-4 rounded-full text-dark font-medium'>Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </Dialog >
    );
};

export default Navbar;



