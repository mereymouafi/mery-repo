import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onCancel}
      ></div>
      
      {/* Modal */}
      <div className="relative z-10 max-w-md w-full bg-gradient-to-b from-amber-50 to-white rounded-lg shadow-xl overflow-hidden transform transition-all">
        {/* Gold border accent */}
        <div className="absolute inset-0 border-2 border-amber-300 rounded-lg opacity-30 pointer-events-none"></div>
        
        {/* Gold top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200"></div>
        
        <div className="p-6">
          <h3 className="text-xl font-medium text-gray-900 mb-3 border-b border-amber-200 pb-2">{title}</h3>
          <p className="mb-5 text-gray-700">{message}</p>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-md hover:from-amber-600 hover:to-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              Confirm
            </button>
          </div>
        </div>

        {/* Decorative gold corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-300 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-300 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-300 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-300 rounded-br-lg"></div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
