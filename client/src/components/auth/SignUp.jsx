import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout, InputField, Button, SelectField } from './AuthComponents';
import { useAuth } from '../../context/AuthContext';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const SignUp = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const roleOptions = [
    { value: 'employee', label: 'Employee' },
    { value: 'hr', label: 'HR Manager' }
  ];

  const passwordRequirements = [
    { id: 'length', text: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
    { id: 'uppercase', text: 'One uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
    { id: 'lowercase', text: 'One lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
    { id: 'number', text: 'One number', test: (pwd) => /\d/.test(pwd) },
    { id: 'special', text: 'One special character', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee ID is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const failedRequirements = passwordRequirements.filter(req => !req.test(formData.password));
      if (failedRequirements.length > 0) {
        newErrors.password = 'Password does not meet requirements';
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await signup(formData);
      
      if (result.success) {
        setSuccess(true);
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        setErrors({ general: result.message || 'Failed to create account' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'Failed to create account' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getPasswordStrength = () => {
    const passed = passwordRequirements.filter(req => req.test(formData.password)).length;
    if (passed <= 2) return { strength: 'weak', color: 'bg-red-400' };
    if (passed <= 4) return { strength: 'medium', color: 'bg-yellow-400' };
    return { strength: 'strong', color: 'bg-green-400' };
  };

  const isFormValid = formData.employeeId && 
                     formData.email && 
                     formData.password && 
                     formData.confirmPassword && 
                     formData.role &&
                     passwordRequirements.every(req => req.test(formData.password)) &&
                     formData.password === formData.confirmPassword;

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join our HRMS platform"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.general && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <InputField
          label="Employee ID"
          value={formData.employeeId}
          onChange={handleInputChange('employeeId')}
          error={errors.employeeId}
          placeholder="Enter your employee ID"
          required
        />

        <InputField
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={errors.email}
          placeholder="Enter your email address"
          required
        />

        <div className="space-y-3">
          <InputField
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            placeholder="Create a strong password"
            required
            showPasswordToggle
          />
          
          {/* Password Requirements */}
          {formData.password && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600">Password strength:</span>
                <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${getPasswordStrength().color}`} 
                       style={{ width: `${(passwordRequirements.filter(req => req.test(formData.password)).length / passwordRequirements.length) * 100}%` }}></div>
                </div>
                <span className="text-xs font-medium capitalize">{getPasswordStrength().strength}</span>
              </div>
              
              <div className="grid grid-cols-1 gap-1">
                {passwordRequirements.map((req) => {
                  const passed = req.test(formData.password);
                  return (
                    <div key={req.id} className="flex items-center gap-2">
                      {passed ? (
                        <CheckCircleIcon className="w-3 h-3 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-3 h-3 text-neutral-300" />
                      )}
                      <span className={`text-xs ${passed ? 'text-green-600' : 'text-neutral-500'}`}>
                        {req.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <InputField
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
          required
          showPasswordToggle
        />

        <SelectField
          label="Role"
          value={formData.role}
          onChange={handleInputChange('role')}
          options={roleOptions}
          error={errors.role}
          placeholder="Select your role"
          required
        />

        {/* Email Verification Notice */}
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-700">
            📧 We'll send a verification link to your email address
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="text-sm text-green-700">
              ✅ Account created successfully! Redirecting to sign in...
            </p>
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          disabled={!isFormValid || success}
        >
          Create Account
        </Button>

        <div className="text-center">
          <p className="text-sm text-neutral-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signin')}
              className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignUp;