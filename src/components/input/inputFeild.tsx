// src/input/inputFields.tsx
import React from 'react';
import '../input/input.css';

interface InputFieldsProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}

const InputFields: React.FC<InputFieldsProps> = ({ value, onChange, placeholder }) => {
    return (
        <div className=" inputs-container">
            <input 
                className="text-feild m-4"
                value={value} 
                onChange={onChange} 
                placeholder={placeholder} 
            />
        </div>
    );
}

export default InputFields;
