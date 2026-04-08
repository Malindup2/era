import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  variant?: 'neutral' | 'destructive';
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  confirmText,
  cancelLabel = 'Cancel',
  isDestructive,
  variant,
}: ConfirmationModalProps) => {
  const finalConfirmLabel = confirmText || confirmLabel || 'Confirm';
  const finalIsDestructive = isDestructive || variant === 'destructive';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <div className={`p-3 rounded-xl ${finalIsDestructive ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {finalIsDestructive ? <AlertTriangle size={24} /> : <Info size={24} />}
          </div>
          <p className="text-gray-600 leading-relaxed font-medium">
            {message}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-6 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all ${
              finalIsDestructive 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-100' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            {finalConfirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
