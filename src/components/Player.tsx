import { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { MusicState, useMusicProgress } from "utils/music/music";
import { GenericTrack } from "utils/music/types";

import { SpotifyContext } from "./SpotifyProvider";

const formatProgress = (num: number) => {
  return Intl.DateTimeFormat("en-US", {
    minute: "numeric",
    second: "2-digit",
  })
    .format(num * 1000)
    .slice(1);
};

export default function Player() {
  const music = useContext(SpotifyContext);
  const [song, setSong] = useState<GenericTrack>();
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

  const { duration, progress } = useMusicProgress();

  useEffect(() => {
    const changeState = (state: MusicState) => {
      setPlaying(!state.paused);
      if (state.currentSong) setSong(state.currentSong);
    };

    music?.onStateChange(changeState);
    return () => music?.offStateChange(changeState);
  }, [music]);

  const [internalProgress, setInternalProgress] = useState(0);
  const waitingForUpdate = useRef(false);
  useEffect(() => {
    if (waitingForUpdate.current) {
      setInternalProgress((prev) => {
        if (Math.abs(progress - prev) < 4) {
          waitingForUpdate.current = false;
          return progress;
        }
        return prev;
      });
    } else {
      setInternalProgress(progress);
    }
  }, [progress]);

  const onSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.round(Number(e.target.value));
    setInternalProgress(value);
    if (!song) return;
    waitingForUpdate.current = true;
    music?.seek(value).catch((error) => {
      console.error(error);
      waitingForUpdate.current = false;
    });
  };

  return (
    <Wrapper>
      <Image
        src={song?.album.image}
        alt={`${song?.album.name ?? "no"} album cover`}
        as={song ? "img" : "div"}
      />
      <SongInfo>
        <SongName>{song?.name}</SongName>
        <Album>{song?.album.name}</Album>
      </SongInfo>
      <Progress>
        <TimeStamp>{formatProgress(internalProgress)}</TimeStamp>
        <Slider
          key={song?.uri}
          type="range"
          min={0}
          max={100}
          value={internalProgress}
          onChange={onSliderChange}
        />
        <TimeStamp>{formatProgress(duration)}</TimeStamp>
      </Progress>
      <Control
        onClick={() => {
          togglePlayback().catch(console.error);
        }}
      >
        {playing ? "pause" : "play_arrow"}
      </Control>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: #f6f6f6;
  display: grid;
  grid-template-columns: 50px auto 1fr 50px;
  width: min(calc(100vw - 200px), 900px);
  margin: 0 auto;
  padding: 5px;
  border-radius: 20px;
  gap: 10px;
  align-items: center;
`;

const Image = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 15px;
  background: #ddd;
`;

const SongInfo = styled.div`
  width: 150px;
`;

const SongName = styled.div`
  font-weight: bold;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Album = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Progress = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
`;

const TimeStamp = styled.div``;

const Slider = styled.input`
  /* style the track */
  appearance: none;
  background: transparent;
  cursor: pointer;
  width: 15rem;
  width: 100%;

  ::-webkit-slider-runnable-track {
    background: black;
    height: 1px;
    border-radius: 1px;
  }

  ::-moz-range-track {
    background: black;
    height: 1px;
    border-radius: 1px;
  }

  ::-webkit-slider-thumb {
    appearance: none;
    margin-top: -5px; /* Centers thumb on the track */
    background-color: black;
    height: 10px;
    width: 2px;
    border-radius: 1px;
  }

  ::-moz-range-thumb {
    border: none; /* Removes extra border that FF applies */
    background-color: black;
    height: 10px;
    width: 2px;
    border-radius: 1px;
  }
`;

const Control = styled.button`
  /* stylelint-disable-next-line font-family-no-missing-generic-family-keyword */
  font-family: "Material Symbols Outlined";
  cursor: pointer;
  text-align: center;
  font-size: 1.3rem;
`;
