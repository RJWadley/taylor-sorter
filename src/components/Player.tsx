import { useContext, useEffect, useRef, useState } from "react";
import { SpotifyContext } from "./SpotifyProvider";
import { MusicState } from "utils/music/music";
import { GenericTrack } from "utils/music/types";

export default function Player({ song }: { song?: GenericTrack }) {
  const music = useContext(SpotifyContext);
  const [playing, setPlaying] = useState(false);
  const isCooldown = useRef(false);

  const togglePlayback = async () => {
    if (isCooldown.current) return;
    isCooldown.current = true;
    setTimeout(() => (isCooldown.current = false), 1000);

    if (playing) {
      music?.pause();
    } else if (song) {
      music?.playSong(song);
    }
  };

  useEffect(() => {
    music?.pause();
    setPlaying(false);
    const changeState = (state: MusicState) => {
      setPlaying(!state.paused && state.currentSong?.uri === song?.uri);
    };

    music?.onStateChange(changeState);
    return () => music?.offStateChange(changeState);
  }, [music, song?.uri]);

  return <button onClick={togglePlayback}>{playing ? "Pause" : "Play"}</button>;
}
