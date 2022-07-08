import { DetailedTrack } from "App";
import React, { useEffect, useState } from "react";
import { getSRS, setSRS } from "utils";
import SingleSong from "./SingleSong";
import SpotifyPlayerWrapper from "./SpotifyPlayer";

//TODO incorporate how long it took to guess the song into the SRS

type props = {
  songs: DetailedTrack[];
};

// in minutes
const steps = [1, 1, 5, 10, 10 * 60, 120 * 60, 14 * 24 * 60];

const TrackManager: React.FC<props> = ({ songs }) => {
  let [currentSong, setCurrentSong] = useState<DetailedTrack | undefined>(
    undefined
  );
  let [visible, setVisible] = useState(false);
  let srs = getSRS();

  useEffect(() => {
    songs.forEach((song) => {
      if (srs[song.info.id] === undefined) {
        srs[song.info.id] = {
          currentStep: 0,
          seen: false,
          dueAt: 0,
        };
      }
    });
  }, [songs, srs]);

  useEffect(() => {
    console.log("CURENT SONG", currentSong);
    if (!currentSong) {
      console.log("FINDING NEXT SONG");
      //search for songs that have been seen and are due to be seen again
      const songsToReview = songs.filter((song) => {
        return srs[song.info.id]?.seen && srs[song.info.id]?.dueAt < Date.now();
      });

      console.log("SONGS TO REVIEW", songsToReview);

      //if no songs to review, return a random unseen song
      if (songsToReview.length === 0) {
        const unseenSongs = songs.filter((song) => !srs[song.info.id]?.seen);
        const randomSong =
          unseenSongs[Math.floor(Math.random() * unseenSongs.length)];
        setCurrentSong(randomSong);
      } else {
        //if there are songs to review, return the first one
        const randomSong = songsToReview[0];
        setCurrentSong(randomSong);
      }
    }
  }, [currentSong, songs, srs]);

  const Success = () => {
    if (currentSong) {
      srs[currentSong.info.id].currentStep++;
      srs[currentSong.info.id].seen = true;
      srs[currentSong.info.id].dueAt =
        Date.now() + steps[srs[currentSong.info.id].currentStep] * 60 * 1000;
      setCurrentSong(undefined);
      setSRS(srs);
    }
  };

  const Failure = () => {
    if (currentSong) {
      srs[currentSong.info.id].currentStep = 0;
      srs[currentSong.info.id].seen = true;
      srs[currentSong.info.id].dueAt =
        Date.now() + steps[srs[currentSong.info.id].currentStep] * 60 * 1000;
      setCurrentSong(undefined);
      setSRS(srs);
    }
  };

  const toggleVisibility = () => {
    setVisible(!visible);
  };

  window.Success = Success;
  window.Failure = Failure;

  return (
    <div>
      TrackManager
      {currentSong && visible && <SingleSong track={currentSong} />}
      {currentSong && <SpotifyPlayerWrapper trackToPlay={currentSong} />}
      <button onClick={toggleVisibility}>Toggle Visibility</button>
      <button onClick={Success}>GOT IT</button>
      <button onClick={Success}>DIDN'T GOT IT</button>
    </div>
  );
};

export default TrackManager;
