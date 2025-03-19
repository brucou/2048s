import { GAME_IN_PROGRESS, GAME_NOT_STARTED, GAME_OVER } from "../constants.js";

/**
 * Adapted from code generated by AI
 * Cf. [prompt](./ai prompt and answer - how to test uniform distribution)
 * Chi-Square critical values for different significance levels
    const chiSquareCriticalValues = {
        0.1: 14.684,
        0.05: 16.919,
        0.01: 21.666,
        0.001: 27.877
    };
 * @param {} f 
 * @param {*} p 
 * @returns 
 */
export function check_generator(
  sampleSize,
  observedFrequencies,
  chiSquareCriticalValue
) {
  // Create a histogram of the generated numbers
  const numBins = 4;
  // const observedFrequencies = new Array(numBins).fill(0);
  // randomNumbers.forEach(num => {
  //     const binIndex = Math.floor(num * numBins);
  //     observedFrequencies[binIndex]++;
  // });

  // Calculate expected frequencies for a uniform distribution
  const expectedFrequencies = new Array(numBins).fill(sampleSize / numBins);

  // Calculate Chi-Square Statistic
  let chiSquareStat = 0;
  for (let i = 0; i < numBins; i++) {
    chiSquareStat +=
      Math.pow(observedFrequencies[i] - expectedFrequencies[i], 2) /
      expectedFrequencies[i];
  }

  // Calculate degrees of freedom
  const degreesOfFreedom = numBins - 1;
  // Determine if the Chi-Square statistic exceeds the critical value for the given p-value
  return chiSquareStat < chiSquareCriticalValue ? 1 : 0;
}

export function are_array_deep_equal(arr1, arr2) {
  return arr1.join(",") === arr2.join(",");
}

export function transpose(array_of_arrays) {
  return array_of_arrays.map((row, i) =>
    row.map((_, j) => array_of_arrays[j][i])
  );
}

/**
 * Returns the current state of the board. 0 represents an empty cell.
 * Any non-zero number represents the value of the cell.
 * @returns {Array<Array<number>>} 4x4 matrix representing the current state of the board
 */
export function get_board_state() {
  return [0, 1, 2, 3].map((i) =>
    Array.from(document.querySelectorAll(`[data-row="${i}"]`)).map(
      (x) => x.textContent | 0
    )
  );
}

export function get_best_score() {
  return document.querySelector("#best-score-amount").textContent | 0;
}

export function get_current_score() {
  return document.querySelector("#current-score-amount").textContent | 0;
}

export function get_game_status() {
  // Check if game over overlay is visible
  const overlay = document.querySelector("#game-over-overlay");
  if (overlay && !overlay.classList.contains("hidden")) {
    return GAME_OVER;
  }
  const board_state = get_board_state();
  return (
    board_state.every((row) => row.every((cell) => cell === 0))) ? GAME_NOT_STARTED : GAME_IN_PROGRESS;
}

export function get_uuid() {
  let d = '';
  while (d.length < 32) d += Math.random().toString(16).substring(2);
  const vr = ((parseInt(d.substring(16, 17), 16) & 0x3) | 0x8).toString(16);
  return `${d.substring(0, 8)}-${d.substring(8, 12)}-4${d.substring(13, 16)}-${vr}${d.substring(17, 20)}-${d.substring(20, 32)}`;
};

export function get_app_state_from_UI() {
  return {
    board_state: get_board_state(),
    current_score: get_current_score(),
    best_score: get_best_score(),
    game_status: get_game_status(),
  }
}

export function is_deep_equal_app_state(actual_app_state, expected_app_state) {
  // As of now, all properties of app state are JSON-serializable so let's do it the lazy way
  return JSON.stringify(actual_app_state) === JSON.stringify(expected_app_state);
}

export function get_board_diff(board1, board2) {
  return board1.reduce((acc, row, i) =>
    row.reduce((acc, cell, j) => cell === board2[i][j] ? acc : acc.concat({ value: board2[i][j], x: j, y: i }), acc), []);
}

/**
 *
 * @param {Array<Array<Number>>} board1
 * @param {Array<Array<Number>>} board2
 * @returns true if the boards are deep equal, false otherwise
 */
export function are_boards_deep_equal(board1, board2) {
  return JSON.stringify(board1) === JSON.stringify(board2);
}

export function is_new_game_app_state(app_state) {
  const { best_score: new_best_score, board_state: new_board_state, current_score: new_current_score, game_status: new_game_status } = app_state;

  const are_exactly_two_cells_on_the_board = new_board_state.reduce((acc, row) => row.reduce((acc, cell) => cell ? acc + 1 : acc, acc), 0) === 2;
  const are_cells_2_or_4 = new_board_state.every(row => row.every(cell => cell ? cell === 2 || cell === 4 : true));
  const is_current_score_0 = new_current_score === 0;
  const is_game_status_in_progress = new_game_status === GAME_IN_PROGRESS;

  return {
    is_new_game_app_state: are_exactly_two_cells_on_the_board && are_cells_2_or_4 && is_current_score_0 && is_game_status_in_progress,
    debug: { are_exactly_two_cells_on_the_board, are_cells_2_or_4, is_current_score_0, is_game_status_in_progress }
  }
}

export function get_first_two_cells(board_state) {
  return board_state.reduce((acc, row, i) => row.reduce((acc, cell, j) => cell ? acc.concat({ value: cell, y: i, x: j }) : acc, acc), []);
}

export function take_snapshot_before_after(next_move, emitter) {
  const { type, detail } = next_move;

  const app_state = get_app_state_from_UI();
  emitter(type, detail);
  const new_app_state = get_app_state_from_UI();

  return [app_state, new_app_state]
}


export function update_coverage_after_start_new_game(coverage, transition, app_state, new_app_state) {
  const { best_score, board_state, current_score, game_status } = app_state;
  const { best_score: new_best_score, board_state: new_board_state, current_score: new_current_score, game_status: new_game_status } = new_app_state;
  const [first_cell, second_cell] = get_first_two_cells(new_board_state);

  coverage.first_cell = first_cell;
  coverage.second_cell = second_cell;
  coverage.added_cells_history.push([first_cell, second_cell]);
  coverage.app_state_history.push(new_app_state);

  return coverage
}

export function update_coverage_after_no_change(coverage, transition, app_state, control_state) {
  coverage.added_cells_history.push(void 0);
  coverage.app_state_history.push(app_state);

  return coverage
}

export function update_coverage_after_collapse_move(coverage, transition, new_cell, app_state, new_app_state) {
  const  { value, x, y } = new_cell;

  coverage.added_cells_history.push({ value, x, y });
  coverage.app_state_history.push(new_app_state);

  return coverage
}

export function get_added_cell_after_play(new_board_state_without_added_cell, new_board_state) {

  return get_board_diff(new_board_state_without_added_cell, new_board_state);
}

export function is_expected_cell_value(new_cells) {
  const [{ value, x, y }] = new_cells || [{}];
  // Check that the added cell is 2 or 4
  const is_expected_cell_value = value === 2 || value === 4;

  return is_expected_cell_value
}

export function is_2048(board_state) {
  return board_state.some(row => row.some(cell => cell === 2048))
}

export function print_move(move, control_state){
  const {type, detail} = move;
  let control_state_char = control_state === "GAME_OVER" ? "▒" : control_state === "GAME_IN_PROGRESS"? " " : control_state === "TEST_PASSED" ? "🏅":"▪";
  let move_char = "";
  if (type === "COLLAPSE") {
    if (detail === "RIGHT"){move_char = "→"}
    if (detail === "LEFT"){move_char = "←"}
    if (detail === "TOP"){move_char = "↑"}
    if (detail === "DOWN"){move_char = "↓"}
  }
  if (type === "START_NEW_GAME") move_char = "🎲"
  if (type === "EOF") move_char = "!"

  return move_char + control_state_char
}

export function print_board_state (board_state) {
  return board_state.map(row => row.concat("|")).join("/n");
}

export const empty_object = {};
