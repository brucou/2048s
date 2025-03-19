import { empty_object, are_boards_deep_equal } from "./_utils.js";

export   function swing_and_switch_game_strategy() {
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
