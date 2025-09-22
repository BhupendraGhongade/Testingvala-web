import React from 'react';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'info'
  itemName = '',
  itemDescription = ''
}) => {
  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 className="w-6 h-6 text-red-600" />;
      case 'info':
        return <AlertCircle className="w-6 h-6 text-blue-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-100';
      case 'info':
        return 'bg-blue-100';
      default:
        return 'bg-orange-100';
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      default:
        return 'bg-orange-600 hover:bg-orange-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 ${getIconBg()} rounded-full flex items-center justify-center`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">This action cannot be undone</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-3">{message}</p>
          {itemName && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-1">{itemName}</h4>
              {itemDescription && (
                <p className="text-sm text-gray-600">{itemDescription}</p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${getConfirmButtonStyle()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;