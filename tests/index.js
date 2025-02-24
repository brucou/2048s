import { get_seeded_random_generator, get_starting_cells, get_board_state, get_current_score, get_best_score, get_ui_elements, render } from "../index.js";
import { check_generator } from "../tests/_utils.js";

QUnit.testStart(({name, module, testId, previousFailure }) => {
  if (module.trim().startsWith("(UI)")) {
    console.debug(`Running test ${testId} '${name}'`);
    render();
  }
});

QUnit.module("(UI) Game start", function (hooks) {
  QUnit.test(
    "User navigates to the game page and sees the initial screen",
    function (assert) {
      const board_state = get_board_state();
      const current_score = get_current_score();
      const best_score = get_best_score();
      const { new_game_button } = get_ui_elements();

      assert.deepEqual(
        board_state,
        [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        "Board is empty"
      );
      assert.deepEqual(current_score, 0, "Current score is 0");
      assert.deepEqual(best_score, 0, "Best score is 0");
      assert.ok(new_game_button, "There is a new game button");
    }
  );

  QUnit.test(
    "User clicks on the new game button and the game starts, with two distint cells on the board, and a zero score",
    function (assert) {
        const { new_game_button } = get_ui_elements();
        new_game_button.click();

        const board_state = get_board_state();
        const current_score = get_current_score();

        const count_valid_cells = board_state.reduce((acc, row) => { 
            const row_count = row.reduce((acc, number) => [2, 4].includes(number) ? acc + 1 : acc, 0);
            return acc + row_count;
        }, 0);

        const count_invalid_cells = board_state.reduce((acc, row) => { 
          const row_count = row.reduce((acc, number) => [0, 2, 4].includes(number) ? acc: acc + 1 , 0);
          return acc + row_count;
      }, 0);

        assert.deepEqual(current_score, 0, "Current score is 0");
        assert.deepEqual(count_valid_cells, 2, "There are two cells on the board with the expected values");
        assert.deepEqual(count_invalid_cells, 0, "There are only two non-empty cells on the board");
    }
  );
});

QUnit.module("Random number generation", function (hooks) {
  QUnit.test(
    "Random generator generate same numbers for same seed",
    function (assert) {
      const random_generator_1 = get_seeded_random_generator("some");
      const generated_numbers_1 = new Array(100)
        .fill(0)
        .map((_) => random_generator_1());

      const random_generator_2 = get_seeded_random_generator("some");
      const generated_numbers_2 = new Array(100)
        .fill(0)
        .map((_) => random_generator_2());

      assert.deepEqual(
        generated_numbers_1,
        generated_numbers_2,
        "100 generated numbers are all equal"
      );
    }
  );

  QUnit.test(
    "When starting the game, the first two cells are distint and generated with the right probabilities",
    function (assert) {
      const test_size = 1000;
      const random_generator_1 = get_seeded_random_generator("some");
      const random_generated_starting_cells = new Array(test_size)
        .fill(0)
        .map((_) => {
          const [
            [first_cell_x, first_cell_y, first_cell_value],
            [second_cell_x, second_cell_y, second_cell_value],
          ] = get_starting_cells(random_generator_1);

          return {
            first_cell_x,
            first_cell_y,
            first_cell_value,
            second_cell_x,
            second_cell_y,
            second_cell_value,
          };
        });

      const [frequency_4_1, frequency_4_2] =
        random_generated_starting_cells.reduce(
          (acc, { first_cell_value, second_cell_value }) => {
            if (first_cell_value === 4) {
              acc[0]++;
            }
            if (second_cell_value === 4) {
              acc[1]++;
            }
            return acc;
          },
          [0, 0]
        );

      const frequency_first_cell_4 = frequency_4_1 / test_size;
      const frequency_second_cell_4 = frequency_4_2 / test_size;

      assert.ok(
        frequency_first_cell_4 > 79 / test_size &&
          frequency_first_cell_4 < 128 / test_size,
        "Frequency of 4s is within parameters"
      );
      assert.ok(
        frequency_second_cell_4 > 79 / test_size &&
          frequency_second_cell_4 < 128 / test_size,
        "Frequency of 4s is within parameters"
      );

      // 21.666 is for 99% confidence level
      const observedFrequenciesAbscissa =
        random_generated_starting_cells.reduce(
          (acc, { first_cell_x }) => (acc[first_cell_x]++, acc),
          [0, 0, 0, 0]
        );

      const result = check_generator(
        test_size,
        observedFrequenciesAbscissa,
        21.666
      );

      assert.ok(
        result === 1,
        "The abscissa for the first cell is uniformally distributed"
      );

      const observedFrequenciesSecondCell =
        random_generated_starting_cells.reduce(
          (acc, { second_cell_x }) => (acc[second_cell_x]++, acc),
          [0, 0, 0, 0]
        );

      const resultSecondCell = check_generator(
        test_size,
        observedFrequenciesSecondCell,
        21.666
      );

      assert.ok(
        resultSecondCell === 1,
        "The abscissa for the second cell is uniformally distributed"
      );

      const observedFrequenciesOrdinate =
        random_generated_starting_cells.reduce(
          (acc, { first_cell_y }) => (acc[first_cell_y]++, acc),
          [0, 0, 0, 0]
        );

      const resultOrdinate = check_generator(
        test_size,
        observedFrequenciesOrdinate,
        21.666
      );

      assert.ok(
        resultOrdinate === 1,
        "The ordinate for the first cell is uniformally distributed"
      );

      const observedFrequenciesSecondCellOrdinate =
        random_generated_starting_cells.reduce(
          (acc, { second_cell_y }) => (acc[second_cell_y]++, acc),
          [0, 0, 0, 0]
        );

      const resultSecondCellOrdinate = check_generator(
        test_size,
        observedFrequenciesSecondCellOrdinate,
        21.666
      );

      assert.ok(
        resultSecondCellOrdinate === 1,
        "The ordinate for the second cell is uniformally distributed"
      );

      const is_two_cells_distinct = random_generated_starting_cells.reduce((acc, {first_cell_x, first_cell_y, second_cell_x, second_cell_y}) => {
        return acc && !(first_cell_x === second_cell_x && first_cell_y === second_cell_y);
      }, true);
      assert.ok(is_two_cells_distinct, "The first two generated cells are distinct");
    }
  );
});
