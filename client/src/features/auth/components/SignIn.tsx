import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, Shield, Users, Palette } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define types for form data and errors
interface FormData {
    email: string;
    password: string;
    role: 'other' | 'designer' | 'admin';
    secretKey: string;
}

interface Errors {
    email?: string;
    password?: string;
    secretKey?: string;
}

const SignIn = () => {
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        role: 'other',
        secretKey: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof Errors]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Accept string and typecast to allowed role types
    const handleRoleChange = (value: string) => {
        setFormData(prev => ({ ...prev, role: value as 'other' | 'designer' | 'admin', secretKey: '' }));
        if (errors.secretKey) {
            setErrors(prev => ({ ...prev, secretKey: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Errors = {};

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

    const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const data = await login(formData);
            console.log(data);
            if (data.success) {
                if (data.user.role === 'admin') {
                    navigate('/admin-dashboard');
                }
                else if (data.user.designation === "Department Head") {
                    navigate('/dh-dashboard')
                }
                else {
                    navigate('/dashboard')
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-lg">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <LogIn className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Welcome Back</CardTitle>
                            <CardDescription className="mt-2">
                                Sign in to your account to continue
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <Tabs value={formData.role} onValueChange={handleRoleChange} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="other" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    User
                                </TabsTrigger>
                                <TabsTrigger value="designer" className="flex items-center gap-2">
                                    <Palette className="h-4 w-4" />
                                    Designer
                                </TabsTrigger>
                                <TabsTrigger value="admin" className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Admin
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="other" className="mt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                            placeholder="Enter your email"
                                            autoComplete="email"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
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
                                        <p className="text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="designer" className="mt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                            placeholder="Enter your email"
                                            autoComplete="email"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
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
                                        <p className="text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="admin" className="mt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                            placeholder="Enter your email"
                                            autoComplete="email"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
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
                                        <p className="text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="secretKey">Admin Secret Key</Label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="secretKey"
                                            name="secretKey"
                                            type={showSecretKey ? 'text' : 'password'}
                                            value={formData.secretKey}
                                            onChange={handleInputChange}
                                            className={`pl-10 pr-10 ${errors.secretKey ? 'border-red-500' : ''}`}
                                            placeholder="Enter admin secret key"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowSecretKey(!showSecretKey)}
                                        >
                                            {showSecretKey ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.secretKey && (
                                        <p className="text-sm text-red-600">{errors.secretKey}</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            className="w-full"
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

                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <Separator className="w-full" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-muted-foreground">Don't have an account?</span>
                                </div>
                            </div>

                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/sign-up">
                                    Create New Account
                                </Link>
                            </Button>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/admin-setup"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                System Administrator Setup
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Secure authentication powered by advanced encryption
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;