import { useQuery } from "@tanstack/react-query";
import { SpotifyContext } from "components/SpotifyProvider";
import { useContext } from "react";
import { dedupe, shuffle } from "utils";
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
      const combinedAlbums = await music.getAlbums(TAYLOR_ID);
      if (!combinedAlbums) return [];

      // filter out albums that aren't taylors version if a taylors version exists
      const taylorsVersionAlbums = combinedAlbums.filter((album) => {
        if (/Taylor(’|')s Version/.test(album.name)) return true;
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
            !/Taylor(’|')s Version/.test(album.name) &&
            !album.name.toLowerCase().includes("deluxe version") &&
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
      return filteredAlbums.filter(
        (album, index, self) =>
          self.findIndex((a) => a.name === album.name) === index
      );
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

  if (!songs) return [];

  const sortOrder = localStorage.getItem("sortOrder")?.split(",");

  if (sortOrder) {
    // match the order in the local storage
    const sortFunction = (a: GenericTrack, b: GenericTrack) => {
      const aIndex = sortOrder.indexOf(a.id);
      const bIndex = sortOrder.indexOf(b.id);

      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    };

    return dedupe(songs.sort(sortFunction));
  } else {
    const shuffled = shuffle(songs ?? []);
    localStorage.setItem("sortOrder", shuffled.map((s) => s.id).join(","));
    return dedupe(shuffled);
  }
}
