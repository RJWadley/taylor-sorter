import { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useImageHSL } from "utils/averageImageColor";
import { MusicState } from "utils/music/music";
import { GenericTrack } from "utils/music/types";

import { SpotifyContext } from "./SpotifyProvider";

export default function PlayButton({ track }: { track: GenericTrack }) {
  const music = useContext(SpotifyContext);
  const [playing, setPlaying] = useState(false);
  const isCooldown = useRef(false);

  const togglePlayback = async () => {
    if (isCooldown.current) return;
    isCooldown.current = true;
    setTimeout(() => {
      isCooldown.current = false;
    }, 1000);

    await (playing ? music?.pause() : music?.playSong(track));
  };

  useEffect(() => {
    music?.pause().catch(console.error);
    setPlaying(false);
    const changeState = (state: MusicState) => {
      setPlaying(!state.paused && state.currentSong?.uri === track.uri);
    };

    music?.onStateChange(changeState);
    return () => music?.offStateChange(changeState);
  }, [music, track.uri]);

  const [hue, saturation] = useImageHSL(track.album.image);

  if (hue === undefined || saturation === undefined) return null;
  return (
    <Wrapper
      onClick={() => {
        togglePlayback().catch(console.error);
      }}
      accentColor={`hsl(${hue}, ${saturation}%, 30%)`}
      textColor={`hsl(${hue}, ${saturation}%, 95%)`}
    >
      <Icon>{playing ? "pause" : "play_arrow"}</Icon>
      <SongName>
        {playing ? "Playing " : "Play "} {track.name}
      </SongName>
    </Wrapper>
  );
}

const Wrapper = styled.button<{
  accentColor: string;
  textColor: string;
}>`
  background-color: ${({ accentColor }) => accentColor};
  color: ${({ textColor }) => textColor};
  cursor: pointer;
  padding: 10px 20px 10px 10px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  border-radius: 10px;
`;

const Icon = styled.div`
  /* stylelint-disable-next-line font-family-no-missing-generic-family-keyword */
  font-family: "Material Symbols Outlined";
`;

const SongName = styled.div`
  max-width: 350px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
