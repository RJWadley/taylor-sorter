import { GenericTrack } from "utils/music/types";

/**
 * randomize the order of an array
 */
export const shuffle = <T>(arrayIn: readonly T[]): T[] => {
  const array: (T | undefined)[] = [...arrayIn];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.flatMap((item) => (item ? [item] : []));
};

/**
 * given an array of tracks, return a new array with no duplicate tracks
 * and no tracks with the same name
 * and no voice memos
 * @param array array of tracks
 * @returns array of tracks with no duplicates
 */
export const dedupe = (array: GenericTrack[]): GenericTrack[] => {
  // filter out tracks with the exact same id
  let uniqueSongs = array.filter(
    (track, index, self) => index === self.findIndex((t) => t.id === track.id)
  );

  // filter out tracks with the same name
  uniqueSongs = uniqueSongs.filter(
    (track, index, self) =>
      index === self.findIndex((t) => t.name === track.name)
  );

  // filter out voice memos
  uniqueSongs = uniqueSongs.filter(
    (track) => !track.name.toLowerCase().includes("voice memo")
  );

  return uniqueSongs;
};
