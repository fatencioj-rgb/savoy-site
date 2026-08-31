# Savoy — Front of House

Internal FOH site for Savoy, based on the Petrus site. This is a new, standalone repo.

## Structure

```
savoy-site/
├── index.html           ← Landing page with login modal
├── auth.js              ← Firebase config & auth functions
├── guard.js             ← Page guard for protected pages
├── training.html        ← Training hub (Food + Wine)
├── winelist.html        ← Wine training (placeholder)
├── sommeliers.html      ← Sommeliers hub (Stocktake only)
└── somm-stocktake.html  ← Stocktake with Par Levels feature
```

## Sections

- **Training** — Food and Wine training links.
- **Sommeliers** — only **Stocktake** is enabled.

## Par Levels (default inventory)

The Stocktake page has a **Par Levels** button. It lets you assign a default
inventory quantity to specific products, per location.

- Products with a par level are **pre-filled automatically** every time a
  stocktake is opened for that section (Wine / Beverage).
- Those cells are highlighted and the product shows a **"Par"** badge.
- The par level stays applied until you change or clear it in the Par Levels
  dialog. Leave a value blank to remove a product's par level.

Par levels are stored per section in the Firestore collection
`savoy_par_levels` (documents `par_wine` and `par_bar`).

## Firebase

`auth.js` currently reuses the Petrus Firebase project config. To keep Savoy's
data fully separate, create a new Firebase project and paste its config into
`auth.js`. Users log in with `name@savoy.local` and a personal code.

Firestore collections used:
- `savoy_stocktake` — saved stocktakes
- `savoy_par_levels` — default inventory (par levels)
- `savoy_access_logs` — access logging

## Local preview

Open `index.html` in a browser, or serve the folder with any static server.
```
python -m http.server 8000
```
