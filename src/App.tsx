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

  const { nextTwoItems, selectItem } = useRankingManager(
    songs.map((song) => song.info.name)
  );

  const [songA, songB] = nextTwoItems ?? [];
  const songInfoA = songs.find((song) => song.info.name === songA);
  const songInfoB = songs.find((song) => song.info.name === songB);

  if (!songA || !songB) return <p>Loading...</p>;
  return (
    <div>
      <button onClick={() => selectItem(songA, songB)}>Select {songA}</button>
      <p>{songInfoA?.album.name}</p>
      <h1>{songA}</h1>
      <h1>{songB}</h1>
      <p>{songInfoB?.album.name}</p>
      <button onClick={() => selectItem(songB, songA)}>Select {songB}</button>
    </div>
  );
}

export default App;
