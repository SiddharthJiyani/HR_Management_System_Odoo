import { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { authAPI } from '../../services/api';

const AuthContainer = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState('signin'); // 'signin' | 'signup'

  const handleSignIn = async (formData) => {
    try {
      console.log('Sign in attempt:', formData);
      
      const response = await authAPI.signin({
        email: formData.email,
        password: formData.password
      });
      
      console.log('Sign in response:', response);
      
      if (response.success) {
        // Store user data in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Call the success callback to update App state
        onAuthSuccess(response.user);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const handleSignUp = async (formData) => {
    try {
      console.log('Sign up attempt:', formData);
      
      const response = await authAPI.signup({
        employeeId: formData.employeeId,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role
      });
      
      console.log('Sign up response:', response);
      
      if (response.success) {
        alert('Account created successfully! You can now sign in.');
        setCurrentView('signin');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
    alert('Forgot password functionality coming soon!');
  };

  return (
    <>
      {currentView === 'signin' && (
        <SignIn
          onSignIn={handleSignIn}
          onSignUp={() => setCurrentView('signup')}
          onForgotPassword={handleForgotPassword}
        />
      )}
      
      {currentView === 'signup' && (
        <SignUp
          onSignUp={handleSignUp}
          onSignIn={() => setCurrentView('signin')}
        />
      )}
    </>
  );
};

export default AuthContainer;