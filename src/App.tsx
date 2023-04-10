import Leaderboard from "components/Leaderboard";
import Player from "components/Player";
import useRankingManager from "hooks/useRankingManager";
import useTaylorSongs from "hooks/useTaylorSongs";
import {
  SimplifiedAlbum,
  SimplifiedTrack,
} from "spotify-web-api-ts/types/types/SpotifyObjects";

export type DetailedTrack = {
  info: SimplifiedTrack;
  album: SimplifiedAlbum;
};

function App() {
  const songs = useTaylorSongs();

  const { nextTwoItems, selectItem, scores, simpleRanking, progress } =
    useRankingManager(songs.map((song) => song.info.name));

  const [songA, songB] = nextTwoItems ?? [];
  const songInfoA = songs.find((song) => song.info.name === songA);
  const songInfoB = songs.find((song) => song.info.name === songB);

  // useEffect(() => {
  //   if (Math.random() < 0.999 && nextTwoItems) {
  //     nextTwoItems.sort();
  //     setTimeout(() => {
  //       selectItem(nextTwoItems[0], nextTwoItems[1]);
  //     }, 0);
  //   }
  // }, [nextTwoItems, selectItem]);

  if (!songA || !songB) return <p>Loading...</p>;
  return (
    <div>
      <Player song={songInfoA}></Player>
      <button onClick={() => selectItem(songA, songB)}>Select {songA}</button>
      <p>{songInfoA?.album.name}</p>
      <h1>{songA}</h1>
      <h1>{songB}</h1>
      <p>{songInfoB?.album.name}</p>
      <Player song={songInfoB}></Player>
      <button onClick={() => selectItem(songB, songA)}>Select {songB}</button>

      <p>Progress: {Math.round(progress * 100)}%</p>

      <Leaderboard
        songs={songs}
        scores={scores}
        simpleRanking={simpleRanking}
      ></Leaderboard>
    </div>
  );
}

export default App;
