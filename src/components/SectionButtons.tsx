import React from 'react';

interface SectionButtonsProps {
  onPrev?: () => void;
  onNext?: () => void;
}

const SectionButtons: React.FC<SectionButtonsProps> = ({ onPrev, onNext }) => (
  <div className="flex justify-between mt-6">
    {onPrev && (
      <button
        type="button"
        onClick={onPrev}
        className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
      >
        Previous
      </button>
    )}
    {onNext && (
      <button
        type="button"
        onClick={onNext}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ml-auto"
      >
        Next
      </button>
    )}
  </div>
);

export default SectionButtons;
