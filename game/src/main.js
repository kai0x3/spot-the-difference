// main.js — bootstrap: find the canvas, size it for crisp rendering on any
// display, start the game, and honour the maker's screenshot set-ups
// (?shot=cover|garden|reef|win freezes a deterministic mid-hunt moment so
// the entry screenshots are real renders of a game in progress).

import { createGame, VIEW_W, VIEW_H } from './engine.js';

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const game = createGame(canvas);

const shot = new URLSearchParams(window.location.search).get('shot');
if (shot) game.setupShot(shot);

game.start();
window.__twinTidesReady = true;
