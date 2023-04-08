import { useState, useEffect, useCallback, useRef } from "react";

import EloRank from "elo-rank";
import { shuffle } from "utils";
import mergeSort from "utils/mergeSort";

const elo = new EloRank();

type MatchUp = {
  players: [string, string];
  winner: string;
};

/**
 * given a list of items, rank them using the elo algorithm
 * and using a simple algorithm
 * store all the known match ups in local storage
 * @param items the list of every item
 * @returns
 *
 * `nextTwoItems` - the next two items to compare
 *
 * `selectItem` - call this function with the item that won the match up
 */
export default function useRankingManager(items: readonly string[]) {
  /**
   * scores using the ELO algorithm
   */
  const [scores] = useState<Record<string, number>>({});
  /**
   * how many times each item has been matched up
   */
  const [matchUpCounts] = useState<Record<string, number>>({});
  /**
   * simple ranking
   */
  const [simpleRanking, setSimpleRanking] = useState<string[]>([]);
  /**
   * the next two items to compare
   */
  const [nextTwoItems, setNextTwoItems] = useState<[string, string]>();
  /**
   * every match up that has happened
   */
  const [matchUps] = useState<MatchUp[]>(
    JSON.parse(localStorage.getItem("matchUps") ?? "[]")
  );
  /**
   * how done we are as a percentage
   */
  const [progress, setProgress] = useState(0);

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
  const updateScores = useCallback(
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
   * select the next two songs to compare
   */
  const selectNextSongs = () => {
    let simpleInProgress = false;
    let totalCount = 0;
    const neededBattles: [string, string][] = [];

    // first sort the items using a merge sort.
    // track which comparisons we need to make to improve the sort
    const comparison = (a: string, b: string) => {
      totalCount += 1;
      const battles = matchUps.filter(
        (matchUp) => matchUp.players.includes(a) && matchUp.players.includes(b)
      );

      if (battles.length === 0) {
        neededBattles.push([a, b]);
        simpleInProgress = true;

        // if they've never competed, guess the winner using the ELO scores
        scores[a] ||= 1000;
        scores[b] ||= 1000;
        if (scores[a] === scores[b]) {
          return 0;
        }
        // higher score comes first
        return scores[a] > scores[b] ? -1 : 1;
      }

      const cumulativeScore = battles.reduce((acc, matchUp) => {
        if (matchUp.winner === a) {
          return acc - 1;
        } else if (matchUp.winner === b) {
          return acc + 1;
        } else {
          return acc;
        }
      }, 0);

      return cumulativeScore;
    };

    const simpleRanking = mergeSort([...items], comparison);
    setSimpleRanking(simpleRanking);
    let [nextBattle] = neededBattles;
    setNextTwoItems(nextBattle);

    const progress = 1 - neededBattles.length / totalCount;
    setProgress(progress);
    if (simpleInProgress) return;
    setProgress(1);

    /**
     * now, we select items using a few different strategies
     */

    // 80% of the time, return items with the most common score
    if (Math.random() < 0.8) {
      const modeScore = getMode(scores);
      const itemsWithModeScore = Object.entries(scores)
        .filter(([, score]) => score === modeScore)
        .map(([item]) => item);

      if (itemsWithModeScore.length >= 2) {
        const [itemA, itemB] = shuffle(itemsWithModeScore);
        setNextTwoItems([itemA, itemB]);
      }
    }

    // return two random items OR
    // the least played item and it's closest competitor
    if (Math.random() < 0.5) {
      const [itemA, itemB] = shuffle(items);
      setNextTwoItems([itemA, itemB]);
    } else {
      // sort the items by the number of match ups they've had
      // where the least played item is first
      const sortedItems = [...items].sort(
        (a, b) => (matchUpCounts[a] ?? 0) - (matchUpCounts[b] ?? 0)
      );

      // then, get the least played item and the item with the closest score
      const [leastPlayed] = sortedItems;
      const closestScore = sortedItems
        .slice(1)
        .reduce((acc, item) =>
          Math.abs(scores[item] - scores[leastPlayed]) <
          Math.abs(scores[acc] - scores[leastPlayed])
            ? item
            : acc
        );

      setNextTwoItems([leastPlayed, closestScore]);
    }
  };

  /**
   * on the first render, get the match ups from local storage
   */
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (items.length && isFirstRender.current) {
      for (const matchUp of matchUps) {
        const [playerA, playerB] = matchUp.players;

        if (playerA === matchUp.winner) {
          updateScores(playerA, playerB);
        } else if (playerB === matchUp.winner) {
          updateScores(playerB, playerA);
        }
      }

      selectNextSongs();
      isFirstRender.current = false;
    }
  });

  /**
   * select a winner between two items
   * @param winner the song that won
   * @param loser the song that lost
   */
  const selectItem = (winner: string, loser: string) => {
    updateScores(winner, loser);

    matchUps.push({ players: [winner, loser], winner });
    if (matchUps.length > 30_000) matchUps.shift();
    localStorage.setItem("matchUps", JSON.stringify(matchUps));

    // @ts-expect-error
    window.matchUps = matchUps;

    selectNextSongs();
  };

  return { nextTwoItems, selectItem, scores: scores, simpleRanking, progress };
}

/**
 * calculate the most common number in a record of numbers
 */
function getMode(arr: Record<string, number>) {
  const numbers = Object.values(arr);
  let [mode] = numbers;
  let maxCount = 0;
  const counts: { [key: number]: number } = {};

  for (let i = 0; i < numbers.length; i++) {
    const val = numbers[i];
    counts[val] = (counts[val] || 0) + 1;
    if (counts[val] > maxCount) {
      maxCount = counts[val];
      mode = val;
    }
  }

  return mode;
}
