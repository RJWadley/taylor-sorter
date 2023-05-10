import { SpotifyWebApi } from "spotify-web-api-ts";
import {
  authWithCode,
  authSpotifyWithRefreshToken,
  grantSpotifyPermissions,
} from "./spotifyAuth";
import SpotifyPlayer from "spotify-web-playback";
import { GenericAlbum, GenericTrack } from "./types";
import { SimplifiedAlbum } from "spotify-web-api-ts/types/types/SpotifyObjects";

const spotify = new SpotifyWebApi();
const player = new SpotifyPlayer("Song Sorter");
const fallbackAudio = new Audio();

export default class Music {
  private spotifyToken?: string;
  private isPremium: boolean = false;
  spotify = spotify;

  async authenticate() {
    const codeVerifier = localStorage.getItem("codeVerifier");
    const refreshToken = localStorage.getItem("refresh_id");
    const code = new URLSearchParams(window.location.search).get("code");
    window.history.replaceState({}, document.title, "/");

    // first, check if we have a refresh token and use it
    // if we were redirected from spotify, use the code and code verifier to get a token
    if (refreshToken || (codeVerifier && code)) {
      const newToken =
        codeVerifier && code
          ? await authWithCode(code, codeVerifier)
          : await authSpotifyWithRefreshToken(refreshToken);
      if (newToken) {
        this.spotifyToken = newToken;
        spotify.setAccessToken(newToken);
        player.setToken(newToken);

        // clear out the code verifier
        localStorage.removeItem("codeVerifier");

        setTimeout(() => {
          this.authenticate();
        }, 3500 * 1000);

        // detect if the user is premium
        await spotify.users
          .getMe()
          .then((user) => {
            if (user.product === "premium") this.isPremium = true;
          })
          .catch(() => {});

        return;
      }
    }

    // otherwise, we need to get permissions from the user
    grantSpotifyPermissions();
  }

  async getAlbums(artistId: string): Promise<GenericAlbum[] | undefined> {
    if (!this.spotifyToken) await this.authenticate();
    if (!this.spotifyToken) return;
    const combinedAlbums: SimplifiedAlbum[] = [];
    let next = true;
    let page = 0;
    while (next) {
      const albums = await spotify?.artists.getArtistAlbums(artistId, {
        limit: 50,
        offset: page * 50,
        include_groups: ["album", "single"],
      });
      combinedAlbums.push(...(albums?.items ?? []));
      next = !!albums?.next;
      page++;
    }

    return combinedAlbums.map((album) => ({
      ...album,
      image: album.images[0]?.url,
      available_markets: album.available_markets,
    }));
  }

  async getSongs(albums: GenericAlbum[]): Promise<GenericTrack[] | undefined> {
    if (!this.spotifyToken) this.authenticate();
    if (!this.spotifyToken) return;
    const allSongs = albums.flatMap((album) => {
      const currentMarket = window.navigator.language.split("-")[1];
      const validMarket = album.available_markets?.includes(currentMarket);
      if (validMarket)
        return spotify?.albums
          .getAlbumTracks(album.id)
          .then((tracks) =>
            tracks?.items.map((track) => ({
              ...track,
              album,
            }))
          )
          .catch(() => undefined);
      else return undefined;
    });

    return (await Promise.all(allSongs)).flatMap((x) => x ?? []);
  }

  async playSong(song: GenericTrack) {
    if (!this.spotifyToken) await this.authenticate();
    if (!this.spotifyToken) return;
    if (!this.isPremium) {
      fallbackAudio.src = song.preview_url || "";
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
    } else {
      if (!player.ready) await player.connect(this.spotifyToken);
      await player.play(song.uri);
    }

    this.dispatchStateChange({ paused: false, currentSong: song });
  }

  async pause() {
    if (!this.spotifyToken) await this.authenticate();
    if (!this.spotifyToken) return;
    if (!this.isPremium) {
      await fallbackAudio.pause();
    } else {
      if (player.playing) await player.pause();
    }
    this.dispatchStateChange({ paused: true });
  }

  stateCallbacks: ((state: MusicState) => void)[] = [];

  onStateChange(callback: (state: MusicState) => void) {
    this.stateCallbacks.push(callback);
  }

  offStateChange(callback: (state: MusicState) => void) {
    this.stateCallbacks = this.stateCallbacks.filter((cb) => cb !== callback);
  }

  private dispatchStateChange(state: MusicState) {
    this.stateCallbacks.forEach((cb) => cb(state));
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type MusicState = {
  paused: boolean;
  currentSong?: GenericTrack;
};
