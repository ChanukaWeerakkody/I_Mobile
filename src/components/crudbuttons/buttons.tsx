// src/components/Button.tsx
import React from 'react';


interface ButtonProps {
    onClick: () => void;
    className: string;
    iconSrc: string;
    iconAlt: string;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, className, iconSrc, iconAlt, children }) => {
    return (
        <button onClick={onClick} className={className}>
            <img src={iconSrc} className='mr-[0.3vw]' alt={iconAlt} />
            {children}
        </button>
    );
};

export default Button;
