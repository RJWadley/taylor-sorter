import { useContext, useEffect, useRef, useState } from "react";
import SpotifyPlayer, { SpotifyWebPlaybackState } from "spotify-web-playback";
import { SpotifyContext } from "./SpotifyProvider";
import { DetailedTrack } from "App";

const player = new SpotifyPlayer("Song Sorter");
const fallbackAudio = new Audio();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Player({ song }: { song?: DetailedTrack }) {
  const { token, isPremium } = useContext(SpotifyContext);
  const [playing, setPlaying] = useState(false);
  const isCooldown = useRef(false);

  const togglePlayback = async () => {
    if (isCooldown.current) return;
    isCooldown.current = true;

    if (!token) return;
    if (!song) return;

    setPlaying((p) => !p);

    if (!isPremium) {
      if (playing) {
        fallbackAudio.pause();
      } else {
        fallbackAudio.src = song.info.preview_url || "";
        fallbackAudio.volume = 0;
        await fallbackAudio.play();
        await sleep(100);

        // fade in the audio
        const fadeTime = 1000;
        const steps = 100;
        const fade = setInterval(() => {
          fallbackAudio.volume = Math.min(1, fallbackAudio.volume + 1 / steps);
        }, fadeTime / steps);
        setTimeout(() => clearInterval(fade), fadeTime);
      }
    } else {
      if (playing) {
        await player.pause();
      } else {
        if (!player.ready) await player.connect(token);
        await player.play(song.info.uri);
      }
    }

    isCooldown.current = false;
  };

  useEffect(() => {
    const changeState = (state: SpotifyWebPlaybackState | null) => {
      if (state) {
        if (state.paused) setPlaying(false);
        if (!state.paused)
          setPlaying(state.track_window.current_track.uri === song?.info.uri);
      }
    };
    const fallbackState = () => {
      if (fallbackAudio.paused) setPlaying(false);
      if (fallbackAudio.src !== song?.info.preview_url) setPlaying(false);
    };
    player.addListener("state", changeState);
    fallbackAudio.addEventListener("pause", fallbackState);
    fallbackAudio.addEventListener("play", fallbackState);
    return () => {
      fallbackAudio.removeEventListener("pause", fallbackState);
      fallbackAudio.removeEventListener("play", fallbackState);
      player.removeListener("state", changeState);
    };
  });

  return <button onClick={togglePlayback}>{playing ? "Pause" : "Play"}</button>;
}
