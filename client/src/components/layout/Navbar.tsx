import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import filePath from '../../utils/filePath.js';
import { designTypes } from '../../constants/index.jsx';
import useAppStore from '../../store/useAppStore.js';
import { createEmptyProjectAPI, getUserAPI, logoutAPI } from '../../lib/globalAPI.js';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, LogOut, User } from 'lucide-react';
import { IUser } from '@/types/user.types.js';

const Navbar = () => {
    const { user, setUser } = useAppStore();
    const [emptyProjectData, setEmptyProjectData] = useState({
        name: "",
        type: "",
        description: ""
    });

    const location = useLocation();
    const navigate = useNavigate();

    const fetchLoggedUser = useCallback(async () => {
        try {
            const response = await getUserAPI();
            if (response.success) {
                setUser(response.user as IUser);
            }
            else {
                setUser({} as IUser);
            }
        } catch (error) {
            console.log(error);
        }
    }, [setUser]);

    const logoutUser = useCallback(async () => {
        try {
            const data = await logoutAPI();
            if (data.success) {
                setUser({} as IUser);
                toast.success("You logged out successfully.")
            }
            else {
                toast.error(data.status)
            }
        } catch (error) {
            console.log(error);
        }
    }, [setUser]);

    useEffect(() => {
        fetchLoggedUser();
    }, [location.pathname, fetchLoggedUser]);

    const isAuthenticated = user && user.username ? true : false;

    // useEffect(() => {
    //     const tempDesignInfo = designTypes[selectedDesignType]?.questions.reduce((acc, question) => {
    //         acc[question.name] = question.options[0];
    //         return acc;
    //     }, {}) || {};

    //     setDesignInfo(tempDesignInfo);
    // }, [selectedDesignType]);

    const createEmptyProject = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = await createEmptyProjectAPI(emptyProjectData);

            if (data.success) {
                toast.success(data.status);
                const projectId = data.project?._id;
                navigate(`/projects/${projectId}`);
            } else {
                toast.error(data.status);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to create design.');
        }
    };

    const handleProjectInputChange = (field: string, value: string) => {
        setEmptyProjectData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <>
            <Dialog>
                <DialogContent className="max-w-md">
                    <DialogTitle className="text-center">Create A New Design</DialogTitle>
                    <DialogDescription>
                        Fill out the form below to create a new design project.
                    </DialogDescription>
                    <form onSubmit={createEmptyProject} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={emptyProjectData.name}
                                onChange={(e) => handleProjectInputChange('name', e.target.value)}
                                placeholder="Enter project name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Project Type</Label>
                            <Select
                                value={emptyProjectData.type}
                                onValueChange={(value) => handleProjectInputChange('type', value)}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select project type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(designTypes).map(type => (
                                        <SelectItem key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Project Description</Label>
                            <Textarea
                                id="description"
                                value={emptyProjectData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleProjectInputChange('description', e.target.value)}
                                placeholder="Describe your project"
                                className="min-h-24"
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" className="w-full">Create Project</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>

                <nav className="border-b-2 border-dark">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="w-40">
                            <Link to={"/"} className="text-lg font-medium text-purple-700">
                                GAD Builder
                            </Link>
                        </div>

                        <div className="flex space-x-4">
                            <Button
                                variant={location.pathname === '/' ? "secondary" : "ghost"}
                                asChild
                                className="font-medium"
                            >
                                <Link to="/">Home</Link>
                            </Button>
                        </div>

                        <div className="flex items-center space-x-3">
                            {isAuthenticated && user ? (
                                <>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="rounded-full h-10 w-10 p-0">
                                                <img
                                                    src={`${filePath}/${user.dp}`}
                                                    alt={user.username}
                                                    className="h-full w-full rounded-full"
                                                />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem disabled className="flex justify-between">
                                                <User className="mr-2 h-4 w-4" />
                                                <span>{user.username}</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={logoutUser}>
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Logout</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <DialogTrigger asChild>
                                        <Button size="sm" className="rounded-full">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add
                                        </Button>
                                    </DialogTrigger>
                                </>
                            ) : (
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link to="/sign-in">Login</Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link to="/sign-up">Register</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </Dialog>
        </>
    );
};

export default Navbar;