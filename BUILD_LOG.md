# BUILD LOG — Vice Cover Maker (gta6-cover-art-01)

Entry: **Vice Cover Maker** — pembuat cover art multi-panel gaya poster GTA 6.
Akun: @epan-pai · Repo: https://github.com/epanpai/gta6-cover-art-01
Kompetisi buka 19 Nov 2026 17:30 WIB, deadline 21 Nov 2026 17:30 WIB.
Dibangun dalam sesi rekaman 01a1f362-2741-757f-b96e-0fd1434199d9 (mulai ~17:38 WIB).

## Langkah 1 — Baca aturan & starter (17:39–17:40 WIB)
- Baca `RULES.txt` kit seluruhnya + `gta6-cover-art-01-detail.json` + starter `app/` dan `main.ts` (referensi saja).
- Kuota sudah dicek koordinator: `can_submit: true`.

## Langkah 2 — Font OFL (17:40 WIB)
- Unduh dari GitHub google/fonts: `Anton-Regular.ttf` (170.812 byte) dan `ArchivoBlack-Regular.ttf` (90.988 byte), beserta `OFL.txt` masing-masing.
- Disimpan di `app/fonts/` (`OFL-Anton.txt`, `OFL-ArchivoBlack.txt`). Tanpa logo/wordmark/artwork/font Rockstar.

## Langkah 3 — Tulis app baru (17:41–17:43 WIB)
- `app/index.html` — editor: foto, layout, panel, caption, grade, ukuran export.
- `app/style.css` — tema editor gelap; `@font-face` menunjuk font lokal.
- `app/src/cover.js` — renderer canvas 2D murni: 4 layout (split, triptych, hero, quad), 4 grade (sunset, neon, dusk, noir), matahari retro bergaris, lettering Anton + Archivo Black, pan/zoom per panel.
- `app/src/main.js` — wiring editor + `exportCoverPNG(size)` + scene `?shot=`.
- `app/src/shots.js` — scene screenshot tetap.
- `shots.json` — 4 scene: cover wide 1920×1080, editor, cover square, cover portrait.

## Langkah 4 — Uji di headless Chromium (17:43 WIB)
- Serve `node serve.ts --port 8080`; driver Playwright sendiri (`/tmp/shot-vice.mjs`, di luar repo).
- Hasil run pertama: 4 screenshot tersimpan, export PNG valid di ketiga ukuran (1080×1080, 1080×1350, 1920×1080 — header PNG + dimensi cocok), **NO ERRORS** (tanpa error console/pageerror, tanpa request network ke luar app).
- Verifikasi visual: cover wide pertama memotong kepala subjek di panel hero → revisi `shots.js` (offset panel) dan `cover.js` (pan di-clamp agar foto selalu menutupi panel). Run kedua: masih ada celah kosong di atas panel kiri → clamp pan diperbaiki. Run ketiga: semua panel terisi penuh, wajah utuh.
- Run final: 4 screenshot tersimpan, 3 export PNG valid, **NO ERRORS**.

## Langkah 5 — Screenshot final (17:43 WIB)
| File | Ukuran | Byte |
|---|---|---|
| `1-cover-wide.jpg` (cover, 1920×1080) | 1280×720 | 107.422 |
| `2-editor.jpg` (editor + foto) | 1280×720 | 128.728 |
| `3-cover-square.jpg` (1080×1080) | 1024×1024 | 132.937 |
| `4-cover-portrait.jpg` (1080×1350) | 1024×1280 | 175.356 |

Semua ≤256 KiB, sisi panjang ≤1280, sisi pendek ≥480. Screenshot starter lama (`1-cover.jpg`, `3-cover.jpg`) dihapus.

## Langkah 6 — main.ts baru + determinisme (17:44 WIB)
- `main.ts` ditulis ulang di sesi ini (logika sama seperti starter: salin `app/` + `screenshots/`, tulis `dossier.json` via `buildDossier`).
- Dua run `MAKEFUN_OUTPUT_DIR=out|out2 node main.ts`: **byte-identik** (`diff` sha256 kosong).
- `out/dossier.json` sha256: `aa109dea09499525f527236778154c064b0878b2473e35a26cdd6cd212592903`.
- `vendor/makefun-app.ts` tidak diubah: sha256 `14e650adbd6aff7fb760e9bcd7be00dfbe86fb4819afe88dfe23dd0e087e770e`.
- Tidak ada referensi `http://`/`https://` di `app/` (grep bersih); `app/` total 424 KiB.

## Langkah 7 — Kit check (17:44 WIB)
- `node cli/makefun.mjs check --kit . --repo …` (commit + `--worktree`): **4 passed, 0 failed, 16 skipped, 5 checked at submission**.
- Yang "at submission" (repo publik, owner, dibuat setelah buka, commit ter-push, duplikat snapshot) menunggu push — wajar.

## Langkah 8 — README + commit + push
- `README.md` ditulis di sesi ini, dengan 3 badge make.fun (bounty, rank, reward) sebagai image + link ke bounty.
- Commit sebagai `epanpai <epanp87@gmail.com>`, push ke `https://github.com/epanpai/gta6-cover-art-01`.
- About repo: homepage `https://make.fun/bounty/gta6-cover-art-01`, topic `makefun`.
- `.makefun/owner.json` ikut ter-commit.

## Tidak dilakukan
- **Submit TIDAK dilakukan** — dilakukan koordinator setelah rekaman disegel.
- File `~/.makefun/` tidak disentuh; proses rekaman tidak dihentikan.
