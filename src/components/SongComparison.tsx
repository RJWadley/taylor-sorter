import useRankingManager from "hooks/useRankingManager";
import useTaylorSongs from "hooks/useTaylorSongs";
import { useEffect } from "react";
import styled from "styled-components";

import Leaderboard from "./Leaderboard";
import PlayButton from "./PlayButton";
import Player from "./Player";
import PrimaryButton from "./PrimaryButton";
import SongCard from "./SongCard";

export default function SongComparison() {
  const songs = useTaylorSongs();

  const { nextTwoItems, selectItem, progress, scores, simpleRanking, undo } =
    useRankingManager(songs.map((song) => song.name));

  const [songA, songB] = nextTwoItems ?? [];
  const songInfoA = songs.find((song) => song.name === songA);
  const songInfoB = songs.find((song) => song.name === songB);

  useEffect(() => {
    // if (!nextTwoItems) return;
    // nextTwoItems.sort();
    // setTimeout(() => {
    //   selectItem(nextTwoItems[0], nextTwoItems[1]);
    // }, 0);
  }, [nextTwoItems, selectItem]);

  if (!songInfoA || !songInfoB || !songA || !songB) return <p>Loading...</p>;

  return (
    <>
      <Wrapper>
        <TopRow>
          <div />
          <ProgressBar progress={progress * 100}>
            <div>
              {progress.toLocaleString(undefined, {
                style: "percent",
                minimumFractionDigits: 2,
              })}{" "}
              Sorted
            </div>
          </ProgressBar>
          <PrimaryButton onClick={undo} icon="undo">
            Undo
          </PrimaryButton>
        </TopRow>
        <Cards>
          <SongCard
            track={songInfoA}
            onClick={() => selectItem(songA, songB)}
          />
          <SongCard
            track={songInfoB}
            onClick={() => selectItem(songB, songA)}
          />
        </Cards>
        <BottomRow>
          <PlayButton track={songInfoA} />
          <PlayButton track={songInfoB} />
        </BottomRow>
        <Player />
      </Wrapper>
      <Leaderboard
        scores={scores}
        simpleRanking={simpleRanking}
        songs={songs}
      />
    </>
  );
}

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  padding: 20px;
  gap: 15px;
  width: 100%;
  height: 100%;
`;

const TopRow = styled.div`
  display: grid;
  justify-content: center;
  gap: 10px;
  grid-template-columns: 1fr auto 1fr;
  place-items: end;
`;

const ProgressBar = styled.div<{
  progress: number;
}>`
  width: 400px;
  background: #f6f6f6;
  position: relative;
  padding: 10px;
  border-radius: 10px;
  overflow: hidden;
  text-align: center;

  > div {
    position: relative;
    z-index: 2;
  }

  ::before {
    content: "";
    position: absolute;
    z-index: 1;
    inset: 0;
    width: ${(props) => props.progress}%;
    background: #bbefc4;
  }
`;

const Cards = styled.div`
  display: flex;
  gap: 100px;
  align-items: center;
  justify-content: center;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
`;
