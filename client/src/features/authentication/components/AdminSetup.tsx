// src/pages/AdminSetup.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { Shield, User, Mail, Lock, Key, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const AdminSetup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        setupKey: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSetupKey, setShowSetupKey] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authService.createInitialAdmin(formData);
            toast.success('Administrator account created successfully!');
            navigate('/sign-in');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to create admin account.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate form completion progress
    const getFormProgress = () => {
        const fields = Object.values(formData);
        const filledFields = fields.filter(field => field.trim() !== '').length;
        return (filledFields / fields.length) * 100;
    };

    // Validate password strength
    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { strength: 0, label: '', color: '' };
        
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) return { strength: score * 20, label: 'Weak', color: 'bg-red-500' };
        if (score <= 3) return { strength: score * 20, label: 'Fair', color: 'bg-yellow-500' };
        if (score <= 4) return { strength: score * 20, label: 'Good', color: 'bg-blue-500' };
        return { strength: 100, label: 'Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength();
    const formProgress = getFormProgress();
    const isFormValid = Object.values(formData).every(field => field.trim() !== '');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            System Administrator Setup
                        </h1>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Initialize your system by creating the first administrator account
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Badge variant="secondary" className="text-xs font-medium">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            One-time Setup
                        </Badge>
                    </div>
                </div>

                {/* Progress Indicator */}
                <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-700">Setup Progress</span>
                                <span className="text-xs text-slate-500">{Math.round(formProgress)}%</span>
                            </div>
                            <Progress value={formProgress} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* Main Form Card */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-slate-900">
                            Administrator Details
                        </CardTitle>
                        <CardDescription className="text-slate-600">
                            Enter the required information to create your administrator account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Full Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-500" />
                                    Full Name
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="pl-4 h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 transition-all duration-200"
                                    />
                                    {formData.name && (
                                        <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                                    )}
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-slate-500" />
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="admin@yourcompany.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="pl-4 h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 transition-all duration-200"
                                    />
                                    {formData.email && (
                                        <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                                    )}
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-3">
                                <Label htmlFor="password" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-slate-500" />
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a strong password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="pl-4 pr-12 h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 transition-all duration-200"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9 p-0 hover:bg-slate-100"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-slate-500" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-slate-500" />
                                        )}
                                    </Button>
                                </div>
                                
                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-600">Password Strength</span>
                                            <span className={`text-xs font-medium ${
                                                passwordStrength.label === 'Strong' ? 'text-green-600' :
                                                passwordStrength.label === 'Good' ? 'text-blue-600' :
                                                passwordStrength.label === 'Fair' ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                                            <div 
                                                className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                style={{ width: `${passwordStrength.strength}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator className="my-6" />

                            {/* Setup Key Field */}
                            <div className="space-y-2">
                                <Label htmlFor="setupKey" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Key className="h-4 w-4 text-slate-500" />
                                    Secret Setup Key
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="setupKey"
                                        name="setupKey"
                                        type={showSetupKey ? "text" : "password"}
                                        placeholder="Enter the system setup key"
                                        value={formData.setupKey}
                                        onChange={handleInputChange}
                                        required
                                        className="pl-4 pr-12 h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 transition-all duration-200"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9 p-0 hover:bg-slate-100"
                                        onClick={() => setShowSetupKey(!showSetupKey)}
                                    >
                                        {showSetupKey ? (
                                            <EyeOff className="h-4 w-4 text-slate-500" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-slate-500" />
                                        )}
                                    </Button>
                                    {formData.setupKey && (
                                        <CheckCircle2 className="absolute right-12 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    This key was provided during system installation
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <Button 
                                    type="submit" 
                                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                                    disabled={isLoading || !isFormValid}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating Administrator Account...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            Create Administrator Account
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-slate-500">
                        This account will have full system administrative privileges
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminSetup;