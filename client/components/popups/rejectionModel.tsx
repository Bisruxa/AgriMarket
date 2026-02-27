'use client';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from '@/components/hooks/useTranlations';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isProcessing?: boolean;
}

export default function RejectionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isProcessing = false 
}: RejectionModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const t = useTranslations();

  const handleConfirm = () => {
    if (rejectionReason.trim()) {
      onConfirm(rejectionReason);
      setRejectionReason(''); // Reset after confirm
    }
  };

  const handleClose = () => {
    setRejectionReason(''); // Reset when closed
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {t.modals?.rejection?.title || 'Reject Application'}
          </h3>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            {t.modals?.rejection?.description || 
              'Please provide a reason for rejecting this trader application. This will be shared with the applicant.'}
          </p>
          
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={t.modals?.rejection?.placeholder || 'Enter rejection reason...'}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B8C51] focus:border-transparent outline-none min-h-[120px] text-sm"
            disabled={isProcessing}
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {t.common?.cancel || 'Cancel'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!rejectionReason.trim() || isProcessing}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t.modals?.rejection?.rejecting || 'Rejecting...'}
              </span>
            ) : (
              t.modals?.rejection?.confirm || 'Confirm Reject'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}