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
export function collapse_to_the_right(row) {
  const length = row.length;

  if (length == 1) {
    return [row[0]];
  }

  {
  if (length == 2) {
    let  [c, d] = row;
    return d === 0 ? [0, c] : c === d ? [0, 2 * c] : [c, d];
  }
}

  if (length > 2) {
    // If the row is all zeros, return a row of zeros
    if (row.reduce((acc, x) => acc + x, 0) === 0) {
      return row.map(x => 0);
    }

    let c = row.pop();
    let d = row.pop();
    let rest = row;

    if (d === 0) {
      return [0, collapse_to_the_right([...rest, c])].flat();
    }

    if (d !== 0 && c === d) {
      return [0, collapse_to_the_right(rest), 2*c].flat();
    }

    if (d !== 0 && c !== d) {
      if (c === 0) {
        return[0, collapse_to_the_right([...rest, d])].flat
      }
      else {
        return [collapse_to_the_right([...rest, c]), d].flat
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

  const el_first_cell = document.querySelector(
    `[data-row="${first_cell_x}"][data-col="${first_cell_y}"]`
  );
  const el_second_cell = document.querySelector(
    `[data-row="${second_cell_x}"][data-col="${second_cell_y}"]`
  );

  reset_board();
  el_first_cell.textContent = first_cell_value;
  el_second_cell.textContent = second_cell_value;
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

  return { new_game_button };
}

export function render() {
  // Init key dependencies
  const seed = "some seed string";
  const random_generator = get_seeded_random_generator(seed);

  //Set markup
  document.querySelector("#app")?.remove();
  document.body.append(
    document.querySelector("#app-template").content.cloneNode(true)
  );

  // Set event listeners
  const new_game_button = document.querySelector("#new-game-button");
  new_game_button?.addEventListener("click", (_) =>
    start_new_game({ random_generator })
  );
}

render();
