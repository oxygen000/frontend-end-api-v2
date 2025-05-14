import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';

// Import types from API service and create a combined type
import type {
  MaleUser,
  FemaleUser,
  ChildUser,
  DisabledUser,
} from '../../services/api';

// Combine all user types for API handling
type ApiUser = MaleUser | FemaleUser | ChildUser | DisabledUser;

// Extended user type with additional profile fields
interface ProfileUser {
  id: string | number;
  username?: string;
  name?: string;
  photo?: string;
  image_path?: string;
  email?: string;
  bio?: string;
  registrationDate?: string;
  created_at?: string;
  // Reference to API user type if needed
  apiData?: ApiUser;
}

// Registration data interface
interface RegistrationData {
  name: string;
  nickname?: string;
  dob?: string;
  date_of_birth?: string;
  gender?: string;
  national_id?: string;
  address?: string;
  category?: string;
  form_type?: string;
  physical_description?: string;
  last_clothes?: string;
  area_of_disappearance?: string;
  last_seen_time?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_id?: string;
  relationship?: string;
  additional_notes?: string;
  phone_number?: string;
  phone_company?: string;
  employee_id?: string;
  department?: string;
  role?: string;
  // Additional fields for other user types
  job?: string;
  document_number?: string;
  occupation?: string;
  disability_type?: string;
  disability_details?: string;
  medical_condition?: string;
  medication?: string;
  caregiver_name?: string;
  caregiver_phone?: string;
  caregiver_relationship?: string;
}

// Enhanced mock users with profile data
const profileUsers: ProfileUser[] = [
  {
    id: 1,
    username: 'user1',
    name: 'John Smith',
    photo: 'https://randomuser.me/api/portraits/men/1.jpg',
    email: 'john.smith@example.com',
    bio: 'Software developer with 5 years of experience',
    registrationDate: '2023-05-15',
  },
  {
    id: 2,
    username: 'user2',
    name: 'Sarah Johnson',
    photo: 'https://randomuser.me/api/portraits/women/1.jpg',
    email: 'sarah.johnson@example.com',
    bio: 'UI/UX Designer passionate about creating intuitive interfaces',
    registrationDate: '2023-06-22',
  },
  {
    id: 3,
    username: 'user3',
    name: 'Alex Thompson',
    photo: 'https://randomuser.me/api/portraits/men/2.jpg',
    email: 'alex.thompson@example.com',
    bio: 'Product manager with expertise in launching digital products',
    registrationDate: '2023-08-10',
  },
  // Mock registration data for testing
  {
    id: 'temp-1747175442876', // Example temp ID from logs
    name: 'sdlcmklsk',
    username: 'sdlcmklsk',
    registrationDate: '2025-05-13',
    // Registration data
    bio: 'Registered through child form',
  },
];

// Mock registration data - simulating what would be stored after form submission
const registrationData: Record<string, RegistrationData> = {
  'temp-1747175442876': {
    name: 'sdlcmklsk',
    nickname: 'sdlcmklsk',
    dob: '2025-05-28',
    date_of_birth: '2025-05-28',
    national_id: '',
    address: '',
    category: 'child',
    form_type: 'child',
    physical_description: 'asdasd',
    last_clothes: 'asdasd',
    area_of_disappearance: 'asdas',
    last_seen_time: '2025-05-01T02:32',
    guardian_name: 'asdas',
    guardian_phone: '1123213123',
    guardian_id: '',
    relationship: 'aunt/uncle',
    gender: 'male',
    additional_notes: 'sdasdasd',
    phone_number: '1123213123',
    phone_company: 'Etisalat',
  },
};

function Profiler() {
  const { t } = useTranslationWithFallback();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    'personal' | 'contact' | 'additional'
  >('personal');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<ProfileUser | null>(null);
  const [registrationDetails, setRegistrationDetails] =
    useState<RegistrationData | null>(null);
  const [isTemporaryId, setIsTemporaryId] = useState<boolean>(false);

  // Fetch user data when component mounts
  useEffect(() => {
    // Short delay to simulate data loading
    const timer = setTimeout(() => {
      if (!id) {
        setError(t('profile.errors.noId', 'No user ID provided'));
        setLoading(false);
        return;
      }

      // Check if it's a temporary ID (from registration)
      const isTempId = id.startsWith('temp-');
      setIsTemporaryId(isTempId);

      // Look for user in our mock data
      let user: ProfileUser | undefined;

      if (isTempId) {
        // For temporary IDs, get from registrationData
        const regData = registrationData[id];
        if (regData) {
          user = {
            id: id,
            name: regData.name,
            username: regData.nickname || regData.name,
            // Use a placeholder image for temp users
            photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(regData.name)}&background=random`,
            registrationDate: new Date().toISOString(),
          };
          setRegistrationDetails(regData);
        }
      } else {
        // Try to find by numeric ID first
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          user = profileUsers.find((u) => u.id === numericId);
        }

        // If not found by numeric ID, try string ID
        if (!user) {
          user = profileUsers.find((u) => u.id.toString() === id);
        }

        // If found by string ID, check if we have registration data
        if (user && registrationData[id]) {
          setRegistrationDetails(registrationData[id]);
        }
      }

      if (user) {
        setUserData(user);
        setLoading(false);
      } else {
        setError(t('profile.errors.userNotFound', 'User not found'));
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [id, t]);

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Get user category for display
  const getUserCategory = () => {
    if (!registrationDetails) return '';

    const category = registrationDetails.category?.toLowerCase();
    if (category === 'male') return 'Male';
    if (category === 'female') return 'Female';
    if (category === 'child') return 'Child';
    if (category === 'disabled') return 'Person with Disability';

    return registrationDetails.form_type || '';
  };

  return (
    <div className="p-6">
      <Link
        to="/home"
        className="inline-flex items-center text-white hover:text-blue-300 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        {t('common.back', 'Back to Home')}
      </Link>

      <motion.div
        className="max-w-4xl mx-auto bg-white/20 backdrop-blur-lg p-10 mt-6 rounded-2xl shadow-[0_0_30px_5px_rgba(0,0,255,0.3)] text-white border border-white/30"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-xl">{t('common.loading', 'Loading...')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400 text-5xl mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {t('profile.errors.title', 'Error')}
            </h2>
            <p className="text-white/80 mb-8">{error}</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('common.returnHome', 'Return Home')}
            </button>
          </div>
        ) : userData ? (
          <>
            {/* Profile Header */}
            <div className="flex flex-col items-center mb-10">
              {isTemporaryId && (
                <div className="mb-4 px-4 py-2 bg-yellow-500/20 text-yellow-200 rounded-lg">
                  {t(
                    'profile.tempId',
                    'Viewing recently registered data (not yet saved to database)'
                  )}
                </div>
              )}

              {/* Profile Photo */}
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/30 mb-6 relative group">
                {userData.photo ? (
                  <img
                    src={userData.photo}
                    alt={userData.name || userData.username || ''}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, show placeholder
                      e.currentTarget.src =
                        'https://ui-avatars.com/api/?name=' +
                        encodeURIComponent(
                          userData.name || userData.username || 'User'
                        );
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold">
                    {userData.name
                      ? userData.name.charAt(0).toUpperCase()
                      : userData.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <span className="text-white text-sm">Profile Photo</span>
                </div>
              </div>

              {/* User Name and Username */}
              <motion.h1
                className="text-4xl font-bold mb-2 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {userData.name || userData.username || 'Unknown User'}
              </motion.h1>

              {userData.username && userData.username !== userData.name && (
                <motion.p
                  className="text-xl text-white/70 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  @{userData.username}
                </motion.p>
              )}

              {/* User Category */}
              {registrationDetails && (
                <motion.div
                  className="px-3 py-1 bg-blue-600/30 text-blue-200 rounded-full text-sm mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {getUserCategory()}
                </motion.div>
              )}

              {/* User Bio */}
              {userData.bio && (
                <motion.p
                  className="text-center text-white/80 max-w-xl mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {userData.bio}
                </motion.p>
              )}

              {/* Member Since */}
              {(userData.registrationDate || userData.created_at) && (
                <motion.div
                  className="text-center text-white/60 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Member since{' '}
                  {formatDate(userData.registrationDate || userData.created_at)}
                </motion.div>
              )}
            </div>

            {/* Tabs Navigation */}
            <div className="flex justify-center mb-10">
              <div className="flex p-1 bg-white/10 rounded-lg">
                {(['personal', 'contact', 'additional'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-md transition-all ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t(
                      `profile.tabs.${tab}`,
                      tab.charAt(0).toUpperCase() + tab.slice(1)
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6 text-center">
                  {t('profile.personalInfoTitle', 'Personal Information')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Name */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-white/60">
                      {t('profile.fields.name', 'Full Name')}
                    </h3>
                    <p className="text-lg">
                      {userData.name ||
                        registrationDetails?.name ||
                        t('profile.notProvided', 'Not provided')}
                    </p>
                  </div>

                  {/* Nickname/Username */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-white/60">
                      {t('profile.fields.nickname', 'Nickname')}
                    </h3>
                    <p className="text-lg">
                      {userData.username ||
                        registrationDetails?.nickname ||
                        t('profile.notProvided', 'Not provided')}
                    </p>
                  </div>

                  {/* Gender */}
                  {registrationDetails?.gender && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60">
                        {t('profile.fields.gender', 'Gender')}
                      </h3>
                      <p className="text-lg capitalize">
                        {registrationDetails.gender}
                      </p>
                    </div>
                  )}

                  {/* Date of Birth */}
                  {(registrationDetails?.dob ||
                    registrationDetails?.date_of_birth) && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60">
                        {t('profile.fields.dob', 'Date of Birth')}
                      </h3>
                      <p className="text-lg">
                        {formatDate(
                          registrationDetails.dob ||
                            registrationDetails.date_of_birth
                        )}
                      </p>
                    </div>
                  )}

                  {/* Form Type */}
                  {registrationDetails?.form_type && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60">
                        {t('profile.fields.formType', 'Registration Type')}
                      </h3>
                      <p className="text-lg capitalize">
                        {registrationDetails.form_type}
                      </p>
                    </div>
                  )}

                  {/* National ID */}
                  {registrationDetails?.national_id && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60">
                        {t('profile.fields.nationalId', 'National ID')}
                      </h3>
                      <p className="text-lg">
                        {registrationDetails.national_id}
                      </p>
                    </div>
                  )}

                  {/* Job/Occupation (for adults) */}
                  {registrationDetails?.job && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60">
                        {t('profile.fields.job', 'Occupation')}
                      </h3>
                      <p className="text-lg">{registrationDetails.job}</p>
                    </div>
                  )}

                  {/* Email (from standard profiles) */}
                  {userData.email && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60">
                        {t('profile.fields.email', 'Email')}
                      </h3>
                      <p className="text-lg">{userData.email}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Contact Information Tab */}
            {activeTab === 'contact' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6 text-center">
                  {t('profile.contactInfoTitle', 'Contact Information')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Address */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-white/60">
                      {t('profile.fields.address', 'Address')}
                    </h3>
                    <p className="text-lg">
                      {registrationDetails?.address ||
                        t('profile.notProvided', 'Not provided')}
                    </p>
                  </div>

                  {/* Phone Number */}
                  {registrationDetails?.phone_number && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60">
                        {t('profile.fields.phoneNumber', 'Phone Number')}
                      </h3>
                      <p className="text-lg">
                        {registrationDetails.phone_number}
                        {registrationDetails.phone_company &&
                          ` (${registrationDetails.phone_company})`}
                      </p>
                    </div>
                  )}

                  {/* Guardian Name (for children) */}
                  {registrationDetails?.guardian_name && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60">
                        {t('profile.fields.guardianName', 'Guardian Name')}
                      </h3>
                      <p className="text-lg">
                        {registrationDetails.guardian_name}
                      </p>
                    </div>
                  )}

                  {/* Guardian Phone (for children) */}
                  {registrationDetails?.guardian_phone && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60">
                        {t('profile.fields.guardianPhone', 'Guardian Phone')}
                      </h3>
                      <p className="text-lg">
                        {registrationDetails.guardian_phone}
                      </p>
                    </div>
                  )}

                  {/* Relationship (for children) */}
                  {registrationDetails?.relationship && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60">
                        {t(
                          'profile.fields.relationship',
                          'Relationship to Guardian'
                        )}
                      </h3>
                      <p className="text-lg capitalize">
                        {registrationDetails.relationship.replace('/', ' or ')}
                      </p>
                    </div>
                  )}

                  {/* Caregiver info (for disabled) */}
                  {registrationDetails?.caregiver_name && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60">
                        {t('profile.fields.caregiverName', 'Caregiver Name')}
                      </h3>
                      <p className="text-lg">
                        {registrationDetails.caregiver_name}
                      </p>
                    </div>
                  )}
                </div>

                {/* If no contact info is available */}
                {!registrationDetails?.address &&
                  !registrationDetails?.phone_number &&
                  !registrationDetails?.guardian_name &&
                  !registrationDetails?.caregiver_name && (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📱</div>
                      <p className="text-white/70">
                        {t(
                          'profile.noContactInfo',
                          'No contact information available'
                        )}
                      </p>
                    </div>
                  )}
              </motion.div>
            )}

            {/* Additional Information Tab */}
            {activeTab === 'additional' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6 text-center">
                  {t('profile.additionalInfoTitle', 'Additional Information')}
                </h2>

                <div className="space-y-6">
                  {/* Physical Description */}
                  {registrationDetails?.physical_description && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60 mb-1">
                        {t(
                          'profile.fields.physicalDescription',
                          'Physical Description'
                        )}
                      </h3>
                      <p className="text-lg bg-white/10 p-3 rounded-lg">
                        {registrationDetails.physical_description}
                      </p>
                    </div>
                  )}

                  {/* Last Clothes (for missing people) */}
                  {registrationDetails?.last_clothes && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60 mb-1">
                        {t(
                          'profile.fields.lastClothes',
                          'Clothes When Last Seen'
                        )}
                      </h3>
                      <p className="text-lg bg-white/10 p-3 rounded-lg">
                        {registrationDetails.last_clothes}
                      </p>
                    </div>
                  )}

                  {/* Last Seen Info */}
                  {(registrationDetails?.last_seen_time ||
                    registrationDetails?.area_of_disappearance) && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60 mb-1">
                        {t('profile.fields.lastSeen', 'Last Seen Information')}
                      </h3>
                      <div className="bg-white/10 p-3 rounded-lg">
                        {registrationDetails.last_seen_time && (
                          <p className="mb-2">
                            <span className="font-medium">Time:</span>{' '}
                            {registrationDetails.last_seen_time}
                          </p>
                        )}
                        {registrationDetails.area_of_disappearance && (
                          <p>
                            <span className="font-medium">Location:</span>{' '}
                            {registrationDetails.area_of_disappearance}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Disability Info */}
                  {(registrationDetails?.disability_type ||
                    registrationDetails?.disability_details) && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60 mb-1">
                        {t(
                          'profile.fields.disabilityInfo',
                          'Disability Information'
                        )}
                      </h3>
                      <div className="bg-white/10 p-3 rounded-lg">
                        {registrationDetails.disability_type && (
                          <p className="mb-2">
                            <span className="font-medium">Type:</span>{' '}
                            {registrationDetails.disability_type}
                          </p>
                        )}
                        {registrationDetails.disability_details && (
                          <p>
                            <span className="font-medium">Details:</span>{' '}
                            {registrationDetails.disability_details}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  {registrationDetails?.additional_notes && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-white/60 mb-1">
                        {t(
                          'profile.fields.additionalNotes',
                          'Additional Notes'
                        )}
                      </h3>
                      <p className="text-lg bg-white/10 p-3 rounded-lg">
                        {registrationDetails.additional_notes}
                      </p>
                    </div>
                  )}

                  {/* If no additional info is available */}
                  {!registrationDetails?.physical_description &&
                    !registrationDetails?.last_clothes &&
                    !registrationDetails?.last_seen_time &&
                    !registrationDetails?.disability_type &&
                    !registrationDetails?.additional_notes && (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-white/70">
                          {t(
                            'profile.noAdditionalInfo',
                            'No additional information available'
                          )}
                        </p>
                      </div>
                    )}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p>{t('profile.noData', 'No user data available')}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Profiler;
