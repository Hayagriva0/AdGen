import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, id, ...props }) => {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
        {...props}
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-300">
        {label}
      </label>
    </div>
  );
};
