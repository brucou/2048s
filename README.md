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
  - Displaying  the web page will naturally happen as a result of publishing the page on a web server. We use GitHub pages for this purpose.
  - The simplest at this stage is to implement the page with a mix of HTML and CSS, no JavaScript being necessary so far.
  - The CSS rules should be in a separate file
    - ADR: rules could be inlined in the HTML too (e.g., tailwind) but we decide against that as we anticipate wanting to iterate on the CSS rules and the simplest will be to isolate the CSS. Also we may use AI or we may use rules from other helper sites (e.g. StackOverflow) and we do not want to tie our hand with a CSS framework so early in the game. The underlying principle is to do the fastest simplest thing that works and refactor later.
- Tests:
  - At this stage, we don't really have closed requirements for the initial screen. We will then postpone automated tests till we have some stability in those requirements. Because change in requirements means change in test cases, we will test only those requirements that are likely not to change, or that are key to the application usability. This is in order not to commit engineering efforts that provide short-lived value.
  - We will use manual visual testing for those requirements that are likely to change.
  - Essentially, we iterate on the page till we are happy enough.

# Implementation
- Publishing in GitHub pages: https://medium.com/@itspaulolimahimself/deploying-a-react-js-spa-app-to-github-pages-58ddaa2897a3
- HTML boilerplate: https://www.freecodecamp.org/news/basic-html5-template-boilerplate-code-example/
- Flexbox playground: https://flexbox-seven.vercel.app/, https://flexbox.tech/, https://www.flexbox.fun/app
- Copilot -> bing.com
- Published -> https://brucou.github.io/2048s/

# Tests
Following manual visual testing:
- Results are acceptable enough not to block progressing with the rest of the requirements. However, some defaults are visible and left for later
  - homogeneity of font, color, vertical spacing
  - some padding around score may make it look nicer
- For now, only adjusted down the dimensions of the cells so the board fits in one screen (assuming 1360x768 res)

# Screenshots
![Initial screen](./2048s%20-%20initial%20screen.png)

# Room for improvement
- There are some dependencies within the CSS that are not visible in the code
  - width of app is tied to the size of the cells of the board (100px cell -> 450px app, 80 -> 390)
  - esthetically pleasing vertical spacing is likely to depend on font size and should follow a scale

# Lessons learnt
## CSS
- Firefox has the best tooling ever for flexbox debugging (used version 95.0b12 (64-bit))
- don't use font size in tags where no text is displayed
  - use font-size: 24px at parent level and that caused children height to be higher than expected (because of line height of font in parent, even when the font size was overriden in the child)
- use margin bottom and right always when needed, don't use margin left and top. Margin collapsing is a nightmare to reason about. This avoid collapsing ever happening.
- vertical spacing quickly feels arbitrary. A scale or some vertical spacing strategy and a grid would help a lot.

## AI
- Copilot did not do too bad a job. It is likely that the entire styles could have been determined by iterating on it. Worth trying with instructions like "a little bit higher there, a little bit more vertical space between this and that" and see if it changes completely the structure or continue to use flex

