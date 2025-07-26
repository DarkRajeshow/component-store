import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SignIn = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'other', // Default role
        secretKey: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleRoleChange = (value: string) => {
        setFormData(prev => ({ ...prev, role: value, secretKey: '' }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        if (formData.role === 'admin' && !formData.secretKey) {
            newErrors.secretKey = 'Secret key is required for admin login';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const data = await login(formData);
            console.log(data);

            navigate('/dashboard');
        } catch (error: unknown) {
            console.log(error);
            // Error handling is done in the useAuth hook
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="space-y-4 pb-8">
                        <div className="flex items-center justify-center">
                            <div className="p-3 bg-blue-600 rounded-full">
                                <LogIn className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
                            <CardDescription className="text-gray-600">
                                Sign in to your account to continue
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="role">Login As</Label>
                                <Select onValueChange={handleRoleChange} defaultValue={formData.role}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="designer">Designer</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`pl-10 h-11 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`pl-10 pr-10 h-11 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                                )}
                            </div>
                            {formData.role === 'admin' && (
                                <div className="space-y-2">
                                    <Label htmlFor="secretKey">Secret Key</Label>
                                    <Input
                                        id="secretKey"
                                        name="secretKey"
                                        type="password"
                                        value={formData.secretKey}
                                        onChange={handleInputChange}
                                        className={`pl-10 pr-10 h-11 ${errors.secretKey ? 'border-red-500 focus:border-red-500' : ''}`}
                                        placeholder="Enter your admin secret key"
                                    />
                                    {errors.secretKey && (
                                        <p className="text-sm text-red-600 mt-1">{errors.secretKey}</p>
                                    )}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <Separator className="w-full" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-500">Don't have an account?</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full h-11 border-gray-300 hover:bg-gray-50 transition-colors"
                                asChild
                            >
                                <Link to="/register">
                                    Create New Account
                                </Link>
                            </Button>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/admin-setup"
                                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                System Administrator Setup
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        Secure authentication powered by advanced encryption
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;