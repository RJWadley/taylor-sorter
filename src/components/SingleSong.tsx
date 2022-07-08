import { DetailedTrack } from "App";
import React from "react";
type props = {
  track: DetailedTrack;
};

const SingleSong: React.FC<props> = ({ track }) => {
  console.log(track);

  return (
    <div>
      <img
        src={track.album.images[0].url}
        alt={`Album art for ${track.info.name}`}
      />
      <h1>{track.info.name}</h1>
    </div>
  );
};

export default SingleSong;
