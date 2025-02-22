# What
Variations, musings, and learning good practices through the 2048 game

# Why
Writing down for myself and others some good practices for software development. Let's see how far this goes.

# HL requirement for this branch

# Non-functional requirements and constraints
- application is distributed on the web through a public web page without any login
- game experience must be nice and enticing enough to generate spontaneous recognition and word-of-mouth

# Functional requirements for this branch
- Rules of the original 2048 game: https://www.baeldung.com/cs/2048-algorithm
- When the user comes to the game web page, it sees an initial screen with an empty board, a new game button, the best score so far -> https://classic.play2048.co/

# Approach
- Implementation
  - displaying  the web page will naturally happen as a result of publishing the page on a web server
  - The simplest at this stage is to implement the page with a mix of HTML and CSS, no JavaScript being necessary so far.
  - The CSS rules should be in a separate file
    - ADR: rules could be inlined in the HTML too (e.g., tailwind) but we decide against that as we anticipate wanting to iterate on the CSS rules and the simplest will be to isolate the CSS. Also we may use AI or we may use rules from other helper sites (e.g. StackOverflow) and we do not want to tie our hand with a CSS framework so early in the game. The underlying principle is to do the fastest simplest thing that works and refactor later.
- Tests:
  - At this stage, given that we don't really have closed requirements for the initial screen, we will use manual visual testing rather than automated testing.
  - Essentially, we iterate on the page till we are happy.

# Implementation
- HTML boilerplate: https://www.freecodecamp.org/news/basic-html5-template-boilerplate-code-example/
- Flexbox playground: https://flexbox-seven.vercel.app/, https://flexbox.tech/, https://www.flexbox.fun/app
- Copilot bing.com

# Lessons learnt
## CSS
- Firefox has the best tooling ever for flexbox debugging (used version 95.0b12 (64-bit))
- don't use font size in tags where no text is displayed
  - use font-size: 24px at parent level and that caused children height to be higher than expected (because of line height of font in parent, even when the font size was overriden in the child)
- use margin bottom and right always when needed, don't use margin left and top. Margin collapsing is a nightmare to reason about. This avoid collapsing ever happening.
- vertical spacing quickly feels arbitrary. A scale or some vertical spacing strategy and a grid would help a lot.

## AI
- Copilot did not do too bad a job. It is likely that the entire styles could have been determined by iterating on it. Worth trying with instructions like "a little bit higher there, a little bit more vertical space between this and that" and see if it changes completely the structure or continue to use flex

