import React, { useState } from 'react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitted, setSubmitted] = useState(false);

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
          justify-content: center;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: white;
        }
        
        #forgot-password-card {
          width: 480px;
          background-color: #EBF6F7;
          padding: 50px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          margin: 0 auto;
        }
        
        .page-title {
          text-align: center;
          margin-bottom: 20px;
          margin-top: 0;
          color: #37505D;
          font-size: 1.75rem;
          font-weight: 600;
        }
        
        .page-subtitle {
          text-align: center;
          margin-bottom: 30px;
          color: #A4B2B3;
          font-size: 1rem;
        }
        
        .form-group {
          margin-bottom: 25px;
        }
        
        .form-label {
          display: block;
          margin-bottom: 10px;
          color: #A4B2B3;
          font-size: 1rem;
        }
        
        .form-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid rgba(164, 178, 179, 0.2);
          border-radius: 9999px;
          background-color: white;
          font-size: 0.875rem;
          box-sizing: border-box;
        }
        
        .submit-button {
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
          margin: 30px auto 20px;
        }
        
        .submit-button:hover {
          background-color: #2A5269;
        }
        
        .submit-button:disabled {
          background-color: #95B2C1;
          cursor: not-allowed;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #33647E;
        }
        
        .success-message {
          color: #4CAF50;
          text-align: center;
          margin: 20px 0;
          padding: 10px;
          border-radius: 8px;
          background-color: rgba(76, 175, 80, 0.1);
        }
        
        .error-message {
          color: #F44336;
          text-align: center;
          margin: 20px 0;
          padding: 10px;
          border-radius: 8px;
          background-color: rgba(244, 67, 54, 0.1);
        }
        
        .navigation-links {
          text-align: center;
          margin-top: 30px;
        }
        
        .nav-link {
          color: #33647E;
          text-decoration: none;
          font-weight: 500;
          margin: 0 10px;
        }
        
        .nav-link:hover {
          text-decoration: underline;
        }
        
        .submit-icon {
          margin-left: 8px;
          display: inline-block;
          vertical-align: middle;
        }
      `}} />
    );
  };

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }
    
    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Ici, vous feriez une requête réelle à votre API
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email }),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to send reset email');
      // }
      
      // Succès
      setMessage({ 
        type: 'success', 
        text: `We've sent a password reset link to ${email}. Please check your inbox.` 
      });
      setSubmitted(true);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'An error occurred while sending the reset link. Please try again later.' 
      });
      console.error('Forgot password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = (e) => {
    e.preventDefault();
    window.location.href = '/login';
  };

  return (
    <>
      {injectStyles()}
      <div id="forgot-password-card">
        <h1 className="page-title">Forgot Password?</h1>
        <p className="page-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        {message.text && (
          <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
            {message.text}
          </div>
        )}
        
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={isSubmitting}
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <button 
            onClick={handleBackToLogin}
            className="submit-button"
          >
            Back to Login
          </button>
        )}
        
        <div className="navigation-links">
          <a href="/login" className="nav-link" onClick={handleBackToLogin}>
            Remember your password? Login
          </a>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;