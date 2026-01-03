import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout, InputField, Button } from './AuthComponents';
import { useAuth } from '../../context/AuthContext';

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await login(formData);
      
      if (result.success) {
        // Redirect based on role
        if (result.user?.role === 'hr') {
          navigate('/dashboard');
        } else {
          navigate('/coming-soon');
        }
      } else {
        setErrors({ general: result.message || 'Failed to sign in' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'Failed to sign in' });
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

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your HRMS account"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <InputField
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={errors.email}
          placeholder="Enter your email address"
          required
        />

        <div className="space-y-1">
          <InputField
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            placeholder="Enter your password"
            required
            showPasswordToggle
          />
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          disabled={!formData.email || !formData.password}
        >
          Sign In
        </Button>

        <div className="text-center">
          <p className="text-sm text-neutral-500">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignIn;