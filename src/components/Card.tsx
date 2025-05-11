import React from 'react';

// Define the User type for props
interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
}

interface CardProps {
  user: User;
}

const Card: React.FC<CardProps> = ({ user }) => {
  return (
    <div className="bg-white/20 backdrop-blur-md shadow-lg rounded-lg p-6 flex flex-col items-center space-y-4 w-full border border-white/30 hover:shadow-xl transition-all duration-300 hover:bg-white/30">
      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2">
        {user.name.charAt(0).toUpperCase()}
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white">{user.name}</h3>
        {user.email && <p className="text-white/70 text-sm mt-1">{user.email}</p>}
      </div>

      <div className="w-full flex justify-between items-center">
        <p className="text-white/70">Phone:</p>
        <p className="font-bold text-white">{user.phone}</p>
      </div>

      <div className="w-full flex justify-between items-center">
        <p className="text-white/70">ID:</p>
        <p className="font-bold text-white">{user.id}</p>
      </div>
      
      <button className="w-full mt-4 py-2 bg-blue-600/70 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300">
        View Details
      </button>
    </div>
  );
};

export default Card;
