import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { designTypes } from '../../constants/index.jsx';
import { createEmptyProjectAPI } from '../../lib/globalAPI.js';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
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
import { LogOut, User, Menu, Sun, Moon, Plus, Upload, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.js';
import { NotificationBell } from '@/features/notification/components/NotificationBell';
import { NotificationList } from '@/features/notification/components/NotificationList';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Role } from '@/types/user.types';
import { Switch } from '@/components/ui/switch';
import { CommandDialog, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { cn } from '@/lib/utils';

// Theme toggle logic (Tailwind dark mode)
function useTheme() {
    const [isDark, setIsDark] = useState(() =>
        typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
    );
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);
    return { isDark, setIsDark };
}

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [emptyProjectData, setEmptyProjectData] = useState({ name: '', type: '', description: '' });
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const { isDark, setIsDark } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const navRef = useRef<HTMLDivElement>(null);

    // Accessibility: close mobile menu on route change
    useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

    // Helper: Navigation links based on role, with sublinks
    // Use a more permissive type for navLinks
    interface NavSublink { label: string; to: string; }
    interface NavLinkBase { label: string; show: boolean; }
    type NavLink = (NavLinkBase & { to: string; sublinks?: undefined }) | (NavLinkBase & { sublinks: NavSublink[]; to?: undefined });

    const navLinks: NavLink[] = [
        { label: 'Home', to: '/', show: true },
        { label: 'Components', to: '/components', show: isAuthenticated },
        { label: 'Admin Dashboard', to: '/admin-dashboard', show: isAuthenticated && user?.role === Role.ADMIN },
        { label: 'DH Dashboard', to: '/dh-dashboard', show: isAuthenticated && user?.designation === Role.DEPARTMENT_HEAD },

        // Approvals with dynamic sublinks
        ...(isAuthenticated && (user?.role === Role.ADMIN || user?.designation === Role.DEPARTMENT_HEAD)
            ? [
                user?.role === Role.ADMIN
                    ? {
                        label: 'Approvals', show: true, sublinks: [
                            { label: 'Pending Users', to: '/admin-dashboard?tab=pending' },
                            { label: 'All Users', to: '/admin-dashboard?tab=users' },
                            { label: 'Admin Users', to: '/admin-dashboard?tab=admins' },
                        ]
                    }
                    : {
                        label: 'Approvals', show: true, sublinks: [
                            { label: 'Pending Users', to: '/dh-dashboard?tab=pending' },
                            { label: 'All Users', to: '/dh-dashboard?tab=users' },
                        ]
                    }
            ]
            : []),
    ];

    // Quick actions
    const quickActions: { label: string, icon: React.ReactNode, onClick: () => void, show: boolean }[] = [
        // { label: 'New Component', icon: <Plus className="w-4 h-4" />, onClick: () => setShowCreateDialog(true), show: isAuthenticated },
        // { label: 'Upload', icon: <Upload className="w-4 h-4" />, onClick: () => toast.info('Upload coming soon!'), show: isAuthenticated },
    ];

    // Create Project Dialog
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const createEmptyProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await createEmptyProjectAPI(emptyProjectData);
            if (data.success) {
                toast.success(data.status);
                const projectId = data.project?._id;
                navigate(`/projects/${projectId}`);
                setShowCreateDialog(false);
            } else {
                toast.error(data.status);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to create design.');
        }
    };
    const handleProjectInputChange = (field: string, value: string) => {
        setEmptyProjectData(prev => ({ ...prev, [field]: value }));
    };

    // Command palette (global search)
    const handleCommandSelect = (item: string) => {
        // Example: navigate to selected item
        if (item.startsWith('/')) navigate(item);
        setSearchOpen(false);
    };

    // Keyboard shortcut for search (Ctrl+K)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setSearchOpen((v) => !v);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Accessibility: focus trap for mobile menu
    useEffect(() => {
        if (mobileMenuOpen && navRef.current) {
            navRef.current.focus();
        }
    }, [mobileMenuOpen]);

    return (
        <>
            {/* Create Project Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-md">
                    <DialogTitle className="text-center">Create A New Component</DialogTitle>
                    <DialogDescription>Fill out the form below to create a new component.</DialogDescription>
                    <form onSubmit={createEmptyProject} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Component Name</Label>
                            <Input id="name" value={emptyProjectData.name} onChange={(e) => handleProjectInputChange('name', e.target.value)} placeholder="Enter component name" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Component Type</Label>
                            <Select value={emptyProjectData.type} onValueChange={(value) => handleProjectInputChange('type', value)}>
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select component type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(designTypes).map(type => (
                                        <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={emptyProjectData.description} onChange={(e) => handleProjectInputChange('description', e.target.value)} placeholder="Describe your component" className="min-h-24" />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full">Create</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Command Palette (Global Search) */}
            <CommandDialog className='w-3xl' open={searchOpen} onOpenChange={setSearchOpen} title="Quick Search" description="Search components, users, pages...">
                <div className="w-full mx-auto">
                    <CommandInput placeholder="Type a command or search..." className="w-full min-w-[400px] md:min-w-[600px] lg:min-w-[800px] xl:min-w-[1000px]" />
                </div>
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Navigation">
                        {navLinks.filter(link => link.show).map(link => (
                            'sublinks' in link && link.sublinks ? (
                                <div key={link.label}>
                                    {link.sublinks.map((sublink) => (
                                        <CommandItem key={sublink.to} onSelect={() => handleCommandSelect(sublink.to)}>
                                            {link.label} / {sublink.label}
                                            {/* Optionally add shortcut or icon */}
                                        </CommandItem>
                                    ))}
                                </div>
                            ) : (
                                <CommandItem key={link.to!} onSelect={() => handleCommandSelect(link.to!)}>
                                    {link.label}
                                    {/* Optionally add shortcut or icon */}
                                </CommandItem>
                            )
                        ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Quick Actions">
                        {quickActions.filter(a => a.show).map(action => (
                            <CommandItem key={action.label} onSelect={action.onClick}>
                                {action.icon} {action.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>

            {/* Navbar */}
            <nav
                className={cn(
                    'backdrop-blur-lg h-20 bg-white/70 dark:bg-dark/80 border-b border-black/10 dark:border-white/10 sticky top-0 z-50 shadow-xs transition-all',
                    'supports-[backdrop-filter]:bg-white/60',
                )}
                aria-label="Main navigation"
            >
                <div className="max-w-7xl h-full mx-auto px-4 md:px-10 py-2 flex items-center justify-between gap-2">
                    {/* Left: Logo & Desktop Nav */}
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold  tracking-tight select-none focus:outline-none" aria-label="Home">
                            <span className="rounded-lg bg-zinc-200 to-blue-300 px-2 py-1">CS</span>
                        </Link>
                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex gap-1 ml-4">
                            {navLinks.filter(link => link.show).map(link => (
                                'sublinks' in link && link.sublinks ? (
                                    <DropdownMenu key={link.label}>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="font-medium px-4 rounded-lg flex items-center gap-1">
                                                {link.label} <ChevronDown className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            <DropdownMenuLabel>{link.label}</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {link.sublinks.map((sublink) => (
                                                <DropdownMenuItem asChild key={sublink.to}>
                                                    <Link to={sublink.to}>{sublink.label}</Link>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Button
                                        key={link.to}
                                        variant={location.pathname === link.to ? 'secondary' : 'ghost'}
                                        asChild
                                        className="font-medium px-4 rounded-lg transition-all duration-150 focus-visible:ring-2 focus-visible:ring-purple-400"
                                    >
                                        <Link to={link.to!} tabIndex={0}>{link.label}</Link>
                                    </Button>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Center: Search Bar (Desktop) */}
                    <div className="hidden md:flex flex-1 justify-end">
                        <Button variant="ghost" className="px-3 w-1/3 flex justify-between bg-zinc-100" onClick={() => setSearchOpen(true)} aria-label="Open search (Ctrl+K)">
                            <div className='flex items-center gap-2'>
                                <Search className="w-5 h-5" />
                                <span className="hidden sm:inline">Search</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Ctrl+K</span>
                        </Button>
                    </div>

                    {/* Right: Quick Actions, Notifications, Profile, Theme Toggle */}
                    <div className="flex items-center gap-2">
                        {/* Quick Actions */}
                        {quickActions.filter(a => a.show).map(action => (
                            <Button key={action.label} variant="outline" size="icon" className="rounded-full" onClick={action.onClick} aria-label={action.label}>
                                {action.icon}
                            </Button>
                        ))}
                        {/* Notifications */}
                        {isAuthenticated && user && (
                            <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
                                <PopoverTrigger asChild>
                                    <div>
                                        <NotificationBell onClick={() => setNotificationOpen((v) => !v)} />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="p-0 w-80">
                                    <NotificationList />
                                </PopoverContent>
                            </Popover>
                        )}
                        {/* Theme Toggle */}
                        {/* <div className="flex items-center gap-1 px-2">
              <Sun className={cn('w-5 h-5', !isDark ? 'text-yellow-400' : 'text-muted-foreground')} />
              <Switch
                checked={isDark}
                onCheckedChange={setIsDark}
                aria-label="Toggle dark mode"
                className="mx-1"
              />
              <Moon className={cn('w-5 h-5', isDark ? 'text-blue-400' : 'text-muted-foreground')} />
            </div> */}
                        {/* Profile Dropdown */}
                        {isAuthenticated && user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="rounded-full h-10 w-10 p-0 focus-visible:ring-2 focus-visible:ring-purple-400" aria-label="User menu">
                                        <User className="h-6 w-6" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem disabled className="flex justify-between">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>{user.name}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile">Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/settings">Settings</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                        {/* Hamburger (Mobile) */}
                        <Button variant="ghost" size="icon" className="md:hidden rounded-full ml-2" onClick={() => setMobileMenuOpen((v) => !v)} aria-label="Open menu">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
                {/* Mobile Menu */}
                <div
                    className={cn(
                        'md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity',
                        mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    )}
                    aria-hidden={!mobileMenuOpen}
                    tabIndex={-1}
                    onClick={() => setMobileMenuOpen(false)}
                />
                <aside
                    ref={navRef}
                    className={cn(
                        'md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white/90 dark:bg-dark/90 shadow-2xl border-r border-black/10 dark:border-white/10 transform transition-transform duration-300 ease-in-out',
                        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    )}
                    tabIndex={mobileMenuOpen ? 0 : -1}
                    aria-label="Mobile menu"
                >
                    <div className="flex flex-col gap-2 p-6 pt-8">
                        <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-purple-700 mb-6" onClick={() => setMobileMenuOpen(false)}>
                            <span className="rounded-lg bg-gradient-to-br from-purple-400 to-blue-300 px-2 py-1 shadow-md">CS</span>
                            <span>ComponentStore</span>
                        </Link>
                        {navLinks.filter(link => link.show).map(link => (
                            'sublinks' in link && link.sublinks ? (
                                <div key={link.label} className="w-full">
                                    <div className="font-semibold text-sm text-zinc-700 dark:text-zinc-200 px-2 py-1">{link.label}</div>
                                    {link.sublinks.map((sublink) => (
                                        <Button
                                            key={sublink.to}
                                            variant={location.pathname === sublink.to ? 'secondary' : 'ghost'}
                                            asChild
                                            className="font-medium px-4 rounded-lg w-full justify-start ml-2"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <Link to={sublink.to} tabIndex={0}>{sublink.label}</Link>
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <Button
                                    key={link.to!}
                                    variant={location.pathname === link.to ? 'secondary' : 'ghost'}
                                    asChild
                                    className="font-medium px-4 rounded-lg w-full justify-start"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Link to={link.to!} tabIndex={0}>{link.label}</Link>
                                </Button>
                            )
                        ))}
                        {/* Dropdowns and Mega Menu (Mobile) */}
                        {isAuthenticated && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="font-medium px-4 rounded-lg w-full flex items-center gap-1 justify-start">
                                        Approvals <ChevronDown className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuLabel>Approvals</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link to="/approvals">All Approvals</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/approvals/pending">Pending</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/approvals/history">History</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        <div className="flex gap-2 mt-4">
                            {quickActions.filter(a => a.show).map(action => (
                                <Button key={action.label} variant="outline" size="icon" className="rounded-full" onClick={action.onClick} aria-label={action.label}>
                                    {action.icon}
                                </Button>
                            ))}
                            <Button variant="ghost" className="px-3" onClick={() => setSearchOpen(true)} aria-label="Open search (Ctrl+K)">
                                <Search className="w-5 h-5 mr-2" />
                                <span>Search</span>
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-sm">Theme</span>
                            <Sun className={cn('w-5 h-5', !isDark ? 'text-yellow-400' : 'text-muted-foreground')} />
                            <Switch checked={isDark} onCheckedChange={setIsDark} aria-label="Toggle dark mode" className="mx-1" />
                            <Moon className={cn('w-5 h-5', isDark ? 'text-blue-400' : 'text-muted-foreground')} />
                        </div>
                        {isAuthenticated && user && (
                            <div className="flex flex-col gap-2 mt-4">
                                <Button variant="ghost" className="w-full justify-start" asChild onClick={logout}>
                                    <span className="flex items-center gap-2 text-red-600"><LogOut className="w-4 h-4" /> Logout</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </aside>
            </nav>
            {/* Onboarding Tooltips Placeholder (future) */}
            {/* <OnboardingTooltips /> */}
        </>
    );
};

export default Navbar;