'use client';

import { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-6 right-6 z-[10000] animate-slideInRight">
      <div
        className={`
          flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl min-w-[320px] max-w-md backdrop-blur-sm
          ${type === 'success' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300'
          }
        `}
      >
        <div className={`
          p-2 rounded-full flex-shrink-0
          ${type === 'success' ? 'bg-green-100' : 'bg-red-100'}
        `}>
          {type === 'success' ? (
            <FiCheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <FiXCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
        
        <p className={`flex-1 text-sm font-semibold ${type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
          {message}
        </p>
        
        <button
          onClick={onClose}
          className={`
            p-1.5 rounded-lg transition-all flex-shrink-0 hover:scale-110
            ${type === 'success' ? 'hover:bg-green-200 text-green-700' : 'hover:bg-red-200 text-red-700'}
          `}
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
