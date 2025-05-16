import { useState, useEffect } from 'react';
import { useParams,  useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  FiX,
  FiMaximize,
} from 'react-icons/fi';
import { FaIdCard, FaUserTag, FaFingerprint, FaCar } from 'react-icons/fa';
import axios from 'axios';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';

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
  const [isIdentityRevealed] = useState<boolean>(true);
  const [showEmptyFields] = useState<boolean>(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [imageModalOpen, setImageModalOpen] = useState<boolean>(false);
  const { t, isRTL } = useTranslationWithFallback();

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
          <p>{error || t('users.notFound', 'User not found')}</p>
          <button
            onClick={() => navigate('/search')}
            className="mt-2 bg-blue-600/70 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
          >
            {t('common.back', 'Back to Search')}
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

  // Calculate age function
  const calculateAge = (dateString: string) => {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age + ' ' + t('forms.child.yearsOld', 'years old');
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
    <div className="p-3 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Back button */}
      <div className="mb-4 sm:mb-6 flex justify-between">
        <button
            onClick={() => navigate(-1)}
          className="px-4 sm:px-6 py-2 bg-blue-600/30 text-white rounded-md hover:bg-blue-700/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 backdrop-blur-lg backdrop-opacity-60 transition-all duration-300 text-sm sm:text-base"
        >
          <FiArrowLeft className={`inline ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('common.back', 'Back to Search')}
        </button>
      </div>

      {/* User profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/30 shadow-lg mb-4 sm:mb-6 ${
          isChildRecord ? 'from-amber-500/20 to-amber-500/10' : ''
        }`}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
          <div
            className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-lg border-2 border-white/30 cursor-pointer relative group"
            onClick={() => user?.image_path && setImageModalOpen(true)}
          >
            {user?.image_path && (
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <FiMaximize className="text-white text-lg" />
                {isChildRecord && (
                  <span className="sr-only">
                    {t('forms.child.clickToEnlarge')}
                  </span>
                )}
              </div>
            )}
            {user?.image_path ? (
              <img
                src={getImageUrl(user.image_path, user.name)}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {user.name}
              </h1>
            </div>
            <p className="text-white/70 mt-1 flex flex-wrap items-center justify-center md:justify-start gap-2">
              {user.form_type && (
                <span className="capitalize bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  {t(`search.formTypes.${user.form_type}`, user.form_type)}
                </span>
              )}
              {user.department && (
                <span className="bg-blue-500/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  {isIdentityRevealed
                    ? user.department
                    : t('users.department', 'Department')}
                </span>
              )}
              {isChildRecord && (
                <span className="bg-amber-500/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  {t('users.childRecord', 'Child Record')}
                </span>
              )}
            </p>
            <p className="text-white/70 mt-2 flex items-center justify-center md:justify-start text-sm">
              <FiCalendar className={`inline ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('users.registeredOn', 'Registered on')}{' '}
              {formatDate(user.created_at)}
            </p>

            {user.has_criminal_record === 1 && (
              <div className="mt-3 inline-block bg-red-500/30 text-white px-4 py-1 rounded-full text-xs sm:text-sm font-medium">
                <FiAlertCircle
                  className={`inline ${isRTL ? 'ml-2' : 'mr-2'}`}
                />
                {t('users.hasCriminalRecord', 'Has Criminal Record')}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {imageModalOpen && user?.image_path && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setImageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                onClick={() => setImageModalOpen(false)}
                aria-label={
                  isChildRecord ? t('forms.child.close') : t('common.cancel')
                }
              >
                <FiX size={24} />
              </button>
              <img
                src={getImageUrl(user.image_path, user.name)}
                alt={user.name}
                className="max-h-[85vh] max-w-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3 text-center">
                {user.name}
                {isChildRecord && (
                  <span className="ml-2 text-sm opacity-70">
                    {t('forms.child.viewImage')}
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column - Main information */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/30 shadow-lg"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
              <FaFingerprint
                className={`${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'} text-blue-400`}
                size={20}
              />
              {t('users.personalInfo', 'Personal Information')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center text-sm">
                  <FiHash className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                  {t('users.id', 'ID:')}
                </span>
                <span className="text-white font-medium text-sm">
                  {user.id
                    ? `${user.id.substring(0, 8)}...`
                    : t('users.notAvailable', 'Not available')}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center text-sm">
                  <FiUser className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                  {t('users.faceId', 'Face ID:')}
                </span>
                <span className="text-white font-medium text-sm">
                  {user.face_id
                    ? `${user.face_id.substring(0, 8)}...`
                    : t('users.notAvailable', 'Not available')}
                </span>
              </div>

              {(user.employee_id || showEmptyFields) && (
                <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                  <span className="text-white/70 flex items-center text-sm">
                    <FiBriefcase className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                    {t('users.employeeId', 'Employee ID:')}
                  </span>
                  <span className="text-white font-medium text-sm">
                    {maskSensitiveInfo(user.employee_id)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center text-sm">
                  <FiHash className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                  {t('users.formType', 'Form Type:')}
                </span>
                <span className="text-white font-medium text-sm capitalize">
                  {t(`search.formTypes.${user.form_type}`, user.form_type)}
                </span>
              </div>

              {(user.occupation || showEmptyFields) && (
                <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                  <span className="text-white/70 flex items-center text-sm">
                    <FiBriefcase className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                    {t('users.occupation', 'Occupation:')}
                  </span>
                  <span className="text-white font-medium text-sm">
                    {maskSensitiveInfo(user.occupation)}
                  </span>
                </div>
              )}

              {(user.address || showEmptyFields) && (
                <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                  <span className="text-white/70 flex items-center text-sm">
                    <FiHome className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                    {t('registration.address', 'Address:')}
                  </span>
                  <span className="text-white font-medium text-sm">
                    {maskSensitiveInfo(user.address)}
                  </span>
                </div>
              )}

              {(user.updated_at || showEmptyFields) && (
                <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                  <span className="text-white/70 flex items-center text-sm">
                    <FiCalendar className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                    {t('users.lastUpdated', 'Last Updated:')}
                  </span>
                  <span className="text-white font-medium text-sm">
                    {formatDate(user.updated_at)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Child Information Section - RESTRUCTURED */}
          {isChildRecord && (
            <>
              {/* Reporter's Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`bg-gradient-to-br ${SECTION_COLORS.child.gradient} backdrop-blur-md rounded-xl p-4 sm:p-6 border ${SECTION_COLORS.child.border} shadow-lg`}
              >
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
                  <FaUserTag
                    className={`${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'} ${SECTION_COLORS.child.icon}`}
                    size={20}
                  />
                  {t('forms.child.reporterInfo', "Reporter's Information")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('users.guardianName', "Reporter's Name:")}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.guardian_name)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('users.guardianId', 'National ID:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.guardian_id)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('registration.address', 'Address:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.address)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('users.guardianPhone', 'Phone Number:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.guardian_phone)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('users.secondaryPhone', 'Additional Phone:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.second_phone_number ||
                          t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t(
                        'forms.child.relationshipToMissing',
                        'Relationship to Missing Person:'
                      )}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.category || t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Missing Person's Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`bg-gradient-to-br ${SECTION_COLORS.child.gradient} backdrop-blur-md rounded-xl p-4 sm:p-6 border ${SECTION_COLORS.child.border} shadow-lg mt-4 sm:mt-6`}
              >
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
                  <FiUser
                    className={`${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'} ${SECTION_COLORS.child.icon}`}
                    size={20}
                  />
                  {t(
                    'forms.child.missingPersonInfo',
                    "Missing Person's Information"
                  )}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('registration.fullName', 'Name:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.name)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('forms.child.age', 'Age:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {user.date_of_birth || user.dob
                        ? calculateAge(String(user.date_of_birth || user.dob))
                        : t('users.notAvailable', 'N/A')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t(
                        'registration.nationalId',
                        'National ID (if available):'
                      )}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.national_id || t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('registration.phoneNumber', 'Phone Number:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.phone_number || t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t(
                        'users.areaOfDisappearance',
                        'Place of Disappearance:'
                      )}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.area_of_disappearance)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t(
                        'forms.child.dateOfDisappearance',
                        'Date of Disappearance:'
                      )}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {formatDate(user.last_seen_time)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('forms.child.lastSeenLocation', 'Last Seen Location:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.area_of_disappearance)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t(
                        'forms.child.distinguishingMark',
                        'Distinguishing Mark:'
                      )}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.physical_description ||
                          t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('users.lastClothes', 'Clothing Description:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.last_clothes)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('forms.child.previousDisputes', 'Previous Disputes:')}
                    </span>
                    <span className="text-white font-medium text-sm" dir="auto">
                      {(() => {
                        // Check if the value is a JSON string and extract the right field
                        try {
                          if (
                            user.additional_data &&
                            user.additional_data.includes('{')
                          ) {
                            const parsed = JSON.parse(user.additional_data);
                            return (
                              parsed.additional_data ||
                              parsed.additional_notes ||
                              user.additional_data
                            );
                          }
                          return (
                            user.additional_data ||
                            t('users.notAvailable', 'N/A')
                          );
                        } catch {
                          // If parsing fails, just show the original data
                          return (
                            user.additional_data ||
                            t('users.notAvailable', 'N/A')
                          );
                        }
                      })()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('forms.child.medicalHistory', 'Medical History:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.medical_condition || t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>
                  
                </div>
              </motion.div>
            </>
          )}

          {/* Disabled Person Information Section - RESTRUCTURED */}
          {isDisabledPerson && (
            <>
              {/* Reporter's Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`bg-gradient-to-br ${SECTION_COLORS.disabled.gradient} backdrop-blur-md rounded-xl p-4 sm:p-6 border ${SECTION_COLORS.disabled.border} shadow-lg`}
              >
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
                  <FaUserTag
                    className={`${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'} ${SECTION_COLORS.disabled.icon}`}
                    size={20}
                  />
                  {t('forms.disabled.reporterInfo', "Reporter's Information")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('forms.disabled.reporterName', "Reporter's Name:")}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.guardian_name)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('forms.disabled.reporterNationalId', 'National ID:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.guardian_id)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('forms.disabled.reporterAddress', 'Address:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.address)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('forms.disabled.reporterPhone', 'Phone Number:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.guardian_phone)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t(
                        'forms.disabled.reporterAltPhone',
                        'Additional Phone Number:'
                      )}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.second_phone_number ||
                          t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t(
                        'forms.disabled.relationshipToMissing',
                        'Relationship to Missing Person:'
                      )}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.category || t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Missing Person's Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`bg-gradient-to-br ${SECTION_COLORS.disabled.gradient} backdrop-blur-md rounded-xl p-4 sm:p-6 border ${SECTION_COLORS.disabled.border} shadow-lg mt-4 sm:mt-6`}
              >
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
                  <FiUser
                    className={`${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'} ${SECTION_COLORS.disabled.icon}`}
                    size={20}
                  />
                  {t(
                    'forms.disabled.missingPersonInfo',
                    "Missing Person's Information"
                  )}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('forms.disabled.missingPersonName', 'Name:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.name)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('forms.disabled.age', 'Age:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {user.date_of_birth || user.dob
                        ? calculateAge(String(user.date_of_birth || user.dob))
                        : t('users.notAvailable', 'N/A')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t(
                        'forms.disabled.nationalId',
                        'National ID (if available):'
                      )}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.national_id || t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('forms.disabled.phoneNumber', 'Phone Number:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.phone_number || t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t(
                        'forms.disabled.disappearanceLocation',
                        'Place of Disappearance:'
                      )}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.area_of_disappearance ||
                          t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t(
                        'forms.disabled.dateOfDisappearance',
                        'Date of Disappearance:'
                      )}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {formatDate(user.last_seen_time) ||
                        t('users.notAvailable', 'N/A')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t(
                        'forms.disabled.lastSeenLocation',
                        'Last Seen Location:'
                      )}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.area_of_disappearance ||
                          t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t(
                        'forms.disabled.distinguishingMark',
                        'Distinguishing Mark:'
                      )}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.physical_description ||
                          t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('forms.disabled.clothes', 'Clothing Description:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.last_clothes || t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t(
                        'forms.disabled.previousDisputes',
                        'Previous Disputes:'
                      )}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.additional_data || t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('forms.disabled.medicalHistory', 'Medical History:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(
                        user.medical_condition || t('users.notAvailable', 'N/A')
                      )}
                    </span>
                  </div>
                </div>

                {/* Disability-specific information */}
                <h3 className="text-base sm:text-lg font-semibold text-white mt-4 mb-3">
                  {t('forms.disabled.disabilityInfo', 'Disability Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('forms.disabled.disabilityType', 'Disability Type:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {user.disability_type &&
                        t(
                          user.disability_type,
                          maskSensitiveInfo(user.disability_type)
                        )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t(
                        'forms.disabled.disabilityDetails',
                        'Disability Description:'
                      )}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.disability_description)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('forms.disabled.specialNeeds', 'Special Needs:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.special_needs)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t(
                        'forms.disabled.emergencyContact',
                        'Emergency Contact:'
                      )}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.emergency_contact)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white/70 text-sm">
                      {t('users.emergencyPhone', 'Emergency Phone:')}
                    </span>
                    <span className="text-white font-medium text-sm">
                      {maskSensitiveInfo(user.emergency_phone)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </>
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
                  className={`bg-gradient-to-br ${user.form_type === 'woman' ? SECTION_COLORS.woman.gradient : SECTION_COLORS.man.gradient} backdrop-blur-md rounded-xl p-4 sm:p-6 border ${user.form_type === 'woman' ? SECTION_COLORS.woman.border : SECTION_COLORS.man.border} shadow-lg`}
                >
                  <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
                    <FaCar
                      className={`${isRTL ? 'mr-2 sm:mr-3' : 'ml-2 sm:ml-3'} ${user.form_type === 'woman' ? SECTION_COLORS.woman.icon : SECTION_COLORS.man.icon}`}
                      size={20}
                    />
                    {t('users.vehicleInfo', 'Vehicle Information')}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.licensePlate', 'License Plate:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {maskSensitiveInfo(user.license_plate)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.vehicleModel', 'Vehicle Model:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {maskSensitiveInfo(user.vehicle_model)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.vehicleColor', 'Vehicle Color:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {maskSensitiveInfo(user.vehicle_color)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.chassisNumber', 'Chassis Number:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {maskSensitiveInfo(user.chassis_number)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.vehicleNumber', 'Vehicle Number:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {maskSensitiveInfo(user.vehicle_number)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.licenseExpiration', 'License Expiration:')}
                      </span>
                      <span className="text-white font-medium text-sm">
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
                  className={`bg-gradient-to-br ${user.form_type === 'woman' ? SECTION_COLORS.woman.gradient : SECTION_COLORS.man.gradient} backdrop-blur-md rounded-xl p-4 sm:p-6 border ${user.form_type === 'woman' ? SECTION_COLORS.woman.border : SECTION_COLORS.man.border} shadow-lg`}
                >
                  <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
                    <FiMap
                      className={`${isRTL ? 'mr-2 sm:mr-3' : 'ml-2 sm:ml-3'} ${user.form_type === 'woman' ? SECTION_COLORS.woman.icon : SECTION_COLORS.man.icon}`}
                      size={20}
                    />
                    {t('users.travelInfo', 'Travel Information')}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.travelDate', 'Travel Date:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {formatDate(user.travel_date)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.travelDestination', 'Travel Destination:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {maskSensitiveInfo(user.travel_destination)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.arrivalAirport', 'Arrival Airport:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {maskSensitiveInfo(user.arrival_airport)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.arrivalDate', 'Arrival Date:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {formatDate(user.arrival_date)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.flightNumber', 'Flight Number:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {maskSensitiveInfo(user.flight_number)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.returnDate', 'Return Date:')}
                      </span>
                      <span className="text-white font-medium text-sm">
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
                  className="bg-red-500/20 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-red-500/30 shadow-lg"
                >
                  <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
                    <FiAlertCircle className={`${isRTL ? 'mr-2' : 'ml-2'}`} />
                    {t('users.caseInfo', 'Case Information')}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.hasCriminalRecord', 'Has Criminal Record:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {user.has_criminal_record === 1
                          ? t('common.yes', 'Yes')
                          : t('common.no', 'No')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.caseDetails', 'Case Details:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {maskSensitiveInfo(user.case_details)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.policeStation', 'Police Station:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {maskSensitiveInfo(user.police_station)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.caseNumber', 'Case Number:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {maskSensitiveInfo(user.case_number)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.judgment', 'Judgment:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {maskSensitiveInfo(user.judgment)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <span className="text-white/70 text-sm">
                        {t('users.accusation', 'Accusation:')}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {maskSensitiveInfo(user.accusation)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Common Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-teal-500/20 to-teal-500/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-teal-500/30 shadow-lg"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
              <FiInfo
                className={`${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'} text-teal-400`}
                size={20}
              />
              {t('users.commonInfo', 'Common Information')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center text-sm">
                  <FiUser className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                  {t('registration.fullName', 'Full Name:')}
                </span>
                <span className="text-white font-medium text-sm">
                  {maskSensitiveInfo(
                    user.name || t('users.notAvailable', 'N/A')
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center text-sm">
                  <FiUser className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                  {t('registration.nickname', 'Nickname:')}
                </span>
                <span className="text-white font-medium text-sm">
                  {maskSensitiveInfo(
                    user.nickname || t('users.notAvailable', 'N/A')
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center text-sm">
                  <FiCalendar className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                  {t('registration.dateOfBirth', 'Date of Birth:')}
                </span>
                <span className="text-white font-medium text-sm">
                  {formatDate(user.dob || user.date_of_birth) ||
                    t('users.notAvailable', 'N/A')}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center text-sm">
                  <FiHash className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                  {t('registration.nationalId', 'National ID:')}
                </span>
                <span className="text-white font-medium text-sm">
                  {maskSensitiveInfo(
                    user.national_id || t('users.notAvailable', 'N/A')
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center text-sm">
                  <FiHome className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                  {t('registration.address', 'Address:')}
                </span>
                <span className="text-white font-medium text-sm">
                  {maskSensitiveInfo(
                    user.address || t('users.notAvailable', 'N/A')
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
                <span className="text-white/70 flex items-center text-sm">
                  <FiTag className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                  {t('users.category', 'Category:')}
                </span>
                <span className="text-white font-medium text-sm">
                  {maskSensitiveInfo(
                    user.category || t('users.notAvailable', 'N/A')
                  )}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Phone Numbers Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-blue-500/30 shadow-lg"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
              <FiPhone
                className={`${isRTL ? 'mr-2 sm:mr-3' : 'ml-2 sm:ml-3'} text-blue-400`}
                size={20}
              />
              {t('users.phoneNumbers', 'Phone Numbers')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-white/70 text-sm">
                  {t('users.primaryPhone', 'Primary Phone:')}
                </span>
                <span className="text-white font-medium text-sm">
                  {maskSensitiveInfo(
                    user.phone_number || t('users.notAvailable', 'N/A')
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-white/70 text-sm">
                  {t('users.secondaryPhone', 'Secondary Phone:')}
                </span>
                <span className="text-white font-medium text-sm">
                  {maskSensitiveInfo(
                    user.second_phone_number || t('users.notAvailable', 'N/A')
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-white/70 text-sm">
                  {t('users.phoneProvider', 'Phone Provider:')}
                </span>
                <span className="text-white font-medium text-sm">
                  {maskSensitiveInfo(
                    user.phone_company || t('users.notAvailable', 'N/A')
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-white/70 text-sm">
                  {t('users.registrationDate', 'Registration Date:')}
                </span>
                <span className="text-white font-medium text-sm">
                  {formatDate(user.created_at) ||
                    t('users.notAvailable', 'N/A')}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right column - Actions and Identity Verification */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 shadow-lg"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
              <FiActivity
                className={`${isRTL ? 'mr-2 sm:mr-3' : 'ml-2 sm:ml-3'} text-white`}
                size={20}
              />
              {t('users.actions', 'Actions')}
            </h2>

            <div className="flex flex-col gap-3">
              <button
                onClick={() =>
                  navigate(
                    `/register/${user.form_type === 'child' ? 'child' : 'man'}?edit=${user.id}`
                  )
                }
                className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600/70 to-green-700/70 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-colors duration-300 flex items-center justify-center text-sm sm:text-base"
              >
                <FiFileText className={`${isRTL ? 'mr-2' : 'ml-2'}`} />{' '}
                {t('users.editInformation', 'Edit Information')}
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600/70 to-red-700/70 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-colors duration-300 flex items-center justify-center text-sm sm:text-base"
              >
                <FiTrash2 className={`${isRTL ? 'mr-2' : 'ml-2'}`} />{' '}
                {t('common.delete', 'Delete Record')}
              </button>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                    {t('users.confirmDeletion', 'Confirm Deletion')}
                  </h3>
                  <p className="text-white/70 mb-4 sm:mb-6 text-sm sm:text-base">
                    {t(
                      'users.deleteWarning',
                      'Are you sure you want to delete this record? This action cannot be undone.'
                    )}
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-600/70 hover:bg-gray-600 text-white rounded-lg transition-colors duration-300 text-sm sm:text-base"
                    >
                      {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600/70 hover:bg-red-600 text-white rounded-lg transition-colors duration-300 text-sm sm:text-base"
                    >
                      {t('common.delete', 'Delete')}
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
            className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/30 shadow-lg"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
              <FaIdCard
                className={`${isRTL ? 'mr-2 sm:mr-3' : 'ml-2 sm:ml-3'} text-white`}
                size={20}
              />
              {t('users.identityVerification', 'Identity Verification')}
            </h2>

            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
              <div className="flex justify-between items-center">
                <span className="text-white/70">
                  {t('users.idVerified', 'ID Verified:')}
                </span>
                <span className="text-white font-medium">
                  {isIdentityRevealed
                    ? t('common.yes', 'Yes')
                    : t('common.no', 'No')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/70">
                  {t('users.faceIdVerified', 'Face ID Verified:')}
                </span>
                <span className="text-white font-medium">
                  {isIdentityRevealed
                    ? t('common.yes', 'Yes')
                    : t('common.no', 'No')}
                </span>
              </div>

              {user.employee_id && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">
                    {t('users.employeeIdVerified', 'Employee ID Verified:')}
                  </span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed
                      ? t('common.yes', 'Yes')
                      : t('common.no', 'No')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-white/70">
                  {t('users.formTypeVerified', 'Form Type Verified:')}
                </span>
                <span className="text-white font-medium">
                  {isIdentityRevealed
                    ? t('common.yes', 'Yes')
                    : t('common.no', 'No')}
                </span>
              </div>

              {user.date_of_birth && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">
                    {t('users.dateOfBirthVerified', 'Date of Birth Verified:')}
                  </span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed
                      ? t('common.yes', 'Yes')
                      : t('common.no', 'No')}
                  </span>
                </div>
              )}

              {user.address && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">
                    {t('users.addressVerified', 'Address Verified:')}
                  </span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed
                      ? t('common.yes', 'Yes')
                      : t('common.no', 'No')}
                  </span>
                </div>
              )}

              {user.occupation && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">
                    {t('users.occupationVerified', 'Occupation Verified:')}
                  </span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed
                      ? t('common.yes', 'Yes')
                      : t('common.no', 'No')}
                  </span>
                </div>
              )}

              {user.has_criminal_record === 1 && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">
                    {t(
                      'users.criminalRecordVerified',
                      'Criminal Record Verified:'
                    )}
                  </span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed
                      ? t('common.yes', 'Yes')
                      : t('common.no', 'No')}
                  </span>
                </div>
              )}

              {hasVehicleInfo && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">
                    {t('users.vehicleInfoVerified', 'Vehicle Info Verified:')}
                  </span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed
                      ? t('common.yes', 'Yes')
                      : t('common.no', 'No')}
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
            className="bg-purple-500/20 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-purple-500/30 shadow-lg"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
              <FaIdCard className={`${isRTL ? 'mr-2' : 'ml-2'}`} />
              {t('users.biometricVerification', 'Biometric Verification')}
            </h2>

            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
              <div className="flex justify-between items-center">
                <span className="text-white/70">
                  {t('users.faceRecognition', 'Face Recognition:')}
                </span>
                <span className="text-white font-medium">
                  {isIdentityRevealed
                    ? t('common.verified', 'Verified')
                    : t('common.hidden', 'Hidden')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/70">
                  {t('users.fingerprint', 'Fingerprint:')}
                </span>
                <span className="text-white font-medium">
                  {isIdentityRevealed
                    ? t('common.notAvailable', 'Not Available')
                    : t('common.hidden', 'Hidden')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/70">
                  {t('users.lastVerification', 'Last Verification:')}
                </span>
                <span className="text-white font-medium">
                  {isIdentityRevealed
                    ? formatDate(user.updated_at || user.created_at)
                    : t('common.hidden', 'Hidden')}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Document Verification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-green-500/20 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-green-500/30 shadow-lg"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
              <FiFileText className={`${isRTL ? 'mr-2' : 'ml-2'}`} />
              {t('users.documentVerification', 'Document Verification')}
            </h2>

            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
              <div className="flex justify-between items-center">
                <span className="text-white/70">
                  {t('users.idCard', 'ID Card:')}
                </span>
                <span className="text-white font-medium">
                  {isIdentityRevealed
                    ? user.employee_id
                      ? t('common.verified', 'Verified')
                      : t('common.notAvailable', 'Not Available')
                    : t('common.hidden', 'Hidden')}
                </span>
              </div>

              {user.form_type === 'child' && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">
                    {t('users.birthCertificate', 'Birth Certificate:')}
                  </span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed
                      ? t('common.notAvailable', 'Not Available')
                      : t('common.hidden', 'Hidden')}
                  </span>
                </div>
              )}

              {hasVehicleInfo && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">
                    {t('users.vehicleLicense', 'Vehicle License:')}
                  </span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed
                      ? t('common.verified', 'Verified')
                      : t('common.hidden', 'Hidden')}
                  </span>
                </div>
              )}

              {user.has_criminal_record === 1 && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">
                    {t('users.caseDocuments', 'Case Documents:')}
                  </span>
                  <span className="text-white font-medium">
                    {isIdentityRevealed
                      ? t('common.verified', 'Verified')
                      : t('common.hidden', 'Hidden')}
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
