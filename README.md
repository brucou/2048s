# What
Variations, musings, and learning good practices through the 2048 game

# Why
Writing down for myself and others some good practices for software development. Rather than abstractly list principles, everything will be derived from the specification and implementation of an actual application. Not too easy, not too hard, not too ugly, not too pretty. 

- We are not necessarily looking into making a top-notch app but rather identifying common issues in software development, and common solutions, and the rationale behind them.
- We are not looking either into the perfect technical writing, at least in a first iteration, but in the validity of the recommendations first and foremost (substance over presentation).

Let's see how far we can go.

# HL requirement for this branch

# Non-functional requirements and constraints
- application is distributed on the web through a public web page without any login
- game experience must be nice and enticing enough to generate spontaneous recognition and word-of-mouth

# Functional requirements for this branch
- Rules of the original 2048 game: https://www.baeldung.com/cs/2048-algorithm
- When the user comes to the game web page, it sees an initial screen with an empty board, a new game button, the best score so far -> https://classic.play2048.co/
- When user starts the game, he sees initial board with two 2/4 screen 10% probability, and a restart game button and a score initialized to 0

# Approach
- Implementation
  - we are going to need JavaScript now to handle the click on the "new game" button
  - Handler placed on button goes like this:
    - randomly pick two numbers (10% chance a 4, 90$ chance a 2)
    - randomly pick two **distinct** locations on the board (there are such 2, we have 4x4 empty cells)
    - define those 10/90 as constant
    - define the list of values to pick from (2,4) as constant too
    - display the chosen number in the chosen locations

- Design:
  - Pure function get_seeded_random_generator (seed)
    - ADR: we chose seedable random generator to make it easier to test functions who use random generation
    - for now, set the seed to Math.random()
    - see what AI recommends as code or library
  - Pure function get_starting_cells(seeded_random_generator):
    - Note: function is pure because the seeded random generator will always generate the same list of values as determined from its seed
    - get two random integer numbers between 0 and 100, 0 <= x < 10 -> cell has a 4, 10 <= x, cell has a 2
    - get two random integer numbers between 0 and X, with X > size of board = 16 (so every cell is reachable!)
      - the cell coordinate X will be the number mod 4, i.e. integer number = 14 => cell position = 2; integer number = 15 => cell number = 4
      - the cell coordinate Y will be the number mod 16 div 4
        - with div(x,y) = Math.trunc(x/y) so that x === div(x, y) * y + x % y
      - NOTE: (0,0) is the top left corner of the board, (3,3) is the bottom right corner of the board
      - NOTE: Because all cells are initially empty, the chosen locations are necessarily free
      - if both numbers are the same, rinse and repeat! (the probability of that is vanishingly small but non zero and we need to handle it)
  - Impure function (DOM read, DOM write) set_up_initial_board([number, x, y], [number, x, y])
    - For each of the two parameters:
      - Find the selector for the DOM element to be updated (coordinates are x,y)
      - Update that selector so it displays the number

- Tests:
  - get_starting_cells
    -  we will pass a custom made seeded random generator
    -  we will run it 100 times
    -  we will fail the test if the number of 2 < ??.
    -  Let's ask AI :-)
       -  The full conversation is [here](./ai%20prompt%20and%20answer%20-%20how%20to%20test%20random%20generator.txt)
       -  [Wikipedia on binomial proportion confidence intervals](https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval)

# Implementation
- One optimization is to use a single generated float number for stating cell locations, and use its truncation when multiplied by X and X*10
  - this may be faster assuming that the cost of generating a random number is largely above that of multiplying and truncating
  - we won't do that though, as we don't know that, and there is no need for such an early optimization

Patterns:
- no early optimization
- explicitly name core constants
- design for testing
  - use pure functions as much as possible


# Tests
...

# Screenshots

# Room for improvement
.

# Lessons learnt
## CSS

## JS
- Be careful when manipulating random generator
  - use the randomness algorithm that fits: for a game there is no need for crytography-grade random generation
  - beware that when rounding random floats to integer for instance to generate integers in a given interval, there is a small but non-zero likelihood that two subsequent generated numbers will be the same. It may not matter but if it does, act accordingly.

## AI
- ..