import { useQuery } from "@tanstack/react-query";
import { SpotifyContext } from "components/SpotifyProvider";
import { useContext } from "react";
import { dedupe } from "utils";
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

  return dedupe(songs ?? []);
}
