import React from 'react'

// Reusable Input Component
const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="mb-6">
    <label className="block text-white font-semibold mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 
                 rounded-xl 
                 bg-white/10 backdrop-blur-md 
                 border border-white/30 
                 text-white placeholder-white/70 
                 focus:outline-none focus:ring-2 focus:ring-blue-400 
                 transition duration-300"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

export default Input