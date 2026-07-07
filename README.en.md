<p align="center"><a href="README.md">Nederlands</a> · <strong>English</strong></p>

# Marktplaats Without Spam V2

A small, vanilla browser extension that hides unwanted content on Marktplaats and 2dehands result pages. This repo contains builds for Firefox and Chrome/Chromium. This is an original MVP implementation based on visible behavior and public DOM signals; no code from the original Chrome extension was copied.
There already was a Firefox plugin, made by someone called 'Toverbal', but it has not been updated for 4 years. Hence this one.

Inspired by the Chrome extension ["Marktplaats zonder spam"](https://chromewebstore.google.com/detail/lekhkeegnegccgaoakphligfonjmaodh?utm_source=item-share-cb).

The maker of this browser extension is not the same maker, and has no connection to Marktplaats.

<p align="center">
  <a href="https://addons.mozilla.org/en-US/firefox/addon/mplaats-zonder-spam/" target="_blank" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/Firefox%20Add--ons-Install%20for%20Firefox-FF7139?style=for-the-badge&amp;logo=firefoxbrowser&amp;logoColor=white" alt="Install for Firefox on Firefox Add-ons" />
  </a>
</p>

<p align="center">
  <a href="#installtest-in-chromechromium" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/Chrome%20Web%20Store-Coming%20soon-4285F4?style=for-the-badge&amp;logo=googlechrome&amp;logoColor=white" alt="Chrome Web Store - Coming soon" />
  </a>
</p>

<p align="center">
  <a id="donate-button" href="https://tikkie.me/pay/upd18kg90oap9ea32sbj" target="_blank" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/Donate%20with-Tikkie-00b14f?style=for-the-badge" alt="Donate with Tikkie" />
  </a>
</p>

## Features

- Hides top ads, day toppers and 2dehands top listings by default.
- Hides Admarkt/commercial ads by default via `a...` item IDs and Admarkt CDN images.
- Hides ad banners and CAS/Adsense blocks.
- Hides sellers with an external website link by default.
- Supports optional filters for business/high-volume signals, verified sellers and reserved listings.
- Supports a seller blacklist and keyword blacklist.
- Adds a small **Hide seller** button to each listing.
- Shows a compact control panel on pages with listings, with visible/hidden counts and quick toggles.
- Optionally makes the layout more compact to reduce whitespace.

## Install manually

### Chrome/Chromium

The Chrome version is in `chrome-version/`.
To use it without building yourself: [download the Chrome ZIP](chrome-version/dist/markplaats-zonder-spam-v2-chrome.zip), unzip it to a folder and load that unpacked folder. Developers can also build it themselves from `chrome-version/`.

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the unzipped folder, or the `chrome-version/` folder from the repo.

### Firefox

1. Open Firefox and go to `about:debugging`.
2. Choose **This Firefox**.
3. Click **Load Temporary Add-on...**.
4. Select `manifest.json` from this project folder.
5. Open or reload `https://www.marktplaats.nl/` or `https://www.2dehands.be/`.

Temporary add-ons disappear when Firefox is fully closed. Load the extension again through `about:debugging` after that. Use this only for development or temporary testing; this is not recommended for normal users.

## Settings

Open the extension options from your browser. In Firefox, you can do that through `about:addons` or through the temporary add-on page in `about:debugging`; in Chrome/Chromium through `chrome://extensions`, **Details** and **Extension options**. There you can turn filters on/off, manage sellers and keywords, and export/import settings.

Default keyword blacklist:

- `VidaXL`
- `Used Products`
- `Catawiki`

Broad terms such as `www` or `.nl` are deliberately not active by default, because they can quickly hide too many legitimate listings. Only add them if you want to.

## Privacy

This extension does not collect, send or sell data. All settings stay local in your browser: Firefox uses `browser.storage.local`, Chrome/Chromium uses `chrome.storage.local`. No data leaves your browser and there are no external scripts, servers, analytics or npm dependencies.
The AMO manifest metadata therefore declares `data_collection_permissions.required` as `none`.

## Known limitations

- Marktplaats and 2dehands regularly change their HTML; selectors can break because of that.
- Business/high-volume and keyword filters are heuristics and can give false positives.
- Reserved detection uses `script#__NEXT_DATA__` with `reserved === true` where possible, with text recognition as fallback.
- The control panel only appears when listing elements are present on the page.

## Development

I am always open to suggestions, PRs, forks - go wild.

## Donate

If you really feel like it, you can donate, then I will make more time to maintain this / make a settlement with Marktplaats.

We just use a normal Tikkie here.

<p align="center">
  <a href="https://tikkie.me/pay/upd18kg90oap9ea32sbj" target="_blank" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/Donate%20with-Tikkie-00b14f?style=for-the-badge" alt="Donate with Tikkie" />
  </a>
</p>

## License

MIT. See [`LICENSE`](LICENSE).
