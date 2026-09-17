import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';

const Toast = ({ message, type = 'success', onClose }) => {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl animate-slide-up ${
      type === 'success' ? 'bg-primary text-white' : 'bg-red-500 text-white'
    }`}>
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="hover:opacity-80 transition-opacity"
        aria-label="Close notification"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
