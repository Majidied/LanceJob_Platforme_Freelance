// client/src/pages/VerifyEmailPage.jsx
import React from 'react';
import EmailVerificationForm from '../components/EmailVerification';

const VerifyEmailPage = () => {
  
  const handleVerify = (code) => {
    // Appel API pour vérifier le code
    console.log('Vérification du code:', code);
    
    // Redirection après vérification réussie
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      <EmailVerificationForm  onVerify={handleVerify} />
    </div>
  );
};

export default VerifyEmailPage;