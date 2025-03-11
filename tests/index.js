import {
  get_seeded_random_generator,
  get_starting_cells,
  collapse_to_the_right,
  collapse_to_the_left,
  compute_score_after_collapse,
  get_board_state,
  get_current_score,
  get_best_score,
  get_ui_elements,
  events,
  lenses,
} from "../index.js";
import {
  check_generator,
  are_array_deep_equal,
  transpose,
} from "../tests/_utils.js";

QUnit.module("(UI) Game start", function (hooks) {
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

QUnit.module("Collapse a row to the right", function (hooks) {
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

  QUnit.module(
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

  QUnit.module("Property-based testing", function (hooks) {
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

  QUnit.module("(UI) Swipe updates the board", function (hooks) {
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

QUnit.module("Collapse a row to the left", function (hooks) {
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

QUnit.module("Collapse a row to the bottom", function (hooks) {
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

        console.log(`board_state_before`, JSON.stringify(board_state_before));
        console.log(`board_state_after`, JSON.stringify(board_state_after));
        console.log(
          `score before, after, points`,
          current_score_before,
          current_score_after,
          score_points
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

QUnit.module("Collapse a row to the top", function (hooks) {
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

QUnit.module("(UI) Game rules", function (hooks) {
  QUnit.module("Game state machine describes accurately the game", function (hooks) {
    const first_cells_seed = "some seed string";
    const new_cell_seed = "another seed string";

    // TODO: refactor the config passed to the game test generator. Some of this is setting, some is dependency injection, some is initial value for variables, etc.
    const initial_state = {
      coverage: {
        first_cell: { value, x, y },
        second_cell: { value, x, y },
        added_cells_history: [],
        nodes: {
          GAME_NOT_STARTED: [],
          GAME_IN_PROGRESS: [],
          "?": [],
          GAME_OVER: []
        },
        transitions: {
          "GAME_NOT_STARTED -> GAME_IN_PROGRESS": [],
          "GAME_IN_PROGRESS -> ?": [],
          "GAME_IN_PROGRESS -> GAME_IN_PROGRESS": [],
          "? -> GAME_IN_PROGRESS": [],
          "? -> GAME_OVER": [],
        }
      }
    };
    const deps = {
      collapse_to_the_right,
      transpose,
      are_array_deep_equal,
      getters: {
        get_board_state,
        get_current_score,
        get_best_score,
        get_game_status,
      },
      parameters: {
        seeds: { first_cells_seed, new_cell_seed },
        frequencies: [[2, 0.9], [4, 0.1]],
      },
    };
    // That's the generator of game events that simulates a player's game UI interactions 
    // e.g., swipe right, new game button clicked, etc.
    const moves_generator = void 0;

    const game_state_machine = new game_fsm({ initial_state, moves_generator, deps });

  });
});

function get_app_state(getters) {
  const { get_board_state, get_current_score, get_best_score, get_game_status } = getters;

  return {
    board_state: get_board_state(),
    current_score: get_current_score(),
    best_score: get_best_score(),
    game_status: get_game_status(),
  }
}

function is_deep_equal_app_state(actual_app_state, expected_app_state) {
  // As of now, all properties of app state are JSON-serializable so let's do it the lazy way
  return JSON.stringify(actual_app_state) === JSON.stringify(expected_app_state);
}

function* game_fsm({ initial_state, moves_generator, deps }) {
  let extended_state = JSON.parse(JSON.stringify(initial_state));
  const { collapse_to_the_right, transpose, getters, parameters } = deps;
  const { get_board_state, get_current_score, get_best_score, get_game_status } = getters;
  const { first_cells_seed, new_cell_seed } = parameters.seeds;

  let control_state = "GAME_NOT_STARTED";
  extended_state.app_state = get_app_state();

  events.emitter("INITIALIZE_APP", { first_cells_seed, new_cell_seed });


  /** @typedef {{type: String, detail: any}} */
  const next_move = moves_generator.next({ board_state: get_board_state(), game_status: get_game_status() });

  const reactions = {
    GAME_NOT_STARTED: (extended_state, move) => {
      if (move.type === "START_NEW_GAME") {
        // TODO
        events.emitter("START_NEW_GAME", move.detail);

        // TODO: 
        // - check that I have exactly two cells in the board
        // - the cells are 2 or 4
        // - keep track of their position and values for later randomness evaluation
        // - check that the current score is 0
        // - check that the best score has not changed
        // - check that the game status is in progress now
        if (everything as expected) {

        }
        else {
          // TODO: think about what should go in case of error in the extended state or the return value of the fsm!!
          // 
          return {
            control_state: "TEST_FAILED",
            extended_state,
          };
        }
      }
      else if (move.type !== "START_NEW_GAME") {
        // The app state should not change at all
        events.emitter(move.type, move.detail);
        const actual_app_state = get_app_state();
        const expected_app_state = extended_state.app_state;
        if (is_deep_equal_app_state(actual_app_state, expected_app_state)) {
          return {
            control_state: "GAME_IN_PROGRESS",
            extended_state,
          };
        }
        else {
          // TODO: put some coverage information, and also failure information too
          return {
            control_state: "TEST_FAILED",
            extended_state,
          };
        }
      }
    },
    TEST_FAILED:  (extended_state, move) => {},
    GAME_IN_PROGRESS:  (extended_state, move) => {},
  }

}