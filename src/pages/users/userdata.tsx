import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiFileText, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';

// Import new components
import {
  UserHeader,
  PersonalInfo,
  PhoneNumbers,
  VehiclesSection,
  ImageModal,
  formatDate as formatDateUtil,
  maskSensitiveInfo as maskSensitiveInfoUtil,
} from '../../components/UserData';

// Import types
import type { User } from '../../components/UserData/types';

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

  // Format date function - wrapper for the utility function
  const formatDate = (dateString: string | null) => {
    return formatDateUtil(dateString);
  };

  // Function to mask sensitive information - wrapper for the utility function
  const maskSensitiveInfo = (text: string | null) => {
    return maskSensitiveInfoUtil(text, isIdentityRevealed);
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

  // Check if user is a child record
  const isChildRecord = user.form_type === 'child';

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
      <UserHeader
        user={user}
        isRTL={isRTL}
        isIdentityRevealed={isIdentityRevealed}
        formatDate={formatDate}
        maskSensitiveInfo={maskSensitiveInfo}
        t={t}
        openImageModal={() => setImageModalOpen(true)}
      />

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        user={user}
        isChildRecord={isChildRecord}
        t={t}
      />

      {/* User details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column - Main information */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <PersonalInfo
            user={user}
            isRTL={isRTL}
            isIdentityRevealed={isIdentityRevealed}
            formatDate={formatDate}
            maskSensitiveInfo={maskSensitiveInfo}
            t={t}
            showEmptyFields={showEmptyFields}
          />

          {/* Phone Numbers Section */}
          <PhoneNumbers
            user={user}
            isRTL={isRTL}
            isIdentityRevealed={isIdentityRevealed}
            formatDate={formatDate}
            maskSensitiveInfo={maskSensitiveInfo}
            t={t}
          />

          {/* Vehicles Section */}
          <VehiclesSection
            user={user}
            isRTL={isRTL}
            isIdentityRevealed={isIdentityRevealed}
            formatDate={formatDate}
            maskSensitiveInfo={maskSensitiveInfo}
            t={t}
          />
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

          {/* Additional sections can be added here as needed */}
        </div>
      </div>
    </div>
  );
}

export default Userdata;
