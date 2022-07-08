import { DetailedTrack } from "App";
import React, { useContext, useEffect, useState } from "react";
import SpotifyPlayer from "spotify-web-playback";
import { SpotifyContext } from "./SpotifyProvider";

type props = {
  trackToPlay: DetailedTrack;
};

const SpotifyPlayerWrapper: React.FC<props> = ({ trackToPlay }) => {
  const { spotify } = useContext(SpotifyContext);

  const [hasPremium, setHasPremium] = useState(false);
  const [player, setPlayer] = useState<SpotifyPlayer | undefined>();

  useEffect(() => {
    spotify?.users.getMe().then((user) => {
      if (user.product === "premium") {
        setHasPremium(true);
      }
    });
  }, [spotify]);

  useEffect(() => {
    if (hasPremium && spotify) {
      const token = spotify.getAccessToken();

      const player = new SpotifyPlayer("Music Player");
      player.connect(token).then(() => {
        player.pause();
        player.play(trackToPlay.info.id);
        setPlayer(player);
      });
    }
  }, [hasPremium, spotify, trackToPlay.info.id]);

  useEffect(() => {
    if (player) {
      player.pause();
      setTimeout(() => {
        player.play(trackToPlay.info.uri);
      }, 1000);
    }
  }, [player, trackToPlay]);

  return (
    <div>
      {!hasPremium && (
        <audio autoPlay controls>
          <source src={trackToPlay.info.preview_url} />
        </audio>
      )}
      <button onClick={() => player?.play(trackToPlay.info.uri)}>PLAY</button>
      <button onClick={() => player?.pause()}>PAUSE</button>
    </div>
  );
};

export default SpotifyPlayerWrapper;
