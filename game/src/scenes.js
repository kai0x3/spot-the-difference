// scenes.js — the artwork of Twin Tides. Every scene is drawn from scratch with
// canvas paths (no image assets), once for the left panel in its true state and
// once for the right panel with that level's differences applied. A difference
// is a small flag the painter checks while drawing: flip the flag and one detail
// changes colour, vanishes, or appears. Each difference also carries the point
// a player must click (in scene coordinates, 560 x 540) and the line the game
// speaks when it is found.

export const SCENE_W = 560;
export const SCENE_H = 540;

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, stroke, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function bird(ctx, x, y, s, colour) {
  ctx.beginPath();
  ctx.moveTo(x - 11 * s, y);
  ctx.quadraticCurveTo(x - 5 * s, y - 8 * s, x, y);
  ctx.quadraticCurveTo(x + 5 * s, y - 8 * s, x + 11 * s, y);
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2.4 * s;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function cloud(ctx, x, y, s, fill) {
  ellipse(ctx, x, y, 34 * s, 15 * s, fill);
  ellipse(ctx, x - 22 * s, y + 4 * s, 22 * s, 11 * s, fill);
  ellipse(ctx, x + 24 * s, y + 4 * s, 24 * s, 12 * s, fill);
  ellipse(ctx, x + 2 * s, y - 9 * s, 20 * s, 12 * s, fill);
}

function waveRow(ctx, y, colour, phase) {
  ctx.beginPath();
  for (let x = 0; x <= SCENE_W; x += 8) {
    const yy = y + Math.sin((x + phase) / 26) * 3.2;
    if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
  }
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2.4;
  ctx.stroke();
}

// ---------------------------------------------------------------- harbour ---
function paintHarbour(ctx, diff) {
  const sky = ctx.createLinearGradient(0, 0, 0, 360);
  sky.addColorStop(0, '#2e4a7d');
  sky.addColorStop(0.55, '#c96f4a');
  sky.addColorStop(1, '#f2a65a');
  rect(ctx, 0, 0, SCENE_W, 360, sky);
  rect(ctx, 0, 360, SCENE_W, 180, '#1d5f6e');
  waveRow(ctx, 392, 'rgba(255,255,255,0.35)', 10);
  waveRow(ctx, 438, 'rgba(255,255,255,0.22)', 60);
  waveRow(ctx, 492, 'rgba(255,255,255,0.16)', 120);

  // sun — difference 0: warm gold on the left, rose pink on the right
  const sunFill = diff.has(0) ? '#ff7d9c' : '#ffcf5c';
  if (!diff.has(0)) {
    ctx.save();
    ctx.translate(452, 96);
    ctx.strokeStyle = 'rgba(255,207,92,0.85)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 44, Math.sin(a) * 44);
      ctx.lineTo(Math.cos(a) * 58, Math.sin(a) * 58);
      ctx.stroke();
    }
    ctx.restore();
  }
  circle(ctx, 452, 96, 34, sunFill);
  circle(ctx, 452, 96, 27, diff.has(0) ? '#ffa4ba' : '#ffe29a');

  cloud(ctx, 150, 74, 1.0, 'rgba(255,214,178,0.9)');
  cloud(ctx, 330, 128, 0.75, 'rgba(255,196,160,0.8)');
  cloud(ctx, 520, 176, 0.6, 'rgba(255,206,170,0.75)');

  // birds — difference 3: the middle bird is gone on the right
  bird(ctx, 208, 50, 1.0, '#26355e');
  bird(ctx, 252, 72, 0.85, '#26355e');
  if (!diff.has(3)) bird(ctx, 330, 76, 0.95, '#26355e');
  bird(ctx, 292, 50, 0.7, '#26355e');
  bird(ctx, 372, 56, 0.8, '#26355e');

  // distant headland and harbour houses
  poly(ctx, [[0, 360], [0, 318], [90, 300], [190, 322], [240, 360]], '#3d4a63');
  const houseCols = ['#e8b04b', '#d96f4e', '#7fb3b0', '#c95d7b', '#e5d3a1'];
  for (let i = 0; i < 5; i++) {
    const hx = 268 + i * 56;
    rect(ctx, hx, 322, 42, 38, houseCols[i]);
    poly(ctx, [[hx - 4, 322], [hx + 21, 306], [hx + 46, 322]], '#5b3a44');
    rect(ctx, hx + 15, 338, 11, 22, '#4a3049');
    rect(ctx, hx + 5, 326, 8, 8, '#ffe9a8');
  }

  // lighthouse on its rock
  poly(ctx, [[28, 372], [172, 372], [150, 344], [52, 344]], '#4c4238');
  const stripe = (y, h, fill) => rect(ctx, 76, y, 48, h, fill);
  rect(ctx, 76, 208, 48, 140, '#f4ead8');
  stripe(238, 26, '#d64541');
  // difference 1: the middle stripe is blue on the right
  stripe(282, 26, diff.has(1) ? '#3f6fd8' : '#d64541');
  stripe(326, 22, '#d64541');
  rect(ctx, 68, 190, 64, 18, '#37415c');
  rect(ctx, 88, 158, 24, 32, '#ffd76a');
  rect(ctx, 84, 150, 32, 8, '#37415c');
  poly(ctx, [[100, 128], [86, 150], [114, 150]], '#37415c');
  // difference 4: the pennant changes colour
  poly(ctx, [[100, 128], [100, 142], [diff.has(4) ? 122 : 124, 135]], diff.has(4) ? '#2ec4b6' : '#e63946');
  // light beam
  const beam = ctx.createLinearGradient(112, 174, 320, 130);
  beam.addColorStop(0, 'rgba(255,215,106,0.5)');
  beam.addColorStop(1, 'rgba(255,215,106,0)');
  poly(ctx, [[112, 166], [320, 118], [320, 196], [112, 182]], beam);

  // big sailboat
  line(ctx, 236, 356, 236, 428, '#5b3a29', 4);
  poly(ctx, [[236, 362], [236, 424], [282, 424]], '#f7f3e8');
  poly(ctx, [[230, 372], [230, 424], [198, 424]], '#e63946');
  poly(ctx, [[188, 428], [292, 428], [272, 448], [204, 448]], '#7a4a2b');
  rect(ctx, 232, 344, 16, 12, '#2ec4b6');

  // difference 2: the little red dinghy is missing on the right
  if (!diff.has(2)) {
    poly(ctx, [[360, 446], [424, 446], [410, 464], [372, 464]], '#c0392b');
    line(ctx, 392, 408, 392, 446, '#5b3a29', 3);
    poly(ctx, [[392, 412], [392, 444], [414, 444]], '#fdf6e3');
  }

  // dock posts and a buoy
  rect(ctx, 20, 452, 150, 10, '#6b4a2f');
  for (let i = 0; i < 4; i++) rect(ctx, 30 + i * 42, 452, 8, 40, '#54381f');
  circle(ctx, 500, 470, 13, '#e63946');
  rect(ctx, 493, 448, 14, 10, '#f4ead8');
  ellipse(ctx, 500, 486, 20, 5, 'rgba(255,255,255,0.3)');
}

// ----------------------------------------------------------------- garden ---
function paintGarden(ctx, diff) {
  const sky = ctx.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, '#7ec8e3');
  sky.addColorStop(1, '#d9f2e4');
  rect(ctx, 0, 0, SCENE_W, 340, sky);
  circle(ctx, 66, 62, 30, '#ffd93d');
  circle(ctx, 66, 62, 38, 'rgba(255,217,61,0.25)');
  cloud(ctx, 300, 60, 1.0, '#ffffff');
  cloud(ctx, 470, 104, 0.7, '#ffffff');
  rect(ctx, 0, 330, SCENE_W, 210, '#58b368');
  rect(ctx, 0, 330, SCENE_W, 14, '#6cc274');
  ellipse(ctx, 280, 356, 300, 16, 'rgba(0,0,0,0.06)');

  // fence
  for (let i = 0; i < 14; i++) {
    const fx = 8 + i * 40;
    poly(ctx, [[fx, 318], [fx + 9, 304], [fx + 18, 318], [fx + 18, 344], [fx, 344]], '#e8dcc3');
  }
  rect(ctx, 0, 322, SCENE_W, 6, '#d9c9a8');

  // apple tree
  rect(ctx, 118, 236, 20, 108, '#7a4a2b');
  poly(ctx, [[128, 250], [92, 196], [104, 190], [128, 226], [158, 188], [168, 196], [140, 248]], '#7a4a2b');
  circle(ctx, 128, 168, 74, '#2f7d46');
  circle(ctx, 76, 196, 46, '#379457');
  circle(ctx, 182, 196, 48, '#2a7040');
  circle(ctx, 128, 128, 44, '#3f9e57');
  const apples = [[96, 150], [150, 132], [178, 182], [108, 206], [150, 150], [70, 178]];
  apples.forEach(([ax, ay], i) => {
    // difference 0: one apple (index 4) is missing on the right
    if (diff.has(0) && i === 4) return;
    circle(ctx, ax, ay, 9, '#e63946');
    circle(ctx, ax - 3, ay - 3, 3, '#ff8fa3');
  });

  // kite — difference 1: coral on the left, violet on the right
  const kiteFill = diff.has(1) ? '#8b5cf6' : '#ff6b5e';
  poly(ctx, [[430, 66], [468, 110], [430, 154], [392, 110]], kiteFill);
  poly(ctx, [[430, 66], [468, 110], [430, 110]], '#ffd93d');
  poly(ctx, [[430, 110], [468, 110], [430, 154]], '#ffd93d');
  ctx.beginPath();
  ctx.moveTo(430, 154);
  ctx.quadraticCurveTo(452, 196, 424, 226);
  ctx.quadraticCurveTo(404, 248, 420, 276);
  ctx.strokeStyle = '#5b4a68';
  ctx.lineWidth = 2;
  ctx.stroke();
  [[446, 196], [428, 228], [424, 256]].forEach(([bx, by]) => {
    poly(ctx, [[bx - 8, by], [bx, by - 5], [bx, by + 5]], '#e63946');
    poly(ctx, [[bx + 8, by], [bx, by - 5], [bx, by + 5]], '#e63946');
  });
  ctx.beginPath();
  ctx.moveTo(420, 276);
  ctx.quadraticCurveTo(380, 330, 330, 372);
  ctx.strokeStyle = 'rgba(91,74,104,0.6)';
  ctx.stroke();

  // picnic blanket and food
  poly(ctx, [[196, 402], [364, 402], [392, 486], [168, 486]], '#e63946');
  poly(ctx, [[224, 402], [252, 402], [262, 486], [238, 486]], '#fdf6e3');
  poly(ctx, [[308, 402], [336, 402], [354, 486], [330, 486]], '#fdf6e3');
  ellipse(ctx, 280, 452, 26, 9, 'rgba(0,0,0,0.12)');
  // cake — difference 2: the cherry on top is gone on the right
  rect(ctx, 252, 420, 56, 22, '#fdf6e3');
  rect(ctx, 252, 420, 56, 7, '#ff8fa3');
  rect(ctx, 260, 404, 40, 16, '#fdf6e3');
  rect(ctx, 260, 404, 40, 6, '#8a5a3b');
  if (!diff.has(2)) {
    circle(ctx, 280, 398, 6, '#d90429');
    line(ctx, 280, 392, 284, 386, '#2f7d46', 2);
  }
  circle(ctx, 226, 436, 13, '#ffffff');
  circle(ctx, 226, 436, 8, '#ffd93d');
  circle(ctx, 336, 440, 12, '#ffffff');
  circle(ctx, 336, 440, 7, '#c77dff');

  // cat asleep by the blanket
  ellipse(ctx, 428, 452, 34, 16, '#f4a259');
  circle(ctx, 458, 440, 14, '#f4a259');
  poly(ctx, [[448, 430], [444, 418], [454, 426]], '#f4a259');
  poly(ctx, [[464, 428], [466, 416], [472, 428]], '#f4a259');
  ctx.beginPath();
  ctx.arc(398, 452, 12, Math.PI * 0.4, Math.PI * 1.5);
  ctx.strokeStyle = '#f4a259';
  ctx.lineWidth = 6;
  ctx.stroke();
  line(ctx, 452, 440, 462, 440, '#5b4a68', 2);

  // flower beds — difference 3: one tulip changes from yellow to pink
  const tulips = [[52, 478, '#e63946'], [84, 486, '#ffd93d'], [116, 478, '#c77dff'], [448, 486, '#ff8fa3'], [484, 478, '#e63946'], [518, 486, '#ffd93d']];
  tulips.forEach(([tx, ty, col], i) => {
    line(ctx, tx, ty + 22, tx, ty + 4, '#2f7d46', 3);
    const fill = diff.has(3) && i === 1 ? '#ff8fa3' : col;
    poly(ctx, [[tx - 7, ty + 6], [tx - 7, ty - 6], [tx - 2, ty], [tx, ty - 8], [tx + 2, ty], [tx + 7, ty - 6], [tx + 7, ty + 6]], fill);
  });
  for (let i = 0; i < 9; i++) circle(ctx, 30 + i * 62, 522, 4, i % 2 ? '#ffffff' : '#ffd93d');

  // butterflies — difference 4: an extra butterfly appears on the right
  const flutter = (x, y, col) => {
    ellipse(ctx, x - 7, y, 7, 10, col);
    ellipse(ctx, x + 7, y, 7, 10, col);
    ellipse(ctx, x, y + 3, 3, 8, '#3b2d4a');
  };
  flutter(238, 268, '#c77dff');
  flutter(356, 214, '#ff9f1c');
  if (diff.has(4)) flutter(482, 302, '#2ec4b6');

  // difference 5: the watering can is missing on the right
  if (!diff.has(5)) {
    rect(ctx, 472, 446, 30, 22, '#5aa9e6');
    poly(ctx, [[502, 450], [518, 440], [520, 448], [504, 458]], '#5aa9e6');
    ctx.beginPath();
    ctx.arc(487, 446, 12, Math.PI, 0);
    ctx.strokeStyle = '#5aa9e6';
    ctx.lineWidth = 4;
    ctx.stroke();
    circle(ctx, 520, 436, 5, '#3d7ab5');
  }

  // bush with berries
  circle(ctx, 40, 356, 30, '#2f7d46');
  circle(ctx, 74, 366, 24, '#379457');
  [[30, 348], [52, 362], [66, 348], [44, 338]].forEach(([bx, by]) => circle(ctx, bx, by, 4, '#e63946'));
}

// ------------------------------------------------------------------- reef ---
function paintReef(ctx, diff) {
  const sea = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  sea.addColorStop(0, '#2a9d8f');
  sea.addColorStop(0.5, '#1d7a9e');
  sea.addColorStop(1, '#123c63');
  rect(ctx, 0, 0, SCENE_W, SCENE_H, sea);
  // light rays
  ctx.save();
  ctx.globalAlpha = 0.13;
  poly(ctx, [[60, 0], [130, 0], [210, 300], [120, 300]], '#ffffff');
  poly(ctx, [[240, 0], [300, 0], [400, 320], [330, 320]], '#ffffff');
  poly(ctx, [[430, 0], [480, 0], [540, 260], [490, 260]], '#ffffff');
  ctx.restore();
  // sandy floor
  poly(ctx, [[0, 470], [140, 448], [300, 466], [440, 450], [560, 468], [560, 540], [0, 540]], '#e9d8a6');
  ellipse(ctx, 120, 500, 60, 10, 'rgba(0,0,0,0.08)');
  ellipse(ctx, 420, 508, 80, 10, 'rgba(0,0,0,0.08)');

  const bubbles = (x, y, sizes) => sizes.forEach(([s, dx, dy]) => {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, s, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    circle(ctx, x + dx - s * 0.3, y + dy - s * 0.3, s * 0.22, 'rgba(255,255,255,0.8)');
  });
  bubbles(70, 120, [[7, 0, 0], [5, 12, -26], [4, -6, -52]]);
  bubbles(300, 90, [[6, 0, 0], [4, 10, -22]]);
  // difference 5: an extra bubble cluster rises on the right
  if (diff.has(5)) bubbles(520, 150, [[7, 0, 0], [5, -12, -24], [4, 4, -48], [3, -4, -68]]);

  // coral branch — difference 6: pink on the left, orange on the right
  const coralFill = diff.has(6) ? '#ff9f1c' : '#ef6f9c';
  const branch = (x, y, s, flip) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flip * s, s);
    ctx.strokeStyle = coralFill;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(2, -34, -4, -58); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -22); ctx.quadraticCurveTo(16, -34, 22, -52); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -36); ctx.quadraticCurveTo(-16, -44, -22, -60); ctx.stroke();
    ctx.restore();
    circle(ctx, x - 4, y - 58, 6, coralFill);
    circle(ctx, x + 22, y - 52, 5, coralFill);
    circle(ctx, x - 22, y - 60, 5, coralFill);
  };
  branch(64, 452, 1.0, 1);
  branch(516, 470, 0.8, -1);
  // staghorn clump
  ctx.strokeStyle = '#c77dff';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  [[250, 486, 236, 452], [262, 488, 262, 448], [274, 486, 290, 456]].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  });

  // seaweed
  const weed = (x, h, col) => {
    ctx.beginPath();
    ctx.moveTo(x, 500);
    ctx.quadraticCurveTo(x + 14, 500 - h * 0.5, x, 500 - h);
    ctx.quadraticCurveTo(x - 12, 500 - h * 0.55, x + 4, 502);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
  };
  weed(180, 120, '#2a9d5c');
  weed(204, 88, '#37b06c');
  weed(352, 104, '#2a9d5c');
  weed(376, 76, '#37b06c');
  weed(30, 66, '#37b06c');

  // fish school — difference 1: one fish is missing on the right
  const fish = (x, y, s, col, flip) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flip * s, s);
    ellipse(ctx, 0, 0, 16, 9, col);
    poly(ctx, [[13, 0], [24, -8], [24, 8]], col);
    circle(ctx, -7, -2, 2.4, '#123c63');
    ctx.restore();
  };
  fish(238, 128, 1.0, '#ffb703', 1);
  fish(282, 104, 0.85, '#fb8500', 1);
  if (!diff.has(1)) fish(342, 138, 0.95, '#ffd60a', 1);
  fish(300, 168, 0.8, '#ffb703', 1);
  fish(392, 108, 0.75, '#fb8500', 1);
  fish(120, 210, 1.1, '#4cc9f0', -1);
  fish(180, 246, 0.9, '#4cc9f0', -1);

  // turtle — difference 4: one shell spot is gone on the right
  ellipse(ctx, 386, 262, 52, 36, '#5a9367');
  ellipse(ctx, 386, 262, 40, 26, '#74a86f');
  circle(ctx, 366, 248, 8, '#3e6b4f');
  circle(ctx, 398, 256, 9, '#3e6b4f');
  if (!diff.has(4)) circle(ctx, 380, 276, 7, '#3e6b4f');
  circle(ctx, 404, 236, 6, '#3e6b4f');
  circle(ctx, 440, 252, 13, '#8fbf7f');
  circle(ctx, 444, 250, 2.4, '#123c63');
  poly(ctx, [[344, 244], [322, 228], [338, 268]], '#8fbf7f');
  poly(ctx, [[350, 286], [330, 302], [360, 300]], '#8fbf7f');

  // difference 3: the seahorse is missing on the right
  if (!diff.has(3)) {
    ctx.save();
    ctx.translate(150, 306);
    ctx.strokeStyle = '#ffd60a';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -18, 16, Math.PI * 0.2, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(4, 14, 12, Math.PI * 1.1, Math.PI * 2.4);
    ctx.stroke();
    poly(ctx, [[-8, -38], [6, -46], [10, -32]], '#ffd60a');
    circle(ctx, -6, -26, 2.6, '#123c63');
    poly(ctx, [[-14, -8], [-26, -2], [-14, 4]], '#ffb703');
    ctx.restore();
  }

  // octopus peeking from a rock
  rect(ctx, 470, 420, 74, 52, '#6c757d');
  poly(ctx, [[470, 420], [506, 398], [544, 420]], '#868e96');
  circle(ctx, 506, 428, 17, '#b565a7');
  circle(ctx, 500, 426, 3, '#2b2d42');
  circle(ctx, 513, 426, 3, '#2b2d42');
  ctx.strokeStyle = '#b565a7';
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(492, 442); ctx.quadraticCurveTo(486, 456, 476, 458); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(520, 442); ctx.quadraticCurveTo(528, 454, 538, 456); ctx.stroke();

  // treasure chest — difference 2: open with gold on the left, shut on the right
  rect(ctx, 398, 446, 68, 34, '#7a4a2b');
  rect(ctx, 398, 446, 68, 8, '#5b3a29');
  if (diff.has(2)) {
    poly(ctx, [[398, 446], [466, 446], [458, 428], [406, 428]], '#8a5a3b');
    rect(ctx, 424, 442, 16, 14, '#ffd60a');
  } else {
    poly(ctx, [[398, 446], [466, 446], [472, 412], [420, 420]], '#8a5a3b');
    circle(ctx, 430, 428, 9, '#ffd60a');
    circle(ctx, 446, 424, 8, '#ffb703');
    circle(ctx, 416, 432, 6, '#ffd60a');
    ellipse(ctx, 432, 436, 22, 6, 'rgba(255,214,10,0.45)');
    rect(ctx, 424, 442, 16, 14, '#ffd60a');
  }

  // starfish — difference 0: orange on the left, violet on the right
  const starFill = diff.has(0) ? '#9d6bf5' : '#fb8500';
  ctx.save();
  ctx.translate(96, 452);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 24 : 10;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = starFill;
  ctx.fill();
  circle(ctx, 0, 0, 4, 'rgba(255,255,255,0.55)');
  ctx.restore();

  // shells on the sand
  const shell = (x, y, col) => {
    ctx.beginPath();
    ctx.arc(x, y, 11, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    line(ctx, x, y - 10, x, y, 'rgba(0,0,0,0.15)', 2);
    line(ctx, x - 6, y - 7, x - 3, y, 'rgba(0,0,0,0.15)', 2);
    line(ctx, x + 6, y - 7, x + 3, y, 'rgba(0,0,0,0.15)', 2);
  };
  shell(238, 512, '#ffb3c6');
  shell(330, 520, '#ffc8dd');
  shell(70, 524, '#ffd6a5');
}

// ------------------------------------------------------------ level data ---
export const LEVELS = [
  {
    name: 'Harbour at Dusk',
    tagline: 'The ferry is leaving — check the pier before it goes.',
    seconds: 150,
    paint: paintHarbour,
    differences: [
      { x: 452, y: 96, r: 42, label: 'The sun lost its rays and turned rose pink.' },
      { x: 100, y: 295, r: 30, label: 'The lighthouse stripe turned blue.' },
      { x: 392, y: 450, r: 34, label: 'The little red dinghy vanished.' },
      { x: 330, y: 76, r: 24, label: 'One gull left the flock.' },
      { x: 112, y: 134, r: 22, label: 'The lighthouse pennant changed colour.' },
    ],
  },
  {
    name: 'Garden Picnic',
    tagline: 'Someone has been at the picnic. Find what they touched.',
    seconds: 160,
    paint: paintGarden,
    differences: [
      { x: 150, y: 150, r: 20, label: 'An apple is missing from the tree.' },
      { x: 430, y: 110, r: 34, label: 'The kite turned violet.' },
      { x: 280, y: 398, r: 18, label: 'The cherry on the cake is gone.' },
      { x: 84, y: 480, r: 18, label: 'A yellow tulip turned pink.' },
      { x: 482, y: 302, r: 20, label: 'A new butterfly fluttered in.' },
      { x: 490, y: 452, r: 28, label: 'The watering can disappeared.' },
    ],
  },
  {
    name: 'Coral Reef',
    tagline: 'The reef hides its secrets well. Seven changes, diver.',
    seconds: 180,
    paint: paintReef,
    differences: [
      { x: 96, y: 452, r: 26, label: 'The starfish turned violet.' },
      { x: 342, y: 138, r: 20, label: 'One fish slipped out of the school.' },
      { x: 432, y: 432, r: 32, label: 'The treasure chest snapped shut.' },
      { x: 150, y: 300, r: 24, label: 'The seahorse swam away.' },
      { x: 380, y: 276, r: 18, label: 'A spot faded from the turtle shell.' },
      { x: 520, y: 126, r: 24, label: 'A fresh stream of bubbles appeared.' },
      { x: 62, y: 420, r: 28, label: 'The coral turned orange.' },
    ],
  },
];
