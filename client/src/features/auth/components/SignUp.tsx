import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, User, Building, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getReportingTo } from '@/lib/userAPI';

// Enums matching backend
const Department = {
    DESIGN: 'Design',
    MACHINE_SHOP: 'Machine Shop',
    VENDOR_DEVELOPMENT: 'Vendor Development',
    MAINTENANCE: 'Maintenance',
    PRODUCTION: 'Production',
    QUALITY: 'Quality',
    STORE: 'Store',
    PATTERN_SHOP: 'Pattern Shop',
    TESTING: 'Testing',
    OTHER: 'Other'
};

const Designation = {
    DEPARTMENT_HEAD: 'Department Head',
    SENIOR_MANAGER: 'Senior Manager',
    MANAGER: 'Manager',
    ASSISTANT_MANAGER: 'Assistant Manager',
    EMPLOYEE: 'Employee'
};

const Role = {
    DESIGNER: 'designer',
    OTHER: 'other'
};

interface ReportingManager {
    _id: string;
    name: string;
    designation: string;
    email: string;
}

interface FormData {
    name: string;
    email: string;
    mobileNo: string;
    password: string;
    confirmPassword: string;
    employeeId: string;
    department: string;
    designation: string;
    reportingTo: string;
    role: "designer" | "other";
}

const SignUp = () => {
    const navigate = useNavigate();
    const { register, isLoading } = useAuth();

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        mobileNo: '',
        password: '',
        confirmPassword: '',
        employeeId: '',
        department: '',
        designation: '',
        reportingTo: '',
        role: 'other'
    });

    const [reportingManagers, setReportingManagers] = useState<ReportingManager[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loadingManagers, setLoadingManagers] = useState(false);

    // Mock function to fetch reporting managers - replace with actual API call
    const fetchReportingManagers = async (designation: string, department: string) => {
        if (designation === Designation.DEPARTMENT_HEAD || !department) {
            setReportingManagers([]);
            return;
        }

        setLoadingManagers(true);
        try {
            const managers = await getReportingTo(designation, department);
            setReportingManagers(managers);
        } catch (error) {
            console.error('Failed to fetch reporting managers:', error);
            toast.error('Failed to load reporting managers');
            setReportingManagers([]);
        } finally {
            setLoadingManagers(false);
        }
    };

    // Fetch reporting managers when designation changes
    useEffect(() => {
        if (formData.designation && formData.department) {
            fetchReportingManagers(formData.designation, formData.department);
        }
    }, [formData.designation, formData.department]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Mobile number validation
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!formData.mobileNo) {
            newErrors.mobileNo = 'Mobile number is required';
        } else if (!mobileRegex.test(formData.mobileNo)) {
            newErrors.mobileNo = 'Please enter a valid 10-digit mobile number';
        }

        // Employee ID validation
        if (!formData.employeeId.trim()) {
            newErrors.employeeId = 'Employee ID is required';
        } else if (formData.employeeId.trim().length < 3) {
            newErrors.employeeId = 'Employee ID must be at least 3 characters';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Department validation
        if (!formData.department) {
            newErrors.department = 'Please select a department';
        }

        // Designation validation
        if (!formData.designation) {
            newErrors.designation = 'Please select a designation';
        }

        // Role validation
        if (!formData.role) {
            newErrors.role = 'Please select your role';
        }

        // Reporting manager validation
        if (formData.designation !== Designation.DEPARTMENT_HEAD && !formData.reportingTo) {
            newErrors.reportingTo = 'Please select a reporting manager';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors below');
            return;
        }

        try {
            const submitData = {
                name: formData.name.trim(),
                email: formData.email.toLowerCase().trim(),
                mobileNo: formData.mobileNo,
                password: formData.password,
                employeeId: formData.employeeId.trim().toUpperCase(),
                department: formData.department,
                designation: formData.designation,
                reportingTo: formData.reportingTo || undefined,
                role: formData.role
            };

            await register(submitData);
            navigate('/status'); // Redirect to status page after successful registration
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
                    <CardDescription className="text-gray-600">
                        Register for access to the GAD Builder system
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="space-y-6" onSubmit={handleSubmit}>
                        {/* Personal Information Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <User className="h-4 w-4" />
                                Personal Information
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="employeeId">Employee ID *</Label>
                                    <Input
                                        id="employeeId"
                                        type="text"
                                        placeholder="Enter employee ID"
                                        value={formData.employeeId}
                                        onChange={(e) => handleInputChange('employeeId', e.target.value)}
                                        className={errors.employeeId ? 'border-red-500' : ''}
                                    />
                                    {errors.employeeId && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.employeeId}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mobileNo">Mobile Number *</Label>
                                    <Input
                                        id="mobileNo"
                                        type="tel"
                                        placeholder="Enter 10-digit mobile number"
                                        value={formData.mobileNo}
                                        onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                                        className={errors.mobileNo ? 'border-red-500' : ''}
                                    />
                                    {errors.mobileNo && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.mobileNo}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Organization Information Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Building className="h-4 w-4" />
                                Organization Information
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department *</Label>
                                    <Select
                                        value={formData.department}
                                        onValueChange={(value) => handleInputChange('department', value)}
                                    >
                                        <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(Department).map((dept) => (
                                                <SelectItem key={dept} value={dept}>
                                                    {dept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.department && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.department}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="designation">Designation *</Label>
                                    <Select
                                        value={formData.designation}
                                        onValueChange={(value) => handleInputChange('designation', value)}
                                    >
                                        <SelectTrigger className={errors.designation ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select designation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(Designation).map((desig) => (
                                                <SelectItem key={desig} value={desig}>
                                                    {desig}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.designation && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.designation}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Application Role *</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value) => handleInputChange('role', value)}
                                    >
                                        <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={Role.DESIGNER}>
                                                Designer (Create/Edit Components)
                                            </SelectItem>
                                            <SelectItem value={Role.OTHER}>
                                                Viewer (Read-Only Access)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.role && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.role}
                                        </p>
                                    )}
                                </div>

                                {formData.designation !== Designation.DEPARTMENT_HEAD && (
                                    <div className="space-y-2">
                                        <Label htmlFor="reportingTo">Reporting Manager *</Label>
                                        <Select
                                            value={formData.reportingTo}
                                            onValueChange={(value) => handleInputChange('reportingTo', value)}
                                            disabled={loadingManagers || reportingManagers.length === 0}
                                        >
                                            <SelectTrigger className={errors.reportingTo ? 'border-red-500' : ''}>
                                                <SelectValue placeholder={
                                                    loadingManagers
                                                        ? "Loading managers..."
                                                        : reportingManagers.length === 0
                                                            ? "No managers available"
                                                            : "Select reporting manager"
                                                } />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {reportingManagers.map((manager) => (
                                                    <SelectItem key={manager._id} value={manager._id}>
                                                        {manager.name} ({manager.designation})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.reportingTo && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.reportingTo}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Security Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Lock className="h-4 w-4" />
                                Security Information
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Create a strong password"
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
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
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm your password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                            className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Approval Process Info */}
                        <Alert className="bg-blue-50 border-blue-200">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                                <strong>Approval Process:</strong> After registration, your account will be reviewed by your Department Head, then by the System Administrator. You'll receive notifications at each step.
                            </AlertDescription>
                        </Alert>

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmit}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </Button>

                        {/* Login Link */}
                        <div className="text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                                Sign in here
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SignUp;