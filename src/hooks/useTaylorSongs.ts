import { useQuery } from "@tanstack/react-query";
import { SpotifyContext } from "components/SpotifyProvider";
import { useContext } from "react";
import { dedupe, shuffle } from "utils";
import { GenericTrack } from "utils/music/types";

export default function useTaylorSongs(): readonly GenericTrack[] {
  const music = useContext(SpotifyContext);

  const spotify = music?.spotify;

  const PLAYLIST_ID = "4GQD49kf1lZ5y29oVayAQi";

  // fetch all the songs from the playlist
  const { data: songs } = useQuery({
    queryKey: ["playlistSongs", !!music, !!spotify?.getAccessToken()],
    queryFn: async () => {
      if (!music) return [];
      const newSongs = await music.getSongsFromPlaylist(PLAYLIST_ID);
      return newSongs ?? [];
    },
  });

  const sortOrder = localStorage.getItem("sortOrder")?.split(",");

  if (!songs) return [];
  if (sortOrder && sortOrder.length > 1) {
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
    const shuffled = shuffle(songs);
    localStorage.setItem("sortOrder", shuffled.map((s) => s.id).join(","));
    return dedupe(shuffled);
  }
}
