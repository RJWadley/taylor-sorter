import { useState, useEffect, useCallback } from "react";

import EloRank from "elo-rank";
import { shuffle } from "utils";

const elo = new EloRank();

type MatchUp = {
  players: [string, string];
  winner: string;
};

/**
 * given a list of items, rank them using the elo algorithm
 * store all the known match ups in local storage
 * @param items the list of every item
 * @returns
 *
 * `nextTwoItems` - the next two items to compare
 *
 * `selectItem` - call this function with the item that won the match up
 */
export default function useRankingManager(items: string[]) {
  const [scores] = useState<Record<string, number>>({});
  const [matchUpCounts] = useState<Record<string, number>>({});
  const [nextTwoItems, setNextTwoItems] = useState<[string, string]>();
  const [matchUps] = useState<MatchUp[]>(
    JSON.parse(localStorage.getItem("matchUps") ?? "[]")
  );

  /**
   * get an initial set of two items to compare
   */
  useEffect(() => {
    if (!nextTwoItems && items.length) {
      setNextTwoItems([items[0], items[1]]);
    }
  }, [items, nextTwoItems]);

  /**
   * update the ELO scores for a winner and loser
   */
  const updateElo = useCallback(
    (winner: string, loser: string) => {
      // update the match up counts
      matchUpCounts[winner] ||= 0;
      matchUpCounts[loser] ||= 0;
      matchUpCounts[winner] += 1;
      matchUpCounts[loser] += 1;

      scores[winner] ||= 1000;
      scores[loser] ||= 1000;

      // get the expected scores
      var expectedScoreWinner = elo.getExpected(scores[winner], scores[loser]);
      var expectedScoreLoser = elo.getExpected(scores[loser], scores[winner]);

      // update the ELO scores
      scores[winner] = elo.updateRating(expectedScoreWinner, 1, scores[winner]);
      scores[loser] = elo.updateRating(expectedScoreLoser, 0, scores[loser]);
    },
    [matchUpCounts, scores]
  );

  /**
   * on the first render, get the match ups from local storage
   */
  useEffect(() => {
    for (const matchUp of matchUps) {
      const [playerA, playerB] = matchUp.players;

      if (playerA === matchUp.winner) {
        updateElo(playerA, playerB);
      } else if (playerB === matchUp.winner) {
        updateElo(playerB, playerA);
      }
    }
  }, [matchUps, updateElo]);

  const selectItem = (winner: string, loser: string) => {
    updateElo(winner, loser);

    // update the match ups
    matchUps.push({ players: [winner, loser], winner });
    localStorage.setItem("matchUps", JSON.stringify(matchUps));

    if (Math.random() < 0.2) {
      // return two random items (20% of the time)
      const [itemA, itemB] = shuffle(items);
      setNextTwoItems([itemA, itemB]);
    } else {
      // return the least played item and a random item (80% of the time)

      // sort the items by the number of match ups they've had
      // where the least played item is first
      const sortedItems = items.sort(
        (a, b) => (matchUpCounts[a] ?? 0) - (matchUpCounts[b] ?? 0)
      );

      // then, get the least played item
      const leastPlayedItem = sortedItems[0];
      const randomItem = sortedItems[Math.floor(Math.random() * items.length)];

      setNextTwoItems([leastPlayedItem, randomItem]);
    }
  };

  return { nextTwoItems, selectItem, scores, matchUps };
}
