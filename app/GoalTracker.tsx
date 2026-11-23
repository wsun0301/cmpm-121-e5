import { hasCrate, type Puzzle } from "../core/mod.ts";

export function GoalTracker({ puzzle }: { puzzle: Puzzle }) {
  const filled =
    puzzle.layout.goals.filter((goal) => hasCrate(puzzle, goal)).length;

  return <p>Goals filled: {filled} of {puzzle.layout.goals.length}</p>;
}
