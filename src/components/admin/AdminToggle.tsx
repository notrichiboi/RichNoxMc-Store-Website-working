import React from 'react';
import { cn } from '@/lib/utils';

interface AdminToggleProps {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function AdminToggle({
  label,
  description,
  checked,
  onChange,
  className
}: AdminToggleProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {(label || description) && (
        <div className="flex flex-col mr-4">
          {label && <span className="text-sm font-medium text-zinc-200">{label}</span>}
          {description && <span className="text-xs text-zinc-500">{description}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#111118]",
          checked ? "bg-purple-600" : "bg-zinc-700"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
