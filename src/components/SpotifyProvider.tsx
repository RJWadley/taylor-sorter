import React, { createContext, useMemo } from "react";
import Music from "utils/music/music";

export const SpotifyContext = createContext<Music | null>(null);

interface Props {
  children: React.ReactNode;
}

const MusicProvider = ({ children }: Props) => {
  const music = useMemo(() => new Music(), []);

  return (
    <SpotifyContext.Provider value={music}>{children}</SpotifyContext.Provider>
  );
};

export default MusicProvider;
