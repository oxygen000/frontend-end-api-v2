import React from 'react';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';

interface PopupChoiceProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNew: () => void;
  onConfirm?: () => void;
  title: string;
  confirmText: string;
  cancelText: string;
}

const PopupChoice: React.FC<PopupChoiceProps> = ({
  isOpen,
  onClose,
  onCreateNew,
  title,
  confirmText,
  cancelText,
}) => {
  const { isRTL } = useTranslationWithFallback();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="bg-gray-700 text-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-sm">
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-400"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupChoice;
