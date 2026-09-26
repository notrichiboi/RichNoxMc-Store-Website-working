import React from 'react';
import { cn } from '@/lib/utils';

interface AdminFormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  help?: string;
  helpText?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function AdminFormField({
  label,
  help,
  helpText,
  description,
  error,
  required,
  children,
  className,
  ...props
}: AdminFormFieldProps) {
  const displayHelp = help || helpText || description;

  return (
    <div className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props}>
      <label className="text-sm font-medium text-zinc-200">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {displayHelp && <p className="text-xs text-zinc-500">{displayHelp}</p>}
      <div className="mt-1">{children}</div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
