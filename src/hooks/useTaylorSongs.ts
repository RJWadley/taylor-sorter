import { useQuery } from "@tanstack/react-query";
import { SpotifyContext } from "components/SpotifyProvider";
import { useContext } from "react";
import { dedupe } from "utils";
import { GenericTrack } from "utils/music/types";

const TAYLOR_ID = "06HL4z0CvFAxyc27GXpf02";

const TAYLORS_VERSIONS = ["fearless", "red"];
const INCLUDE_LIVE = false;
const INCLUDE_REMIXES = false;

export default function useTaylorSongs(): readonly GenericTrack[] {
  const music = useContext(SpotifyContext);

  const spotify = music?.spotify;

  const { data: albums } = useQuery({
    queryKey: ["taylorAlbums", !!music, !!spotify?.getAccessToken()],
    queryFn: async () => {
      if (!music) return [];
      const combinedAlbums = await music?.getAlbums(TAYLOR_ID);
      if (!combinedAlbums) return [];

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
      const songs = await music?.getSongs(albums);
      return songs ?? [];
    },
  });

  return dedupe(songs ?? []);
}
