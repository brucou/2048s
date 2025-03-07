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
- Given:
  - a game in progress
- When the users swipes up/down/left/right
- Then: 
  - the game board is updated as per the rules of the game
  - if there are empty cells, one of those, randomly chosen, is filled with a number that is either 2 or 4
  - after that number is added:
    - if there are no more moves (e.g., swipes up/down/left/right) that frees a cell in the board, the game is over
    - otherwise the game remains in progress

  ## ADR:
  - 

# Approach
- Implementation
  - new pieces of state
    - game_status: in progress, or over, or not started (reactively computed from the board state and the "new game" button click)

- Design:
  - randomness:
    - the empty cells are indexed, a random number is generated (with an independent seeded generator)
  - new cell:
    - the cell whose index is the random number modulo the number of empty cells is picked
  - can_still_move:
    - compute the board after all four swipes. If none of the four boards has at least one 0 (empty cell), then false else true

- Game rules for collapsing
> Tiles slide as far as possible in the chosen direction until they are stopped by either another tile or the edge of the grid. If two tiles of the same number collide while moving, they will merge into a tile with the total value of the two tiles that collided.[7][8] The resulting tile cannot merge with another tile again in the same move. Higher-scoring tiles emit a soft glow;[5] the largest possible tile is 131,072.[9]
>
> If a move causes three consecutive tiles of the same value to slide together, only the two tiles farthest along the direction of motion will combine. If all four spaces in a row or column are filled with tiles of the same value, a move parallel to that row/column will combine the first two and last two.[10] 

- Tests:
  - We generate N random game plays. For each, we choose a M random number of moves, then a random move for each turn, then apply that.
  - After each random move, we check that the game requirement holds

But we have no way to know that the game is over! So we add a requirement which is to add a board overlay that says game over. We can check the existence of the overlay in our tests. So even if the game is over, we can still send swipe events and check each time that the overlay remains put.

We should try to find some property or oracle testing so we can test all conditions of the requirements on games of arbitrary length.
Generate random game:
- start new game
- stack of moves = all four moves
- pick one from the stack
- apply it
- if the board does not change, pick another move
- if there are no moves left, the game is over -> check that the board says so, continue with the rest of the moves till chosen  number of moves reached
- if the move is possible, the board changes, and reset the stack
- iterate
- Properties:
  - every time a move is applied, either:
    - board stays the same, so do score and best score
    - board is moved and exactly one cell appears new, that cell is a 2 or a 4, score moves up, and maybe best score too
  - when no moves are moving the board observed once, it always remain like this.


In other words, the test is a state machine.

# Implementation
Nothing special to mention.

## Rendering

# Tests
A lot of our UI tests are now failing. Moving the board in one direction now adds a number so deep equal comparison are going to fail. We thus need a comparison that is true with the predicted board except exactly one cell! Hence now, we are going to be comparing boards directly, not just rows. We changed the requirements by refining it further, so we have to refine the tests too. Lesson learnt: put the full requirement from the beginning. That is, specify all what should happen in response to a user event. Or accept the downside when there is enough benefit in implementing a smaller portion of the requirement first.


## UI testing
That's all we'll do here. Thanks to our previous tests, we have functions that we trust compute the board's expected state as a result of a user move (left/right/up/down). We have functions that read the board state from the DOM. We only to generate user moves and compare actual vs. expected repeatedly. Tests will be considered passed if the sequence of moves does not generate a contradiction to the rules of the game. Test will be considered failed when such a contradiction is met. 

// TODO: talk about the test space = [events] x n
// and testing output of each event is according to game rules
// so also that no events prior to create new game is changing the board/score/etc.!!
// and also make it more clear that the test can be automaticaly derived from the game state machine
// it is not so obvious now

The full algoritm can be conveniently described as a state machine. Please see:
- [the game's state machine](./tests/Game%20state%20machine.png)
- [the game test's state machine](./tests/game%20test%20state%20machine.png) that we derived from the game's state machine

# Screenshots

# Room for improvement

# Lessons learnt
## CSS

## JS

## AI

## Testing
- State machines are great as specifications tools. They can be used to accurately but concisely describe the game play but also to test the game itself.
- A state diagram is far easier to test for bugs than code and generates more confidence about our implementation.