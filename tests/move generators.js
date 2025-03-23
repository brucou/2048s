import { empty_object, are_boards_deep_equal } from "./_utils.js";
function pick_random_move(probabilities, alea) {
  let cumulativeProbability = 0;

  // Convert probabilities object to array of [move, probability] pairs
  const moves = Object.entries(probabilities);

  // Find the move based on the random number and cumulative probabilities
  for (const [move, probability] of moves) {
    cumulativeProbability += probability;
    if (alea <= cumulativeProbability) {
      return {
        type: move === "START_NEW_GAME" ? "START_NEW_GAME" : "COLLAPSE",
        detail: move === "START_NEW_GAME" ? void 0 : move
      };
    }
  }

  // Fallback in case probabilities don't sum to 1
  return { type: "COLLAPSE", detail: "RIGHT" };
}

export function random_game_strategy(probabilities) {
  if (!probabilities) {
    probabilities = {
      "START_NEW_GAME": 0.05,
      "LEFT": 0.25,
      "RIGHT": 0.25,
      "TOP": 0.2,
      "DOWN": 0.25
    };
  }
  // Pick a random number of moves
  const size = Math.floor(Math.random() * 100) + 1;
  let control_state = "PLAY";
  let extended_state = { moves_played: 0 };

  return function get_next_move() {
    const alea = Math.random();

    if (control_state === "PLAY"){
      if (extended_state.moves_played === size) {
        control_state = "DONE";
        return { type: "EOF", detail: extended_state }
      }
      else {
        extended_state.moves_played++;
        return pick_random_move(probabilities, alea);
      }
    }
    if (control_state === "DONE") {
      return { type: "EOF", detail: extended_state }
    }
  }
}

export function swing_and_switch_game_strategy() {
  let control_state = "START_NEW_GAME";
  let extended_state = empty_object;

  return function get_next_move({ board_state, _ }) {
    if (control_state === "START_NEW_GAME") {
      control_state = "LEFT";
      extended_state.board_state_LR = board_state;
      extended_state.board_state_UD = board_state;

      return { type: "START_NEW_GAME", detail: void 0 }
    }
    if (control_state === "LEFT") {
      if (are_boards_deep_equal(board_state, extended_state.board_state_LR)) {
        control_state = "UP";
        extended_state.board_state_UD = extended_state.board_state_LR;

        return { type: "COLLAPSE", detail: "TOP" }
      }
      else {
        control_state = "RIGHT";
        extended_state.board_state_LR = board_state;

        return { type: "COLLAPSE", detail: "RIGHT" }
      }
    }
    if (control_state === "RIGHT") {
      control_state = "LEFT";

      return { type: "COLLAPSE", detail: "LEFT" }
    }
    if (control_state === "UP") {
      control_state = "DOWN";

      return { type: "COLLAPSE", detail: "DOWN" }
    }
    if (control_state === "DOWN") {
      if (!are_boards_deep_equal(board_state, extended_state.board_state_UD)) {
        control_state = "UP";
        extended_state.board_state_UD = board_state;

        return { type: "COLLAPSE", detail: "TOP" }
      }
      else if (!are_boards_deep_equal(extended_state.board_state_UD, extended_state.board_state_LR)) {
        control_state = "LEFT";
        extended_state.board_state_LR = extended_state.board_state_UD;

        return { type: "COLLAPSE", detail: "LEFT" }
      }
      else {
        // board_state, board_state_UD and board_state-LR are equal
        // so that means there are no moves that move the board
        control_state = "DONE";

        return { type: "EOF", detail: extended_state }
      }
    }
    if (control_state === "DONE") {
      return { type: "EOF", detail: extended_state }
    }
  }
}
