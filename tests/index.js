import {get_seeded_random_generator} from "../index.js"

function get_best_score(){
    return document.querySelector('#best-score-amount').textContent|0;
}

function get_current_score(){
    return document.querySelector('#current-score-amount').textContent|0;
}

function get_board_state() {
    return [0, 1, 2, 3].map(i => Array.from(document.querySelectorAll(`[data-row="${i}"]`)).map(x => String.prototype.trim(x.textContent) | 0));
}

function get_ui_elements() {
    const new_game_button = document.querySelector('#new-game-button');

    return {new_game_button}
}

QUnit.module("UI updates", function (hooks) {

    QUnit.test("User navigates to the game page and sees the initial screen", function (assert) {
        const board_state = get_board_state();
        const current_score = get_current_score();
        const best_score = get_best_score();
        const {new_game_button} = get_ui_elements();

        assert.deepEqual(board_state, [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ], "Board is empty");
        assert.deepEqual(current_score, 0, 'Current score is 0');
        assert.deepEqual(best_score, 0, 'Best score is 0');
        assert.ok(new_game_button, 'There is a new game button');
    });

    QUnit.test("", function (assert) {
        const element = document.getElementById("my-element");
        element.querySelector("p").textContent = "Hello, World!";
        assert.strictEqual(element.querySelector("p").textContent, "Hello, World!", "Text content is updated");
    });
});

QUnit.module("Random number generation", function (hooks) {

    QUnit.test("Random generator generate same numbers for same seed", function (assert) {
        const random_generator_1 = get_seeded_random_generator("some");
        const generated_numbers_1 = new Array(100).fill(0).map(x => random_generator_1());

        const random_generator_2 = get_seeded_random_generator("some");
        const generated_numbers_2 = new Array(100).fill(0).map(x => random_generator_2());

        assert.deepEqual(generated_numbers_1, generated_numbers_2, '100 generated numbers are all equal');
    });

    QUnit.test("When starting the game, the first two cells are generated with the right probabilities", function (assert) {
        // TODO write get_starting_cells(seeded_random_generator)
    });
});