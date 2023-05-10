import useRankingManager from "hooks/useRankingManager";
import useTaylorSongs from "hooks/useTaylorSongs";
import styled from "styled-components";

import PlayButton from "./PlayButton";
import Player from "./Player";
import SongCard from "./SongCard";

export default function SongComparison() {
  const songs = useTaylorSongs();

  const { nextTwoItems, selectItem } = useRankingManager(
    songs.map((song) => song.name)
  );

  const [songA, songB] = nextTwoItems ?? [];
  const songInfoA = songs.find((song) => song.name === songA);
  const songInfoB = songs.find((song) => song.name === songB);

  if (!songInfoA || !songInfoB || !songA || !songB) return <p>Loading...</p>;

  return (
    <>
      <Wrapper>
        <SongCard track={songInfoA} onClick={() => selectItem(songA, songB)} />
        <SongCard track={songInfoB} onClick={() => selectItem(songB, songA)} />
      </Wrapper>
      <Player />
      <BottomRow>
        <PlayButton track={songInfoA} />
        <PlayButton track={songInfoB} />
      </BottomRow>
    </>
  );
}

const Wrapper = styled.div`
  display: flex;
  gap: 100px;
  align-items: center;
  justify-content: center;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
`;
