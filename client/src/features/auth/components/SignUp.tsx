import React, { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { registerAPI } from '../lib/authAPI';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

// Define types based on the updated schema
interface UserPreferences {
    theme: "light" | "dark";
    language: string;
}

interface UserCredentials {
    username: string;
    email: string;
    password: string;
    preferences: UserPreferences;
}

const SignUp: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [language, setLanguage] = useState<string>("en");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (password.length < 6) {
            toast.warning('Password should be at least 6 characters long');
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            toast.warning('Passwords do not match');
            setLoading(false);
            return;
        }
        if (!validateEmail(email)) {
            toast.warning('Please enter a valid email address');
            setLoading(false);
            return;
        }

        // Register API call with updated user structure
        try {
            const userCredentials: UserCredentials = {
                username,
                email,
                password,
                preferences: {
                    theme,
                    language
                }
            };

            const data = await registerAPI(userCredentials);

            if (data.success) {
                toast.success('Registration successful!');
                toast.success(data.status || 'Registration successful');
                navigate('/');
            } else {
                toast.error(data.status || 'Registration failed');
            }
        } catch (error) {
            console.log(error);
            toast.error('An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    const languages = [
        { code: "en", name: "English" },
        { code: "es", name: "Spanish" },
        { code: "fr", name: "French" },
        { code: "de", name: "German" },
        { code: "zh", name: "Chinese" }
    ];

    return (
        <div className="grid grid-cols-7 justify-center overflow-hidden min-h-screen bg-[#FFF9F2]">
            <div className="p-8 md:p-16 lg:p-20 lg:pl-40 col-span-7 lg:col-span-4">
                <div className="flex flex-col gap-2">
                    <p className="font-medium text-gray-600">Start For Free</p>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold pl-4 border-l-2 border-gray-200">
                        Create new account <span className="text-blue-500 font-bold">.</span>
                    </h2>
                    <p className="font-medium">
                        Already a Member? <Link to={'/sign-in'} className="text-blue-500 font-semibold hover:underline">Sign In</Link>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full md:w-[85%] lg:w-[70%] my-6 md:my-10">
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-dark font-medium mb-1">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                id="username"
                                placeholder="Enter username"
                                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-dark font-medium mb-1">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter email address"
                                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-dark font-medium mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Enter password"
                                className="w-full px-4 py-3 pl-10 pr-10 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-dark font-medium mb-1">Confirm Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="confirmPassword"
                                placeholder="Enter password again"
                                className={`w-full px-4 py-3 pl-10 rounded-lg border shadow-sm focus:ring focus:ring-opacity-50 ${confirmPassword && password !== confirmPassword
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                                    }`}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="theme" className="block text-dark font-medium mb-1">Theme Preference</label>
                            <select
                                id="theme"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value as "light" | "dark")}
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="language" className="block text-dark font-medium mb-1">Language</label>
                            <select
                                id="language"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full text-sm bg-[#765EFC] hover:bg-[#6952e3] text-white py-3 my-4 rounded-full transition duration-200 font-medium flex items-center justify-center"
                    >
                        {loading ? (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : null}
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
            </div>

            <div className="hidden lg:col-span-3 lg:flex items-center justify-center bg-gradient-to-r from-[#6d57e6] to-[#765EFC]">
                <img src="/loginbanner.jpg" alt="Sign Up" className="object-cover h-full" />
            </div>
        </div>
    );
};

export default SignUp;