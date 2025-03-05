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
- When the users swipes down
- Then: 
  - the game board is updated as per the rules of the game
  - the current score is updated as per the rules of the game
  - the best score is updated as per the rules of the game

  
  ## ADR:
  - 

# Approach
- Implementation
  - We do require the application to export a function that collapses rows (or columns) of cells. Here we focus on `collapse_to_the_bottom` which takes a row from the board, and returns the updated row that should replace the old one. Once again, we are going to test that function first.

- Design:
  - We reuse `collapse_to_the_right` (See [Implementation](#implementation))
  - The already implemented `compute_score_after_collapse` ([a,b,c,d]) -> points to add to the current score can be reused as is, as the score increases as a result of collapsing cells, not as a result of the direction in which they collapse.

- Game rules for collapsing
> Tiles slide as far as possible in the chosen direction until they are stopped by either another tile or the edge of the grid. If two tiles of the same number collide while moving, they will merge into a tile with the total value of the two tiles that collided.[7][8] The resulting tile cannot merge with another tile again in the same move. Higher-scoring tiles emit a soft glow;[5] the largest possible tile is 131,072.[9]
>
> If a move causes three consecutive tiles of the same value to slide together, only the two tiles farthest along the direction of motion will combine. If all four spaces in a row or column are filled with tiles of the same value, a move parallel to that row/column will combine the first two and last two.[10] 

# Implementation
## collapse_to_the_bottom
- Swiping from top to down in the 4x4 array is the same as swiping right in the transposed array and trasnposing that
- e.g.
```
a,b,a,d                      0,0,0,0
c,c,0,d    =swipes down>     a,b,0,0
c,0,a,0                      c,c,2a,2d
c,b,b,a                      2c,b,b,a

                                |
                                t
                                r
same as                         a
                                n
                                s
                                p
                                o
                                s
                                e   
                                |
                                ∨

a,c,c,c                      0,a,c,2c
b,c,0,b    =swipes right>    0,b,c,b
a,0,a,b                      0,0,2a,b
d,d,0,a                      0,0,2d,a
```

## Rendering
No specific issue here:
- set swipe down key event handler
- when swipe down, extract the four rows of the board, transpose the matrix, compute the swiped rows, retranspose, and put that back in the board. If we extract the board state right then, the new four rows we recover should be our computed four rows exactly.

# Tests

## UI testing
- Our confidence is high enough that we are directly testing the rendered board for correctness and we use the identified property to perform that testing


# Screenshots

# Room for improvement
- refactor collapse_to_the_[right/left/down] into a single function with a direction parameter?

# Lessons learnt
## CSS

## JS

## AI

## Testing