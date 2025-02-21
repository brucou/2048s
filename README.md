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
- 
