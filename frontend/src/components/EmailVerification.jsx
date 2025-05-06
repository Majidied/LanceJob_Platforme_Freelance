import React, { useState, useRef, useEffect } from 'react';

const EmailVerification = ({ email = "examp****le@gmail.com", onVerify = () => {} }) => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    // Autofocus sur le premier input au chargement
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleCodeChange = (index, value) => {
    // N'accepter que les chiffres
    if (value && !/^\d*$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Passer automatiquement à l'input suivant
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Retourner à l'input précédent sur Backspace
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Vérifier si c'est un code à 6 chiffres
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setVerificationCode(newCode);
      
      // Focus sur le dernier champ
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async () => {
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      setError('Veuillez entrer le code complet à 6 chiffres');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Appeler la fonction de callback avec le code
      onVerify(code);
      
      console.log('Code vérifié:', code);
    } catch (error) {
      setError('Erreur de vérification. Veuillez réessayer.');
      console.error('Erreur de vérification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // Simulation d'un appel API pour renvoyer le code
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Code renvoyé à:', email);
      alert(`Un nouveau code a été envoyé à ${email}`);
    } catch (error) {
      console.error('Erreur lors du renvoi du code:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="max-w-xl w-full mx-4 bg-white rounded-lg shadow-sm">
        <div className="p-8 rounded-lg" style={{ backgroundColor: '#EBF6F7' }}>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#37505D' }}>
              Verify your email
            </h2>
            <p className="text-gray-600 mb-1">
              We have sent a verification code to <span className="text-blue-600">{email}</span>.
            </p>
            <p className="text-gray-600">
              Please check your inbox and input the code below to activate your account.
            </p>
          </div>
          
          <div className="flex justify-center space-x-2 mb-8">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : null}
                className="w-12 h-16 text-center text-xl border rounded-md bg-white"
                style={{ 
                  borderColor: '#A4B2B3',
                  color: '#37505D'
                }}
              />
            ))}
          </div>
          
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          
          <div className="flex justify-center mb-6">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-40 font-medium py-3 px-4 rounded-full transition duration-200"
              style={{ 
                backgroundColor: isSubmitting ? '#95B2C1' : '#33647E', 
                color: 'white' 
              }}
            >
              {isSubmitting ? 'Verifying...' : 'Verify email'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600">
              Didn't receive the code?{' '}
              <button 
                onClick={handleResendCode}
                className="font-medium"
                style={{ color: '#33647E' }}
              >
                Resend Code
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;