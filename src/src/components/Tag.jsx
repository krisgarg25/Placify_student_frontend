import React from 'react';

export default function Tag({ label, variant = 'default', size = 'sm' }) {
    if (!label) return null;

    const baseClasses = 'inline-flex items-center font-medium rounded-full whitespace-nowrap';

    const sizeClasses = {
        sm: 'px-3 py-1 text-xs',
        md: 'px-4 py-1.5 text-sm'
    };

    const variantClasses = {
        green: 'bg-green-100 text-green-800',
        blue: 'bg-blue-100 text-blue-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        pink: 'bg-pink-100 text-pink-800',
        default: 'bg-gray-800 text-white'
    };

    return (
        <span className={`${baseClasses} ${sizeClasses[size] || sizeClasses.sm} ${variantClasses[variant] || variantClasses.default}`}>
            {label}
        </span>
    );
}
