import { useState } from 'react';

// A reusable slide content component for both freelancer and client views
const SlideContent = ({ 
  title, 
  description, 
  bulletPoints = [], 
  e1, e2, e3,  // Support for both array and individual props
  btnText = "Join Now",
  btnLink = "#about",
  btnColor = "#5A8C8E",
  btnHoverColor = "#4a7476"
}) => {
  // Use either bulletPoints array or individual e1,e2,e3 props
  const points = bulletPoints.length > 0 
    ? bulletPoints 
    : [e1, e2, e3].filter(Boolean);

  return (
    <div className="text-white px-3 space-y-9 max-w-2xl mx-auto">
      <div className="text-center space-y-7">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-lg">{description}</p>
      </div>
      
      {points.length > 0 && (
        <ul className="space-y-3 text-lg text-[#CCCCCC]">
          {points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      )}
      
      <div className="w-full text-right">
        <button>
          <a 
            href={btnLink}
            className={`bg-[${btnColor}] text-white px-4 py-2 rounded-lg hover:bg-[${btnHoverColor}] transition-colors`}
          >
            {btnText}
          </a>
        </button>
      </div>
    </div>
  );
};

export default SlideContent;