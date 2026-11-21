# Twin Tides — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/kai0x3/spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/kai0x3/spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Entry for "Make the best spot the difference game" ($50, places 1–10 pay $5 each).
Free entry, no fee. Ends Sat 21 Nov 2026 16:51 UTC (23:51 WIB).

**Twin Tides** is an original spot-the-difference game. Two near-identical
pictures sit side by side — the original on the left, a changed copy on the
right — and the player hunts down every difference before the tide clock
runs out. All artwork is drawn in code with canvas paths; there are no
image assets and the game makes no network requests.

## The game

- **3 scenes, 18 differences:** Harbour at Dusk (5), Garden Picnic (6) and
  Coral Reef (7), each harder than the last. Differences are designed to be
  fair but not obvious: a stripe changes colour, a dinghy vanishes, a cherry
  leaves a cake, a chest snaps shut.
- **Click either picture** to mark a difference; a find rings it in green on
  both panels with a numbered badge, a sparkle burst and a chime, and the
  header counter (FOUND n/N, TO GO) always shows how many remain.
- **Time pressure you can feel:** each scene has a draining tide clock; a
  wrong click costs 25 points and 3 seconds and leaves a fading red X.
- **Hints that behave:** 3 hints per game, each 40 points, pulse an amber
  dashed ring around one unfound difference.
- **Scoring:** 100 points per find plus a time bonus of 2 points per second
  left when a scene is cleared. Title, scene-cleared, time-up and victory
  cards complete the flow; everything is playable with mouse, and H / R / M
  work from the keyboard.
- **Sound** is synthesised live with WebAudio (find chime, miss buzz, clear
  arpeggio) — no audio files.

## Layout

- `game/index.html` — the page; loads `game/src/main.js` as a module.
- `game/src/scenes.js` — the artwork: each scene painted twice from one
  painter, with the difference flags and click points as data.
- `game/src/engine.js` — state, input, HUD, markers, cards, scoring, timer.
- `game/src/audio.js` — the WebAudio synth.
- `game/src/main.js` — bootstrap and the maker's screenshot set-ups
  (`?shot=cover|garden|reef|win`, listed in `shots.json`).
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json` with the vendored library.
- `serve.ts` — a tiny local server for playing the game (`node serve.ts`).
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

## Screenshots

The four screenshots in `screenshots/` are real renders of the game in a
browser, taken mid-hunt: the cover shows Harbour at Dusk with 2 of 5
differences found and 3 still hiding; the reef shot is late in scene 3 with
the clock at 34 seconds and 2 differences to go.
