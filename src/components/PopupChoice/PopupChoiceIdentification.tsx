import React from 'react'; // Import React
import { FaMale, FaFemale } from 'react-icons/fa'; // Import icons from react-icons // Import icons from react-icons
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';

interface PopupChoiceIdentificationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  cancelText: string;
}

const PopupChoiceIdentification: React.FC<PopupChoiceIdentificationProps> = ({
  isOpen,
  onClose,
  title,
  cancelText,
}) => {
  const { t, isRTL } = useTranslationWithFallback();

  if (!isOpen) return null;

  const iconButtonStyle =
    'w-full flex items-center justify-center gap-2 px-4 py-4 text-white rounded-lg font-semibold shadow transition-all duration-200 hover:scale-[1.02] text-xl';

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="bg-gray-900 text-white p-6 rounded-xl shadow-2xl w-[90%] max-w-md space-y-6 animate-fade-in">
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>

        {/* Gender selection options with icons */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/identification"
            className={`${iconButtonStyle} bg-blue-700 hover:bg-blue-800`}
            aria-label={t('registration.male', 'Male')}
          >
            <FaMale />
            <span className="text-sm">{t('search.formTypes.man', 'Man')}</span>
          </Link>
          <Link
            to="/identification"
            className={`${iconButtonStyle} bg-pink-600 hover:bg-pink-700`}
            aria-label={t('registration.female', 'Female')}
          >
            <FaFemale />
            <span className="text-sm">
              {t('search.formTypes.female', 'Woman')}
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

export default PopupChoiceIdentification;
