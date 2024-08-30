import '../combobox/combobox.css'
import React from 'react';

interface ComboboxProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string, label: string }[];
    placeholder: string;
}

const Combobox: React.FC<ComboboxProps> = ({ value, onChange, options, placeholder }) => {
    return (
        <select value={value} onChange={onChange} className='combobox text-white mb-4 md:mb-0 md:w-[30%]'>
            <option value="" disabled>{placeholder}</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    );
};

export default Combobox;
