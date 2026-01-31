import React from 'react';
export default function IconButton({
    icon,
    onClick,
    variant = 'default',
    size = 'md',
    className = '',
    ariaLabel = 'Button'
}) {
    if (!icon) return null;

    const baseClasses = 'inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    const variantClasses = {
        default: 'bg-gray-100 hover:bg-gray-200 text-gray-600 focus:ring-gray-300',
        dark: 'bg-gray-800 hover:bg-gray-700 text-white focus:ring-gray-500',
        outline: 'bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-600 focus:ring-gray-300'
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.default} ${className}`}
            aria-label={ariaLabel}
        >
            {icon}
        </button>
    );
}
