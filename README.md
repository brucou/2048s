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
  - define those 10/90 as constant
  - define the list of values to pick from (2,4) as constant too  
  - Handler placed on button goes like this:
    - randomly pick two numbers (10% chance a 4, 90$ chance a 2)
    - randomly pick two **distinct** locations on the board (there are such 2, we have 4x4 empty cells)
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
       -  In short, AI was helpful but it required a few iterations and checks to get it right
          -  AI starts with choosing the wrong formula to answer
          -  When prompted, it picks a better formula but a less accurate one as that formula works better with probabilities closer to 0.5 (coin toss) and we have 0.1 here
          -  checks were done throug standard google search and peeking on [Wikipedia](https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval) and [stackoverflow](https://softwareengineering.stackexchange.com/questions/147134/how-should-i-test-randomness)
          -  it did require spending some time to understand the topic to get some confidence about the answer and being a math bachelors definitely shortened that time. Your mileage may vary.
    -  In summary:
       -  95% => 100 trials: passes if number of 4s between 6 and 18
       -  99% => 100 trials: passes if number of 4s between 5 and 22
       -  95% => 1000 trials: passes if number of 4s between 83 and 121
       -  99% => 1000 trials: passes if number of 4s between 79 and 128
    -  We'll try 1000 trials first and if that's too slow, we'll downgrade to 100!
    -  This is not enough to prove the randomness of the generator but it is enough for our purposes to observe that we get 2s far more often than 4s. With those numbers we accept an observed ratio of 1/8 or 1/12 as OK vs the theoretical 1/10. 
    -  We also need to test the randomness of the location for the first two cells. That comes down to testing the uniform distribution between 1 and 4 (0 and 3 actually) of the abscissa and ordinate for the location. AI gave a great answer for this.
       -  the AI provided function had to be manually updated to accept different parameters but that was easy enough

 -  set_up_initial_board:
    -  .... how do we test this UI??  
    - Let's ask AI!!
       -  long story short, AI recommended Jasmine + Karma + some setup that was put in a codesandbox that could not be opened (did not exist...). Asking for other code playground also led to URL that did not exist or was the main page of the framework. At least, I discovered the onecompiler playground :-)
       -  Bottom line is let's try good old QUnit...
       -  Seems like it could work but we need to adjust the CSS a bit so we can see the test results next to the UI
          -  QUnit has a `qunit-fixture` section that is refreshed for every test. We put our app there and try it out.
          -  To see the app next to the HTML test reporter, we need to comment out some `position: fixed` or `position: absolute` so the HTML reporter does not override our UI.
       -  We realize now that we have no way to select the cell with coordinate (x,y)! So we have to modify our HTML so we can find that easily with a DOM selector query.
          -   This extra information would be data attributes. To follow HTML guidelines we should use the `data-*` syntax. Hence, `data-row`, `data-col` here.
          -   Remember that visible content should not be stored in data-attributes but in the HTML content somewhere
    - Every element of the user interface mentioned in the requirements should have a unique ID/selector (which will be used to test the requirement)
      - special efforts should be made not to change those names too often as they will break the tests...
      - but of course when the requirements will change, the tests will break but that's expected.
      - Typical work around is to not test those UI requirements that we expect will change soon or often

  - get_seeded_random_generator:
    - run twice with the same seed, get 100 numbers and check that we have the same numbers being generated

# Implementation
- One optimization is to use a single generated float number for stating cell locations, and use its truncation when multiplied by X and X*10
  - this may be faster assuming that the cost of generating a random number is largely above that of multiplying and truncating
  - we won't do that though, as we don't know that, and there is no need for such an early optimization

Patterns:
- no early optimization
- explicitly name core constants
- design for testing
  - use pure functions as much as possible

Useful links:
- [A complete guide to data attributes ](https://css-tricks.com/a-complete-guide-to-data-attributes/)
- [JavaScript notebook](https://scribbler.live/samples.html)
- [Event delegation summary](https://dev.to/shafayeat/mastering-javascript-event-delegation-3k2k)

# Tests
- Some errors done when following AI code. 
- In the end, we replaced set_up_initial_board with two functions:
  - reset_board
  - start_new_game
  - we only test start_new_game, which is the one matching the requirements for this branch
- !!!!! Even with the slight modifications of QUnit we performed, we still can't reach our goal to test the UI in the browser itself
  - What we wanted: 
    - test the UI's behavior in response to user actions
      - not test purely visual elements - that is better suited to visual testing or other techniques. That means we don't test animations, sounds, colors, fonts, layout, etc.
      - not too high focus on UI content (text of a button, etc.) - that is better suited to visual testing or other techniques. Also that is one of the most likely to change part of requirements so again cost/benefit analysis necessary to select which test cases to pursue.
      - test UI structure is as per requirements. E.g., there is a button, when clicked it does what is expected.
      - Only for those user actions that are easy enough to replicate that the cost/benefit is favourable. That means [simulating hovering over an area](https://stackoverflow.com/questions/17226676/how-to-simulate-a-mouseover-in-pure-javascript-that-activates-the-css-hover) is probably not worth the effort.
    - See failing tests and successful tests: we got that.
    - Rerun tests selectively and start with failing tests: we got that
    - UI tests that fails can be debugged directly in the same browser used by real users: we only partly got that
      - that means not stubbing the thing under test so we don't mock the browser but possibly other interfaced systems (e.g., network, database). So headless browsers, JSDom and the likes are out of consideration. However close they are to being a real browser, there is no such thing as the real thing.
      - We do mock the user (else this would be manual testing ain't it). But we do so as faithfully as possible. That means we need to check requirements by acting on the user interface like a user would (e.g., clicking button, filling fields, etc.). See previous remarks about cost/benefit caveats.
  - What we have:
        - tests that run directly in the browser next to the test runner
        - possibility to insert debugging instructions or use dev tools for failing tests
  - What we don't have:
        - the ability to restart from a fresh UI on every new test (QUnit fixture capability restore the HTML after every test but not the event handlers...)
        - because of DOM limitations/security, we can't faithfully mock all user interactions (see note about hovering and non-trusted events) from a JavaScript script.
  - ADR:
    - we will render the UI through JavaScript rather than through HTML and call the rendering in our test setups.
    - The good:
      - we have an SPA anyways so there was always going to be some JavaScript in there.
      - we can design the render function to get the user interface back to any suitable state for testing purposes
    - The bad:
      - well, it is extra work and thus extra bugs and work arounds so we need to keep it as simple as possible
      - as simple as possible means we may run into dead ends where the complexity is not worth the benefit... We'll see how to handle it when we get there.
    - The choice:
      - Using the `<template>` tag. Let's try and see if that would work well enough...
      - Use event delegation so event handler do not need to be recreated or removed when an element is replaced or destroyed.
- IT NOW WORKS!!
  - ![QUnit in action](./test%20passing%20snapshot.png)

# Screenshots

# Room for improvement


# Lessons learnt
## CSS

## JS
- Be careful when manipulating random generator
  - use the randomness algorithm that fits: for a game there is no need for crytography-grade random generation
  - beware that when rounding random floats to integer for instance to generate integers in a given interval, there is a small but non-zero likelihood that two subsequent generated numbers will be the same. It may not matter but if it does, act accordingly.

## AI
- One must absolutely check AI results, specially in those topics that require expertise. 
  - The problem is one may not have that expertise. Here, I have some mathematics background so it was easy for me to notice the error and navigate through the solution space to pick the right formula.
  - Even with the wrong formula, in this specific case, the interval was not far from the most accurate one and there would not be highly adverse consequences. Still, one must be rigorous, there is no way in general to know the impact of this imprecision on the rest of the codebase. 
  - AI shortened the time I would spend if I had to do it by myself from scratch though! 
  - In the second use of AI (how to determine that a random generator produces uniformly distributed numbers), AI was great and saved a lot of time. Reading through the die-hard tests did not lead me anywhere quickly.
- AI code completion feels really magic. However, it is also a distraction and can led to loosing flow when the completion is irrelevant and time is spent diverting from an original line of thought. That could however improve as one gets used to AI coding assistant? The jury is open.


## Testing
- It did took some time to test the randomness/frequencies for the first two cells. I believe that is an important enough requirement that makes it worth. However, the learning is to always compare the cost of writing a test vs. the value of having it. Don't test the stuff that does not matter.
- Given that I did find errors in the generation of the locations (the ordinate originally was sometimes above 4), the test was useful and a good decision. So the learning is the reverse one here. Do test the stuff that matters.

