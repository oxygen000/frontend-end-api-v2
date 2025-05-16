import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import type { User } from './types';
import { getImageUrl } from './UserDataUtils';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  isChildRecord: boolean;
  t: (key: string, fallback: string) => string;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  user,
  isChildRecord,
  t,
}) => {
  return (
    <AnimatePresence>
      {isOpen && user?.image_path && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={onClose}
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
              onClick={onClose}
              aria-label={
                isChildRecord
                  ? t('forms.child.close', 'Close')
                  : t('common.cancel', 'Cancel')
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
                  {t('forms.child.viewImage', 'View Image')}
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageModal;
