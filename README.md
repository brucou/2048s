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