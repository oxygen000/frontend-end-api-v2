import React from 'react';
import { Link } from 'react-router-dom';

// Define the User type for props
interface User {
  id: string;
  name: string;
  employee_id?: string;
  department?: string;
  role?: string;
  image_path?: string;
  image_url?: string;
  created_at?: string;
  form_type?: string;
  category?: string;
  phone_number?: string;
  national_id?: string;
  address?: string;
  dob?: string;
}

interface CardProps {
  user: User;
}

const Card: React.FC<CardProps> = ({ user }) => {
  const getImageUrl = () => {
    if (user.image_path) {
      return `https://backend-fast-api-ai.fly.dev/${user.image_path}`;
    }
    if (user.image_url) {
      return user.image_url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
  };

  return (
    <div className="bg-white/20 backdrop-blur-md shadow-lg rounded-lg p-6 flex flex-col items-center space-y-4 w-full border border-white/30 hover:shadow-xl transition-all duration-300 hover:bg-white/30 ">
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/30">
        <img
          src={getImageUrl()}
          alt={user.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
          }}
        />
      </div>

      <div className="text-center">
        <h3 className="text-xl font-semibold text-white">{user.name}</h3>
        {user.category && (
          <p className="text-white/70 text-sm mt-1">{user.category}</p>
        )}
        {user.department && (
          <p className="text-white/70 text-sm mt-1">{user.department}</p>
        )}
      </div>

      <div className="w-full space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-white/70">Phone:</p>
          <p className="font-bold text-white">{user.phone_number || 'N/A'}</p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-white/70">ID:</p>
          <p className="font-bold text-white">
            {user.national_id || user.employee_id || 'N/A'}
          </p>
        </div>

        {user.address && (
          <div className="flex justify-between items-center">
            <p className="text-white/70">Address:</p>
            <p className="font-bold text-white text-right">{user.address}</p>
          </div>
        )}
      </div>

      <Link
        to={`/users/${user.id}`}
        className="w-full mt-4 py-2 text-center bg-blue-600/70 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300"
      >
        View Details
      </Link>
    </div>
  );
};

export default Card;
