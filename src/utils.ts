import { DetailedTrack, srs } from "App";

export const shuffle = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const dedupe = (array: DetailedTrack[]): DetailedTrack[] => {
  //filter by track.info.id
  return array.filter(
    (track, index, self) =>
      index === self.findIndex((t) => t.info.id === track.info.id)
  );
};

export const getSRS = () => {
  //get from local storage
  const srs = localStorage.getItem("srs");
  if (srs) {
    return JSON.parse(srs) as srs;
  } else {
    return {};
  }
};

export const setSRS = (srs: srs) => {
  localStorage.setItem("srs", JSON.stringify(srs));
};
