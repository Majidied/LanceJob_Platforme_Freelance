import React, { useState } from 'react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    console.log('Login with:', { email, password, rememberMe });
    // Ajoutez votre logique d'authentification ici
  };
  const handleForgotPassword = (e) => {
    e.preventDefault();
    window.location.href = '/forgot-password';
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    window.location.href = '/register';
  };

  // Cette fonction injecte du CSS directement, garantissant que les styles fonctionnent
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
        
        #login-card {
          width: 480px;
          background-color: #EBF6F7;
          padding: 50px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        
        .login-title {
          text-align: center;
          margin-bottom: 40px;
          margin-top: 0;
          color: #37505D;
          font-size: 1.75rem;
          font-weight: 600;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
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
        
        .checkbox-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .remember-container {
          display: flex;
          align-items: center;
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
        
        .checkbox-label {
          color: #37505D;
          font-size: 0.875rem;
        }
        
        .forget-link {
          color: #37505D;
          text-decoration: none;
          font-size: 0.875rem;
        }
        
        .login-button {
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
          margin: 0 auto 30px;
        }
        
        .signup-text {
          text-align: center;
          color: #37505D;
          font-size: 0.875rem;
        }
        
        .signup-link {
          color: #33647E;
          font-weight: 600;
          text-decoration: none;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #33647E;
        }
        
        .login-button:hover {
          background-color: #2A5269;
        }
        
        /* Styles pour correspondre exactement à la maquette */
        .form-input {
          box-shadow: none;
        }
        
        .hidden-checkbox {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }
      `}} />
    );
  };

  return (
    <>
      {injectStyles()}
      <div id="login-card">
        <h2 className="login-title">
          Welcome back <span role="img" aria-label="celebration">🎉</span>
        </h2>
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            placeholder=""
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            placeholder=""
          />
        </div>
        
        <div className="checkbox-row">
          <div className="remember-container">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="hidden-checkbox"
            />
            <label htmlFor="remember-me" onClick={() => setRememberMe(!rememberMe)}>
              <span className="custom-checkbox"></span>
              <span className="checkbox-label">Remember me</span>
            </label>
          </div>
          
          <a 
  href="#" 
  onClick={handleForgotPassword}
  className="forget-link"
>
  Forget password?
</a>
        </div>
        
        <button onClick={handleLogin} className="login-button">
          Login
        </button>
        
        <div className="signup-text">
          Don't have an account? <a href="#" onClick={handleSignUp} className="signup-link">Sign up</a>
        </div>
      </div>
    </>
  );
};

export default LoginPage;