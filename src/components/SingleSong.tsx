import { DetailedTrack } from "App";
import React from "react";
type props = {
  track: DetailedTrack;
};

const SingleSong: React.FC<props> = ({ track }) => {
  return (
    <div>
      <img
        src={track.album.images[0].url}
        alt={`Album art for ${track.info.name}`}
      />
      <h1>{track.info.name}</h1>
      <h2>{track.album.name}</h2>
      <h3>Track number {track.info.track_number}</h3>
    </div>
  );
};

export default SingleSong;
