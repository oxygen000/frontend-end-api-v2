import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import {
  FaWheelchair,
  FaChild,
} from 'react-icons/fa'; // Import icons from react-icons
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';

interface PopupChoiceSearchProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  cancelText: string;
}

const PopupChoiceSearch: React.FC<PopupChoiceSearchProps> = ({
  isOpen,
  onClose,
  title,
  cancelText,
}) => {
  const { t, isRTL } = useTranslationWithFallback();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="bg-gray-900 text-white p-6 rounded-xl shadow-2xl w-[90%] max-w-md space-y-6 animate-fade-in">
        <h2 className="text-xl font-bold text-center border-b border-white/10 pb-2">
          {title}
        </h2>

        {/* Search options */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/disabilities"
            className="w-full flex items-center justify-center gap-2 px-4 py-4 text-white rounded-lg font-semibold shadow transition-all duration-200 hover:scale-[1.02] text-xl bg-purple-600 hover:bg-purple-700"
            aria-label={t('search.formTypes.disabled', 'Disabled')}
            onClick={onClose}
          >
            <FaWheelchair />
            <span className="text-sm">
              {t('search.formTypes.disabled', 'Disabled')}
            </span>
          </Link>
          <Link
            to="/children"
            className="w-full flex items-center justify-center gap-2 px-4 py-4 text-white rounded-lg font-semibold shadow transition-all duration-200 hover:scale-[1.02] text-xl bg-yellow-600 hover:bg-yellow-700"
            aria-label={t('search.formTypes.child', 'Child')}
            onClick={onClose}
          >
            <FaChild />
            <span className="text-sm">
              {t('search.formTypes.child', 'Child')}
            </span>
          </Link>
        </div>

        

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-lg font-semibold transition"
        >
          {cancelText}
        </button>
      </div>
    </div>
  );
};

export default PopupChoiceSearch;
