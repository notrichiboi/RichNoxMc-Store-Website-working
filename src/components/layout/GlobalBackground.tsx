'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { ParticleCanvas, ParticleType } from './ParticleCanvas';

export function GlobalBackground() {
  const { settings } = useSettingsContext();
  const pathname = usePathname();

  // Keep admin panel clean and functional
  const isAdmin = pathname?.startsWith('/admin') && !pathname?.startsWith('/admin/preview');

  const bgImage = settings.backgroundImageUrl?.trim() || '';
  const isEnabled = settings.backgroundEnabled !== false && Boolean(bgImage);

  const opacityValue = typeof settings.backgroundOpacity === 'number' 
    ? settings.backgroundOpacity / 100 
    : 0.4;

  const blurValue = typeof settings.backgroundBlur === 'number' 
    ? `${settings.backgroundBlur}px` 
    : '0px';

  const overlayOpacityValue = typeof settings.backgroundOverlayOpacity === 'number'
    ? settings.backgroundOverlayOpacity / 100
    : 0.75;

  const showOverlay = settings.backgroundOverlay !== false;
  const showParticles = settings.particlesEnabled !== false && !isAdmin;

  const particleType: ParticleType = (settings.particlesType as ParticleType) || 'portal';
  const particleAmount = typeof settings.particlesAmount === 'number' ? settings.particlesAmount : 40;
  const particleSpeed = typeof settings.particlesSpeed === 'number' ? settings.particlesSpeed : 1;
  const particleOpacity = typeof settings.particlesOpacity === 'number' ? settings.particlesOpacity / 100 : 0.7;
  const particleSize = typeof settings.particlesSize === 'number' ? settings.particlesSize : 3;
  const particleColor = settings.particlesColor?.trim() || undefined;

  if (isAdmin) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none"
    >
      {/* 1. Base theme background color */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-[#07070d] transition-colors duration-500" />

      {/* 2. Custom Background Image Layer */}
      {isEnabled && bgImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: `url("${bgImage}")`,
            opacity: opacityValue,
            filter: `blur(${blurValue})`,
            transform: 'scale(1.02)', // Prevents blur edge artifacts
          }}
        />
      ) : (
        /* Subtle default dark atmosphere vignette */
        <div className="absolute inset-0 opacity-40 dark:opacity-60 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,50,220,0.25),rgba(255,255,255,0))]" />
      )}

      {/* 3. Dark Overlay Layer for perfect text contrast */}
      {isEnabled && showOverlay && (
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundColor: `rgba(7, 7, 13, ${overlayOpacityValue})`,
          }}
        />
      )}

      {/* 4. Dynamic HTML5 Canvas Particles with Selectable Styles */}
      {showParticles && (
        <ParticleCanvas
          type={particleType}
          amount={particleAmount}
          speed={particleSpeed}
          opacity={particleOpacity}
          size={particleSize}
          color={particleColor}
        />
      )}
    </div>
  );
}
