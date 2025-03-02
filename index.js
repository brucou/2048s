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
  return SimpleFastCounter32(generated_seed, MurmurHash3("some seed")());
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
    let [
      rand_first_cell_value,
      rand_second_cell_value,
      position_first_cell,
      position_second_cell,
    ] = [
      seeded_random_generator(),
      seeded_random_generator(),
      seeded_random_generator(),
      seeded_random_generator(),
    ];

    first_cell_value = rand_first_cell_value < 0.9 ? 2 : 4;
    second_cell_value = rand_second_cell_value < 0.9 ? 2 : 4;

    first_cell_x = Math.trunc((100 * position_first_cell) % 4);
    first_cell_y = Math.trunc(((100 * position_first_cell) % 16) / 4);

    second_cell_x = Math.trunc((100 * position_second_cell) % 4);
    second_cell_y = Math.trunc(((100 * position_second_cell) % 16) / 4);
  } while (first_cell_x === second_cell_x && first_cell_y === second_cell_y);

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

export function start_new_game(deps) {
  const { random_generator } = deps;
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

  return [
    {
      board_state,
      best_score: 0,
      current_score: 0,
    },
    ["RENDER"],
  ];
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

export function get_ui_elements() {
  const new_game_button = document.querySelector("#new-game-button");
  const cell_elements = [0, 1, 2, 3].map((i) =>
    [0, 1, 2, 3].map((j) =>
      document.querySelector(`[data-row="${i}"][data-col="${j}"]`)
    )
  );
  const best_score_el = document.querySelector("#best-score-amount");
  const current_score_el = document.querySelector("#current-score-amount");

  return { new_game_button, cell_elements, best_score_el, current_score_el };
}

export let elements;

export function render(app_state, event_payload) {
  const { emitter } = events;

  if (app_state === INIT_APP_STATE) {
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

    // Swipe right key ("k")
    document.addEventListener("keydown", (event) => {
      if (event.key === "k") {
        emitter("COLLAPSE_TO_THE_RIGHT", void 0);
      }
    });

    // Swipe right mouse down + right drag
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

        // Check if the swipe was to the right
        if (
          end_x > start_x &&
          Math.abs(end_x - start_x) > Math.abs(end_y - start_y)
        ) {
          emitter("COLLAPSE_TO_THE_RIGHT", void 0);
        }
      }
    });

    // Memoize elements
    elements = get_ui_elements();
  } else {
    // Update the UI
    const board_state = lenses.get_board_state(app_state);
    const best_score = lenses.get_best_score(app_state);
    const current_score = lenses.get_current_score(app_state);
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
  }
}

// Init key dependencies
const seed = "some seed string";
const random_generator = get_seeded_random_generator(seed);

const INIT_APP_STATE = {
  board_state: [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  best_score: 0,
  current_score: 0,
};

let app_state = INIT_APP_STATE;

export const lenses = {
  get_board_state: (app_state) => app_state.board_state,
  set_board_state: (board_state, app_state) => ({ ...app_state, board_state }),
  get_best_score: (app_state) => app_state.best_score,
  get_current_score: (app_state) => app_state.current_score,
};

// Setting a dummy variable for strict equality checking of non existing subscriptions
const empty_array = [];
export const noop = () => empty_array;

export const behavior = {
  effects: {
    RENDER: render,
  },
  global_listener: (event) => {
    // Both should be undefined if and only if the event is not in the subscriptions
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

    const [updated_state, effects] = x;

    try {
      // Update the app state
      app_state = updated_state;

      // Execute the effects
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
    INITIALIZE_APP: (_, __) => [INIT_APP_STATE, ["RENDER"]],
    START_NEW_GAME: (_, __) => start_new_game({ random_generator }),
    COLLAPSE_TO_THE_RIGHT: (_, app_state) => {
      const board_state = lenses.get_board_state(app_state);
      const new_board_state = board_state.map(collapse_to_the_right);

      return [lenses.set_board_state(new_board_state, app_state), ["RENDER"]];
    },
  },
};

// Subscribe to events
Object.keys(events.subscriptions).forEach((event_type) => {
  document.addEventListener(event_type, behavior.global_listener);
});

// Initialize the app
events.emitter("INITIALIZE_APP", { detail: void 0 });
