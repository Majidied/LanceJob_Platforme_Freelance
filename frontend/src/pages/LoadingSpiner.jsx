import React from 'react';

const LoadingSpinner = () => {
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        position: 'relative',
        overflow: 'hidden'
    };

    const backgroundPattern = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        backgroundImage: `
            radial-gradient(circle at 25% 25%, #60a5fa 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)
        `,
        animation: 'float 6s ease-in-out infinite'
    };

    const spinnerContainerStyle = {
        position: 'relative',
        width: '140px',
        height: '140px',
        marginBottom: '40px'
    };

    const ringStyle = {
        position: 'absolute',
        borderRadius: '50%',
        border: '3px solid transparent'
    };

    const ring1Style = {
        ...ringStyle,
        width: '140px',
        height: '140px',
        borderTop: '3px solid #3b82f6',
        borderRight: '3px solid #60a5fa',
        animation: 'spin 3s linear infinite',
        filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))'
    };

    const ring2Style = {
        ...ringStyle,
        width: '100px',
        height: '100px',
        top: '20px',
        left: '20px',
        borderTop: '3px solid #10b981',
        borderLeft: '3px solid #34d399',
        animation: 'spin 2s linear infinite reverse',
        filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))'
    };

    const ring3Style = {
        ...ringStyle,
        width: '60px',
        height: '60px',
        top: '40px',
        left: '40px',
        borderTop: '2px solid #f59e0b',
        borderBottom: '2px solid #fbbf24',
        animation: 'spin 1.5s linear infinite',
        filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.3))'
    };

    const centerDotStyle = {
        position: 'absolute',
        width: '20px',
        height: '20px',
        background: 'linear-gradient(45deg, #3b82f6, #10b981)',
        borderRadius: '50%',
        top: '60px',
        left: '60px',
        animation: 'pulse 2s ease-in-out infinite',
        filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))'
    };

    const textContainerStyle = {
        textAlign: 'center',
        color: '#ffffff',
        maxWidth: '400px',
        padding: '0 20px'
    };

    const headingStyle = {
        fontSize: '2.5rem',
        fontWeight: '600',
        margin: '0 0 16px 0',
        background: 'linear-gradient(135deg, #3b82f6, #10b981)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'glow 2s ease-in-out infinite alternate'
    };

    const paragraphStyle = {
        fontSize: '1.1rem',
        margin: '0 0 8px 0',
        opacity: '0.8',
        fontWeight: '400',
        lineHeight: '1.5'
    };

    const subTextStyle = {
        fontSize: '0.9rem',
        opacity: '0.6',
        fontWeight: '300',
        margin: '0'
    };

    const dotsStyle = {
        display: 'inline-block',
        animation: 'dots 1.5s steps(4, end) infinite'
    };

    return (
        <div style={containerStyle}>
            <div style={backgroundPattern}></div>
            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { 
                        transform: scale(1); 
                        opacity: 1; 
                    }
                    50% { 
                        transform: scale(1.2); 
                        opacity: 0.7; 
                    }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-10px) rotate(1deg); }
                    66% { transform: translateY(-5px) rotate(-1deg); }
                }
                @keyframes glow {
                    0% { filter: brightness(1) drop-shadow(0 0 5px rgba(59, 130, 246, 0.3)); }
                    100% { filter: brightness(1.1) drop-shadow(0 0 20px rgba(59, 130, 246, 0.5)); }
                }
                @keyframes dots {
                    0%, 20% { content: ''; }
                    40% { content: '.'; }
                    60% { content: '..'; }
                    80%, 100% { content: '...'; }
                }
                `}
            </style>
            <div style={spinnerContainerStyle}>
                <div style={ring1Style}></div>
                <div style={ring2Style}></div>
                <div style={ring3Style}></div>
                <div style={centerDotStyle}></div>
            </div>
            <div style={textContainerStyle}>
                <h2 style={headingStyle}>LanceJob</h2>
                <p style={paragraphStyle}>Preparing your workspace<span style={dotsStyle}></span></p>
                <p style={subTextStyle}>Connecting you to opportunities</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;