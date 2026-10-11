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
- `js/maze3d.js` — **Mischa's Jungle!** Builds the village you start in, the
  forest you hike through, the giant hedge maze, and the 👑 Monkey King's
  temple in the middle.
- `js/compass3d.js` — **Mischa's Boss Compass!** The 🧭 in the top-right corner
  points to the boss on every level (red needle), then to the 🚀 rocket once the
  boss is beaten (green needle).
- `js/healthbar3d.js` — **Mischa's Health Bar!** A ❤️ bar floats above your
  astronaut: green → yellow → red as you get hurt, and it flashes when you're hit.

## The Jungle Maze 🌴👑
Planet 2 is an adventure in three parts:
1. 🏘️ Start in the **village** (bottom-left) — a safe zone with shops.
2. 🌲 Follow the **dirt trail** north through the thick **forest**.
3. 🔥 Go through the **torch-lit entrance** into the giant hedge **maze** and
   find the **Monkey King** in the middle. Beat him (and grab 15 ⚡ fuel) to
   unlock the rocket in his throne room!

Trees right in front of you lose their leaves so you can always see yourself.

Fun numbers to change at the top of `js/maze3d.js`:
- `MAZE_CELLS` — how big the maze is (try `[30, 24]` for an even bigger one!)
- `HEDGE_HEIGHT` — how tall the hedges are
- `MAZE_LOOPS` — `0` = only one way through, `0.2` = lots of shortcuts
- `FOREST_DEPTH` — how long the hike through the forest is
- `FOREST_TREES` — how thick the forest is (`0.1` = sparse, `0.4` = super thick)

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
