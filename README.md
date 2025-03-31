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
  - if the user move leads to a change in the board:
    - the score is updated
    - the best score is updated if the score is higher than the best score
    - a new number, 2 (90% of the time) or 4, is added to the board, picked randomly from the empty cells
      - if there are no more moves (e.g., swipes up/down/left/right) that frees a cell in the board, the game is over
      - otherwise the game remains in progress

See [the game's state machine](./tests/Game%20state%20machine.png).

# Approach
- Implementation
We are mainly going to implement tests in this phase and fix the failing ones if any. Summary of last step:
- we made state machines for the game testing
- we have one game move generator (swing and switch play strategy)
- those tests pass, but we are still lacking coverage:

![](./tests/coverage%20swing%20and%20switch.png)

Assuming our testing state machine is correct, the previous illustration showcases the coverage of the game state machine that we obtained from the previous tests. In blue are the game paths that our swing and switch plays have taken. Thickness indicates how many times the generated game play took that game path. This shows clearly that:

- we haven't test the restarting of a game
- we haven't test the game end condition which is when the user actually wins the game

This is one value of using state machines for both game modelization and game tests. It helps us litterally see where remaining bugs could hide and a path to chase them.

All this was transition coverage. A state machine is state and transitions, but the data it encapsulates. Regarding data coverage, our swing and switch strategy:
- did not allow us to test the best score computation in the case when the best score comes from a previous game
- did not allow us to test that 2048 ends the game and there is no game with a higher value than that
- we did test that new cells are 2 or 4 and only one new cell (if any) appear after a move

In the light of this, the swirl and switch is not likely to help us get more state/transition coverage. It will increase our data coverage (we may get longer game plays) but not in significant ways:
- to test user wins, we have no other choice than to, well, win a game for a given seed, and test back the moves that were executed to win
- to increase data coverage for best score, we can just run a game, then simulate a new game click, then run another game. We can do that by taking two sequence of plays from the swing and switch strategy and intercalating a new creation in between. An alternative is to put the board is a specific state where a single move wins the game. I decided against that as once again that requires knowing internals of the implementation.

So, we decide against writing the swirl and switch game play generator -- though it would have been fun to see it run. 

The last strategy is to generate moves randomly, so at any point of time, the next move could be any of the registered moves for the application. This, done with enough repetition, would allow us to test the paths from our illustration that are not in blue (with the exception of a user wins which is unlikely enough to not come up by chance).

Lastly, we are going to test the 2048 winning condition with a sample game with a known seed that we have played and win. In summary:

- we implement the random move generator
![State machine for random move generator](./tests/random%20game%20generator.png)

- we find a loosing game
- we find a winning game
- we make a game that ends and then start another game to finalize our transition coverage

# Implementation
Nothing special to mention.

## Rendering

# Tests

## UI testing

### UI testing design


# Screenshots
- Coverage swing and switch strategy:

![Coverage swing and switch strategy](./tests/coverage%20swing%20and%20switch.png)


- Coverage random game strategy combined with swing and switch:

![Coverage random game strategy combined with swing and switch](./tests/random%20game%20aggregated%20state%20coverage.png)

- Sample test results for random game strategy:

![Sample test results for random game strategy](./tests/random%20game%20sample%20test%20results.png)

# Room for improvement
- Refactor the tests so they are more readable. Adding the state machines introduced a lot of code to the test. It is worth isolating, testing separately, and documenting (whether through types or text).

# Lessons learnt
## CSS

## JS
- types would have helped when handling the coverage display and analysis. As the corresponding code gets long, and as it it written in semi-improvised way, types offer refactoring support. Tests also do, but we are precisely in the test code, and we are not using tests to test our test functions. That's the second learning, when something is too complex, there should be a test that it works as expected. The hope that the code would remain small and easy was wrong. It snowballed into something hard to keep in one's hand days down the road.

## AI
- pay special attention to markdown completion of files. It often gets the wrong file...

## Testing
- we found a bug: when we start a new game, we were also setting the best score back to 0! Our random game strategy allowed us to find it.
- we still haven't covered all the transitions :-) In particular we don't have test that restart a game once the game is over. Lessons learnt: state machines are great to identify those edge cases
- refactoring the event detail for INITIALIZE_APP led to refactoring the tests too. Lesson learnt, same as before, test fails so we can catch easily the bug
- Approx. 6,000 assertions in approx. 6s. Not too bad, but it starts to lag. While it is manually possible to skip some tests and put them back. It could also valuable to reduce the amount of tests.