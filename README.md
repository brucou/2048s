# What
Variations, musings, and learning good practices through the 2048 game

# Why
Writing down for myself and others some good practices for software development. Rather than abstractly list principles, everything will be derived from the specification and implementation of an actual application. Not too easy, not too hard, not too ugly, not too pretty. 

- We are not necessarily looking into making a top-notch app but rather identifying common issues in software development, and common solutions, and the rationale behind them.
- We are not looking either into the perfect technical writing, at least in a first iteration, but in the validity of the recommendations first and foremost (substance over presentation).

Let's see how far we can go.

# UI
- Gemini repeatedly failed to provide the specified UI over the course of five iterations with a hifi mockup provided in the last iteration. It seems to fail to recognize the notion of alignments. It could maybe do a better job with more instructions. 

Prompts:
> @UI.excalidraw Can you provide me with an html and css file that renders this low-fidelity wireframe? Note that "new game" is a button, "how to play" is a link linking to the bottom "how to play" section and "start playing" is also a link going back up to the top of the page
> ...
> Actual.png errm this is what I got with your code. Can you fix it so the board is actually a square???
> ...
> actual 2.png it is better but not quite there yet. First of all, the scores are on the right side. Second the board cells should evenly occupy the board space. There is a huge margin on the right. Can you please fix it/
> ...
> etc.

# Testing
- This time we do black box testing, i.e., we don't have an implementation of the game play that we can use. So we can only property-based testing.
- sequence of new game x n
  - test frequency of 2 and 4, all 2 and 4, only 2 numbers etc.
- INIT - NEW_GAME - [LEFT|RIGHT|UP|DOWN]* (the same all the time - how do I express that in regexp?)
  - once board state is the same, always the same after
- any sequence
  - score increases => 
    - board_state changed, 
    - difference with previous score is new cell value, so 2 or 4, and 90% of time is 2!
    - only one new cell
      - left -> diff every row, only one non null, and that is the row of the new cell, find the col by going right to left till the same sum is found, then next cell non null that's the new cell col
      - same for right/up/down
      - check that new cell positions are also random uniformly distributed
  - score stays the same => same number of numbers on the board, same value for those numbers (use a set to check) = no new cell!
  - score never decreases until new game event
  - best score never decreases, always above or equal score
  - right => numbers tightened to the right (no 0 in between)
  - same for left/up/down
  - one cell is 2048 => board is not changed by any event not new game, game status is over
  - no cell is 2048 => board is reset with new game
  - game status over => one cell is 2048 || board is full, there are no repeating number in any direction
  - left + space inside -> no more spaces inside on the right + board changed
  - same for right/up/down