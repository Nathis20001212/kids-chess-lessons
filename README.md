# Kids Chess Lessons ♞

An animated, voice-narrated chess lesson app for children. Each chapter of a chess book is turned into a guided lesson: the board plays the moves by itself, a voice explains every move and *why* it was played, and a friendly owl guide hops to each move so young learners keep their eyes on the board. After the lesson, an evaluation quiz tests what the child learned with scenarios taken from the same chapter.

It is a plain HTML/CSS/JavaScript web app with no build step. Open `index.html` in a browser and it runs.

## What's built so far

**Guided lesson (auto-play)**
- The game plays move by move on a timer. The child can pause, step back or forward, replay the current move, replay from the start, or drag the slider to any move.
- Each move is announced in plain words ("White Knight moves from d2 to f3") followed by the chapter's Book and Coach comments.
- A coloured path traces each move (orange for White, purple for Black; knights follow their L-shape) and fades once the piece lands.
- Alternative lines from the chapter ("What if White played 20.Bxb6+?") can be played as side lessons, with a button to return to the main game.
- Three speed settings: Slow, Normal, and Fast.

**Voice narration**
- English narration using the browser's built-in Speech Synthesis API (no API key, no server).
- Voice picker, a "Test voice" button, and a clear message when the browser or in-app viewer doesn't support speech. The lesson still plays with on-screen text in that case.

**Owl guide**
- An animated owl in a teacher's cap hops next to each moving piece and wanders around the board edges when idle. It cheers for correct quiz answers and shakes its head at wrong ones.

**Evaluation quiz**
- "Find the move" questions: the child plays the answer directly on the board (tap a piece, tap a square; legal moves are shown).
- Multiple-choice concept questions.
- Hints, specific feedback for common wrong moves, the answer revealed after two attempts, and a star score at the end.
- The board flips automatically when the child plays Black.

**Board and pieces**
- Classic brown board with the cburnett piece set (see credits below).
- Move legality is checked with chess.js, so every move in a chapter is validated when the page loads.

## Project structure

```
kids-chess-lessons/
├── index.html                 # page layout
├── css/
│   ├── style.css              # app styles, board, owl animations
│   └── pieces-cburnett.css    # piece images (embedded SVG)
├── js/
│   ├── app.js                 # lesson player, voice, owl, quiz
│   └── vendor/chess.js        # chess rules engine (v0.10.3)
└── chapters/
    └── chapter-01.js          # Chapter 1 content: moves, comments, variations, quiz
```

## Running it

No installation is needed. You can open `index.html` directly, or serve the folder locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

To host it for free, enable **GitHub Pages** (Settings → Pages → deploy from the `main` branch, root folder). The app will then be live at `https://nathis20001212.github.io/kids-chess-lessons/`.

For voice, use Chrome, Edge, or Safari. Some in-app browsers (inside messaging or other apps) don't support speech.

## Adding a new chapter

All content lives in a chapter file, so a new chapter doesn't need any changes to the app code.

1. Copy `chapters/chapter-01.js` to `chapters/chapter-02.js`.
2. Set `startFen` to the starting position.
3. Fill `mainLine` with moves in SAN, each with optional comments:
   ```js
   ["Bc5!", [["Book", "Why the book says this move is good..."],
             ["Coach", "A simpler explanation for kids..."]]]
   ```
4. Add `variations`. `at` is the index (in `mainLine`) of the move the variation replaces.
5. Add `quiz` questions. For `"move"` questions, `at` is the index of the move to find (the position before it is shown) and `ans` is the correct move. For `"mcq"` questions, give `options` and the `correct` index.
6. Point `index.html` at the new chapter file.

If a move is illegal, the page throws an error naming the move, which makes typos in the chapter text easy to catch.

## Chapter 1 notes

- The original chapter's FEN placed White's rook on a3, where it could simply capture Black's queen on a8. The variation 20.Bxb6+ Nxb6 21.Rxb6 Qa3 only works with the rook on **b3**, so the corrected FEN uses b3. With that change, every move in the main game and the variations is legal.
- The 27.h3 line in the source text was missing White's 28th move ("27...c4 28. ... d4"), so the lesson plays 27.h3 c4 and describes ...d4 in the comment.

## Roadmap / what to add next

- [ ] **Tamil voice**: pre-generate Tamil audio clips for each move (Azure / Google Cloud TTS `ta-IN`, or AI4Bharat Indic Parler-TTS) and play them in sync, with a Tamil/English switch. Pre-recorded audio works on every device, unlike the browser's built-in Tamil voice.
- [ ] **Tamil text mode**: show the original Tamil commentary alongside the English.
- [ ] **Chapter menu**: a home screen listing all chapters, with a loader instead of a hard-coded script tag.
- [ ] **PGN import**: a small tool that converts an annotated PGN chapter (moves + `{comments}` + variations) into a chapter file automatically.
- [ ] **Progress tracking**: save completed chapters and quiz stars per child.
- [ ] **More quiz types**: "which piece is attacked?", "find the safe square", timed puzzles.
- [ ] **Chess engine check**: optionally use Stockfish (WASM) to accept any equally good answer, not only the book move.
- [ ] **Offline / installable app**: make it a PWA, or wrap it as an Android app.
- [ ] **Sound effects**: move, capture, and check sounds that can be turned off.
- [ ] **Accessibility**: full keyboard play on the board and screen-reader move announcements.
- [ ] **Tests**: automated checks that every chapter's moves, variations, and quiz answers are legal.

## Credits and licences

- **Chess pieces:** cburnett set by Colin M.L. Burnett, taken from the [chessground](https://github.com/lichess-org/chessground) project (GPL-3.0).
- **chess.js** v0.10.3 by Jeff Hlywa, BSD 2-Clause licence (header kept in `js/vendor/chess.js`).
- **Font:** Baloo 2 via Google Fonts (SIL Open Font License).
- **Source game:** Cheparinov vs Vallejo Pons, Dresden Olympiad 2008. The commentary comes from the chapter material supplied for this project.

Because the piece set is GPL-3.0, the simplest compatible licence for this repository is GPL-3.0. See `THIRD_PARTY_NOTICES.md`.

## Author

**Shriganeshan Nathiskar** · [GitHub](https://github.com/Nathis20001212)
