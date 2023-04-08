import { useQuery } from "@tanstack/react-query";
import { DetailedTrack } from "App";
import { SpotifyContext } from "components/SpotifyProvider";
import { useContext } from "react";
import { SimplifiedAlbum } from "spotify-web-api-ts/types/types/SpotifyObjects";
import { dedupe } from "utils";

const TAYLOR_ID = "06HL4z0CvFAxyc27GXpf02";

const TAYLORS_VERSIONS = ["fearless", "red"];
const INCLUDE_LIVE = false;
const INCLUDE_REMIXES = false;

export default function useTaylorSongs(): readonly DetailedTrack[] {
  const { initializeApi, isInitialized, spotify } = useContext(SpotifyContext);

  const { data: albums } = useQuery({
    queryKey: ["taylorAlbums", isInitialized],
    queryFn: async () => {
      // init the spotify api
      if (!isInitialized) {
        initializeApi();
        return [];
      }

      const combinedAlbums: SimplifiedAlbum[] = [];
      let next = true;
      let page = 0;
      while (next) {
        const albums = await spotify?.artists.getArtistAlbums(TAYLOR_ID, {
          limit: 50,
          offset: page * 50,
          include_groups: ["album", "single"],
        });
        combinedAlbums.push(...(albums?.items ?? []));
        next = !!albums?.next;
        page++;
      }

      // filter out albums that aren't taylors version if a taylors version exists
      const taylorsVersionAlbums = combinedAlbums.filter((album) => {
        if (album.name.match(/Taylor(’|')s Version/)) return true;
        if (
          TAYLORS_VERSIONS.some((v) => album.name.toLowerCase().includes(v))
        ) {
          return false;
        }
        return true;
      });

      const filteredAlbums = taylorsVersionAlbums.filter((album) => {
        // filter out albums we know we don't want
        // big machine albums
        if (album.name.toLowerCase().includes("big machine")) return false;
        // karaoke albums
        if (album.name.toLowerCase().includes("karaoke")) return false;
        // disney albums
        if (album.name.toLowerCase().includes("disney")) return false;

        if (!INCLUDE_LIVE) {
          // live albums
          if (album.name.toLowerCase().includes("live")) return false;
          if (album.name.toLowerCase().includes("tour")) return false;
        }

        if (!INCLUDE_REMIXES) {
          // remix albums
          if (album.name.toLowerCase().includes("remix")) return false;
          if (album.name.toLowerCase().includes(" mix")) return false;

          // version albums
          if (
            album.name.toLowerCase().includes("version") &&
            // don't filter out tv
            !album.name.match(/Taylor(’|')s Version/) &&
            // don't filter out acoustic
            !album.name.toLowerCase().includes("acoustic")
          )
            return false;

          if (album.name.toLowerCase().includes("witch collection"))
            return false;
        }

        return true;
      });

      // filter out albums with the exact same name
      const deDupedAlbums = filteredAlbums.filter(
        (album, index, self) =>
          self.findIndex((a) => a.name === album.name) === index
      );

      return deDupedAlbums;
    },
  });

  const { data: songs } = useQuery({
    queryKey: ["albumSongs", albums?.map((a) => a.id).join(",")],
    enabled: !!albums?.length,
    queryFn: async () => {
      if (!albums) return [];
      const currentRegion = navigator.language.split("-")[1];

      const songs = await Promise.all(
        albums.map(async (album) => {
          //ensure album is available in current region
          if (
            album.available_markets === undefined ||
            album.available_markets.includes(currentRegion)
          ) {
            //get album tracks
            const tracks = await spotify?.albums.getAlbumTracks(album.id);

            if (!tracks) return [];
            return tracks.items.map((info) => ({
              info,
              album,
            }));
          } else {
            return [];
          }
        }) ?? []
      );

      return songs.flat();
    },
  });

  return dedupe(songs ?? []);
}
