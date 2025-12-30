import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`w-full px-4 py-3 bg-white border-2 border-transparent rounded-xl text-lg transition-all focus:border-primary focus:ring-4 focus:ring-primary/20 placeholder:text-gray-400 font-medium shadow-sm ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                        } ${className}`}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500 font-bold ml-1">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
