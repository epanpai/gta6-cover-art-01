// Program penyerahan entry gta6-cover-art-01 (Node 22, standard library saja).
//
// App-nya adalah folder app/ di sebelah file ini: file statis polos yang
// dibuka browser desktop secara offline (app/index.html beserta modul ES-nya,
// tanpa library dan tanpa request network). Program ini menyerahkan app
// tersebut: menyalin app/ dan screenshots/ ke /output lalu menulis
// /output/dossier.json — ringkasan yang dibaca juri — dengan library make.fun
// yang di-vendor di vendor/makefun-app.ts.
//
// App yang diserahkan: Vice Cover Maker, pembuat cover art multi-panel gaya
// poster GTA 6. Foto dibaca lokal di mesin pengguna, tidak pernah di-upload;
// caption bisa diedit; export PNG 1080x1080, 1080x1350, dan 1920x1080.
// Dua foto sampel di app/samples/ dibuat dengan image model untuk make.fun
// dan bebas dipakai. Font di app/fonts/ berlisensi SIL OFL.
//
// Coba app-nya secara lokal dengan `node serve.ts`, lalu buka http://localhost:8080.
// Di luar container grader, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// Direktori repo ini, dan direktori output (default /output di grader).
const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Salin seluruh app/ dan screenshots/ apa adanya ke output.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Tulis dossier.json dengan batas yang sama seperti gate scorer
// (reference/gate.json): hanya text_max_bytes yang membentuk isi byte;
// batas lainnya menolak entry yang memang akan ditolak scorer — lebih dari
// 4 screenshot atau satu di atas 256 KiB; lebih dari 993 file di app/ atau
// 48 MiB total file app; atau path di bawah app/ lebih dari 1000 byte.
// app/ dihitung bersama /output yang dibatasi 1000 entry, screenshots/,
// dan dossier.json itu sendiri.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
