import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
            <div className="text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-gray-300">404</h1>
                </div>
                
                <div className="mb-8">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-gray-600 max-w-md mx-auto">
                        Sorry, the page you are looking for doesn't exist or has been moved.
                    </p>
                </div>
                
                <div className="space-y-4">
                    <Link
                        to="/"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                        Go Back Home
                    </Link>
                    
                    <div className="mt-4">
                        <Link
                            to="/jobs"
                            className="text-blue-600 hover:text-blue-800 font-medium underline"
                        >
                            Browse Jobs
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;