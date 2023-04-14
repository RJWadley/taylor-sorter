import { useContext, useEffect, useRef, useState } from "react";
import { SpotifyContext } from "./SpotifyProvider";
import { DetailedTrack } from "utils/music/types";
import { MusicState } from "utils/music/music";

export default function Player({ song }: { song?: DetailedTrack }) {
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
    const changeState = (state: MusicState) => {
      setPlaying(
        !state.paused && state.currentSong?.info.uri === song?.info.uri
      );
    };

    music?.onStateChange(changeState);
    return () => music?.offStateChange(changeState);
  });

  return <button onClick={togglePlayback}>{playing ? "Pause" : "Play"}</button>;
}
