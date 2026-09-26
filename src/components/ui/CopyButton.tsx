'use client';
import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from './Button';
import { toast } from './Toast';

interface CopyButtonProps {
  text: string;
  label?: string;
  successLabel?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
}

export function CopyButton({
  text,
  label = 'Copy',
  successLabel = 'Copied!',
  variant = 'secondary',
  size = 'md',
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          {size !== 'icon' && successLabel}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          {size !== 'icon' && label}
        </>
      )}
    </Button>
  );
}
