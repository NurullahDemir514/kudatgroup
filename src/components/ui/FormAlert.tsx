import React from 'react';

interface FormAlertProps {
    type: 'error' | 'success' | 'warning';
    title?: string;
    message: string;
    onClose?: () => void;
}

const FormAlert: React.FC<FormAlertProps> = ({
    type = 'error',
    title,
    message,
    onClose
}) => {
    const alertStyles = {
        error: {
            container: 'bg-red-50 border-red-200 text-red-800',
            icon: 'text-red-500',
            button: 'text-red-500 hover:text-red-800'
        },
        success: {
            container: 'bg-green-50 border-green-200 text-green-800',
            icon: 'text-green-500',
            button: 'text-green-500 hover:text-green-800'
        },
        warning: {
            container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            icon: 'text-yellow-500',
            button: 'text-yellow-500 hover:text-yellow-800'
        }
    };

    const styles = alertStyles[type];

    const renderIcon = () => {
        switch (type) {
            case 'error':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            case 'success':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`p-4 rounded-md border mb-4 ${styles.container}`} role="alert">
            <div className="flex">
                <div className={`flex-shrink-0 ${styles.icon}`}>
                    {renderIcon()}
                </div>
                <div className="ml-3 flex-1">
                    {title && <h3 className="text-sm font-medium">{title}</h3>}
                    <div className="text-sm">{message}</div>
                </div>
                {onClose && (
                    <button
                        type="button"
                        className={`ml-auto pl-3 ${styles.button}`}
                        onClick={onClose}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default FormAlert; 