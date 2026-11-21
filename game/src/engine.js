// engine.js — the rules of Twin Tides: two panels, one true scene and one
// altered copy, a clock that will not wait, and a score that rewards sharp
// eyes. This file owns the game state (which scene, what is found, how long
// is left), the input (clicks on either panel, the hint / restart / sound
// buttons, the keys), and every pixel outside the scenes themselves: the
// header chips with the remaining counter, the found markers, the message
// line, and the title / cleared / game-over / victory cards.

import { LEVELS, SCENE_W, SCENE_H } from './scenes.js';
import { playFind, playMiss, playHint, playClear, playOver, setMuted, isMuted } from './audio.js';

export const VIEW_W = 1280;
export const VIEW_H = 800;

const PANEL_Y = 96;
const LEFT_X = 36;
const RIGHT_X = 684;
const ALL_DIFFS = LEVELS.map((level) => new Set(level.differences.map((_, i) => i)));

const BUTTONS = {
  hint: { x: 812, y: 714, w: 148, h: 54, label: 'HINT' },
  restart: { x: 976, y: 714, w: 148, h: 54, label: 'RESTART' },
  sound: { x: 1140, y: 714, w: 104, h: 54, label: 'SOUND' },
};
const CARD_BUTTON = { x: 490, y: 512, w: 300, h: 62 };

export function createGame(canvas) {
  const ctx = canvas.getContext('2d');
  const game = {
    screen: 'title',
    levelIndex: 0,
    found: new Set(),
    score: 0,
    scoreAtLevelStart: 0,
    hintsLeft: 3,
    timeLeft: LEVELS[0].seconds,
    message: '',
    missMarks: [],
    hintDiff: -1,
    hintUntil: 0,
    particles: [],
    frozen: false,
    shotClock: 1200,
    lastTs: 0,
  };

  const level = () => LEVELS[game.levelIndex];
  const now = () => (game.frozen ? game.shotClock : performance.now());

  function startLevel(index, keepScore) {
    game.levelIndex = index;
    game.found = new Set();
    game.timeLeft = LEVELS[index].seconds;
    if (!keepScore) game.score = game.scoreAtLevelStart;
    game.scoreAtLevelStart = game.score;
    game.message = LEVELS[index].tagline;
    game.missMarks = [];
    game.hintDiff = -1;
    game.screen = 'play';
  }

  function startGame() {
    game.score = 0;
    game.scoreAtLevelStart = 0;
    game.hintsLeft = 3;
    startLevel(0, true);
  }

  function findDifference(index, panelX) {
    game.found.add(index);
    game.score += 100;
    game.message = level().differences[index].label + '  +100';
    playFind();
    const d = level().differences[index];
    spawnParticles(panelX + d.x, PANEL_Y + d.y);
    if (game.hintDiff === index) game.hintDiff = -1;
    if (game.found.size === level().differences.length) {
      const bonus = Math.ceil(game.timeLeft) * 2;
      game.score += bonus;
      game.message = 'Scene cleared! Time bonus +' + bonus + '.';
      playClear();
      game.screen = game.levelIndex === LEVELS.length - 1 ? 'win' : 'clear';
    }
  }

  function missClick(x, y) {
    game.score = Math.max(0, game.score - 25);
    game.timeLeft = Math.max(0, game.timeLeft - 3);
    game.message = 'Not there. −25 points, −3 seconds.';
    game.missMarks.push({ x, y, until: now() + 650 });
    playMiss();
  }

  function useHint() {
    if (game.screen !== 'play' || game.hintsLeft <= 0) return;
    const open = level().differences.map((_, i) => i).filter((i) => !game.found.has(i));
    if (!open.length) return;
    game.hintsLeft -= 1;
    game.score = Math.max(0, game.score - 40);
    game.hintDiff = open[Math.floor(Math.random() * open.length)];
    game.hintUntil = now() + 1900;
    game.message = 'Somewhere inside the amber ring… −40 points.';
    playHint();
  }

  function spawnParticles(x, y) {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + Math.random() * 0.4;
      const sp = 40 + Math.random() * 90;
      game.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 30,
        born: now(),
        life: 620 + Math.random() * 260,
        colour: ['#ffd93d', '#2ec4b6', '#ffffff', '#ff8fa3'][i % 4],
      });
    }
  }

  // ------------------------------------------------------------ drawing ---
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function chip(x, y, w, label, value, accent) {
    roundRect(x, y, w, 44, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 12, y + 17);
    ctx.fillStyle = accent || '#ffffff';
    ctx.font = '700 19px system-ui, sans-serif';
    ctx.fillText(value, x + 12, y + 38);
  }

  function drawHeader() {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd93d';
    ctx.font = '800 30px system-ui, sans-serif';
    ctx.fillText('TWIN TIDES', 36, 40);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '500 14px system-ui, sans-serif';
    ctx.fillText('spot the difference', 38, 64);

    const lv = level();
    const total = lv.differences.length;
    const foundCount = game.found.size;
    chip(316, 14, 218, 'SCENE ' + (game.levelIndex + 1) + ' OF ' + LEVELS.length, lv.name, '#7ee0d2');
    chip(546, 14, 128, 'FOUND', foundCount + ' / ' + total, '#a7e8a0');
    chip(686, 14, 128, 'TO GO', String(total - foundCount), total - foundCount <= 2 ? '#ffb3c6' : '#ffffff');
    chip(826, 14, 128, 'SCORE', String(game.score), '#ffd93d');
    // time chip with a draining bar
    chip(966, 14, 278, 'TIME LEFT', Math.ceil(game.timeLeft) + 's', game.timeLeft <= 30 ? '#ff8fa3' : '#ffffff');
    const frac = Math.max(0, game.timeLeft / lv.seconds);
    roundRect(978, 50, 254, 5, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();
    roundRect(978, 50, 254 * frac, 5, 3);
    ctx.fillStyle = game.timeLeft <= 30 ? '#ff5d73' : '#2ec4b6';
    ctx.fill();
  }

  function drawPanel(panelX, applied) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    roundRect(panelX, PANEL_Y, SCENE_W, SCENE_H, 14);
    ctx.fillStyle = '#0b1526';
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundRect(panelX, PANEL_Y, SCENE_W, SCENE_H, 14);
    ctx.clip();
    ctx.translate(panelX, PANEL_Y);
    level().paint(ctx, applied);
    drawMarkers(ctx);
    ctx.restore();

    roundRect(panelX, PANEL_Y, SCENE_W, SCENE_H, 14);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawMarkers(panelCtx) {
    const t = now();
    level().differences.forEach((d, i) => {
      if (game.found.has(i)) {
        const pulse = game.frozen ? 0 : Math.sin(t / 280) * 1.6;
        const r = Math.max(15, d.r * 0.66) + pulse;
        panelCtx.beginPath();
        panelCtx.arc(d.x, d.y, r, 0, Math.PI * 2);
        panelCtx.strokeStyle = '#37e08b';
        panelCtx.lineWidth = 4.5;
        panelCtx.stroke();
        panelCtx.beginPath();
        panelCtx.arc(d.x, d.y, r, 0, Math.PI * 2);
        panelCtx.strokeStyle = 'rgba(255,255,255,0.85)';
        panelCtx.lineWidth = 1.6;
        panelCtx.stroke();
        panelCtx.beginPath();
        panelCtx.arc(d.x + r * 0.72, d.y - r * 0.72, 10, 0, Math.PI * 2);
        panelCtx.fillStyle = '#37e08b';
        panelCtx.fill();
        panelCtx.fillStyle = '#08331c';
        panelCtx.font = '800 12px system-ui, sans-serif';
        panelCtx.textAlign = 'center';
        panelCtx.fillText(String(i + 1), d.x + r * 0.72, d.y - r * 0.72 + 4);
      } else if (i === game.hintDiff && t < game.hintUntil) {
        const rr = d.r + 8 + Math.sin(t / 90) * 4;
        panelCtx.beginPath();
        panelCtx.arc(d.x, d.y, rr, 0, Math.PI * 2);
        panelCtx.strokeStyle = '#ffb703';
        panelCtx.lineWidth = 4;
        panelCtx.setLineDash([10, 7]);
        panelCtx.stroke();
        panelCtx.setLineDash([]);
      }
    });
  }

  function drawCaptions() {
    ctx.font = '700 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText('· THE ORIGINAL ·', LEFT_X + SCENE_W / 2, 662);
    ctx.fillStyle = '#ffd93d';
    ctx.fillText('· THE CHANGED COPY — CLICK A DIFFERENCE IN EITHER PICTURE ·', RIGHT_X + SCENE_W / 2, 662);
  }

  function drawButton(rect, label, enabled, accent) {
    roundRect(rect.x, rect.y, rect.w, rect.h, 12);
    ctx.fillStyle = enabled ? (accent || '#274b73') : 'rgba(255,255,255,0.07)';
    ctx.fill();
    ctx.strokeStyle = enabled ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = enabled ? '#ffffff' : 'rgba(255,255,255,0.35)';
    ctx.font = '700 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 6);
  }

  function drawBottomBar() {
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = '600 19px system-ui, sans-serif';
    wrapText(game.message, 36, 726, 740, 26);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '500 13px system-ui, sans-serif';
    ctx.fillText('Keys: H hint · R restart scene · M sound', 36, 780);
    drawButton(BUTTONS.hint, 'HINT × ' + game.hintsLeft, game.screen === 'play' && game.hintsLeft > 0, '#8a6d1d');
    drawButton(BUTTONS.restart, 'RESTART', game.screen === 'play' || game.screen === 'over');
    drawButton(BUTTONS.sound, isMuted() ? 'MUTED' : 'SOUND', true);
  }

  function wrapText(text, x, y, maxWidth, lineHeight) {
    const words = String(text).split(' ');
    let lineText = '';
    let lineNo = 0;
    for (const word of words) {
      const trial = lineText ? lineText + ' ' + word : word;
      if (ctx.measureText(trial).width > maxWidth && lineText) {
        ctx.fillText(lineText, x, y + lineNo * lineHeight);
        lineText = word;
        lineNo += 1;
        if (lineNo > 1) return;
      } else {
        lineText = trial;
      }
    }
    if (lineText) ctx.fillText(lineText, x, y + lineNo * lineHeight);
  }

  function drawMissMarks() {
    const t = now();
    game.missMarks = game.missMarks.filter((m) => t < m.until);
    for (const m of game.missMarks) {
      const alpha = Math.max(0, (m.until - t) / 650);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#ff5d73';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(m.x - 11, m.y - 11);
      ctx.lineTo(m.x + 11, m.y + 11);
      ctx.moveTo(m.x + 11, m.y - 11);
      ctx.lineTo(m.x - 11, m.y + 11);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawParticles(dt) {
    const t = now();
    game.particles = game.particles.filter((p) => t - p.born < p.life);
    for (const p of game.particles) {
      const age = (t - p.born) / 1000;
      const x = p.x + p.vx * age;
      const y = p.y + p.vy * age + 130 * age * age;
      ctx.globalAlpha = Math.max(0, 1 - (t - p.born) / p.life);
      ctx.fillStyle = p.colour;
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }
    ctx.globalAlpha = 1;
  }

  function drawCard(title, lines, buttonLabel, titleColour) {
    ctx.fillStyle = 'rgba(5,10,20,0.72)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    roundRect(340, 196, 600, 392, 22);
    ctx.fillStyle = '#10233c';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,217,61,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = titleColour || '#ffd93d';
    let titleSize = 44;
    ctx.font = '800 ' + titleSize + 'px system-ui, sans-serif';
    while (ctx.measureText(title).width > 552 && titleSize > 24) {
      titleSize -= 2;
      ctx.font = '800 ' + titleSize + 'px system-ui, sans-serif';
    }
    ctx.fillText(title, VIEW_W / 2, 282);
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.font = '500 20px system-ui, sans-serif';
    lines.forEach((text, i) => ctx.fillText(text, VIEW_W / 2, 336 + i * 34));
    drawButton(CARD_BUTTON, buttonLabel, true, '#1f7a4d');
  }

  function draw() {
    const bg = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    bg.addColorStop(0, '#0d1b2e');
    bg.addColorStop(1, '#12293f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    drawHeader();
    drawPanel(LEFT_X, new Set());
    drawPanel(RIGHT_X, ALL_DIFFS[game.levelIndex]);
    drawCaptions();
    drawMissMarks();
    drawParticles();
    drawBottomBar();
    if (game.screen === 'title') {
      drawCard('TWIN TIDES', [
        'Two pictures, side by side. One of them is lying.',
        'Find every difference before the tide clock runs out.',
        '3 scenes · 18 differences · a wrong click costs time',
        'Hints are precious: only 3, and each costs 40 points.',
      ], 'START HUNTING');
    } else if (game.screen === 'clear') {
      drawCard('SCENE CLEARED!', [
        level().name + ' — every difference found.',
        'Score so far: ' + game.score,
        'Next: ' + LEVELS[game.levelIndex + 1].name + ' hides ' +
          LEVELS[game.levelIndex + 1].differences.length + ' differences.',
      ], 'NEXT SCENE');
    } else if (game.screen === 'over') {
      drawCard('THE TIDE WENT OUT', [
        'Time ran out on ' + level().name + '.',
        'You found ' + game.found.size + ' of ' + level().differences.length + ' differences.',
        'The scene restarts; your score returns to ' + game.scoreAtLevelStart + '.',
      ], 'TRY THE SCENE AGAIN', '#ff8fa3');
    } else if (game.screen === 'win') {
      drawCard('EVERY DIFFERENCE FOUND!', [
        'Harbour, garden and reef — all three scenes cleared.',
        'Final score: ' + game.score,
        'Sharp eyes, diver. The tides approve.',
      ], 'PLAY AGAIN', '#7ee0d2');
    }
  }

  // -------------------------------------------------------------- input ---
  function inRect(x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  function panelScenePoint(x, y) {
    for (const panelX of [LEFT_X, RIGHT_X]) {
      if (x >= panelX && x <= panelX + SCENE_W && y >= PANEL_Y && y <= PANEL_Y + SCENE_H) {
        return { sx: x - panelX, sy: y - PANEL_Y, panelX };
      }
    }
    return null;
  }

  function handleClick(x, y) {
    if (game.screen === 'title') {
      if (inRect(x, y, CARD_BUTTON)) startGame();
      return;
    }
    if (game.screen === 'clear') {
      if (inRect(x, y, CARD_BUTTON)) startLevel(game.levelIndex + 1, true);
      return;
    }
    if (game.screen === 'over') {
      if (inRect(x, y, CARD_BUTTON) || inRect(x, y, BUTTONS.restart)) startLevel(game.levelIndex, false);
      return;
    }
    if (game.screen === 'win') {
      if (inRect(x, y, CARD_BUTTON)) startGame();
      return;
    }
    if (inRect(x, y, BUTTONS.hint)) { useHint(); return; }
    if (inRect(x, y, BUTTONS.restart)) { startLevel(game.levelIndex, false); return; }
    if (inRect(x, y, BUTTONS.sound)) { setMuted(!isMuted()); return; }
    const p = panelScenePoint(x, y);
    if (!p) return;
    let best = -1;
    let bestDist = Infinity;
    level().differences.forEach((d, i) => {
      if (game.found.has(i)) return;
      const dist = Math.hypot(p.sx - d.x, p.sy - d.y);
      if (dist <= d.r + 10 && dist < bestDist) { best = i; bestDist = dist; }
    });
    if (best >= 0) findDifference(best, p.panelX);
    else missClick(x, y);
  }

  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (VIEW_W / rect.width);
    const y = (event.clientY - rect.top) * (VIEW_H / rect.height);
    handleClick(x, y);
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'h') useHint();
    else if (key === 'r' && (game.screen === 'play' || game.screen === 'over')) startLevel(game.levelIndex, false);
    else if (key === 'm') setMuted(!isMuted());
    else if ((key === 'enter' || key === ' ') && game.screen !== 'play') {
      if (game.screen === 'title' || game.screen === 'win') startGame();
      else if (game.screen === 'clear') startLevel(game.levelIndex + 1, true);
      else if (game.screen === 'over') startLevel(game.levelIndex, false);
    }
  });

  // -------------------------------------------------------------- loop ----
  function frame(ts) {
    const dt = game.lastTs ? Math.min(0.1, (ts - game.lastTs) / 1000) : 0;
    game.lastTs = ts;
    if (game.screen === 'play' && !game.frozen) {
      game.timeLeft -= dt;
      if (game.timeLeft <= 0) {
        game.timeLeft = 0;
        game.screen = 'over';
        playOver();
      }
    }
    draw();
    requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------- shot mode ---
  // Deterministic set-ups the maker uses for the entry screenshots: a scene
  // part-way through a hunt, markers down, several differences still hiding.
  function setupShot(name) {
    game.frozen = true;
    if (name === 'garden') {
      game.score = 640;
      game.hintsLeft = 2;
      startLevel(1, true);
      [0, 2, 5].forEach((i) => game.found.add(i));
      game.timeLeft = 83;
      game.message = 'The watering can disappeared.  +100';
    } else if (name === 'reef') {
      game.score = 1390;
      game.hintsLeft = 1;
      startLevel(2, true);
      [0, 1, 3, 5, 6].forEach((i) => game.found.add(i));
      game.timeLeft = 34;
      game.message = 'The coral turned orange.  +100';
    } else if (name === 'win') {
      game.score = 2480;
      startLevel(2, true);
      LEVELS[2].differences.forEach((_, i) => game.found.add(i));
      game.timeLeft = 57;
      game.screen = 'win';
    } else {
      game.score = 200;
      startLevel(0, true);
      [1, 4].forEach((i) => game.found.add(i));
      game.timeLeft = 97;
      game.message = 'The lighthouse pennant changed colour.  +100';
    }
    game.screen = name === 'win' ? 'win' : 'play';
  }

  return {
    start() { requestAnimationFrame(frame); },
    setupShot,
    state: game,
  };
}
