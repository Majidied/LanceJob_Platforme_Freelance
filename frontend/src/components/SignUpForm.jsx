import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import useUser from '../hooks/useUser';
import useNotification from '../hooks/useNotification';

const SignUpForm = () => {
  const [role, setRole] = useState('Freelancer');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const navigate = useNavigate();
  const notify = useNotification();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  });
  const [errors, setErrors] = useState({});
  
  // Use the hooks from useUser
  const { registerUser, isRegisterPending, isRegisterError, registerError } = useUser();

  // Fonction pour injecter les styles directement
  const injectStyles = () => {
    return (
      <style dangerouslySetInnerHTML={{ __html: `
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          display: flex;
          padding-top: 80px;
          justify-content: center;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: white;
        }
        
        #signup-card {
          width: 480px;
          background-color: #EBF6F7;
          padding: 50px;
          
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          margin: 20px auto;
        }
        
        .signup-title {
          text-align: center;
          margin-bottom: 30px;
          margin-top: 0;
          color: #37505D;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .role-selector {
          position: relative;
          display: inline-block;
          color: #33647E;
          font-weight: 600;
          cursor: pointer;
        }
        
        .role-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 5px;
          width: 140px;
          background-color: white;
          border: 1px solid #A4B2B3;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }
        
        .role-option {
          padding: 10px 15px;
          cursor: pointer;
        }
        
        .role-option:hover {
          background-color: #f5f5f5;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #A4B2B3;
          font-size: 0.9rem;
        }
        
        .form-input {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid rgba(164, 178, 179, 0.2);
          border-radius: 9999px;
          background-color: white;
          font-size: 0.9rem;
          box-sizing: border-box;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #33647E;
        }
        
        .form-input.error {
          border-color: #ff5252;
        }
        
        .error-message {
          color: #ff5252;
          font-size: 0.75rem;
          margin-top: 5px;
        }
        
        .terms-container {
          display: flex;
          align-items: flex-start;
          margin-bottom: 25px;
        }
        
        .custom-checkbox {
          width: 18px;
          height: 18px;
          border: 1px solid #33647E;
          background-color: #33647E;
          border-radius: 4px;
          display: inline-block;
          position: relative;
          cursor: pointer;
          margin-right: 8px;
          margin-top: 2px;
        }
        
        .custom-checkbox::after {
          content: "";
          position: absolute;
          display: block;
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        
        .hidden-checkbox {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }
        
        .terms-text {
          color: #37505D;
          font-size: 0.8rem;
        }
        
        .terms-link {
          color: #33647E;
          text-decoration: none;
          font-weight: 500;
        }
        
        .create-button {
          display: block;
          width: 200px;
          padding: 12px;
          background-color: #33647E;
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          margin: 0 auto 20px;
          transition: background-color 0.2s;
        }
        
        .create-button:hover {
          background-color: #2A5269;
        }
        
        .create-button:disabled {
          background-color: #A4B2B3;
          cursor: not-allowed;
        }
        
        .login-text {
          text-align: center;
          color: #37505D;
          font-size: 0.875rem;
        }
        
        .login-link {
          color: #33647E;
          font-weight: 600;
          text-decoration: none;
        }
        
        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
          margin-left: 8px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleRoleMenu = () => {
    setShowRoleMenu(!showRoleMenu);
  };

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setShowRoleMenu(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // Prepare user data for registration
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: role,
          agreedToTerms: formData.agreedToTerms
        };

        console.log('Submitting user data:', JSON.stringify(userData));
        
        // Call the registerUser function from useUser hook
        await registerUser(userData);
        notify('Registration successful! Please check your email for verification.', 'success');
        
        // Redirect to verification page
        navigate('/verify-email');
        
      } catch (error) {
        console.error('Registration error:', error);
        notify('Registration failed. Please try again.', 'error');
        // The error is already handled by the useUser hook via isRegisterError and registerError
      }
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <>
      {injectStyles()}
      <div id="signup-card">
        <h2 className="signup-title">
          Sign up as{' '}
          <span className="role-selector" onClick={toggleRoleMenu}>
            {role}
            <ChevronDown size={16} style={{ display: 'inline-block', marginLeft: '5px', verticalAlign: 'middle' }} />
            
            {showRoleMenu && (
              <div className="role-dropdown">
                <div 
                  className="role-option"
                  onClick={() => selectRole('Freelancer')}
                >
                  Freelancer
                </div>
                <div 
                  className="role-option"
                  onClick={() => selectRole('Client')}
                >
                  Client
                </div>
              </div>
            )}
          </span>
        </h2>

        {/* Show general error message if registration failed */}
        {isRegisterError && (
          <div className="error-message" style={{ textAlign: 'center', marginBottom: '15px' }}>
            {registerError || 'Registration failed. Please try again.'}
          </div>
        )}

        <div className="form-row">
          <div>
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`form-input ${errors.firstName ? 'error' : ''}`}
            />
            {errors.firstName && <p className="error-message">{errors.firstName}</p>}
          </div>
          
          <div>
            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`form-input ${errors.lastName ? 'error' : ''}`}
            />
            {errors.lastName && <p className="error-message">{errors.lastName}</p>}
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-input ${errors.email ? 'error' : ''}`}
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>
        
        <div className="form-row">
          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>
          
          <div>
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            />
            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
          </div>
        </div>
        
        <div className="terms-container">
          {/* Real checkbox but invisible */}
          <input
            id="terms-checkbox"
            type="checkbox"
            name="agreedToTerms"
            checked={formData.agreedToTerms}
            onChange={handleChange}
            style={{ 
              position: 'absolute', 
              opacity: 0,
              width: 0,
              height: 0
            }}
          />
          
          {/* Custom visual checkbox */}
          <div 
            onClick={() => setFormData(prev => ({ ...prev, agreedToTerms: !prev.agreedToTerms }))}
            style={{ 
              width: '25px',
              height: '18px',
              borderRadius: '4px',
              border: '1px solid #33647E',
              backgroundColor: formData.agreedToTerms ? '#33647E' : 'white',
              marginRight: '8px',
              marginTop: '2px',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            {formData.agreedToTerms && (
              <span style={{
                content: "''",
                position: 'absolute',
                display: 'block',
                left: '6px',
                top: '2px',
                width: '5px',
                height: '10px',
                border: 'solid white',
                borderWidth: '0 2px 2px 0',
                transform: 'rotate(45deg)'
              }}></span>
            )}
          </div>
          
          {/* Terms text */}
          <div className="terms-text" onClick={() => setFormData(prev => ({ ...prev, agreedToTerms: !prev.agreedToTerms }))}>
            Yes, I understand and agree to the{' '}
            <a href="#" className="terms-link" onClick={(e) => e.stopPropagation()}>Terms of Service</a>, including the{' '}
            <a href="#" className="terms-link" onClick={(e) => e.stopPropagation()}>userAgreement</a> and{' '}
            <a href="#" className="terms-link" onClick={(e) => e.stopPropagation()}>PrivacyPolicy</a>.
          </div>
        </div>
        {errors.agreedToTerms && <p className="error-message" style={{ marginTop: '-15px', marginBottom: '15px' }}>{errors.agreedToTerms}</p>}
        
        <button
          onClick={handleSubmit}
          className="create-button"
          disabled={isRegisterPending}
        >
          {isRegisterPending ? (
            <>
              Creating Account
              <span className="spinner"></span>
            </>
          ) : "Create"}
        </button>
        
        <div className="login-text">
          Already have an account?{' '}
          <a href="#" onClick={handleLogin} className="login-link">Login</a>
        </div>
      </div>
    </>
  );
};

export default SignUpForm;