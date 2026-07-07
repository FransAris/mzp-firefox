# Mozilla Add-ons submission notes

## Listing copy

**Name:** Marktplaats Zonder Spam

**Summary:** Hide top ads, Admarkt listings, banners and selected sellers or keywords on Marktplaats and 2dehands.

**Description:**

Marktplaats Zonder Spam is a small Firefox extension that makes Marktplaats.nl and 2dehands.be result pages calmer. It hides common promoted or unwanted listing types, including top ads, Admarkt/commercial listings, banner ad containers, sellers with external website links, and user-defined seller or keyword blocks.

The extension adds a compact page panel with quick toggles and visible/hidden counts. Settings are managed from the extension options page and are stored locally in Firefox.

This is an independent project. It is not affiliated with Marktplaats, 2dehands, Adevinta, or the Chrome extension that inspired it.

## Privacy statement

The extension does not collect, transmit, sell, or share personal data. It has no remote servers, analytics, tracking pixels, external scripts, or runtime npm dependencies.

All preferences, blocked sellers, and blocked keywords are stored locally in Firefox using `browser.storage.local`. The extension reads the current Marktplaats or 2dehands page only to classify and hide visible listing elements in the browser.

## Permission rationale

### `storage`

Used to save extension settings locally, including filter toggles, the seller blacklist, the keyword blacklist, and whether the compact page panel is shown.

### Content script matches

- `https://www.marktplaats.nl/*`
- `https://www.2dehands.be/*`

The content script must run on these listing pages to inspect page markup, detect unwanted listing signals, hide matching elements, add the per-listing **Verberg verkoper** button, and show the compact control panel. The extension does not request access to unrelated websites.

## Testing notes

Recommended checks before upload:

```bash
python -m json.tool manifest.json
python -m json.tool package.json
node --check src/content.js
node --check options/options.js
npm install
npm run lint
npm run package
```

Manual smoke test:

1. Open Firefox and go to `about:debugging`.
2. Load `manifest.json` from the repository root as a temporary add-on.
3. Open Marktplaats.nl and/or 2dehands.be result pages.
4. Confirm promoted listings and banners are hidden by default.
5. Open the options page from `about:addons`, change a setting, and reload a result page.
6. Confirm seller and keyword blocklists persist locally.

## Upload steps

1. Build an unsigned upload package:

   ```bash
   npm run package
   ```

2. Confirm the ZIP contains `manifest.json` at the archive root and does not contain repository or development files:

   ```bash
   python -m zipfile -l dist/marktplaats-zonder-spam-v0.1.0.zip
   ```

3. Upload the ZIP from `dist/` to Mozilla Add-ons Developer Hub.
4. Use the listing copy, privacy statement, permission rationale, and testing notes above when completing the review form.

The GitHub Actions workflow in `.github/workflows/amo-package.yml` only lints and uploads an unsigned build artifact. It does not submit to AMO, sign the extension, or require secrets.
