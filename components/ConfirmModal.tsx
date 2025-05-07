import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText,
  cancelButtonText,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out">
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-all duration-300 ease-in-out scale-100 opacity-100">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
          {title}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 whitespace-pre-wrap">
          {message}
        </p>
        <div className="flex justify-end space-x-3 sm:space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-800 transition-colors"
          >
            {cancelButtonText || 'Cancel'}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-md text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-slate-800 transition-colors"
          >
            {confirmButtonText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 