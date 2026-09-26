'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill';
}

/**
 * An image component that gracefully falls back to a placeholder when the image
 * fails to load or when no source is provided.
 * 
 * Uses a standard <img> tag to avoid Next.js Image config issues with arbitrary URLs.
 */
export function SafeImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  priority = false,
  objectFit = 'cover',
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const shouldShowPlaceholder = !src || hasError;

  if (shouldShowPlaceholder) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-zinc-800/60 text-zinc-600',
          fill ? 'absolute inset-0' : '',
          className
        )}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <Package className="h-1/3 w-1/3 max-h-12 max-w-12 opacity-30" />
      </div>
    );
  }

  return (
    <>
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0 bg-zinc-800/60 animate-pulse',
            fill ? 'absolute inset-0' : '',
          )}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          fill ? 'absolute inset-0 w-full h-full' : '',
          className
        )}
        style={{
          objectFit,
          ...(fill ? {} : { width: width || '100%', height: height || '100%' }),
        }}
        onLoad={() => setIsLoaded(true)}
        onError={() => { setHasError(true); setIsLoaded(true); }}
        width={width}
        height={height}
      />
    </>
  );
}
