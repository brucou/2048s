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
  - a game just started
- When the users swipes left
- Then: 
  - the game board is updated as per the rules of the game
  - the current score is updated as per the rules of the game
  - the best score is updated as per the rules of the game

  
  ## ADR:
  - 

# Approach
- Implementation
  - We do require the application to export a function that collapses rows (or columns) of cells. Here we focus on `collapse_to_the_left` which takes a row from the board, and returns the updated row that should replace the old one. Once again, we are going to test that function first.

- Design:
  - `collapse_to_the_left` ([a,b,c,d]) -> [r,s,t,u] where a letter stands for either 0 or an integer power of 2
  - [r,s,t,u] should be the result of collapsing the row according to the game rules, as [taken from wikipedia](https://en.wikipedia.org/wiki/2048_(video_game)).
  - The already implemented `compute_score_after_collapse` ([a,b,c,d]) -> points to add to the current score can be reused as is, as the score increases as a result of collapsing cells, not as a result of the direction in which they collapse.

- Game rules for collapsing
> Tiles slide as far as possible in the chosen direction until they are stopped by either another tile or the edge of the grid. If two tiles of the same number collide while moving, they will merge into a tile with the total value of the two tiles that collided.[7][8] The resulting tile cannot merge with another tile again in the same move. Higher-scoring tiles emit a soft glow;[5] the largest possible tile is 131,072.[9]
>
> If a move causes three consecutive tiles of the same value to slide together, only the two tiles farthest along the direction of motion will combine. If all four spaces in a row or column are filled with tiles of the same value, a move parallel to that row/column will combine the first two and last two.[10] 

cf. ![example of swiping down before and after](./screenshots/swiping%20game%20rules%20illustration.png).

- Tests:
  - see [ADR](#adr)
  - 

# Implementation
## collapse_to_the_left
The following relation holds:
- collapse_to_the_left ([a,b,c,d]) = reverse (collapse_to_the_right(reverse([a,b,c,d])))
- where reverse([a,b,c,d]) = [d,c,b,a]

## Rendering
No specific issue here:
- set swipe left key event handler
- when swipe left, extract the four rows of the board, compute the swiped rows, and put that back in the board. If we extract the board state right then, the new four rows we recover should be our computed four rows exactly.

# Tests
- We use a property for implementation, we thus avoid using that same property for testing. Instead, we use oracle testing for verification:

Here are the cases with their corresponding results (different letters mean different values):
```go
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

```


## Property-based testing (PBT)
We could do some PBT based on other properties that are not used for the implementation. But we'll save ourselves the trouble as we are happy already about the confidence generated so far by previous tests for `collapse_to_the_right`.

## UI testing
Largely same as those for collapse_to_the_right

# Screenshots

# Room for improvement
- refactor collapse_to_the_[right/left] into a single function with a direction parameter?

# Lessons learnt
## CSS

## JS

## AI

## Testing
- be careful with copy pasting. I made a mistake in a few of the oracle tests. E.g., [a,a,a,0] -> [a,2a,0,0] instead of [2a,a,0,0]