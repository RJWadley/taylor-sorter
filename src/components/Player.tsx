import { useContext, useEffect, useRef, useState } from "react";
import { MusicState } from "utils/music/music";
import { GenericTrack } from "utils/music/types";

import { SpotifyContext } from "./SpotifyProvider";

export default function Player({ song }: { song?: GenericTrack }) {
  const music = useContext(SpotifyContext);
  const [playing, setPlaying] = useState(false);
  const isCooldown = useRef(false);

  const togglePlayback = async () => {
    if (isCooldown.current) return;
    isCooldown.current = true;
    setTimeout(() => {
      isCooldown.current = false;
    }, 1000);

    if (playing) {
      await music?.pause();
    } else if (song) {
      await music?.playSong(song);
    }
  };

  useEffect(() => {
    music?.pause().catch(console.error);
    setPlaying(false);
    const changeState = (state: MusicState) => {
      setPlaying(!state.paused && state.currentSong?.uri === song?.uri);
    };

    music?.onStateChange(changeState);
    return () => music?.offStateChange(changeState);
  }, [music, song?.uri]);

  return (
    <button
      onClick={() => {
        togglePlayback().catch(console.error);
      }}
    >
      {playing ? "Pause" : "Play"}
    </button>
  );
}
