import { LEVELS } from "./levels.ts";
import {
  type Direction,
  isSolved,
  move,
  parsePuzzle,
  type Puzzle,
} from "./puzzle.ts";

export type Command =
  | { readonly kind: "move"; readonly direction: Direction }
  | { readonly kind: "restart" }
  | { readonly kind: "choose-level"; readonly level: number }
  | { readonly kind: "undo" };

export interface SessionState {
  readonly level: number;
  readonly puzzle: Puzzle;
  readonly past: readonly Puzzle[];
}

export function startLevel(level: number): SessionState {
  const { name, rows } = LEVELS[level];
  return {
    level,
    puzzle: parsePuzzle(name, rows),
    past: [],
  };
}

export function update(
  state: SessionState,
  command: Command,
): SessionState {
  switch (command.kind) {
    case "move": {
      if (isSolved(state.puzzle)) return state;
      const puzzle = move(state.puzzle, command.direction);

      return puzzle === state.puzzle ? state : {
        ...state,
        puzzle,
        past: [...state.past, state.puzzle],
      };
    }

    case "undo": {
      if (state.past.length === 0) return state;

      return {
        ...state,
        puzzle: state.past[state.past.length - 1],
        past: state.past.slice(0, -1),
      };
    }

    case "restart":
      return startLevel(state.level);

    case "choose-level":
      return startLevel(command.level);
  }
}

export class Session {
  #state: SessionState;
  readonly #listeners = new Set<() => void>();

  constructor(level = 0) {
    this.#state = startLevel(level);
  }

  getState = (): SessionState => this.#state;

  subscribe = (listener: () => void): () => void => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  dispatch(command: Command): void {
    const next = update(this.#state, command);
    if (next === this.#state) return;
    this.#state = next;
    for (const listener of this.#listeners) listener();
  }
}
