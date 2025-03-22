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

  ## ADR:

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
![State machine for random move generator](./tests/state%20machine%20for%20random%20move%20generator.png)

- we instrument our program for a while to record the steps we take till we win a game  

# Implementation
Nothing special to mention.

## Rendering

# Tests
A lot of our UI tests are now failing. Moving the board in one direction now adds a number so deep equal comparison are going to fail. We thus need a comparison that is true with the predicted board except exactly one cell! Hence now, we are going to be comparing boards directly, not just rows. We changed the requirements by refining it further, so we have to refine the tests too. Lesson learnt: put the full requirement from the beginning. That is, specify all what should happen in response to a user event. Or accept the downside when there is enough benefit in implementing a smaller portion of the requirement first.

We'll remove the failing tests. They are now redundant, now that we will test the entire game, not just the first play. While those tests reached the end of their life, they were still useful to give us confidence for the intermediate implementation steps we took. Still on the fence whether in total, the benefit is positive or not.

## UI testing
That's all we'll do here. Thanks to our previous tests, we have functions that we trust compute the score and the board's expected state as a result of a user move (left/right/up/down). We also have functions that read the board state from the DOM (including wwhether the game is over). We only have to generate test games and then run our tests on it.

What is the test space for a game with n moves?
- events (5):
  - new game
  - swipe left
  - swipe right
  - swipe up
  - swipe down
- number of moves: n, unbounded
- so essentially 5^n games of length n

That grows very quickly, and not all tests generate the same amount of confidence. For instance, 1,200 different sequences of moves, none of which ever includes the new game button click generate as much confidence as a single one of those move. There are [several coverage strategies](https://arxiv.org/pdf/2203.09604) that can be applied when testing state machines, e.g.,:
- all-events coverage
- node coverage (also known as All States Coverage), in which we ensure that the test set leads to the state machine passing through all possible states
- edge coverage (also known as All Transitions coverage), in which we ensure that the test set leads to the state machine passing through all possible transitions at least once
- all-actions coverage

In an infinite test space, picking test cases that reveal bugs or provide confidence that most common cases and edge cases of interest will have been correctly tested is non-trivial. This is the choice we made:
- combination of randomly generated plays with random length
- Swing-and-switch play strategy
  - start, then move right abd left till no progress, then up and down, till no progress, repeat if progress between right/left and up/down phase, otherwise only send EOF
- Twirl-and-switch play strategy
  - same as Swing-and-switch, but move in a square instead of in a line

With a sufficient high length, those tests should achieve:
- all-events coverage
- all-state coverage
- all-transitions coverage

After all tests are concluded, we will provide a coverage report and reassess if the coverage is found to be unsatisfactory.

### UI testing design
Remember that we said that tests should simple enough that they don't have to be themselves tested? Here, we are in the case that we are going to write a lot of code to write the test generators, and then test the game from the generated sequence. So we are going to go step by step and test our tests. That is:

- design the test generators
- write the test generators
- test the test generators (oracle based testing preferred on a few manual examples)
- design the game rules testing (that uses the previously generated tests)
- test it based on manual tests
  - that requires reproductibility of the random components
  - We thus update our implementation design by including seed(s) paramters when sending the NEW_GAME event. Once we know the board and numbers that will be generated, we can do oracle-based testing.

The full algoritm can be conveniently described as a state machine. Please see:
- [the game's state machine](./tests/Game%20state%20machine.png)
- [the game test's state machine](./tests/game%20test%20state%20machine.png) that we derived from the game's state machine

# Screenshots

# Room for improvement

# Lessons learnt
## CSS

## JS
- given the time we spent writing those state machines but without maybe enough precision in the formalism we used in our drawing, the time we spent thinking on how to structure the code etc., we may have reached the point where it is worth introducing a dependency who did the leg work already for us. As usual, it is subjective, but if state machines are going to be a common test instrument, it should really be worth investing in a state machine library (cf. [kingly](https://brucou.github.io/documentation/)). In the same way, one would not rewrite a sort algorithm from scratch, it is better to use a (zero-dependency) library. Typical tradeoff of buy or make decisions. Let's sum pros and cons:
- Pros:
  - already tested (check the thoroughness of the tests though!!)
  - already comes with a design that (hopefully) is proven to work and makes implementation easy
  - may even comes with utilities and dev tools (visualization, debugging, etc.)
- Cons:
  - documentation is quite often lacking in third-party dependency - and so are tests...
  - may need to spend time reviewing//benchmarking competing libraries and evaluate their design (choice paradox)
  - learning curve depending on the existence of the above + examples
  - the tree may be packaged with the forest.

## AI
- Got a great answer to make an overlay that displays game over. Was a bit unclear where to add one CSS line but the answer was correct, it was my ignorance that caused the issue. After asking for clarification the issue was solved. AI is of greater help in the places where my skills or experience is weaker, which is the case of CSS.

## Testing
- State machines are great as specifications tools. They can be used to accurately but concisely describe the game play but also to test the game itself.
- A state diagram is far easier to test for bugs than code and generates more confidence about our implementation
- We made a mistake in our previous test when computing the score, resulting in tests passing (same mistake made both implementation and test so cancelling themselves out...) when they should not:
  - this: `const score_points = board_state.reduce((acc, row) => acc + compute_score_after_collapse(row), 0);` only applies to the right and left move. For the up and down move, we need to transpose the board before apply the compute score function!
  - Good. What do we learn from that?
  - First, we eventually found out the error now that we are going to write the tests for the entire game. Nice, but kind of late still.
  - Second, we should have relied on both the oracle and the property. Here, the problem is that we used a property and our property was wrong (for up and down). We would have caught that with the oracle. Reciprocally, if our oracle tests would be wrong somewhere, we are likely to catch those bugs with the property.
  - The end lesson is to use both oracle and PBT to check each other. I guess another lesson is, like when copy pasting, pay more attention. 
- We were hit by the modification of an implementation detail:
  - instead of one event for each type of swipe, we are now sending one swipe event parameterized by the direction (up/down/etc.).
  - it is a downside and a conscious choice. That validates the choice to use lenses to access state as the shape of state may often seen refactoring. Events, less so, though it happened now...
- We tried to use ES^6generators to implement the state machine. That was too smart for its own good. In the end, all we needed here was a function with a closure. Generators have their quirks, namely, you can create them with parameters, but the first `next` call is different from the others (the parameter is not passed the first time). Then the `yield` syntax is confusing. The `for...` loop is a nice syntax but it does not make sense to complicate the thinking only for a nice syntax. Also I was not fluent in the feature, I just wanted to use precisely to get more experience using them. So that's the mistake. The lesson: make it work the simplest way possible. I always try to do sth more complicated that it should be and I have to learn that lesson time and time again.
  - on the same note, ES6 generators are probably one of the least used features of JavaScript.
  - The more I do this work, the more I realize that all is just functions, data structures, and concurrency. And then a lot of syntax around those three.


- took way too long in setting fixed seeds so I could have reproductive tests...
- should have started with testing the move generators. It was too much to do both move generator and test state machine together. The barrier was that the move generator required simulating the move to pass the updated state but that was easier to solve that originally thought -> `play` function that runs a move. Ended up doing that much too late in the game after painful refactoring.
- After being sure that the move generator work fine, it is easier to focus on the game test state machine.
- What I tried to do in the beginning is to do half the move generator and half the game test state machine and combine them but it was too complex to find which pieces to do in each so a test would be possible. One again the learning is bring it to smaller pieces and find a way to test those pieces before assembling them into larger pieces.
- Refactoring is harder on long codes without types or IDE support. One can say to be extra careful but there will still be minor mistakes and some time wasted. In this case, it was not too much time lost. The idea to start with writing code that is repetitive and then refactor for conciseness is a good one. Just that the refactoring introduces bug because 2 pieces of codes can look very similar but one small thing change and the refactor introduced a bug. So, to do AFTER all tests are passing, it is better. OR suddenly start to type stuff just what is necessary to suppor the refactoring.
- I also forgot to implement the EOF event in the state machine. That mistake came from the lack of precision in the state machine I drew. "fails" is not an event, EOF is one. I implemented fails as it was obvious in the implementation flow and then EOF did not appear in the implementation but came from the move generator. This is also where types would have helped or forced surfacing that. 

- for reproductibility purposes, I had to set a fix value for the length of the tests and size of play sequence. Otherwise, the "rerun" a failing test would not work. Maybe using QUnit.config.seed would help, but it seems that only ensures tests are run in a specific order every time. Rerunning just one test should break that ordering.


- in the end it was way too much so we stop there and open another branch to continue
- lessons learnt, start with oracle testing even if it looks painfully manual. The added difficulty here was the randomness but we solved that with the seeds. Make the seeds a parameter so it can be tested. Design for test is the learning.

- conclusion: this was poorly planned, designed, and implemented which makes it a great learning experience.