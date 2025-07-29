import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    className = ''
}) => {
    const sizeClasses = {
        small: 'h-4 w-4 border-2',
        medium: 'h-8 w-8 border-2',
        large: 'h-12 w-12 border-3',
    };

    return (
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-gray-300 border-t-blue-500 ${className}`} />
    );
};

export default LoadingSpinner; 