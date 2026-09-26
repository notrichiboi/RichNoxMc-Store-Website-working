import React from 'react';
import { Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSaveBarProps {
  isVisible: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isSaving?: boolean;
}

export function AdminSaveBar({
  isVisible,
  onSave,
  onDiscard,
  isSaving
}: AdminSaveBarProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none md:left-64 flex justify-center">
      <div className="bg-[#111118] border border-zinc-700 shadow-2xl shadow-black rounded-lg px-6 py-4 flex items-center justify-between w-full max-w-3xl pointer-events-auto transform translate-y-0 transition-transform duration-300">
        <div className="flex items-center text-zinc-300">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse mr-3"></div>
          You have unsaved changes
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onDiscard}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50 flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Discard
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-6 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors shadow-lg shadow-purple-900/20 disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
