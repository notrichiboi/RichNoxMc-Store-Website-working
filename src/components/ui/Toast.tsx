'use client';
import React from 'react';
import { Toaster, toast as hotToast, ToastBar } from 'react-hot-toast';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#111118',
          color: '#f4f4f5',
          border: '1px solid #27272a',
          padding: '12px 16px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        },
        success: {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        },
        error: {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <>
              {icon}
              {message}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}

export const toast = {
  success: (message: string) => hotToast.success(message),
  error: (message: string) => hotToast.error(message),
  info: (message: string) =>
    hotToast(message, {
      icon: <Info className="h-5 w-5 text-blue-500" />,
    }),
  custom: hotToast.custom,
};
