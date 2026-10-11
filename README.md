# Mischa's Space Adventure 🚀

This is **Mischa's own version** of Space Gerbil Adventure — a 3D browser game to
explore, change, and make your own!

## Play it
Once GitHub Pages is on, it's live at:
**https://aemery4.github.io/mischa-space-adventure/**

## How it works (the quick version)
- The whole game is plain files — no installing anything.
- `index.html` loads the game and all the code in the `js/` folder.
- `js/planets3d.js` — the list of planets/levels and their colors, fog, enemies.
- `js/p1-data.js` … `js/p6-data.js` — each level's map, items, and creatures.
- `js/engine3d.js` — the "engine" that draws the 3D world and runs the game.
- `js/skins.js` — the different hero looks you can unlock.
- `js/cutscene3d.js` — the little story movies between levels.
- `js/maze3d.js` — **Mischa's Giant Jungle Maze!** Builds the hedge maze, the
  village you start in, and the 👑 Monkey King's temple in the middle.

## The Jungle Maze 🌴👑
Planet 2 is a giant hedge maze. Start in the village (bottom-left), find 15 ⚡
fuel, and fight your way to the **Monkey King** in the middle. Beat him to
unlock the rocket in his throne room!

Fun numbers to change at the top of `js/maze3d.js`:
- `MAZE_CELLS` — how big the maze is (try `[30, 24]` for an even bigger one!)
- `HEDGE_HEIGHT` — how tall the hedges are
- `MAZE_LOOPS` — `0` = only one way through, `0.2` = lots of shortcuts

## Fun first things to try changing
1. **Colors of a planet** — open `js/planets3d.js` and change a `sky`, `ground`,
   or `wall` color (they look like `0x1f3d1c`). Save and reload.
2. **How much fuel you need** — change a `fuelTarget` number in the same file.
3. **A level's name** — change a `name:` in `js/planets3d.js`.
4. **Your starting spot** — change a `spawn:` in `js/planets3d.js`.

## How to make your changes go live
1. Edit a file and save.
2. Commit and push to GitHub (the `master` branch).
3. Wait a minute, then hard-refresh the page (Ctrl+Shift+R).

Have fun, Mischa — make it yours! 🎮
