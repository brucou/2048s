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
  const [
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

  const first_cell_value = rand_first_cell_value < 0.9 ? 2 : 4;
  const second_cell_value = rand_second_cell_value < 0.9 ? 2 : 4;

  const first_cell_x = Math.trunc((100 * position_first_cell) % 4);
  const first_cell_y = Math.trunc(((100 * position_first_cell) % 16) / 4);

  const second_cell_x = Math.trunc((100 * position_second_cell) % 4);
  const second_cell_y = Math.trunc(((100 * position_second_cell) % 16) / 4);

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

export function start_new_game() {
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
  console.log(first_cell_x, first_cell_y, first_cell_value);
  console.log(second_cell_x, second_cell_y, second_cell_value);
}

// Main
const seed = "some seed string";
const random_generator = get_seeded_random_generator(seed);

const new_game_button = document.querySelector("#new-game-button");
new_game_button?.addEventListener("click", start_new_game);

