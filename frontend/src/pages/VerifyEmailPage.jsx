// client/src/pages/VerifyEmailPage.jsx
import React from 'react';
import EmailVerificationForm from '../components/EmailVerification';

const VerifyEmailPage = () => {
  // Vous pourriez récupérer l'email de l'URL ou d'un état global
  const email = new URLSearchParams(window.location.search).get('email') || 'user@example.com';
  
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
      <EmailVerificationForm email={email} onVerify={handleVerify} />
    </div>
  );
};

export default VerifyEmailPage;