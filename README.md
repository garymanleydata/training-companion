# Training Companion — PWA (GitHub Pages)

Local-first, offline-ready, single-page web app for logging runs, strength, fasting, meditation and parkrun — no servers, no build steps.

## Quick start
1. Create a GitHub repo (public) named **training-companion** (or any name).
2. Upload all files from this folder to the repo root.
3. In the repo: **Settings → Pages → Deploy from a branch**, pick `main` and `/ (root)`.
4. Visit: `https://<your-username>.github.io/<repo-name>/`

> If you want a user site at the root (no repo name in the URL), create a repo named **`<username>.github.io`** and upload these files there.

## Use it like an app
- Open the site on your phone, then **Add to Home Screen**. It will install as a PWA and work offline.

## Data & privacy
- Data is stored in your browser’s **localStorage** under the key `tc_data_v1`.
- Use **Settings → Export** to back up a JSON file.
- Use **Settings → Import** to restore (merge or replace).

## Modules included
- Runs
- Strength
- Fasting (with start/stop button)
- Meditation/Breathing
- parkrun (manual entry)

## Customisation
- Basic styles in `styles.css`
- Pages/views in `/modules/*.js`
- Common helpers & storage in `lib.js`
- Service worker in `sw.js`
- App shell & routing in `app.js`

