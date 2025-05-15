import React, { useState } from 'react';
import { FaMale, FaFemale, FaChild, FaWheelchair } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { PERSON_CATEGORIES } from '../../config/constants';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';

interface PopupChoiceAddProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  cancelText: string;
}

const PopupChoiceAdd: React.FC<PopupChoiceAddProps> = ({
  isOpen,
  onClose,
  title,
  cancelText,
}) => {
  const [selectedGender, setSelectedGender] = useState<
    'male' | 'female' | null
  >(null);
  const navigate = useNavigate();
  const { t, isRTL } = useTranslationWithFallback();

  if (!isOpen) return null;

  const handleFinalChoice = (category: string) => {
    switch (category) {
      case PERSON_CATEGORIES.MAN:
        navigate('/register/man');
        break;
      case PERSON_CATEGORIES.WOMAN:
        navigate('/register/woman');
        break;
      case PERSON_CATEGORIES.CHILD:
        navigate('/register/child');
        break;
      case PERSON_CATEGORIES.DISABLED:
        navigate('/register/disabled');
        break;
      default:
        navigate('/register');
    }
    onClose();
  };

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
  };

  const iconButtonStyle =
    'w-full flex items-center justify-center gap-2 px-4 py-4 text-white rounded-lg font-semibold shadow transition-all duration-200 hover:scale-[1.02] text-xl';

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="bg-gray-900 text-white p-6 rounded-xl shadow-2xl w-[90%] max-w-md space-y-6 animate-fade-in">
        <h2 className="text-xl font-bold text-center border-b border-white/10 pb-2">
          {selectedGender === null
            ? title
            : t('popups.selectType', 'Select Type')}
        </h2>

        {selectedGender === null ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleGenderSelect('male')}
              className={`${iconButtonStyle} bg-blue-700 hover:bg-blue-800`}
              aria-label={t('registration.male', 'Male')}
            >
              <FaMale />
              <span className="text-sm">
                {t('search.formTypes.man', 'Man')}
              </span>
            </button>
            <button
              onClick={() => handleGenderSelect('female')}
              className={`${iconButtonStyle} bg-pink-600 hover:bg-pink-700`}
              aria-label={t('registration.female', 'Female')}
            >
              <FaFemale />
              <span className="text-sm">
                {t('search.formTypes.female', 'Woman')}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {selectedGender === 'male' ? (
                <>
                  <button
                    onClick={() => handleFinalChoice(PERSON_CATEGORIES.MAN)}
                    className={`${iconButtonStyle} bg-blue-700 hover:bg-blue-800`}
                    aria-label={t('search.formTypes.man', 'Man')}
                  >
                    <FaMale />
                    <span className="text-sm">
                      {t('search.formTypes.man', 'Man')}
                    </span>
                  </button>
                  <button
                    onClick={() => handleFinalChoice(PERSON_CATEGORIES.CHILD)}
                    className={`${iconButtonStyle} bg-yellow-600 hover:bg-yellow-700`}
                    aria-label={t('search.formTypes.child', 'Child')}
                  >
                    <FaChild />
                    <span className="text-sm">
                      {t('search.formTypes.child', 'Child')}
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      handleFinalChoice(PERSON_CATEGORIES.DISABLED)
                    }
                    className={`${iconButtonStyle} bg-purple-600 hover:bg-purple-700`}
                    aria-label={t('search.formTypes.disabled', 'Disabled')}
                  >
                    <FaWheelchair />
                    <span className="text-sm">
                      {t('search.formTypes.disabled', 'Disabled')}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleFinalChoice(PERSON_CATEGORIES.WOMAN)}
                    className={`${iconButtonStyle} bg-pink-600 hover:bg-pink-700`}
                    aria-label={t('search.formTypes.female', 'Woman')}
                  >
                    <FaFemale />
                    <span className="text-sm">
                      {t('search.formTypes.female', 'Woman')}
                    </span>
                  </button>
                  <button
                    onClick={() => handleFinalChoice(PERSON_CATEGORIES.CHILD)}
                    className={`${iconButtonStyle} bg-yellow-600 hover:bg-yellow-700`}
                    aria-label={t('search.formTypes.child', 'Girl')}
                  >
                    <FaChild />
                    <span className="text-sm">
                      {t('search.formTypes.child', 'Girl')}
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      handleFinalChoice(PERSON_CATEGORIES.DISABLED)
                    }
                    className={`${iconButtonStyle} bg-purple-600 hover:bg-purple-700`}
                    aria-label={t('search.formTypes.disabled', 'Disabled')}
                  >
                    <FaWheelchair />
                    <span className="text-sm">
                      {t('search.formTypes.disabled', 'Disabled')}
                    </span>
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setSelectedGender(null)}
              className="text-sm text-gray-400 underline hover:text-white"
            >
              ← {t('common.back', 'Back')}
            </button>
          </div>
        )}

        <button
          onClick={() => {
            setSelectedGender(null);
            onClose();
          }}
          className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-lg font-semibold transition"
        >
          {cancelText}
        </button>
      </div>
    </div>
  );
};

export default PopupChoiceAdd;
