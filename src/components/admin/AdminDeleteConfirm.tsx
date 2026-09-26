import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface AdminDeleteConfirmProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  itemName?: string;
  warningMessage?: string;
  message?: string;
  isLoading?: boolean;
}

export function AdminDeleteConfirm({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  itemName,
  warningMessage = "This action cannot be undone.",
  message,
  isLoading
}: AdminDeleteConfirmProps) {
  if (!isOpen) return null;
  const handleClose = onClose || onCancel || (() => {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111118] border border-zinc-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 text-red-500">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>
            <button onClick={handleClose} className="text-zinc-500 hover:text-white" disabled={isLoading}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {message ? (
            <p className="text-zinc-300 mb-6 text-sm">
              {message}
            </p>
          ) : (
            <>
              <p className="text-zinc-300 mb-2">
                Are you sure you want to delete <span className="font-semibold text-white">{itemName || 'this item'}</span>?
              </p>
              <p className="text-sm text-zinc-500 mb-6">
                {warningMessage}
              </p>
            </>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
