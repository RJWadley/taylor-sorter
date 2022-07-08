import { SpotifyContext } from "components/SpotifyProvider";
import TrackManager from "components/TrackManager";
import React, { useContext, useEffect } from "react";
import {
  SimplifiedAlbum,
  SimplifiedTrack,
} from "spotify-web-api-ts/types/types/SpotifyObjects";
import { dedupe } from "utils";

const TAYLOR_ID = "06HL4z0CvFAxyc27GXpf02";

export type DetailedTrack = {
  info: SimplifiedTrack;
  album: SimplifiedAlbum;
};

export type srs = {
  [key: string]: {
    currentStep: number;
    seen: boolean;
    dueAt: number;
  };
};

function App() {
  const { initializeApi, isInitialized, spotify } = useContext(SpotifyContext);

  const [songs, setSongs] = React.useState<DetailedTrack[]>([]);

  useEffect(() => {
    if (!isInitialized) initializeApi();

    if (spotify) {
      spotify.artists.getArtistAlbums(TAYLOR_ID).then((data) => {
        data.items.forEach((album) => {
          const currentRegion = navigator.language.split("-")[1];

          //ensure album is available in current region
          if (
            album.available_markets === undefined ||
            album.available_markets.includes(currentRegion)
          ) {
            //get album tracks
            spotify.albums.getAlbumTracks(album.id).then((tracks) => {
              tracks.items.forEach((info) => {
                setSongs((prevSongs) =>
                  dedupe([
                    ...prevSongs,
                    {
                      info,
                      album,
                    },
                  ])
                );
              });
            });
          }
        });
      });
    }
  }, [initializeApi, isInitialized, spotify]);

  return (
    <div>
      <TrackManager songs={songs} />
    </div>
  );
}

export default App;
