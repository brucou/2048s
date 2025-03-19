import { GAME_IN_PROGRESS, GAME_NOT_STARTED, GAME_OVER } from "./constants.js";

/**
 * Random generator
 * Returns a function which generates a number between 0 and 1.
 * The function is deterministic and will return the same sequence of numbers for the same
 * Cf. https://www.delftstack.com/howto/javascript/javascript-random-seed-to-generate-random/
 * @param {String} seed
 */
export function get_seeded_random_generator(seed) {
  //
  // The built-in show() helper function can be used to display values in the preview window on the right
  // to execute, click the run button or hit ctrl + enter
  function MurmurHash3(string) {
    let i,
      hash = 0;
    for (i, hash = 1779033703 ^ string.length; i < string.length; i++) {
      let bitwise_xor_from_character = hash ^ string.charCodeAt(i);
      hash = Math.imul(bitwise_xor_from_character, 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }
    return () => {
      // Return the hash that you can use as a seed
      hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
      hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
      return (hash ^= hash >>> 16) >>> 0;
    };
  }

  function SimpleFastCounter32(seed_1, seed_2, seed_3, seed_4) {
    return () => {
      seed_1 >>>= 0;
      seed_2 >>>= 0;
      seed_3 >>>= 0;
      seed_4 >>>= 0;
      let cast32 = (seed_1 + seed_2) | 0;
      seed_1 = seed_2 ^ (seed_2 >>> 9);
      seed_2 = (seed_3 + (seed_3 << 3)) | 0;
      seed_3 = (seed_3 << 21) | (seed_3 >>> 11);
      seed_4 = (seed_4 + 1) | 0;
      cast32 = (cast32 + seed_4) | 0;
      seed_3 = (seed_3 + cast32) | 0;
      return (cast32 >>> 0) / 4294967296;
    };
  }

  let generated_seed = MurmurHash3("some seed")();
  return SimpleFastCounter32(generated_seed, MurmurHash3(seed)());
}

export function transpose(array_of_arrays) {
  return array_of_arrays.map((row, i) =>
    row.map((_, j) => array_of_arrays[j][i])
  );
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

export function compose_lenses_setters(arr_lenses) {
  return (state) =>
    arr_lenses.reduce((acc, [lens_setter, value]) => {
      return lens_setter(value, acc);
    }, state);
}

export function get_random_cell_value(random_generator, threshold) {
  return random_generator() < threshold ? 2 : 4;
}

export function get_empty_cells(board_state) {
  return board_state.reduce((acc, row, i) => {
    row.forEach((cell, j) => {
      if (cell === 0) {
        acc.push([i, j]);
      }
    });
    return acc;
  }, []);
}

/**
 * Generates two numbers and positions for the two starting cells for the 2048 game.
 * Probabilities of number appearance are dictated by the random generator.
 * E.g., in the standarg game, 4 has probability 0.1 and 2 has probability 0.9.
 * 
 * @param {*} seeded_random_generator 
 * @returns [
    [first_cell_x, first_cell_y, first_cell_value],
    [second_cell_x, second_cell_y, second_cell_value],
  ]
 */
export function get_starting_cells(seeded_random_generator) {
  let first_cell_x, first_cell_y, first_cell_value;
  let second_cell_x, second_cell_y, second_cell_value;

  do {
    let [position_first_cell, position_second_cell] = [
      seeded_random_generator(),
      seeded_random_generator(),
    ];

    get_random_cell_value(seeded_random_generator, 0.9),
      (first_cell_x = Math.trunc((UPPER_BOUND * position_first_cell) % 4));
    first_cell_y = Math.trunc(((UPPER_BOUND * position_first_cell) % 16) / 4);

    second_cell_x = Math.trunc((UPPER_BOUND * position_second_cell) % 4);
    second_cell_y = Math.trunc(((UPPER_BOUND * position_second_cell) % 16) / 4);
  } while (first_cell_x === second_cell_x && first_cell_y === second_cell_y);

  first_cell_value = get_random_cell_value(seeded_random_generator, 0.9);
  second_cell_value = get_random_cell_value(seeded_random_generator, 0.9);

  return [
    [first_cell_x, first_cell_y, first_cell_value],
    [second_cell_x, second_cell_y, second_cell_value],
  ];
}

export function reset_board() {
  const cells = document.querySelectorAll(".board-cell");
  cells.forEach((cell) => {
    cell.textContent = "";
  });
}

/**
 * Takes a row to be collapsed to the right and returns the row collapsed to the right.
 * For details of the specifications, see the 2048 game rules.
 * You can also look at the README.md file for a detailed explanation.
 * The row must contain at least one element.
 * All elements are positive integers (>= 0).
 * @param {Array<Number>} row
 */
export function collapse_to_the_right(_row) {
  // We will modify row in place so make a copy of _row to keep it stale
  const row = [..._row];
  const length = row.length;

  if (length == 1) {
    return [row[0]];
  }

  {
    if (length == 2) {
      let [c, d] = row;
      return d === 0 ? [0, c] : c === d ? [0, 2 * c] : [c, d];
    }
  }

  if (length > 2) {
    // If the row is all zeros, return a row of zeros
    if (row.reduce((acc, x) => acc + x, 0) === 0) {
      return row.map((x) => 0);
    }

    let d = row.pop();
    let c = row.pop();
    let rest = row;

    if (d === 0) {
      return [0, collapse_to_the_right([...rest, c])].flat();
    }

    if (d !== 0 && c === d) {
      return [0, collapse_to_the_right(rest), 2 * c].flat();
    }

    if (d !== 0 && c !== d) {
      if (c === 0) {
        return [0, collapse_to_the_right([...rest, d])].flat();
      } else {
        return [collapse_to_the_right([...rest, c]), d].flat();
      }
    }
  }
}

export function collapse_to_the_left(_row) {
  // Don't do destructive updates!
  return collapse_to_the_right([].concat(_row).reverse()).reverse();
}

/**
 * (generated by Claude 3.5 AI)
 * Computes the score gained from collapsing a row to the right.
 * @param {Array<Number>} row Array of numbers, each either 0 or a power of 2
 * @returns {Number} The score gained from collapsing the row
 */
export function compute_score_after_collapse(_row) {
  const row = [..._row];
  const length = row.length;

  if (length <= 1) {
    return 0;
  }

  if (length === 2) {
    let [c, d] = row;
    return c === d && c !== 0 ? 2 * c : 0;
  }

  if (length > 2) {
    if (row.reduce((acc, x) => acc + x, 0) === 0) {
      return 0;
    }

    let d = row.pop();
    let c = row.pop();
    let rest = row;

    if (d === 0) {
      return compute_score_after_collapse([...rest, c]);
    }

    if (d !== 0 && c === d) {
      return 2 * c + compute_score_after_collapse(rest);
    }

    if (d !== 0 && c !== d) {
      if (c === 0) {
        return compute_score_after_collapse([...rest, d]);
      } else {
        return compute_score_after_collapse([...rest, c]);
      }
    }
  }

  return 0;
}

export function play(board_state, detail, { collapse_to_the_right, transpose }) {
  switch (detail) {
    case "RIGHT": return board_state.map(collapse_to_the_right);
    case "LEFT": return board_state.map(collapse_to_the_left);
    case "DOWN": return transpose(transpose(board_state).map(collapse_to_the_right));
    case "TOP": return transpose(transpose(board_state).map(collapse_to_the_left));
  }

  throw `Invalid play direction ${detail}`
}

export function start_new_game(app_state) {
  const { random_generator } = lenses.get_generators(app_state);
  const [
    [first_cell_x, first_cell_y, first_cell_value],
    [second_cell_x, second_cell_y, second_cell_value],
  ] = get_starting_cells(random_generator);

  // Copy the initial state (no destructive update!)
  const board_state = lenses
    .get_board_state(INIT_APP_STATE)
    .map((row, i) => [].concat(row));

  board_state[first_cell_x][first_cell_y] = first_cell_value;
  board_state[second_cell_x][second_cell_y] = second_cell_value;

  const new_app_state = compose_lenses_setters([
    [lenses.set_generators, lenses.get_generators(app_state)],
    [lenses.set_board_state, board_state],
    [lenses.set_best_score, 0],
    [lenses.set_current_score, 0],
    [lenses.set_game_status, GAME_IN_PROGRESS],
  ])(INIT_APP_STATE);

  return [new_app_state, ["RENDER"]];
}

export function get_ui_elements() {
  const new_game_button = document.querySelector("#new-game-button");
  const cell_elements = [0, 1, 2, 3].map((i) =>
    [0, 1, 2, 3].map((j) =>
      document.querySelector(`[data-row="${i}"][data-col="${j}"]`)
    )
  );
  const best_score_el = document.querySelector("#best-score-amount");
  const current_score_el = document.querySelector("#current-score-amount");

  const game_over_el = document.querySelector("#game-over-overlay");

  return { new_game_button, cell_elements, best_score_el, current_score_el, game_over_el };
}

export let elements;

export function render(app_state, event_payload) {
  const { emitter } = events;
  const { init } = event_payload || {};

  if (init) {
    // That's the first render of tha app
    // Initialize from the template

    //Set markup
    document.querySelector("#app")?.remove();
    document.body.append(
      document.querySelector("#app-template").content.cloneNode(true)
    );

    // Set event listeners
    // New game button
    const new_game_button = document.querySelector("#new-game-button");
    new_game_button?.addEventListener("click", (_) =>
      emitter("START_NEW_GAME", { detail: void 0 })
    );

    // Swipe keys
    document.addEventListener("keydown", (event) => {
      if (event.key === "k") {
        emitter("COLLAPSE", "RIGHT");
      }
      if (event.key === "h") {
        emitter("COLLAPSE", "LEFT");
      }
      if (event.key === "n") {
        emitter("COLLAPSE", "DOWN");
      }
      if (event.key === "u") {
        emitter("COLLAPSE", "TOP");
      }
    });

    // Swipe right mouse down + right drag
    {
      let is_swiping_right = false; // Flag to check if the user is swiping
      let start_x = 0; // Initial x position of the swipe
      let start_y = 0; // Initial y position of the swipe
      let end_x = 0; // Final x position of the swipe
      let end_y = 0; // Final y position of the swipe
      document.addEventListener("mousedown", (event) => {
        is_swiping_right = true;
        start_x = event.clientX;
        start_y = event.clientY;
      });
      document.addEventListener("mouseup", (event) => {
        if (is_swiping_right) {
          is_swiping_right = false;
          end_x = event.clientX;
          end_y = event.clientY;

          // Check if the swipe was to the right
          if (
            end_x > start_x &&
            Math.abs(end_x - start_x) > Math.abs(end_y - start_y)
          ) {
            emitter("COLLAPSE", "RIGHT");
          }
        }
      });
    }

    // Swipe left mouse down + left drag
    {
      let is_swiping_left = false; // Flag to check if the user is swiping
      let start_x = 0; // Initial x position of the swipe
      let start_y = 0; // Initial y position of the swipe
      let end_x = 0; // Final x position of the swipe
      let end_y = 0; // Final y position of the swipe
      document.addEventListener("mousedown", (event) => {
        is_swiping_left = true;
        start_x = event.clientX;
        start_y = event.clientY;
      });
      document.addEventListener("mouseup", (event) => {
        if (is_swiping_left) {
          is_swiping_left = false;
          end_x = event.clientX;
          end_y = event.clientY;

          // Check if the swipe was downward
          if (
            end_x < start_x &&
            Math.abs(end_x - start_x) > Math.abs(end_y - start_y)
          ) {
            emitter("COLLAPSE", "LEFT");
          }
        }
      });
    }

    // Swipe down mouse down + down drag
    {
      let is_swiping = false; // Flag to check if the user is swiping
      let start_x = 0; // Initial x position of the swipe
      let start_y = 0; // Initial y position of the swipe
      let end_x = 0; // Final x position of the swipe
      let end_y = 0; // Final y position of the swipe
      document.addEventListener("mousedown", (event) => {
        is_swiping = true;
        start_x = event.clientX;
        start_y = event.clientY;
      });
      document.addEventListener("mouseup", (event) => {
        if (is_swiping) {
          is_swiping = false;
          end_x = event.clientX;
          end_y = event.clientY;

          // Check if the swipe was downward
          if (
            end_y > start_y &&
            Math.abs(end_y - start_y) > Math.abs(end_x - start_x)
          ) {
            emitter("COLLAPSE", "DOWN");
          }
        }
      });
    }

    // Swipe left mouse down + up drag
    {
      let is_swiping = false; // Flag to check if the user is swiping
      let start_x = 0; // Initial x position of the swipe
      let start_y = 0; // Initial y position of the swipe
      let end_x = 0; // Final x position of the swipe
      let end_y = 0; // Final y position of the swipe
      document.addEventListener("mousedown", (event) => {
        is_swiping = true;
        start_x = event.clientX;
        start_y = event.clientY;
      });
      document.addEventListener("mouseup", (event) => {
        if (is_swiping) {
          is_swiping = false;
          end_x = event.clientX;
          end_y = event.clientY;

          // Check if the swipe was to the top
          if (
            end_y < start_y &&
            Math.abs(end_y - start_y) > Math.abs(end_x - start_x)
          ) {
            emitter("COLLAPSE", "TOP");
          }
        }
      });
    }

    // Memoize elements
    elements = get_ui_elements();
  } else {
    // Update the UI
    const board_state = lenses.get_board_state(app_state);
    const best_score = lenses.get_best_score(app_state);
    const current_score = lenses.get_current_score(app_state);
    const game_status = lenses.get_game_status(app_state);
    const { cell_elements, best_score_el, current_score_el } = elements;

    // Update the board
    board_state.forEach((row, i) => {
      row.forEach((value, j) => {
        cell_elements[i][j].textContent = value ? String(value) : "";
      });
    });

    // Update the scores
    best_score_el.textContent = best_score;
    current_score_el.textContent = current_score;

    // Update game status
    if (game_status !== GAME_OVER) {
      elements.game_over_el.classList.add("hidden");
    } else {
      elements.game_over_el.classList.remove("hidden");
    }
  }
}

// Init key dependencies
const first_cells_seed = "some seed string";
const new_cell_seed = "another seed string";


// With such a high upper bound for random numbers, we can get 30x30 boards
// and still cover the entire board
const UPPER_BOUND = 1000;

const INIT_APP_STATE = {
  board_state: [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  best_score: 0,
  current_score: 0,
  game_status: GAME_NOT_STARTED,
};

let app_state = INIT_APP_STATE;

export const lenses = {
  set_generators: ({ random_generator, random_cell_generator }, app_state) => ({ ...app_state, random_generator, random_cell_generator }),
  get_generators: (app_state) => ({ random_generator: app_state.random_generator, random_cell_generator: app_state.random_cell_generator }),
  get_board_state: (app_state) => app_state.board_state,
  set_board_state: (board_state, app_state) => ({ ...app_state, board_state }),
  get_best_score: (app_state) => app_state.best_score,
  set_best_score: (best_score, app_state) => ({ ...app_state, best_score }),
  get_current_score: (app_state) => app_state.current_score,
  set_current_score: (current_score, app_state) => ({
    ...app_state,
    current_score,
  }),
  get_game_status: (app_state) => app_state.game_status,
  set_game_status: (game_status, app_state) => ({ ...app_state, game_status }),
};

// Setting a dummy variable for strict equality checking of non-existing subscriptions
const empty_array = [];
export const noop = () => empty_array;

/**
 * The behavior object contains the effects that can be triggered by the events.
 * It also contains a `global_listener` that listens to all configured events,
 * triggers the matching event handler (if any). It then takes the updated
 * application state and effects to execute computed by the event handler and
 * thus updates the application state and executes the effects.
 */
export const behavior = {
  /** @typedef Object<String, (app_state, event_payload) => void */
  effects: {
    RENDER: render,
    FIRST_RENDER: (x, y) => render(x, { ...y, init: true }),
  },
  global_listener: (event) => {
    // DOC: this means that subscriptions are not allowed to return undefined as updated state
    // DOC: also the updated_state should be a new object (i.e., not the same reference as the old state)
    const x = (events.subscriptions[event.type] || noop)(
      event.detail,
      app_state
    );

    if (x === empty_array) {
      console.warn(`The event ${event.type} has no subscription configured!`);
      return;
    }

    // Both should be undefined if and only if the event is not in the subscriptions
    const [updated_state, effects] = x;

    try {
      // Update the app state
      app_state = updated_state;

      console.info(`event`, event.type, event.detail);
      console.info(`state`, lenses.get_board_state(updated_state));

      // Execute the effects
      effects &&
        effects.forEach((effect) =>
          behavior.effects[effect](app_state, event.detail)
        );
    } catch (e) {
      console.error(
        `Either the effect handlers for ${effects} failed, or one of such handlers is missing!`
      );
      console.error(e);
    }
  },
};

export const events = {
  emitter: function (event_type, event_payload) {
    const event = new CustomEvent(event_type, { detail: event_payload });
    document.dispatchEvent(event);
  },
  // Subscriptions returns the new state and the effects to be executed
  subscriptions: {
    INITIALIZE_APP: ({ first_cells_seed, new_cell_seed }, __) => {
      const random_generator = get_seeded_random_generator(first_cells_seed);
      const random_cell_generator = get_seeded_random_generator(new_cell_seed);

      const new_app_state = compose_lenses_setters([
        [lenses.set_generators, { random_generator, random_cell_generator }],
      ])(INIT_APP_STATE);

      return [new_app_state, ["FIRST_RENDER"]]
    },
    START_NEW_GAME: (_, app_state) => start_new_game(app_state),
    COLLAPSE: (move_direction, app_state) => {
      const { random_cell_generator } = lenses.get_generators(app_state);
      const moves = {
        RIGHT: [(board_state) => board_state.map(collapse_to_the_right)],
        LEFT: [(board_state) => board_state.map(collapse_to_the_left)],
        DOWN: [
          (board_state) =>
            transpose(board_state)
              .map(collapse_to_the_right)
              .map((row, i, arr) => row.map((_, j) => arr[j][i])),
        ],
        TOP: [
          (board_state) =>
            transpose(board_state)
              .map(collapse_to_the_left)
              .map((row, i, arr) => row.map((_, j) => arr[j][i])),
        ],
      };
      let scores = {
        RIGHT: (board_state) =>
          board_state.reduce(
            (acc, row) => acc + compute_score_after_collapse(row),
            0
          ),
        DOWN: (board_state) => scores.RIGHT(transpose(board_state)),
      };
      scores["LEFT"] = scores.RIGHT;
      scores["TOP"] = scores.DOWN;

      const [update_board] = moves[move_direction];

      // If the game is ove or is yet to start, don't do nothing
      const game_status = lenses.get_game_status(app_state);
      if (game_status === GAME_NOT_STARTED || game_status === GAME_OVER) return [app_state, void 0];

      // If the game is in progress
      // then swipe the board in the given direction and compute the new scores
      const board_state = lenses.get_board_state(app_state);
      const collapsed_board_state = update_board(board_state);
      const score_points = scores[move_direction](board_state);

      const new_score = lenses.get_current_score(app_state) + score_points;
      const new_best_score = Math.max(
        lenses.get_best_score(app_state),
        new_score
      );
      const is_2048 = collapsed_board_state.some(row => row.some(cell => cell === 2048));

      // If we reached the goal, end the game
      if (is_2048) {
        const new_app_state = compose_lenses_setters([
          [lenses.set_board_state, collapsed_board_state],
          [lenses.set_game_status, GAME_OVER],
          [lenses.set_current_score, new_score],
          [lenses.set_best_score, new_best_score],
        ])(app_state);

        return [new_app_state, ["RENDER"]];
      }

      // If the swipe move does not change the board in any way,
      // don't do anything.
      if (are_boards_deep_equal(board_state, collapsed_board_state)) {
        return [app_state, void 0];
      }

      // If it did change the board, then it means there was an empty cell
      // that numbers slided into. Add a new number in one of those cells.
      const empty_cells = get_empty_cells(collapsed_board_state);
      const index =
        Math.trunc(random_cell_generator() * UPPER_BOUND) % empty_cells.length;
      const new_cell_coordinate = empty_cells[index];

      const board_state_with_new_cell = collapsed_board_state.map((row, i) => {
        return row.map((cell, j) => {
          if (i === new_cell_coordinate[0] && j === new_cell_coordinate[1]) {
            return get_random_cell_value(random_cell_generator, 0.9);
          }
          return cell;
        });
      });

      // Is there any move possible that frees a cell for a new number?
      const is_move_possible = ["TOP", "DOWN", "RIGHT", "LEFT"].some(
        (move_direction) =>
          get_empty_cells(moves[move_direction][0](board_state_with_new_cell))
            .length !== 0
      );
      // If there are possible moves still, the game goes on
      if (is_move_possible) {
        const new_app_state = compose_lenses_setters([
          [lenses.set_board_state, board_state_with_new_cell],
          [lenses.set_game_status, GAME_IN_PROGRESS],
          [lenses.set_current_score, new_score],
          [lenses.set_best_score, new_best_score],
        ])(app_state);

        return [new_app_state, ["RENDER"]];
      } else {
        // If not, the game is over!
        const new_app_state = compose_lenses_setters([
          [lenses.set_board_state, board_state_with_new_cell],
          [lenses.set_game_status, GAME_OVER],
          [lenses.set_current_score, new_score],
          [lenses.set_best_score, new_best_score],
        ])(app_state);

        return [new_app_state, ["RENDER"]];
      }
    },
  },
};

// Subscribe to events
Object.keys(events.subscriptions).forEach((event_type) => {
  document.addEventListener(event_type, behavior.global_listener);
});

// Initialize the app
console.info(`game with seeds `, first_cells_seed, new_cell_seed);
events.emitter("INITIALIZE_APP", { first_cells_seed, new_cell_seed });
