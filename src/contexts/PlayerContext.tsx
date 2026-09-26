'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PlayerInfo {
  username: string;
  edition: 'Java' | 'Bedrock';
}

interface PlayerContextType {
  player: PlayerInfo | null;
  loginPlayer: (username: string, edition: 'Java' | 'Bedrock') => void;
  logoutPlayer: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('nightmaremc_player_username');
      const savedEdition = (localStorage.getItem('nightmaremc_player_edition') as 'Java' | 'Bedrock') || 'Java';
      if (savedUser) {
        setPlayer({ username: savedUser, edition: savedEdition });
      }
    } catch {}
  }, []);

  const loginPlayer = (username: string, edition: 'Java' | 'Bedrock') => {
    const trimmed = username.trim();
    if (!trimmed) return;
    const info: PlayerInfo = { username: trimmed, edition };
    setPlayer(info);
    try {
      localStorage.setItem('nightmaremc_player_username', trimmed);
      localStorage.setItem('nightmaremc_player_edition', edition);
    } catch {}
    setIsLoginModalOpen(false);
  };

  const logoutPlayer = () => {
    setPlayer(null);
    try {
      localStorage.removeItem('nightmaremc_player_username');
      localStorage.removeItem('nightmaremc_player_edition');
    } catch {}
  };

  return (
    <PlayerContext.Provider
      value={{
        player,
        loginPlayer,
        logoutPlayer,
        isLoginModalOpen,
        setIsLoginModalOpen,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

const FALLBACK_PLAYER_CONTEXT: PlayerContextType = {
  player: null,
  loginPlayer: () => {},
  logoutPlayer: () => {},
  isLoginModalOpen: false,
  setIsLoginModalOpen: () => {},
};

export function usePlayerContext() {
  const context = useContext(PlayerContext);
  // Return safe fallback instead of throwing — prevents navigation crashes
  return context ?? FALLBACK_PLAYER_CONTEXT;
}
