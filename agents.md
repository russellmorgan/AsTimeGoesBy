# agents.md

## Project snapshot
- Language/runtime: JavaScript web app, not TypeScript.
- Bundler: Vite.
- Entrypoint HTML: `src/index.html` (script tag loads `main.js` from the `src` directory).
- App behavior: renders a life-in-months grid from birth month/year and optional lifespan.

## Key files
- `package.json`: scripts are `dev`, `build`, `test` (`test` is a placeholder that exits with error).
- `vite.config.js`: sets `root: 'src'`, `build.outDir: '../dist'`.
- `src/index.html`: UI scaffolding, includes `#userInfoForm`, `#userinfo`, `#showinfo`, `.showinfo__explanation`, and `#timeleft` target container.
- `src/main.js`: contains the working app logic (class, localStorage, grid rendering, status toggles) and is the runtime script.
- `src/style.css`: minimal stylesheet for icon font definitions, keyframe animations, and only styles that are impractical with utility classes.
- `src/...` fonts: icon/font assets for the small help/close glyphs.

## Setup and commands
- Install: `npm install`.
- Development: `npm run dev` (Vite dev server rooted at `src`).
- Production build: `npm run build`.
- There is no real test suite configured.

## Important notes / risks
- The app uses native `Date` APIs (no `moment` dependency).

## Suggested remediation order
1. Confirm `main.js` entrypoint migration behavior end-to-end after the latest edits.
2. Verify page loads in `npm run dev` and confirm localStorage persistence flow.
3. Add at least one small smoke test or script check before refactors.
4. Update `README.md` with running, build, and feature expectations.
