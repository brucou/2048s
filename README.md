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
- given a game in progress, where a move to the right is possible, and the user does move to the right, the board switches to the right and is redrawn according to the game rules

CHANGED TO:
- Given:
  - a game in progress
- When the users swipes right
- Then: 
  - the game board is updated as per the rules of the game.
  - the score is updated as per the rules of the game.
  
  ## ADR:
  - Note that we don't include here more statement on the change in game status. The swipe right may lead to the user winning or loosing but the relevant requirement will be addressed later. This is of course arbitrary. The decision criteria is to keep the requirement small enough that ONE person can get it done in an arbitrary short amount of time.
  - Pros
    - decreases the complexity of the tests for the person writing the tests. Tests have to be simple enough that they don't have to be themself tested! Complexity is managed by keeping the unit of requirement under test small (requirement complexity), but also algorithmically simple (test implementation complexity).
  - Cons
    - Some requirements may depend on the requirement under test and thus can only be performed after tests are passing. In the case of a team of several developers, this reduces options to have several developers work on parallel on different requirements. 

  - Note that we focus on requirement linked to the user. We try to avoid testing implementation details. Implementation details change with the implementation, while the requirements stay identical. We strive to only have to rewrite tests as a result of change in requirements.
    - the function that returns the game status could be considered an implementation detail
    - the function `collapse_to_the_right` could be considered an implementation detail
    - Pros
      - the aforementioned. More value for a given engineering effort
    - Cons
      - it may not always be possible to abstract away implementation details. Those implementation details that are reified into tests should thus become requirements of their own.
      - for instance, `get_seeded_random_generator` is an implementation detail. However, an application that does not have this function will fail the test when it could perfectly be correctly implemented! , The function has thus become a *de facto* technical requirement. We try to minimize those. Also we have assumed but not tested that the function was actually used to generate the initial board. We tested that we had two non-empty cells when creating a new game but not the frequency at which the values of those cells appear. In other words, we did [gray box testing](https://en.wikipedia.org/wiki/Gray-box_testing) here.

# Approach
- Implementation
  - How do we know that the game is in progress????
    - we could require the application to export a function that returns the game status
      - but how do we test that function then? If we are able to create test conditions for various values of that function then we don't need the function anymore. We can directly create those conditions for testing that a game is in progress
    - so we don't. We are going to assume that when a user starts a new game (e.g., clicks on the new game button), the game is in progress. This assumption is actually a requirement in disguise.
  - We do require the application to export a function that collapses rows (or columns) of cells. Here we focus on `collapse_to_the_right` which takes a row from the board, and returns the updated row that should replace the old one. Once again, we are going to test that function first.

- Design:
  - `collapse_to_the_right` ([a,b,c,d]) -> [r,s,t,u] where a letter stands for either 0 or an integer power of 2
  - [r,s,t,u] should be the result of collapsing the row according to the game rules, as [taken from wikipedia](https://en.wikipedia.org/wiki/2048_(video_game)).

- Game rules for collapsing
> Tiles slide as far as possible in the chosen direction until they are stopped by either another tile or the edge of the grid. If two tiles of the same number collide while moving, they will merge into a tile with the total value of the two tiles that collided.[7][8] The resulting tile cannot merge with another tile again in the same move. Higher-scoring tiles emit a soft glow;[5] the largest possible tile is 131,072.[9]
>
> If a move causes three consecutive tiles of the same value to slide together, only the two tiles farthest along the direction of motion will combine. If all four spaces in a row or column are filled with tiles of the same value, a move parallel to that row/column will combine the first two and last two.[10] 

cf. ![example of swiping down before and after](./screenshots/swiping%20game%20rules%20illustration.png).

- Tests:
  - see [ADR](#adr)
  - 

# Implementation
## collapse_to_the_right
Following the aforementioned rules, we believe that they are equivalent to the following algorithm, which assumes that the function takes an array of arbitrary length that is strictly higher than 2 (there is no real point in playing the game on a 2x2 board)

```h
collapse_to_the_right ([...rest of values,c,d]) =
- 1. rest of values is empty => collapse_to_the_right_2(c,d)
- 2. rest of values is just one value => [that one value]
- 3. rest of values is at least two values:
  - 3a. all values are 0 => return a copy of that same thing 
  - 3b. d = 0 => [0, collapse_to_the_right([...rest of values, c])].flat
  - 3c. d != 0 &
    - c = d =>  [0, collapse_to_the_right(rest of values), 2c].flat
    - c != d & c = 0 => [0, collapse_to_the_right([...rest of values, d])].flat
    - c != d & c != 0 => [collapse_to_the_right([...rest of values,c]), d].flat

collapse_to_the_right_2(c,d):
- d = 0 => [0,c]
- d != 0 & c = d => [0, 2c]
- d != 0 & c != d => [c, d]
```

Quick properties of this algorithm:
- it is recursive
- it terminates:
  - 3a is a terminal case for the recursion
  - 3b and 3c lead to a reduction in the size of the array, eventually being 1 or 2, which are terminal cases with custom solutions
- 3c first item ensures that [2,2,2,2] behaves correctly: the first couple of 2 merge, but they can't later merge with the other couple of 2s
- 3d and 1 and 2 ensure that there is never 0 in the last position of the returned array unless we started with a 0-filled array
- 3b, 3c and 1 ensure that all 0s are on the left side

## Rendering
No specific issue here, whatever data structure we use to keep the board state, we need to extract the four rows from it, compute the swiped rows, and put that back in the board. If we extract the board state right then, the new four rows we recover should be our computed four rows exactly.

# Tests
- while our algorithm seems correct at first glance, it cannot be used as a definition of the rules, which are given in plain language. The only factible strategy is to check the algorithm on concrete cases. Full correctness can be proven by exhausting the test space.
- the test space for a row length of 4 is 47. They can be enumerated by considering that the test space is dictated by quatruplets with three cases of interest: number is 0, number is not 0 and appearing only once, number is not 0 and appearing several times. 
  - number of 4 zeros: 1
  - number of 3 zero x not zero number : 4x1
  - number of 2 zeros x (number appearing once or number appearing twice): 6x2
  - number of 1 zero x (three number same, two number same, three number different) = 4x3
  - no zero x (all same, three same, two same (other two different, or other two same), all different): 1x(1 + 4 + 6x(1+1) + 1)

Here are the cases with their corresponding results:
```
    # all letters non-zero and different
    a,b,c,d -> a,b,c,d
    # all letters non-zero and same
    a,a,a,a -> 0,0,2a,2a
    # two letter non-null same
    a,a,c,d -> 0,2a,c,d
    a,a,c,c -> 0,0,2a,2c
    a,b,b,d -> 0,a,2b,d
    a,b,c,b -> a,b,c,b
    a,b,c,c -> 0,a,b,2c
    a,b,a,d -> a,b,a,d
    a,b,c,a -> a,b,c,a
    a,b,a,b -> a,b,a,b
    a,b,b,a -> 0,a,2b,a
    # three letters non-null same
    a,a,a,d -> 0,a,2a,d
    a,b,a,a -> 0,a,b,2a
    a,b,b,b -> 0,a,b,2b
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

```
Errr we have 51 cases there... So either we have duplicated cases or we counted wrong. I'll let you figure out as an exercise which is it (Hint: the issue mostly lies in the notation that we used). While we are now doubting that we are covering the test space exhaustively, this is plenty of tests to get enough confidence in the game's correct behavior. We can supplement this approach (oracle-based testing) with property-based testing.

It would still be interesting to review this to get a full specification of the game rules based on the exhaustive list of cases.

## Property-based testing
- besides the zero array, every output has 0 only on the left side or has no zero at all (compactness property)
- the sum of the array in the input matches the sum in the output (invariance property)
- if numbers in the input are powers of 2, all numbers of the output are powers of 2
- whatever number is in the input, there are no strictly smaller number in the output (progress property)

It would also be interesting to establish whether those four properties are equivalent to the game rules, that is that they are not only necessary but sufficient.

# Screenshots


# Room for improvement
- As mentioned in [ADR](#adr), we have not actually properly tested that the cells in the start game are appearing with the required frequency.

# Lessons learnt
## CSS

## JS


## AI


## Testing
- Use gray box testing when its value overweighs its tradeoff. 100s of UI testing replaced by 100s of pure function testing can be such a case. But pick the option not by laziness but because it makes sense vs. the alternative. 
  - In the current case, we tested the swipe right algorithm on a pure function rather than an actual game board instrumented through automated tests because of the cost that there is in putting the board in a specific state. It is not clear if that is even possible at this stage, given that we haven't developed the game yet so the board can be put in any state through user actions.
  - In a previous case, where we tested the frequency of appearance of 2 and 4 in the initial stage of the game, it was more laziness that took over. It was not too much effort to click a hundred times the new game button and collect the initial cells. We'll leave it like that though and move on.
