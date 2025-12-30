import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', hoverEffect = false, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${hoverEffect ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : ''
                    } ${className}`}
                {...props}
            />
        );
    }
);

Card.displayName = 'Card';
