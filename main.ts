// Twin Tides — hand-in program (Node 22, standard library only).
//
// The entry is the static game in game/ plus the maker's screenshots in
// screenshots/. This program copies both into the output directory and asks
// the vendored make.fun library to write the dossier the judge reads.
// The grader mounts the repository read-only and points the program at
// /output; locally, MAKEFUN_OUTPUT_DIR names the stand-in directory:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's caps, mirrored so a hand-in the scorer would refuse is refused
// here instead: at most 4 screenshots of 256 KiB, at most 993 game files and
// 48 MiB of game in total, no game path over 1,000 bytes, dossier text cut
// at 160 KiB.
const GATE_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyInto(from: string, to: string): void {
  if (!existsSync(from)) return;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyInto(join(repoRoot, 'game'), join(outputDir, 'game'));
copyInto(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

const dossier = buildDossier(outputDir, GATE_LIMITS);
writeFileSync(join(outputDir, 'dossier.json'), dossier);
