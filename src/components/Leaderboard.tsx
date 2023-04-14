import { useState } from "react";
import { DetailedTrack } from "utils/music/types";

export default function Leaderboard({
  scores,
  songs,
  simpleRanking,
}: {
  scores: Record<string, number>;
  songs: readonly DetailedTrack[];
  simpleRanking: string[];
}) {
  const [simpleRank, setSimpleRank] = useState(false);

  const sortedByScore = [...songs].sort((a, b) => {
    const scoreA = scores[a.info.name] ?? 1000;
    const scoreB = scores[b.info.name] ?? 1000;
    return scoreB - scoreA;
  });

  return (
    <>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <button onClick={() => setSimpleRank(true)}>Simple Rank</button>
      <button onClick={() => setSimpleRank(false)}>Detailed Rank</button>
      {simpleRank
        ? simpleRanking.map((song) => <p key={song}>{song}</p>)
        : sortedByScore.map((song) => (
            <p key={song.info.id}>
              {song.info.name} - {scores[song.info.name] ?? 1000}
            </p>
          ))}
    </>
  );
}
