'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Disc3,
  ChevronDown,
  ChevronUp,
  Music,
  Radio,
  Sparkles,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match) return match[1];
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

export function BackgroundMusicPlayer() {
  const { settings } = useSettingsContext();
  const pathname = usePathname();

  // Hide inside admin CMS pages, except for preview mode
  const isAdmin = pathname?.startsWith('/admin') && !pathname?.startsWith('/admin/preview');

  // Always enabled by default
  const isEnabled = settings?.bgMusicEnabled !== false;
  const musicUrl = settings?.bgMusicUrl?.trim() || 'https://youtu.be/1gqEIJoxSHA';
  const trackTitle = settings?.bgMusicTitle?.trim() || 'Aria Math - Minecraft Nostalgic OST';
  const defaultVolume = typeof settings?.bgMusicVolume === 'number' ? settings.bgMusicVolume : 35;

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);

  const playerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const youtubeId = extractYouTubeId(musicUrl);
  const isDirectAudio = !youtubeId && (
    musicUrl.endsWith('.mp3') ||
    musicUrl.endsWith('.ogg') ||
    musicUrl.endsWith('.wav') ||
    musicUrl.includes('audio') ||
    musicUrl.includes('.mp3?')
  );

  // Helper: PostMessage command fallback
  const sendYouTubeCommand = useCallback((func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      } catch {}
    }
  }, []);

  // Play video with audio
  const startPlayback = useCallback(() => {
    setIsPlaying(true);
    setAudioStarted(true);

    // 1. YouTube official YT.Player API
    if (playerRef.current) {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(isMuted ? 0 : volume);
        playerRef.current.playVideo();
      } catch {}
    }

    // 2. Direct postMessage fallback
    if (youtubeId) {
      sendYouTubeCommand('unMute', []);
      sendYouTubeCommand('setVolume', [isMuted ? 0 : volume]);
      sendYouTubeCommand('playVideo', []);
    }

    // 3. HTML5 Audio tag fallback
    if (audioRef.current) {
      audioRef.current.volume = (isMuted ? 0 : volume) / 100;
      audioRef.current.play().catch(() => {});
    }
  }, [youtubeId, isMuted, volume, sendYouTubeCommand]);

  // Pause video
  const pausePlayback = useCallback(() => {
    setIsPlaying(false);
    if (playerRef.current) {
      try {
        playerRef.current.pauseVideo();
      } catch {}
    }
    if (youtubeId) {
      sendYouTubeCommand('pauseVideo', []);
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [youtubeId, sendYouTubeCommand]);

  const togglePlay = () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  };

  // Sync volume & mute changes
  useEffect(() => {
    const targetVol = isMuted ? 0 : volume;
    if (playerRef.current) {
      try {
        if (isMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
          playerRef.current.setVolume(targetVol);
        }
      } catch {}
    }
    if (youtubeId) {
      if (isMuted) {
        sendYouTubeCommand('mute', []);
      } else {
        sendYouTubeCommand('unMute', []);
        sendYouTubeCommand('setVolume', [targetVol]);
      }
    }
    if (audioRef.current) {
      audioRef.current.volume = targetVol / 100;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted, youtubeId, sendYouTubeCommand]);

  // Load YouTube IFrame API and initialize player
  useEffect(() => {
    if (!isEnabled || isAdmin || !youtubeId) return;

    let isSubscribed = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      const container = document.getElementById('nightmaremc-yt-embed');
      if (!container) return;

      try {
        playerRef.current = new window.YT.Player('nightmaremc-yt-embed', {
          height: '200',
          width: '200',
          videoId: youtubeId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: youtubeId,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
          events: {
            onReady: (event: any) => {
              if (!isSubscribed) return;
              setIsReady(true);
              try {
                event.target.unMute();
                event.target.setVolume(volume);
                event.target.playVideo();
                setIsPlaying(true);
              } catch {}
            },
            onStateChange: (event: any) => {
              if (!isSubscribed) return;
              if (event.data === 1) { // Playing
                setIsPlaying(true);
                setAudioStarted(true);
              } else if (event.data === 2) { // Paused
                setIsPlaying(false);
              } else if (event.data === 0) { // Ended -> Loop
                event.target.playVideo();
              }
            },
          },
        });
      } catch (err) {
        console.warn('[MusicPlayer] YT.Player init warning:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      const prevHandler = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevHandler) prevHandler();
        if (isSubscribed) initPlayer();
      };
    }

    return () => {
      isSubscribed = false;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [isEnabled, isAdmin, youtubeId]);

  // Guaranteed Autoplay Unlock on ANY first user gesture
  useEffect(() => {
    if (!isEnabled || isAdmin) return;

    // 1. Try immediate start
    startPlayback();

    // 2. Browser Autoplay policy unlock: the moment visitor touches, clicks, moves mouse, or scrolls
    const handleGesture = () => {
      startPlayback();
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('scroll', handleGesture);
      window.removeEventListener('mousemove', handleGesture);
    };

    window.addEventListener('pointerdown', handleGesture, { once: true, passive: true });
    window.addEventListener('click', handleGesture, { once: true, passive: true });
    window.addEventListener('keydown', handleGesture, { once: true, passive: true });
    window.addEventListener('touchstart', handleGesture, { once: true, passive: true });
    window.addEventListener('scroll', handleGesture, { once: true, passive: true });
    window.addEventListener('mousemove', handleGesture, { once: true, passive: true });

    return () => {
      cleanupListeners();
    };
  }, [isEnabled, isAdmin, startPlayback]);

  if (!isEnabled || isAdmin) {
    return null;
  }

  return (
    <>
      {/* 1. DEDICATED AUDIO STREAM CONTAINER (Hidden off-screen, maintaining full 200px dimensions so browser keeps playback alive) */}
      <div
        className="fixed -bottom-48 -left-48 w-48 h-48 opacity-0 pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
        style={{ zIndex: -9999 }}
      >
        {/* Official YouTube API target element */}
        <div id="nightmaremc-yt-embed" />

        {/* Direct iframe fallback if YT.Player is slow to load */}
        {youtubeId && !isReady && (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=1&mute=0&controls=0&disablekb=1&fs=0&loop=1&playlist=${youtubeId}&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`}
            title="NightmareMC Music Stream"
            allow="autoplay; encrypted-media"
            className="w-48 h-48"
            onLoad={() => {
              sendYouTubeCommand('unMute', []);
              sendYouTubeCommand('setVolume', [isMuted ? 0 : volume]);
              sendYouTubeCommand('playVideo', []);
            }}
          />
        )}

        {/* Direct HTML5 Audio fallback for MP3s */}
        {isDirectAudio && (
          <audio
            ref={audioRef}
            src={musicUrl}
            autoPlay
            loop={settings?.bgMusicLoop !== false}
            preload="auto"
            onLoadedData={() => {
              if (isPlaying) {
                audioRef.current?.play().catch(() => {});
              }
            }}
          />
        )}
      </div>

      {/* 2. MINECRAFT JUKEBOX FLOATING MUSIC WIDGET */}
      <div className="fixed bottom-4 left-4 z-40 select-none animate-in fade-in slide-in-from-bottom-3 duration-500">
        <div className="bg-[#0b0b14]/95 backdrop-blur-2xl border border-purple-500/35 rounded-2xl p-2.5 sm:p-3 shadow-2xl shadow-purple-950/60 text-white transition-all duration-300 max-w-[320px]">
          
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Spinning Vinyl Disc Button */}
              <button
                type="button"
                onClick={togglePlay}
                className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-purple-700 via-pink-600 to-amber-500 p-0.5 shrink-0 group focus:outline-none cursor-pointer hover:scale-105 transition-transform"
                title={isPlaying ? 'Pause Background Music' : 'Play Background Music'}
              >
                <div className={`w-full h-full rounded-full bg-black flex items-center justify-center ${isPlaying ? 'animate-spin [animation-duration:3.5s]' : ''}`}>
                  <Disc3 className={`w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform ${isPlaying ? 'text-pink-400' : ''}`} />
                </div>
              </button>

              <div className="min-w-0 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1">
                    <Music className="w-2.5 h-2.5" />
                    Server Music
                  </span>
                  {isPlaying ? (
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-500/20 px-1 rounded">
                      PAUSED
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-100 truncate max-w-[160px]" title={trackTitle}>
                  {trackTitle}
                </p>
              </div>
            </div>

            {/* Quick Actions (Play/Pause & Minimize) */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={togglePlay}
                className="p-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/60 text-purple-300 hover:text-white transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={isMinimized ? 'Expand volume controls' : 'Minimize'}
              >
                {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Expanded Volume Controls */}
          {!isMinimized && (
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="text-zinc-400 hover:text-white p-1 rounded transition-colors shrink-0 cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseInt(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                title={`Volume: ${isMuted ? 0 : volume}%`}
              />

              <span className="text-[10px] font-mono text-zinc-400 w-7 text-right shrink-0">
                {isMuted ? '0%' : `${volume}%`}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
