import React, { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { registerAPI } from '../lib/authAPI';
import { UserSignupRequest } from '../../../types/request.types';

const SignUp: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validation
        if (password.length < 6) {
            toast.warning('Password should be at least 6 characters long');
            return;
        }
        if (password !== confirmPassword) {
            toast.warning('Passwords do not match');
            return;
        }

        // Register API call
        try {
            const userCredentials: UserSignupRequest = { username, password };
            const { data } = await registerAPI(userCredentials);

            if (data.success) {
                toast.success(data.message || 'Registration successful');
                navigate('/');
            } else {
                toast.error(data.message || 'Registration failed');
            }
        } catch (error) {
            toast.error('An error occurred during registration');
        }
    };

    return (
        <div className="grid grid-cols-7 justify-center overflow-hidden h-screen bg-[#FFF9F2] ">
            <div className="p-20 pl-40 col-span-4">
                <div className='flex flex-col gap-2 '>
                    <p className='font-medium text-gray-600'>Start For Free</p>
                    <h2 className="text-5xl font-semibold pl-4 border-l-2 border-gray-200">Create new account <span className='text-blue-500 font-bold'>.</span></h2>
                    <p className='font-medium'>Already a Member? <Link to={'/sign-in'} className='text-blue-500 font-semibold'>Sign In</Link> </p>
                </div>
                <form onSubmit={handleSubmit} className='w-[70%] my-10'>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-dark font-medium">Username</label>
                        <input
                            type="text"
                            id="username"
                            placeholder='Enter username'
                            className="loginInput"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-dark font-medium">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="loginInput"
                            placeholder='Enter password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-dark font-medium">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className={`loginInput ${password !== confirmPassword ? "focus:!border-red-500" : ""}`}
                            placeholder='Enter password again'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full text-sm bg-[#765EFC] text-white py-3 my-4 rounded-full transition duration-200 font-medium"
                    >
                        Sign Up
                    </button>
                </form>
            </div>

            <div className="hidden col-span-3 lg:flex items-center justify-center">
                <img src="/loginbanner.jpg" alt="Sign Up" className="aspect-[2/2.2]" />
            </div>
        </div>
    );
};

export default SignUp;