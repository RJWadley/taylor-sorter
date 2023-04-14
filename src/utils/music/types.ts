import {
  SimplifiedAlbum,
  SimplifiedTrack,
} from "spotify-web-api-ts/types/types/SpotifyObjects";

export type DetailedTrack = {
  info: SimplifiedTrack;
  album: SimplifiedAlbum;
};
