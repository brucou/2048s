import { GAME_IN_PROGRESS, GAME_OVER } from "../constants.js";
import {
  get_seeded_random_generator,
  get_starting_cells,
  collapse_to_the_right,
  collapse_to_the_left,
  compute_score_after_collapse,
  get_ui_elements,
  events,
  lenses,
} from "../index.js";
import {
  check_generator,
  transpose,
  get_board_state,
  get_current_score,
  get_best_score,
  get_game_status,
  empty_object,
  get_uuid,
  is_deep_equal_app_state,
  get_app_state_from_UI,
  are_boards_deep_equal,
  get_added_cell_after_play,
  is_expected_cell_value,
  update_coverage_after_start_new_game,
  update_coverage_after_collapse_move,
  update_coverage_after_no_change,
  take_snapshot_before_after,
  is_new_game_app_state as _is_new_game_app_state,
  is_2048,
  print_move,
  print_board_state,
} from "../tests/_utils.js";
import { swing_and_switch_game_strategy } from "./move generators.js";
import { winning_game, losing_game } from "./fixtures.js";

QUnit.skip("(UI) Game start", function (hooks) {
  QUnit.test(
    "User navigates to the game page and sees the initial screen",
    function (assert) {
      events.emitter("INITIALIZE_APP", { detail: void 0 });

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
      events.emitter("INITIALIZE_APP", { detail: void 0 });
      events.emitter("START_NEW_GAME", { detail: void 0 });

      const board_state = get_board_state();
      const current_score = get_current_score();

      const count_valid_cells = board_state.reduce((acc, row) => {
        const row_count = row.reduce(
          (acc, number) => ([2, 4].includes(number) ? acc + 1 : acc),
          0
        );
        return acc + row_count;
      }, 0);

      const count_invalid_cells = board_state.reduce((acc, row) => {
        const row_count = row.reduce(
          (acc, number) => ([0, 2, 4].includes(number) ? acc : acc + 1),
          0
        );
        return acc + row_count;
      }, 0);

      assert.deepEqual(current_score, 0, "Current score is 0");
      assert.deepEqual(
        count_valid_cells,
        2,
        "There are two cells on the board with the expected values"
      );
      assert.deepEqual(
        count_invalid_cells,
        0,
        "There are only two non-empty cells on the board"
      );
    }
  );
});

QUnit.skip("Random number generation", function (hooks) {
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

      const is_two_cells_distinct = random_generated_starting_cells.reduce(
        (acc, { first_cell_x, first_cell_y, second_cell_x, second_cell_y }) => {
          return (
            acc &&
            !(first_cell_x === second_cell_x && first_cell_y === second_cell_y)
          );
        },
        true
      );
      assert.ok(
        is_two_cells_distinct,
        "The first two generated cells are distinct"
      );
    }
  );
});

QUnit.skip("Collapse a row to the right", function (hooks) {
  const sample_size = 10;
  const oracle_tests = `

    # all letters non-zero and different
    a,b,c,d -> a,b,c,d

    # all letters non-zero and same
    a,a,a,a -> 0,0,2a,2a

    # two letter non-null same
    a,a,c,d -> 0,2a,c,d
    a,b,a,d -> a,b,a,d
    a,b,c,a -> a,b,c,a
    a,b,b,d -> 0,a,2b,d
    a,b,c,b -> a,b,c,b
    a,b,c,c -> 0,a,b,2c

    a,a,c,c -> 0,0,2a,2c
    a,b,a,b -> a,b,a,b
    a,b,b,a -> 0,a,2b,a

    # three letters non-null same
    a,a,a,d -> 0,a,2a,d
    a,b,a,a -> 0,a,b,2a
    a,b,b,b -> 0,a,b,2b
    a,a,c,a -> 0,2a,c,a
    
    # 1 zero somewhere, all letters different
    0,b,c,d -> 0,b,c,d
    a,0,c,d -> 0,a,c,d
    a,b,0,d -> 0,a,b,d
    a,b,c,0 -> 0,a,b,c

    # 2 zeros somewhere, all letters different
    0,0,c,d -> 0,0,c,d
    0,b,0,d -> 0,0,b,d
    0,b,c,0 -> 0,0,b,c
    a,0,0,d -> 0,0,a,d
    a,0,c,0 -> 0,0,a,c
    a,b,0,0 -> 0,0,a,b

    # 3 zero somewhere, all letters different
    0,0,0,d -> 0,0,0,d
    0,0,c,0 -> 0,0,0,c
    0,b,0,0 -> 0,0,0,b
    a,0,0,0 -> 0,0,0,a

    #4 zero somewhere, all letters different
    0,0,0,0 -> 0,0,0,0
    
    #1 zero somewhere, two letters same
    0,b,b,d -> 0,0,2b,d
    0,b,c,b -> 0,b,c,b
    0,b,c,c -> 0,0,b,2c
    a,0,a,d -> 0,0,2a,d
    a,0,c,a -> 0,a,c,a
    a,0,c,c -> 0,0,a,2c
    a,a,0,d  -> 0,0,2a,d
    a,b,0,a -> 0,a,b,a
    a,b,0,b -> 0,0,a,2b
    a,a,c,0 -> 0,0,2a,c
    a,b,a,0 -> 0,a,b,a
    a,b,b,0 -> 0,0,a,2b
    
    #1 zero somewhere, three letters same
    0,b,b,b -> 0,0,b,2b
    a,0,a,a -> 0,0,a,2a
    a,a,0,a -> 0,0,a,2a
    a,a,a,0 -> 0,0,a,2a
    
    #2 zero somewhere, two letters same
    0,0,c,c -> 0,0,0,2c
    0,b,0,b -> 0,0,0,2b
    0,b,b,0 -> 0,0,0,2b
    a,0,0,a -> 0,0,0,2a
    a,0,a,0 -> 0,0,0,2a
    a,a,0,0 -> 0,0,0,2a 
  `
    .split("\n")
    .map((x) => x.trim())
    .filter((x) => x.length > 0 && !x.startsWith("#"))
    .map((x) => x.split("->").map((x) => x.trim()));

  /**
   * @type {Array<
   * test_scenario,
   * expected_output_pattern,
   * test_inputs,
   * actual_test_results,
   * expected_test_results>}
   */
  const test_results = oracle_tests.map(
    ([test_scenario, expected_output_pattern]) => {
      const test_inputs = Array(sample_size)
        .fill(0)
        .map((i) => {
          return test_scenario.split(",").reduce(
            (acc, char) => {
              let draw;

              if (char === "0") {
                acc.test_case.push(0);
              } else {
                if (acc.vars[char] === undefined) {
                  // draw a number that is not already in the vars
                  while (true) {
                    draw = Math.pow(2, Math.floor(Math.random() * 10) + 1);
                    if (!Object.values(acc.vars).includes(draw)) {
                      break;
                    }
                  }
                  acc.vars[char] = draw;
                  acc.test_case.push(draw);
                } else {
                  acc.test_case.push(acc.vars[char]);
                }
              }
              return acc;
            },
            { test_case: [], vars: {} }
          );
        });

      const actual_test_results = test_inputs.map(({ test_case }) =>
        collapse_to_the_right(test_case)
      );

      const expected_test_results = test_inputs.map(({ vars }) => {
        // e.g. output_pattern = '0,0,2a,2a'
        // check that the test results follow the expected output pattern according to the vars value
        return expected_output_pattern
          .split(",")
          .map((x) => x.trim())
          .reduce(
            (computed, x) => {
              if (x === "0") {
                return {
                  score_points: computed.score_points,
                  expected_row: computed.expected_row.concat(0),
                };
              } else {
                // parse and compute the expected pattern
                const { number, letter } = x
                  .trim()
                  .split("")
                  .reduce(
                    (acc, char) => {
                      if (char > "0" && char <= "9") {
                        acc.number = acc.number * 10 + parseInt(char);
                      } else {
                        acc.letter = char;
                      }
                      return acc;
                    },
                    { number: 0, letter: "" }
                  );

                const score_points = number === 0 ? 0 : number * vars[letter];
                const expected_cell_value = letter
                  ? (number === 0 ? 1 : number) * vars[letter]
                  : 0;

                return {
                  score_points: computed.score_points + score_points,
                  expected_row:
                    computed.expected_row.concat(expected_cell_value),
                };
              }
            },
            { expected_row: [], score_points: 0 }
          );
      });

      return [
        test_scenario,
        expected_output_pattern,
        test_inputs,
        actual_test_results,
        expected_test_results,
      ];
    }
  );

  QUnit.skip(
    "Oracle testing (swipe right and score points)",
    function (hooks) {
      test_results.forEach(
        ([
          test_scenario,
          expected_output_pattern,
          test_inputs,
          actual_test_results,
          expected_test_results,
        ]) => {
          //e.g. test_scenario = 'a,b,c,d' and expected_output_pattern = 'a,b,c,d'
          QUnit.test(
            `Input of the shape ${test_scenario} are swiped right to ${expected_output_pattern}`,

            function (assert) {
              test_inputs.forEach(({ test_case }, i) => {
                assert.deepEqual(
                  actual_test_results[i],
                  expected_test_results[i].expected_row,
                  `Scenario ${test_scenario} with expected output ${expected_output_pattern} is fulfilled when passing inputs ${test_case}`
                );

                assert.deepEqual(
                  compute_score_after_collapse(test_case),
                  expected_test_results[i].score_points,
                  `Scenario ${test_scenario} with expected output ${expected_output_pattern} is correctly scored when passing inputs ${test_case} : ${compute_score_after_collapse(
                    test_case
                  )}`
                );
              });
            }
          );
        }
      );
    }
  );

  QUnit.skip("Property-based testing", function (hooks) {
    // 1. besides the zero array, every output has 0s only on the left side or has no zero at all (compactness property)
    // 2. the sum of the array in the input matches the sum in the output (invariance property)
    // 3. If non-zero numbers in the input are powers of 2, all non-zero numbers of the output are powers of 2
    // 4. if there are zeros on the left side in the input, those same zeros are also present in the output
    // 5. the number of zeros in the output is equal or superior to the number of zeros in the input
    // 6. The smallest non-zero number of the output is equal or superior to the smallest non-zero number in the input

    QUnit.test(
      "Besides the zero array, every output has 0s only on the left side or has no zero at all (compactness property)",
      function (assert) {
        test_results.forEach(
          ([
            test_scenario,
            expected_output_pattern,
            test_inputs,
            actual_test_results,
            expected_test_results,
          ]) => {
            test_inputs.forEach(({ test_case }, i) => {
              if (test_case.every((x) => x === 0)) return;

              const has_zero_only_on_left_side =
                actual_test_results[i].reduce((acc, x) => {
                  // Mini 3-state state machine
                  if (x === 0 && acc === 0) return 0;
                  if (x !== 0 && acc === 0) return 1;
                  if (x === 0 && acc === 1) return -1;
                  return acc;
                }, 0) !== -1;

              assert.ok(
                has_zero_only_on_left_side,
                `Inputs ${test_case} swipes to ${actual_test_results[i]}, which fulfills property`
              );
            });
          }
        );
      }
    );

    QUnit.test(
      "The sum of the input array matches the sum in the output array (invariance property)",
      function (assert) {
        test_results.forEach(
          ([
            test_scenario,
            expected_output_pattern,
            test_inputs,
            actual_test_results,
            expected_test_results,
          ]) => {
            test_inputs.forEach(({ test_case }, i) => {
              const matching_sum =
                test_case.reduce((acc, x) => acc + x, 0) ===
                actual_test_results[i].reduce((acc, x) => acc + x, 0);
              assert.ok(
                matching_sum,
                `Inputs ${test_case} swipes to ${actual_test_results[i]}, which fulfills the invariance property`
              );
            });
          }
        );
      }
    );

    function is_power_of_2(unsigned_int) {
      return unsigned_int === 1 || (unsigned_int & (unsigned_int - 1)) === 0;
    }

    QUnit.test(
      "If non-zero numbers in the input are powers of 2, all non-zero numbers of the output are powers of 2",
      function (assert) {
        // NOTE: By construction, we know that all numbers in the input are powers of 2
        test_results.forEach(
          ([
            test_scenario,
            expected_output_pattern,
            test_inputs,
            actual_test_results,
            expected_test_results,
          ]) => {
            test_inputs.forEach(({ test_case }, i) => {
              const are_all_powers_of_2 =
                test_case.every((x) => x == 0 || is_power_of_2(x)) &&
                actual_test_results[i].every((x) => x == 0 || is_power_of_2(x));
              assert.ok(
                are_all_powers_of_2,
                `Inputs ${test_case} swipes to ${actual_test_results[i]}, which fulfills the property`
              );
            });
          }
        );
      }
    );

    function get_left_side_zeros(test_case) {
      let number_of_zeros_in_left_side_of_input = 0,
        j = 0;
      do {
        if (test_case[j] === 0) number_of_zeros_in_left_side_of_input++;
        else break;
      } while (test_case[++j]);
      return number_of_zeros_in_left_side_of_input;
    }

    QUnit.test(
      "if there are zeros on the left side in the input, those same zeros are also present in the output",
      function (assert) {
        test_results.forEach(
          ([
            test_scenario,
            expected_output_pattern,
            test_inputs,
            actual_test_results,
            expected_test_results,
          ]) => {
            test_inputs.forEach(({ test_case }, i) => {
              const number_of_zeros_in_left_side_of_input =
                get_left_side_zeros(test_case);
              const number_of_zeros_in_left_side_of_output =
                get_left_side_zeros(actual_test_results[i]);
              const are_zeros_preserved =
                number_of_zeros_in_left_side_of_input <=
                number_of_zeros_in_left_side_of_output;
              assert.ok(
                are_zeros_preserved,
                `Inputs ${test_case} swipes to ${actual_test_results[i]}, which fulfills the property`
              );
            });
          }
        );
      }
    );

    QUnit.test(
      "the number of zeros in the output is equal or superior to the number of zeros in the input",
      function (assert) {
        test_results.forEach(
          ([
            test_scenario,
            expected_output_pattern,
            test_inputs,
            actual_test_results,
            expected_test_results,
          ]) => {
            test_inputs.forEach(({ test_case }, i) => {
              const number_of_zeros_in_input = test_case.reduce(
                (acc, x) => acc + (x === 0 ? 1 : 0),
                0
              );
              const number_of_zeros_in_output = actual_test_results[i].reduce(
                (acc, x) => acc + (x === 0 ? 1 : 0),
                0
              );
              const are_zeros_preserved =
                number_of_zeros_in_input <= number_of_zeros_in_output;
              assert.ok(
                are_zeros_preserved,
                `Inputs ${test_case} swipes to ${actual_test_results[i]}, which fulfills the property`
              );
            });
          }
        );
      }
    );

    QUnit.test(
      "The smallest non-zero number of the output is equal or superior to the smallest non-zero number in the input",
      function (assert) {
        test_results.forEach(
          ([
            test_scenario,
            expected_output_pattern,
            test_inputs,
            actual_test_results,
            expected_test_results,
          ]) => {
            test_inputs.forEach(({ test_case }, i) => {
              const smallest_number_in_input = test_case.reduce(
                (acc, x) => (x !== 0 ? (x < acc ? x : acc) : acc),
                Infinity
              );
              const smallest_number_in_output = actual_test_results[i].reduce(
                (acc, x) => (x !== 0 ? (x < acc ? x : acc) : acc),
                Infinity
              );
              assert.ok(
                smallest_number_in_input <= smallest_number_in_output,
                `Inputs ${test_case} swipes to ${actual_test_results[i]}, which fulfills the property`
              );
            });
          }
        );
      }
    );
  });

  QUnit.skip("(UI) Swipe updates the board", function (hooks) {
    const sample_size = 100;

    Array(sample_size)
      .fill(0)
      .forEach((_) => {
        events.emitter("INITIALIZE_APP", { detail: void 0 });
        events.emitter("START_NEW_GAME", { detail: void 0 });
        const board_state_before = get_board_state();
        const best_score_before = get_best_score();
        const current_score_before = get_current_score();

        events.emitter("COLLAPSE", "RIGHT");
        const board_state_after = get_board_state();
        const current_score_after = get_current_score();
        const best_score_after = get_best_score();

        QUnit.test(
          "Swiping to the right does update the score when it should, and does not when it should not",
          function (assert) {
            const score_points = board_state_before.reduce(
              (acc, row) => acc + compute_score_after_collapse(row),
              0
            );
            assert.deepEqual(
              current_score_after,
              current_score_before + score_points,
              "The score is updated correctly"
            );
          }
        );
      });
  });
});

QUnit.skip("Collapse a row to the left", function (hooks) {
  const sample_size = 10;
  const oracle_tests = `
    # all letters non-zero and different
    a,b,c,d -> a,b,c,d

    # all letters non-zero and same
    a,a,a,a -> 2a,2a, 0, 0

    # two letter non-null same
    a,a,c,d -> 2a,c,d,0
    a,b,a,d -> a,b,a,d
    a,b,c,a -> a,b,c,a
    a,b,b,d -> a,2b,d,0
    a,b,c,b -> a,b,c,b
    a,b,c,c -> a,b,2c,0

    a,a,c,c -> 2a,2c,0,0
    a,b,a,b -> a,b,a,b
    a,b,b,a -> a,2b,a,0

    # three letters non-null same
    a,a,a,d -> 2a,a,d,0
    a,b,a,a -> a,b,2a,0
    a,b,b,b -> a,2b,b,0
    a,a,c,a -> 2a,c,a,0

    # 1 zero somewhere, all letters different
    0,b,c,d -> b,c,d,0
    a,0,c,d -> a,c,d,0
    a,b,0,d -> a,b,d,0
    a,b,c,0 -> a,b,c,0

    # 2 zeros somewhere, all letters different
    0,0,c,d -> c,d,0,0
    0,b,0,d -> b,d,0,0
    0,b,c,0 -> b,c,0,0
    a,0,0,d -> a,d,0,0
    a,0,c,0 -> a,c,0,0
    a,b,0,0 -> a,b,0,0

    # 3 zero somewhere, all letters different
    0,0,0,d -> d,0,0,0
    0,0,c,0 -> c,0,0,0
    0,b,0,0 -> b,0,0,0
    a,0,0,0 -> a,0,0,0

    #4 zero somewhere, all letters different
    0,0,0,0 -> 0,0,0,0
    
    #1 zero somewhere, two letters same
    0,b,b,d -> 2b,d,0,0
    0,b,c,b -> b,c,b,0
    0,b,c,c -> b,2c,0,0
    a,0,a,d -> 2a,d,0,0
    a,0,c,a -> a,c,a,0
    a,0,c,c -> a,2c,0,0
    a,a,0,d  -> 2a,d,0,0
    a,b,0,a -> a,b,a,0
    a,b,0,b -> a,2b,0,0
    a,a,c,0 -> 2a,c,0,0
    a,b,a,0 -> a,b,a,0
    a,b,b,0 -> a,2b,0,0
    
    #1 zero somewhere, three letters same
    0,b,b,b -> 2b,b,0,0
    a,0,a,a -> 2a,a,0,0
    a,a,0,a -> 2a,a,0,0
    a,a,a,0 -> 2a,a,0,0
    
    #2 zero somewhere, two letters same
    0,0,c,c -> 2c,0,0,0
    0,b,0,b -> 2b,0,0,0
    0,b,b,0 -> 2b,0,0,0
    a,0,0,a -> 2a,0,0,0
    a,0,a,0 -> 2a,0,0,0
    a,a,0,0 -> 2a,0,0,0 
  `
    .split("\n")
    .map((x) => x.trim())
    .filter((x) => x.length > 0 && !x.startsWith("#"))
    .map((x) => x.split("->").map((x) => x.trim()));

  /**
   * @type {Array<
   * test_scenario,
   * expected_output_pattern,
   * test_inputs,
   * actual_test_results,
   * expected_test_results>}
   */
  const test_results = oracle_tests.map(
    ([test_scenario, expected_output_pattern]) => {
      const test_inputs = Array(sample_size)
        .fill(0)
        .map((i) => {
          return test_scenario.split(",").reduce(
            (acc, char) => {
              let draw;

              if (char === "0") {
                acc.test_case.push(0);
              } else {
                if (acc.vars[char] === undefined) {
                  // draw a number that is not already in the vars
                  while (true) {
                    draw = Math.pow(2, Math.floor(Math.random() * 10) + 1);
                    if (!Object.values(acc.vars).includes(draw)) {
                      break;
                    }
                  }
                  acc.vars[char] = draw;
                  acc.test_case.push(draw);
                } else {
                  acc.test_case.push(acc.vars[char]);
                }
              }
              return acc;
            },
            { test_case: [], vars: {} }
          );
        });

      const actual_test_results = test_inputs.map(({ test_case }) =>
        collapse_to_the_left(test_case)
      );

      const expected_test_results = test_inputs.map(({ vars }) => {
        // e.g. output_pattern = '0,0,2a,2a'
        // check that the test results follow the expected output pattern according to the vars value
        return expected_output_pattern
          .split(",")
          .map((x) => x.trim())
          .reduce(
            (computed, x) => {
              if (x === "0") {
                return {
                  score_points: computed.score_points,
                  expected_row: computed.expected_row.concat(0),
                };
              } else {
                // parse and compute the expected pattern
                const { number, letter } = x
                  .trim()
                  .split("")
                  .reduce(
                    (acc, char) => {
                      if (char > "0" && char <= "9") {
                        acc.number = acc.number * 10 + parseInt(char);
                      } else {
                        acc.letter = char;
                      }
                      return acc;
                    },
                    { number: 0, letter: "" }
                  );

                const score_points = number === 0 ? 0 : number * vars[letter];
                const expected_cell_value = letter
                  ? (number === 0 ? 1 : number) * vars[letter]
                  : 0;

                return {
                  score_points: computed.score_points + score_points,
                  expected_row:
                    computed.expected_row.concat(expected_cell_value),
                };
              }
            },
            { expected_row: [], score_points: 0 }
          );
      });

      return [
        test_scenario,
        expected_output_pattern,
        test_inputs,
        actual_test_results,
        expected_test_results,
      ];
    }
  );

  QUnit.module(
    "Oracle testing (swipe left and score points)",
    function (hooks) {
      test_results.forEach(
        ([
          test_scenario,
          expected_output_pattern,
          test_inputs,
          actual_test_results,
          expected_test_results,
        ]) => {
          //e.g. test_scenario = 'a,b,c,d' and expected_output_pattern = 'a,b,c,d'
          QUnit.test(
            `Input of the shape ${test_scenario} are swiped right to ${expected_output_pattern}`,

            function (assert) {
              test_inputs.forEach(({ test_case }, i) => {
                assert.deepEqual(
                  actual_test_results[i],
                  expected_test_results[i].expected_row,
                  `Scenario ${test_scenario} with expected output ${expected_output_pattern} is fulfilled when passing inputs ${test_case}`
                );

                assert.deepEqual(
                  compute_score_after_collapse(test_case),
                  expected_test_results[i].score_points,
                  `Scenario ${test_scenario} with expected output ${expected_output_pattern} is correctly scored when passing inputs ${test_case} : ${compute_score_after_collapse(
                    test_case
                  )}`
                );
              });
            }
          );
        }
      );
    }
  );

  QUnit.module("(UI) Swipe left updates the board", function (hooks) {
    const sample_size = 100;

    Array(sample_size)
      .fill(0)
      .forEach((_) => {
        events.emitter("INITIALIZE_APP", { detail: void 0 });
        events.emitter("START_NEW_GAME", { detail: void 0 });
        const board_state_before = get_board_state();
        const best_score_before = get_best_score();
        const current_score_before = get_current_score();

        events.emitter("COLLAPSE", "LEFT");
        const board_state_after = get_board_state();
        const current_score_after = get_current_score();
        const best_score_after = get_best_score();

        QUnit.test(
          "Swiping to the left does update the score when it should, and does not when it should not",
          function (assert) {
            const score_points = board_state_before.reduce(
              (acc, row) => acc + compute_score_after_collapse(row),
              0
            );
            assert.deepEqual(
              current_score_after,
              current_score_before + score_points,
              "The score is updated correctly"
            );
          }
        );
      });
  });
});

QUnit.skip("Collapse a row to the bottom", function (hooks) {
  const sample_size = 10;

  QUnit.module("(UI) Swipe updates the board", function (hooks) {
    const sample_size = 100;

    Array(sample_size)
      .fill(0)
      .forEach((_) => {
        events.emitter("INITIALIZE_APP", { detail: void 0 });
        events.emitter("START_NEW_GAME", { detail: void 0 });
        const board_state_before = get_board_state();
        const transposed_board_state_before = transpose(board_state_before);
        const best_score_before = get_best_score();
        const current_score_before = get_current_score();

        events.emitter("COLLAPSE", "DOWN");
        const board_state_after = get_board_state();
        const transposed_board_state_after = transpose(board_state_after);
        const current_score_after = get_current_score();
        const best_score_after = get_best_score();

        const score_points = transposed_board_state_before.reduce(
          (acc, row) => acc + compute_score_after_collapse(row),
          0
        );

        QUnit.test(
          "Swiping to the right does update the score when it should, and does not when it should not",
          function (assert) {
            assert.deepEqual(
              current_score_after,
              current_score_before + score_points,
              "The score is updated correctly"
            );
          }
        );
      });
  });
});

QUnit.skip("Collapse a row to the top", function (hooks) {
  const sample_size = 10;

  QUnit.module("(UI) Swipe updates the board", function (hooks) {
    const sample_size = 100;

    Array(sample_size)
      .fill(0)
      .forEach((_) => {
        events.emitter("INITIALIZE_APP", { detail: void 0 });
        events.emitter("START_NEW_GAME", { detail: void 0 });
        const board_state_before = get_board_state();
        const transposed_board_state_before = transpose(board_state_before);
        const best_score_before = get_best_score();
        const current_score_before = get_current_score();

        events.emitter("COLLAPSE", "TOP");
        const board_state_after = get_board_state();
        const transposed_board_state_after = transpose(board_state_after);
        const current_score_after = get_current_score();
        const best_score_after = get_best_score();

        QUnit.test(
          "Swiping to the right does update the score when it should, and does not when it should not",
          function (assert) {
            const score_points = transposed_board_state_before.reduce(
              (acc, row) => acc + compute_score_after_collapse(row),
              0
            );
            assert.deepEqual(
              current_score_after,
              current_score_before + score_points,
              "The score is updated correctly"
            );
          }
        );
      });
  });
});

function play(board_state, detail, { collapse_to_the_right, transpose }) {
  switch (detail) {
    case "RIGHT": return board_state.map(collapse_to_the_right);
    case "LEFT": return board_state.map(collapse_to_the_left);
    case "DOWN": return transpose(transpose(board_state).map(collapse_to_the_right));
    case "TOP": return transpose(transpose(board_state).map(collapse_to_the_left));
  }

  throw `Invalid play direction ${detail}`
}

function play_score(board_state, detail) {
  switch (detail) {
    case "RIGHT": return board_state.map(compute_score_after_collapse).reduce((a, b) => a + b);
    case "LEFT": return board_state.map(compute_score_after_collapse).reduce((a, b) => a + b);
    case "DOWN": return transpose(board_state).map(compute_score_after_collapse).reduce((a, b) => a + b);
    case "TOP": return transpose(board_state).map(compute_score_after_collapse).reduce((a, b) => a + b);
  }

  throw `Invalid play direction ${detail}`
}

function are_more_moves_possible(board_state, { collapse_to_the_right, transpose }) {
  return ["RIGHT", "LEFT", "TOP", "DOWN"].every(dir => are_boards_deep_equal(play(board_state, dir, { collapse_to_the_right, transpose }), board_state))
}

QUnit.module("(UI) Game rules", function (hooks) {

  let added_cells_history = [];

  function make_game_test_fsm(deps) {
    //   - Initialize the game test state machine
    //     - coverage information (data coverage and state/transition coverage)
    //     - some dependency injections, so the machine can be more easily tested independently
    //       - in short, every function used in the state machine should be in scope, or injected through parameters
    const initial_state = {
      coverage: {
        first_cell: {}, // { value: void 2, x: void 2, y: void 4 },
        second_cell: {}, // { value: void 4, x: void 1, y: void 3  },
        added_cells_history: [],
        app_state_history: []
      }
    };
    let extended_state = JSON.parse(JSON.stringify(initial_state));
    const { collapse_to_the_right, transpose, parameters } = deps;
    const { first_cells_seed, new_cell_seed } = parameters.seeds;


    let control_state = "GAME_NOT_STARTED";

    events.emitter("INITIALIZE_APP", { first_cells_seed, new_cell_seed });

    return function (next_move) {
      // Get the state before the next move
      const [app_state, new_app_state] = take_snapshot_before_after(next_move, events.emitter);

      const { type, detail } = next_move;

      if (type === "EOF") {
        return {
          control_state: "TEST_PASSED",
          extended_state
        }
      }

      if (control_state === "GAME_NOT_STARTED") {
        if (type === "START_NEW_GAME") {
          // A new game should be started and the board should have exactly two cells non mepty, score 0, best score as before
          const transition = "GAME_NOT_STARTED -> GAME_IN_PROGRESS";
          const is_best_score_unchanged = new_app_state.best_score === app_state.best_score;
          const { is_new_game_app_state, debug } = _is_new_game_app_state(new_app_state);

          if (is_new_game_app_state && is_best_score_unchanged) {
            extended_state.coverage = update_coverage_after_start_new_game(extended_state.coverage, transition, app_state, new_app_state);
            control_state = "GAME_IN_PROGRESS";

            return {
              control_state,
              extended_state,
            };
          }
          else {
            control_state = "TEST_FAILED";

            return {
              control_state,
              extended_state,
              debug
            };
          }
        }
        else {
          // nothing should change in the board
          const transition = "GAME_NOT_STARTED -> GAME_NOT_STARTED";

          if (is_deep_equal_app_state(app_state, new_app_state)) {
            control_state = "GAME_NOT_STARTED";
            extended_state.coverage = update_coverage_after_no_change(extended_state.coverage, transition, app_state, control_state);

            return {
              control_state,
              extended_state,
            };
          }
          else {
            control_state = "TEST_FAILED";

            return {
              control_state,
              extended_state,
              debug: {
                app_state, new_app_state
              }
            };
          }
        }
      }

      if (control_state === "GAME_IN_PROGRESS") {
        if (type === "COLLAPSE") {
          const transition = "GAME_IN_PROGRESS -> GAME_IN_PROGRESS";
          const { best_score, board_state, current_score, game_status } = app_state;
          const { best_score: new_best_score, board_state: new_board_state, current_score: new_current_score, game_status: new_game_status } = new_app_state;

          // If the board should not change, nothing should change
          const board_after_play = play(board_state, detail, { collapse_to_the_right, transpose });
          if (are_boards_deep_equal(board_after_play, board_state)) {
            if (is_deep_equal_app_state(app_state, new_app_state)) {
              control_state = "GAME_IN_PROGRESS";
              extended_state.coverage = update_coverage_after_no_change(extended_state.coverage, transition, app_state, control_state)

              return {
                control_state,
                extended_state,
              };
            }
            else {
              control_state = "TEST_FAILED";

              return {
                control_state,
                extended_state,
                debug: {
                  new_board_state, board_state, new_current_score, current_score, new_best_score, best_score, new_game_status, game_status
                }
              };
            }
          }

          // If the board should change, check that it changed correctly as per game rules
          else {
            // Get the added cell. There should be one and there should be only one. All others should be same
            const new_cells = get_added_cell_after_play(board_after_play, new_board_state);
            const score_points = play_score(board_state, detail);
            const is_expected_score = new_current_score === current_score + score_points;
            const is_expected_best_score = Math.max(current_score + score_points, best_score) === new_best_score;

            if (new_cells.length === 1 && is_expected_cell_value(new_cells) && is_expected_score && is_expected_best_score) {
              // We checked that new_board_state is as expected so we can use it to check if the game should be over
              const should_game_be_over = are_more_moves_possible(new_board_state, { collapse_to_the_right, transpose }) || is_2048(new_board_state);
              const is_game_over = new_app_state.game_status === GAME_OVER;

              if (should_game_be_over !== is_game_over) {
                control_state = "TEST_FAILED";

                return {
                  control_state,
                  extended_state,
                  debug: {
                    app_state, new_app_state, new_cells, is_expected_cell_value: is_expected_cell_value(new_cells), is_expected_score, is_expected_best_score, should_game_be_over, is_game_over
                  }
                };
              }
              else {
                control_state = is_game_over ? "GAME_OVER" : "GAME_IN_PROGRESS";
                const transition = `GAME_IN_PROGRESS -> ${control_state}`;
                const new_cell = new_cells[0];

                update_coverage_after_collapse_move(extended_state.coverage, transition, new_cell, app_state, new_app_state)

                return {
                  control_state,
                  extended_state,
                };
              }

            }
            else {
              control_state = "TEST_FAILED";

              return {
                control_state,
                extended_state,
                debug: {
                  app_state, new_app_state, new_cells, is_expected_cell_value: is_expected_cell_value(new_cells)
                }
              };
            }
          }
        }

        if (type === "START_NEW_GAME") {
          // A new game should be started and the board should have exactly two cells non mepty, score 0, best score as before
          const transition = "GAME_IN_PROGRESS -> GAME_IN_PROGRESS";
          const is_best_score_unchanged = new_app_state.best_score === app_state.best_score;
          const { is_new_game_app_state, debug } = _is_new_game_app_state(new_app_state);

          if (is_new_game_app_state && is_best_score_unchanged) {
            extended_state.coverage = update_coverage_after_start_new_game(extended_state.coverage, transition, app_state, new_app_state);
            control_state = "GAME_IN_PROGRESS";

            return {
              control_state,
              extended_state,
            };
          }
          else {
            control_state = "TEST_FAILED";

            return {
              control_state,
              extended_state,
              debug
            };
          }
        }

        throw `unexpected event type received (${type}) while in GAME_IN_PROGRESS state`
      }

      if (control_state === "GAME_OVER") {
        if (type === "START_NEW_GAME") {
          // A new game should be started and the board should have exactly two cells non mepty, score 0, best score as before
          const transition = "GAME_OVER -> GAME_IN_PROGRESS";
          const is_best_score_unchanged = new_app_state.best_score === app_state.best_score;
          const { is_new_game_app_state, debug } = _is_new_game_app_state(new_app_state);

          if (is_new_game_app_state && is_best_score_unchanged) {
            extended_state.coverage = update_coverage_after_start_new_game(extended_state.coverage, transition, app_state, new_app_state);
            control_state = "GAME_IN_PROGRESS";

            return {
              control_state,
              extended_state,
            };
          }
          else {
            control_state = "TEST_FAILED";

            return {
              control_state,
              extended_state,
              debug
            };
          }
        }
        else {
          // nothing should change in the board
          const transition = "GAME_OVER -> GAME_OVER";

          if (is_deep_equal_app_state(app_state, new_app_state)) {
            control_state = "GAME_OVER";
            extended_state.coverage = update_coverage_after_no_change(extended_state.coverage, transition, app_state, control_state);

            return {
              control_state,
              extended_state,
            };
          }
          else {
            control_state = "TEST_FAILED";

            return {
              control_state,
              extended_state,
              debug: {
                app_state, new_app_state
              }
            };
          }
        }
      }
    }
  }

  // For each of the three game play strategies (random, twirl-and-switch, swing-and-switch, cf. excalidraw):
  const game_play_strategies = [swing_and_switch_game_strategy];
  const game_play_strategy = game_play_strategies[0];

  // - pick a random number of tests to perform. Call that N. Must be high enough to test the frequency of 2 and 4s
  const size = 100;

  // - pick the max size of the game play sequence (around 10 x the game state machine size = 50?). Call that M_max
  const M_max = 50;

  // - Iterate N times:
  for (let test_number = 0; test_number < size; test_number++) {
    const move_generator = game_play_strategy();

    //   - pick a M <= M_max, size of the game play sequence to test against
    const m = 100;

    const seeds = {
      // Using a deterministic seed so tests can be rerun and debugged in case of failure
      first_cells_seed: JSON.stringify(Math.pow(test_number, 2) % 57),
      new_cell_seed: JSON.stringify(test_number - 1),

      // That was the non-deterministic option that we discarded
      // first_cells_seed: get_uuid(),
      // new_cell_seed: get_uuid(),
    };
    const game_test_fsm = make_game_test_fsm({
      collapse_to_the_right, transpose, parameters: { seeds }
    });

    // Initialize the app
    events.emitter("INITIALIZE_APP", seeds);

    let test_results = [];
    let moves = [];
    let app_state_history = [];
    let control_state_history = [];
    let test_result = void 0;
    let move_number = 0;

    //   - Iterate M times:
    for (move_number = 0; move_number < m; move_number++) {
      //     - get a move from the move generator associated to the game play strategy under test
      //       - the move generator is a function that takes the game's board state and the game status
      //       - and returns a non-trivial game move or EOF (meaning the absence of move)
      //     - run that move through the game test state machine
      const next_move = move_generator({ board_state: get_board_state(), game_status: get_game_status() });
      moves.push(next_move);
      test_result = game_test_fsm(next_move);
      test_results = test_results.concat(test_result);
      app_state_history.push(get_app_state_from_UI());
      const { control_state, extended_state, debug } = test_result;
      control_state_history.push(control_state);

      //     - the game test state machine returns its control state and the updated coverage resulting for running the test input
      //     - if the control state is "TEST_PASSED", break out of the Mx iteration, return the final coverage and TEST_PASSED
      if (control_state === "TEST_PASSED") break;

      //     - if the control state is "TEST_FAILED", break out of the Mx iteration, return the final coverage and TEST_FAILED
      if (control_state === "TEST_FAILED") break;

      //     - if not, the control state is "TEST_IN_PROGRESS.<substate>" and the iteration continues with the next move
    }

    //   - From the previous test sequence run (length <= M), we have some coverage and the result of the test (passed or failed)
    const { control_state, extended_state, debug } = test_result;
    added_cells_history = extended_state.coverage.added_cells_history;
    const control_state_histogram = control_state_history.reduce((acc, control_state) => {
      const key = control_state;
      acc[key] = acc[key] ? acc[key] + 1 : 1;

      return acc;
    }, {});
    const transition_histogram = control_state_history.reduce((acc, control_state, i) => {
      const key = `${control_state_history[i - 1] || ":"} -> ${control_state}`;
      acc[key] = acc[key] ? acc[key] + 1 : 1;

      return acc;
    }, {});



    // Report on the tests that were successfull
    if (control_state === "TEST_PASSED" || move_number === m) {
      QUnit.skip(`Played game ${JSON.stringify(seeds)} successfully for ${move_number} moves`, assert => {
        assert.ok(true, [`moves: `,
          moves.map((m, i) => print_move(m, control_state_history[i])).toString(), `transitions: `,
          JSON.stringify(transition_histogram)
        ].join("\n")
        );
        console.info("Summary coverage statistics", control_state_histogram, transition_histogram)
        console.info(`Test summary:`, moves.map((move, i) => ({
          move: print_move(move, control_state_history[i]),
          board_state: print_board_state(lenses.get_board_state(app_state_history[i])),
          score: lenses.get_current_score(app_state_history[i]),
          best_score: lenses.get_best_score(app_state_history[i]),
        })))
      });
    }
    //   - If the last test was failed, then stop entirely the testing and produce a test report with:
    //     - game play strategy, number of tests run, number of test passed, failing test sequence
    if (control_state === "TEST_FAILED") {
      const successful_tests = test_results.filter(x => x.control_state === "TEST_PASSED");
      QUnit.skip(`testing game rules`, assert => {
        debugger

        assert.ok(false, `${successful_tests.length} test passed, 1 test failed, see the log for information`);
        console.error(extended_state, debug);
      });

    }
  }

  //   - If all tests pass, test the frequency of the first cells!!
  QUnit.skip(`Frequency of first cells is 2 with a 90% probability`, assert => {
    const frequency = added_cells_history.filter(Boolean).reduce((acc, {value: x}) => x === 2 ? acc + 1 : acc, 0) / added_cells_history.filter(Boolean).length;
    // We need to use the numbers for 100!! which is the test size we used for the first cells here
    assert.ok(frequency > 0.82 && frequency < 0.94 , `Frequency of 2s is ${frequency}, which is within the expected interval`);
  });

  QUnit.skip(`User wins game when reaching 2048 tile`, assert => {
    winning_game.forEach(move => {
      const {type,detail} = move;
      events.emitter(type, detail);
    });
    assert.ok(get_game_status() === GAME_OVER, `Playing a winning game leads correctly to game over status`);
  })

  QUnit.skip(`User loses game when no more moves are possible`, assert => {
    losing_game.moves.forEach((move) => {
      const {type,detail} = move;
      events.emitter(type, detail);
    });
    assert.ok(get_game_status() === GAME_OVER, `Playing a losing game leads correctly to game over status`);
  })
  
  QUnit.test(`Oracle testing - sample game plays exactly as expected per game rules`, assert => {
    losing_game.moves.forEach((move, i) => {
      const {type,detail} = move;
      events.emitter(type, detail);
      const board_state = get_board_state();

        assert.deepEqual(board_state, losing_game.boards[i], `Move ${i} updates the board as expected`);
    });
    assert.ok(get_game_status() === GAME_OVER, `Playing a losing game leads correctly to game over status`);
  })
  
});

// TODO: more move generators
// TODO: check the coverage information and produce a report
// TODO: merge and in master put all the README, summarize all learning...

