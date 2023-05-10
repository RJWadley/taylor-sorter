import { useState } from "react";
import { GenericTrack } from "utils/music/types";

export default function Leaderboard({
  scores,
  songs,
  simpleRanking,
}: {
  scores: Record<string, number>;
  songs: readonly GenericTrack[];
  simpleRanking: string[];
}) {
  const [simpleRank, setSimpleRank] = useState(false);

  const sortedByScore = [...songs].sort((a, b) => {
    const scoreA = scores[a.name] ?? 1000;
    const scoreB = scores[b.name] ?? 1000;
    return scoreB - scoreA;
  });

  return (
    <>
      <br />
      <br />
      <br />
      <br />
      <button onClick={() => setSimpleRank(true)}>Simple Rank</button>
      <button onClick={() => setSimpleRank(false)}>Detailed Rank</button>
      {simpleRank
        ? simpleRanking.map((song) => <p key={song}>{song}</p>)
        : sortedByScore.map((song) => (
            <p key={song.id}>
              {song.name} - {scores[song.name] ?? 1000}
            </p>
          ))}
    </>
  );
}
