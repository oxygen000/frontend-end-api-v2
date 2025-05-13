import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiCalendar,
  FiHash,
  FiHome,
  FiBriefcase,
  FiInfo,
  FiTag,
  FiArrowLeft,
  FiAlertCircle,
  FiPhone,
  FiMap,
  FiFileText,
  FiActivity,
  FiTrash2,
  FiEye,
} from 'react-icons/fi';
import {
  FaIdCard,
  FaUserTag,
  FaFingerprint,
  FaCar,
} from 'react-icons/fa';
import axios from 'axios';

interface User {
  id: string;
  face_id: string;
  name: string;
  employee_id: string | null;
  department: string | null;
  image_path: string;
  created_at: string;
  updated_at: string | null;
  form_type: string;

  // Common fields for all forms
  nickname: string | null;
  dob: string | null;
  national_id: string | null;
  address: string | null;
  phone_number: string | null;
  phone_company: string | null;
  second_phone_number: string | null;
  category: string | null;

  // Adult form fields
  occupation: string | null;
  license_plate: string | null;
  vehicle_model: string | null;
  vehicle_color: string | null;
  chassis_number: string | null;
  vehicle_number: string | null;
  license_expiration: string | null;
  has_criminal_record: number;
  case_details: string | null;
  police_station: string | null;
  case_number: string | null;
  judgment: string | null;
  accusation: string | null;
  travel_date: string | null;
  travel_destination: string | null;
  arrival_airport: string | null;
  arrival_date: string | null;
  flight_number: string | null;
  return_date: string | null;

  // Child form fields
  date_of_birth: string | null;
  physical_description: string | null;
  last_clothes: string | null;
  area_of_disappearance: string | null;
  last_seen_time: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_id: string | null;

  // Disabled person form fields
  disability_type: string | null;
  disability_description: string | null;
  medical_condition: string | null;
  special_needs: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;

  // Additional fields
  additional_data: string | null;
  brand_affiliation: string | null;
  brand_products: string | null;
  brand_position: string | null;
}

// Add these color constants at the top of the file
const SECTION_COLORS = {
  child: {
    gradient: 'from-amber-500/20 to-amber-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
  },
  disabled: {
    gradient: 'from-purple-500/20 to-purple-500/10',
    border: 'border-purple-500/30',
    icon: 'text-purple-400',
  },
  man: {
    gradient: 'from-blue-500/20 to-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
  },
  woman: {
    gradient: 'from-pink-500/20 to-pink-500/10',
    border: 'border-pink-500/30',
    icon: 'text-pink-400',
  },
};

function Userdata() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isIdentityRevealed, ] = useState<boolean>(true);
  const [showEmptyFields] = useState<boolean>(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://backend-fast-api-ai.fly.dev/api/users/${id}`
        );

        if (response.data && response.data.status === 'success') {
          setUser(response.data.user);
        } else {
          setError('Failed to load user data');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('An error occurred while fetching user data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `https://backend-fast-api-ai.fly.dev/api/users/${id}`
      );

      if (response.data && response.data.status === 'success') {
        navigate('/search');
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('An error occurred while deleting the user');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-100/20 backdrop-blur-md border border-red-400/30 text-red-700 px-4 py-3 rounded">
          <p>{error || 'User not found'}</p>
          <button
            onClick={() => navigate('/search')}
            className="mt-2 bg-blue-600/70 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Function to mask sensitive information
  const maskSensitiveInfo = (text: string | null) => {
    if (!text) return 'N/A';
    if (!isIdentityRevealed) {
      return '••••••••';
    }
    return text;
  };

  // Check if user is a child record
  const isChildRecord = user.form_type === 'child';

  // Check if user is a disabled person
  const isDisabledPerson = user.form_type === 'disabled';

  // Check if user is an adult/man
  const isAdult = user.form_type === 'adult' || user.form_type === 'man';

  // Check if user has vehicle information
  const hasVehicleInfo =
    user.vehicle_model ||
    user.license_plate ||
    user.vehicle_color ||
    user.chassis_number ||
    user.vehicle_number ||
    user.license_expiration;

  // Check if user has case information
  const hasCaseInfo =
    user.has_criminal_record === 1 ||
    user.case_details ||
    user.police_station ||
    user.case_number ||
    user.judgment ||
    user.accusation;

  // Check if user has travel information
  const hasTravelInfo =
    user.travel_date ||
    user.travel_destination ||
    user.arrival_airport ||
    user.arrival_date ||
    user.flight_number ||
    user.return_date;

  const getImageUrl = (
    imagePath: string | null | undefined,
    userName: string
  ) => {
    if (!imagePath) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
    }

    // Check if image_path already contains the full URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // If image_path doesn't contain 'uploads/' prefix, add it
    const formattedPath = imagePath.includes('uploads/')
      ? imagePath
      : `uploads/${imagePath}`;

    // Ensure we don't have double slashes in the URL
    return `https://backend-fast-api-ai.fly.dev/${formattedPath.replace(/^\/?/, '')}`;
  };

  return (
    <div className="p-6">
      {/* Back button */}
      <div className="mb-6 flex justify-between">
        <Link
          to="/search"
          className="px-6 py-2 bg-blue-600/30 text-white rounded-md hover:bg-blue-700/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 backdrop-blur-lg backdrop-opacity-60 transition-all duration-300"
        >
          <FiArrowLeft className="inline mr-2" />
          Back to Search
        </Link>
      </div>

      {/* User profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg mb-6 ${
          isChildRecord ? 'from-amber-500/20 to-amber-500/10' : ''
        }`}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-lg border-2 border-white/30">
            {user.image_path ? (
              <img
                src={getImageUrl(user.image_path, user.name)}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start">
              <h1 className="text-2xl font-bold text-white">
              {user.name}
              </h1>
             
            </div>
            <p className="text-white/70 mt-1">
              {user.form_type && (
                <span className="capitalize bg-white/20 px-3 py-1 rounded-full text-sm">
                  {user.form_type}
                </span>
              )}
              {user.department && (
                <span className="ml-2 bg-blue-500/30 px-3 py-1 rounded-full text-sm">
                  {isIdentityRevealed ? user.department : 'Department'}
                </span>
              )}
              {isChildRecord && (
                <span className="ml-2 bg-amber-500/50 text-white px-3 py-1 rounded-full text-sm">
                  Child Record
                </span>
              )}
            </p>
            <p className="text-white/70 mt-2 flex items-center">
              <FiCalendar className="inline mr-2" />
              Registered on {formatDate(user.created_at)}
            </p>

            {user.has_criminal_record === 1 && (
              <div className="mt-3 inline-block bg-red-500/30 text-white px-4 py-1 rounded-full text-sm font-medium">
                <FiAlertCircle className="inline mr-2" />
                Has Criminal Record
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* User details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FaFingerprint className="mr-3 text-blue-400" size={22} />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center">
                  <FiHash className="mr-2" /> ID:
                </span>
                <span className="text-white font-medium">
                  {user.id ? `${user.id.substring(0, 8)}...` : 'Not available'}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center">
                  <FiUser className="mr-2" /> Face ID:
                </span>
                <span className="text-white font-medium">
                  {user.face_id
                    ? `${user.face_id.substring(0, 8)}...`
                    : 'Not available'}
                </span>
              </div>

              {(user.employee_id || showEmptyFields) && (
                <div className="flex justify-between items-center p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                  <span className="text-white/70 flex items-center">
                    <FiBriefcase className="mr-2" /> Employee ID:
                  </span>
                  <span className="text-white font-medium">
                    {maskSensitiveInfo(user.employee_id)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center">
                  <FiHash className="mr-2" /> Form Type:
                </span>
                <span className="text-white font-medium capitalize">
                  {user.form_type}
                </span>
              </div>

              {(user.occupation || showEmptyFields) && (
                <div className="flex justify-between items-center p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                  <span className="text-white/70 flex items-center">
                    <FiBriefcase className="mr-2" /> Occupation:
                  </span>
                  <span className="text-white font-medium">
                    {maskSensitiveInfo(user.occupation)}
                  </span>
                </div>
              )}

              {(user.address || showEmptyFields) && (
                <div className="flex justify-between items-center p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                  <span className="text-white/70 flex items-center">
                    <FiHome className="mr-2" /> Address:
                  </span>
                  <span className="text-white font-medium">
                    {maskSensitiveInfo(user.address)}
                  </span>
                </div>
              )}

              {(user.updated_at || showEmptyFields) && (
                <div className="flex justify-between items-center p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                  <span className="text-white/70 flex items-center">
                    <FiCalendar className="mr-2" /> Last Updated:
                  </span>
                  <span className="text-white font-medium">
                    {formatDate(user.updated_at)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Child Information Section */}
          {isChildRecord && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`bg-gradient-to-br ${SECTION_COLORS.child.gradient} backdrop-blur-md rounded-xl p-6 border ${SECTION_COLORS.child.border} shadow-lg`}
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FaUserTag
                  className={`mr-3 ${SECTION_COLORS.child.icon}`}
                  size={22}
                />
                Child Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-white/70">Date of Birth:</span>
                  <span className="text-white font-medium">
                    {formatDate(user.date_of_birth)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-white/70">Physical Description:</span>
                  <span className="text-white font-medium">
                    {maskSensitiveInfo(user.physical_description)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-white/70">Last Clothes:</span>
                  <span className="text-white font-medium">
                    {maskSensitiveInfo(user.last_clothes)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-white/70">Area of Disappearance:</span>
                  <span className="text-white font-medium">
                    {maskSensitiveInfo(user.area_of_disappearance)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-white/70">Last Seen Time:</span>
                  <span className="text-white font-medium">
                    {formatDate(user.last_seen_time)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-white/70">Guardian Name:</span>
                  <span className="text-white font-medium">
                    {maskSensitiveInfo(user.guardian_name)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-white/70">Guardian Phone:</span>
                  <span className="text-white font-medium">
                    {maskSensitiveInfo(user.guardian_phone)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-white/70">Guardian ID:</span>
                  <span className="text-white font-medium">
                    {maskSensitiveInfo(user.guardian_id)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Disabled Person Information Section */}
          {isDisabledPerson && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={`bg-gradient-to-br ${SECTION_COLORS.disabled.gradient} backdrop-blur-md rounded-xl p-6 border ${SECTION_COLORS.disabled.border} shadow-lg`}
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FiInfo
                  className={`mr-3 ${SECTION_COLORS.disabled.icon}`}
                  size={22}
                />
                Disability Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-white/70">Disability Type:</span>
                  <span className="text-white font-medium">
                    {maskSensitiveInfo(user.disability_type)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-white/70">Disability Description:</span>
                  <span className="text-white font-medium">
                    {maskSensitiveInfo(user.disability_description)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-white/70">Medical Condition:</span>
                  <span className="text-white font-medium">
                    {maskSensitiveInfo(user.medical_condition)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-white/70">Special Needs:</span>
                  <span className="text-white font-medium">
                    {maskSensitiveInfo(user.special_needs)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-white/70">Emergency Contact:</span>
                  <span className="text-white font-medium">
                    {maskSensitiveInfo(user.emergency_contact)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-white/70">Emergency Phone:</span>
                  <span className="text-white font-medium">
                    {maskSensitiveInfo(user.emergency_phone)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Adult/Man Information Section */}
          {isAdult && (
            <>
              {/* Vehicle Information */}
              {hasVehicleInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`bg-gradient-to-br ${user.form_type === 'woman' ? SECTION_COLORS.woman.gradient : SECTION_COLORS.man.gradient} backdrop-blur-md rounded-xl p-6 border ${user.form_type === 'woman' ? SECTION_COLORS.woman.border : SECTION_COLORS.man.border} shadow-lg`}
                >
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <FaCar
                      className={`mr-3 ${user.form_type === 'woman' ? SECTION_COLORS.woman.icon : SECTION_COLORS.man.icon}`}
                      size={22}
                    />
                    Vehicle Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">License Plate:</span>
                      <span className="text-white font-medium">
                        {maskSensitiveInfo(user.license_plate)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Vehicle Model:</span>
                      <span className="text-white font-medium">
                        {maskSensitiveInfo(user.vehicle_model)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Vehicle Color:</span>
                      <span className="text-white font-medium">
                        {maskSensitiveInfo(user.vehicle_color)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Chassis Number:</span>
                      <span className="text-white font-medium">
                        {maskSensitiveInfo(user.chassis_number)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Vehicle Number:</span>
                      <span className="text-white font-medium">
                        {maskSensitiveInfo(user.vehicle_number)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">License Expiration:</span>
                      <span className="text-white font-medium">
                        {formatDate(user.license_expiration)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Travel Information */}
              {hasTravelInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`bg-gradient-to-br ${user.form_type === 'woman' ? SECTION_COLORS.woman.gradient : SECTION_COLORS.man.gradient} backdrop-blur-md rounded-xl p-6 border ${user.form_type === 'woman' ? SECTION_COLORS.woman.border : SECTION_COLORS.man.border} shadow-lg`}
                >
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <FiMap
                      className={`mr-3 ${user.form_type === 'woman' ? SECTION_COLORS.woman.icon : SECTION_COLORS.man.icon}`}
                      size={22}
                    />
                    Travel Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Travel Date:</span>
                      <span className="text-white font-medium">
                        {formatDate(user.travel_date)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Travel Destination:</span>
                      <span className="text-white font-medium">
                        {maskSensitiveInfo(user.travel_destination)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Arrival Airport:</span>
                      <span className="text-white font-medium">
                        {maskSensitiveInfo(user.arrival_airport)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Arrival Date:</span>
                      <span className="text-white font-medium">
                        {formatDate(user.arrival_date)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Flight Number:</span>
                      <span className="text-white font-medium">
                        {maskSensitiveInfo(user.flight_number)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Return Date:</span>
                      <span className="text-white font-medium">
                        {formatDate(user.return_date)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Case Information */}
              {hasCaseInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-red-500/20 backdrop-blur-md rounded-xl p-6 border border-red-500/30 shadow-lg"
                >
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <FiAlertCircle className="mr-2" />
                    Case Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">
                        Has Criminal Record:
                      </span>
                      <span className="text-white font-medium">
                        {user.has_criminal_record === 1 ? 'Yes' : 'No'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Case Details:</span>
                      <span className="text-white font-medium">
                        {maskSensitiveInfo(user.case_details)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Police Station:</span>
                      <span className="text-white font-medium">
                        {maskSensitiveInfo(user.police_station)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Case Number:</span>
                      <span className="text-white font-medium">
                        {maskSensitiveInfo(user.case_number)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Judgment:</span>
                      <span className="text-white font-medium">
                        {maskSensitiveInfo(user.judgment)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70">Accusation:</span>
                      <span className="text-white font-medium">
                        {maskSensitiveInfo(user.accusation)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Additional Data (if applicable) */}
          {user.additional_data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-500/20 backdrop-blur-md rounded-xl p-6 border border-gray-500/30 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FiFileText className="mr-2" />
                Additional Data
              </h2>

              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-white/70">Additional Information:</span>
                <span className="text-white font-medium">
                  {maskSensitiveInfo(user.additional_data)}
                </span>
              </div>
            </motion.div>
          )}

          {/* Common Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-teal-500/20 to-teal-500/10 backdrop-blur-md rounded-xl p-6 border border-teal-500/30 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FiInfo className="mr-3 text-teal-400" size={22} />
              Common Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center">
                  <FiUser className="mr-2" /> Full Name:
                </span>
                <span className="text-white font-medium">
                  {maskSensitiveInfo(user.name || 'N/A')}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center">
                  <FiUser className="mr-2" /> Nickname:
                </span>
                <span className="text-white font-medium">
                  {maskSensitiveInfo(user.nickname || 'N/A')}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center">
                  <FiCalendar className="mr-2" /> Date of Birth:
                </span>
                <span className="text-white font-medium">
                  {formatDate(user.dob || user.date_of_birth) || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center">
                  <FiHash className="mr-2" /> National ID:
                </span>
                <span className="text-white font-medium">
                  {maskSensitiveInfo(user.national_id || 'N/A')}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center">
                  <FiHome className="mr-2" /> Address:
                </span>
                <span className="text-white font-medium">
                  {maskSensitiveInfo(user.address || 'N/A')}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center">
                  <FiTag className="mr-2" /> Category:
                </span>
                <span className="text-white font-medium">
                  {maskSensitiveInfo(user.category || 'N/A')}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Phone Numbers Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 backdrop-blur-md rounded-xl p-6 border border-blue-500/30 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FiPhone className="mr-3 text-blue-400" size={22} />
              Phone Numbers
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-white/70">Primary Phone:</span>
                <span className="text-white font-medium">
                  {maskSensitiveInfo(user.phone_number || 'N/A')}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-white/70">Secondary Phone:</span>
                <span className="text-white font-medium">
                  {maskSensitiveInfo(user.second_phone_number || 'N/A')}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-white/70">Phone Provider:</span>
                <span className="text-white font-medium">
                  {maskSensitiveInfo(user.phone_company || 'N/A')}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-white/70">Registration Date:</span>
                <span className="text-white font-medium">
                  {formatDate(user.created_at) || 'N/A'}
                </span>
              </div>
            </div>
          </motion.div>

         
        </div>

        {/* Right column - Actions and Identity Verification */}
        <div className="lg:col-span-1 space-y-6">
          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FiActivity className="mr-3 text-white" size={22} />
              Actions
            </h2>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate(`/identification?id=${user.id}`)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600/70 to-blue-700/70 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                <FiEye className="mr-2" /> Verify Identity
              </button>

              <button
                onClick={() =>
                  navigate(
                    `/register/${user.form_type === 'child' ? 'child' : 'man'}?edit=${user.id}`
                  )
                }
                className="px-6 py-3 bg-gradient-to-r from-green-600/70 to-green-700/70 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                <FiFileText className="mr-2" /> Edit Information
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 bg-gradient-to-r from-red-600/70 to-red-700/70 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                <FiTrash2 className="mr-2" /> Delete Record
              </button>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Confirm Deletion
                  </h3>
                  <p className="text-white/70 mb-6">
                    Are you sure you want to delete this record? This action
                    cannot be undone.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-600/70 hover:bg-gray-600 text-white rounded-lg transition-colors duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600/70 hover:bg-red-600 text-white rounded-lg transition-colors duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Identity Verification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FaIdCard className="mr-3 text-white" size={22} />
              Identity Verification
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">ID Verified:</span>
                <span className="text-white font-medium">
                  {isIdentityRevealed ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/70">Face ID Verified:</span>
                <span className="text-white font-medium">
                  {isIdentityRevealed ? 'Yes' : 'No'}
                </span>
              </div>

              {user.employee_id && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Employee ID Verified:</span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed ? 'Yes' : 'No'}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-white/70">Form Type Verified:</span>
                <span className="text-white font-medium">
                  {isIdentityRevealed ? 'Yes' : 'No'}
                </span>
              </div>

              {user.date_of_birth && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Date of Birth Verified:</span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed ? 'Yes' : 'No'}
                  </span>
                </div>
              )}

              {user.address && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Address Verified:</span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed ? 'Yes' : 'No'}
                  </span>
                </div>
              )}

              {user.occupation && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Occupation Verified:</span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed ? 'Yes' : 'No'}
                  </span>
                </div>
              )}

              {user.has_criminal_record === 1 && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">
                    Criminal Record Verified:
                  </span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed ? 'Yes' : 'No'}
                  </span>
                </div>
              )}

              {hasVehicleInfo && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Vehicle Info Verified:</span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Biometric Verification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-purple-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FaIdCard className="mr-2" />
              Biometric Verification
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Face Recognition:</span>
                <span className="text-white font-medium">
                  {isIdentityRevealed ? 'Verified' : 'Hidden'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/70">Fingerprint:</span>
                <span className="text-white font-medium">
                  {isIdentityRevealed ? 'Not Available' : 'Hidden'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/70">Last Verification:</span>
                <span className="text-white font-medium">
                  {isIdentityRevealed
                    ? formatDate(user.updated_at || user.created_at)
                    : 'Hidden'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Document Verification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-green-500/20 backdrop-blur-md rounded-xl p-6 border border-green-500/30 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FiFileText className="mr-2" />
              Document Verification
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">ID Card:</span>
                <span className="text-white font-medium">
                  {isIdentityRevealed
                    ? user.employee_id
                      ? 'Verified'
                      : 'Not Available'
                    : 'Hidden'}
                </span>
              </div>

              {user.form_type === 'child' && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Birth Certificate:</span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed ? 'Not Available' : 'Hidden'}
                  </span>
                </div>
              )}

              {hasVehicleInfo && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Vehicle License:</span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed ? 'Verified' : 'Hidden'}
                  </span>
                </div>
              )}

              {user.has_criminal_record === 1 && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Case Documents:</span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed ? 'Verified' : 'Hidden'}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Userdata;
