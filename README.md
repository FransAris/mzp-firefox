<p align="center"><strong>Nederlands</strong> · <a href="README.en.md">English</a></p>

# Marktplaats Zonder Spam

Een kleine, vanilla browserextensie die ongewenste inhoud op Marktplaats en 2dehands-resultaatpagina's verbergt. Deze repo bevat builds voor Firefox en Chrome/Chromium. Dit is een originele MVP-implementatie op basis van zichtbaar gedrag en publieke DOM-signalen; er is geen code uit de oorspronkelijke Chrome-extensie gekopieerd.

Er was al een Firefox-plugin, gemaakt door een zekere 'Toverbal' maar deze is al 4 jaar niet meer geupdated. Vandaar deze.

## Inspiratie en onafhankelijkheid

Geinspireerd door de Chrome-extensie ["Marktplaats zonder spam"](https://chromewebstore.google.com/detail/lekhkeegnegccgaoakphligfonjmaodh?utm_source=item-share-cb). 

De maker van deze browserextensie is niet dezelfde maker, en heeft verder geen enkele band met Marktplaats.

<p align="center">
  <a id="donate-button" href="https://tikkie.me/pay/upd18kg90oap9ea32sbj" target="_blank" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/Doneer%20met-Tikkie-00b14f?style=for-the-badge" alt="Doneer met Tikkie" />
  </a>
</p>

## Functies

- Verbergt standaard topadvertenties, dagtoppers en 2dehands-topzoekertjes.
- Verbergt standaard Admarkt/commerciële advertenties via `a...` item-id's en Admarkt-CDN-afbeeldingen.
- Verbergt advertentiebanners en CAS/Adsense-blokken.
- Verbergt standaard verkopers met een externe website-link.
- Ondersteunt optionele filters voor zakelijke/high-volume signalen, geverifieerde verkopers en gereserveerde advertenties.
- Ondersteunt een verkoper-blacklist en keyword-blacklist.
- Voegt per advertentie een kleine knop **Verberg verkoper** toe.
- Toont een compact bedieningspaneel op pagina's met advertenties, met zichtbare/verborgen aantallen en snelle toggles.
- Maakt de layout optioneel compacter om witruimte te verminderen.

## Installeren/testen in Firefox

1. Open Firefox en ga naar `about:debugging`.
2. Kies **This Firefox** / **Deze Firefox**.
3. Klik op **Load Temporary Add-on...** / **Tijdelijke add-on laden...**.
4. Selecteer `manifest.json` uit deze projectmap.
5. Open of herlaad `https://www.marktplaats.nl/` of `https://www.2dehands.be/`.

Tijdelijke add-ons verdwijnen wanneer Firefox volledig wordt afgesloten. Laad de extensie daarna opnieuw via `about:debugging`.

## Installeren/testen in Chrome/Chromium

De Chrome-versie staat in `chrome-version/`.

1. Open Chrome en ga naar `chrome://extensions`.
2. Zet **Developer mode** / **Ontwikkelaarsmodus** aan.
3. Klik op **Load unpacked** / **Uitgepakte extensie laden**.
4. Selecteer de map `chrome-version/`.

Package maken vanuit `chrome-version/`:

```bash
npm run validate && npm run package
```

Upload daarna deze ZIP naar de Chrome Web Store:

```text
chrome-version/dist/markplaats-zonder-spam-v2-chrome-v0.1.0.zip
```

De Chrome-versie gebruikt `chrome-icon.png` als bron via de gegenereerde assets in `chrome-version/icons/`; het bronbestand zelf hoort niet in de Chrome ZIP.

## Instellingen

Open de extensie-opties vanuit je browser. In Firefox kan dat via `about:addons` of via de tijdelijke add-onpagina in `about:debugging`; in Chrome/Chromium via `chrome://extensions`, **Details** en **Extension options** / **Extensieopties**. Daar kun je filters aan/uit zetten, verkopers en keywords beheren, en instellingen exporteren/importeren.

Standaard keyword-blacklist:

- `VidaXL`
- `Used Products`
- `Catawiki`

Brede termen zoals `www` of `.nl` zijn bewust niet standaard actief, omdat ze snel te veel legitieme advertenties kunnen verbergen. Voeg ze alleen toe als je dat zelf wilt.

## Privacy

Deze extensie verzamelt, verstuurt of verkoopt geen data. Alle instellingen blijven lokaal in je browser: Firefox gebruikt `browser.storage.local`, Chrome/Chromium gebruikt `chrome.storage.local`. Er verlaat geen data je browser en er zijn geen externe scripts, servers, analytics of npm-dependencies.
De AMO-manifestmetadata declareert daarom `data_collection_permissions.required` als `none`.

## Bekende beperkingen

- Marktplaats en 2dehands wijzigen hun HTML regelmatig; selectors kunnen daardoor breken.
- Zakelijke/high-volume en keyword-filters zijn heuristieken en kunnen false positives geven.
- Gereserveerd-detectie gebruikt waar mogelijk `script#__NEXT_DATA__` met `reserved === true`, met tekstherkenning als fallback.
- Het bedieningspaneel verschijnt alleen wanneer er listing-elementen op de pagina staan.

## Development

Ik sta altijd open voor suggesties, PR's, fork - ga los.

Validatie en packages maken:

```bash
# Firefox, vanuit de repo-root
npm run validate && npm run package

# Chrome/Chromium
(cd chrome-version && npm run validate && npm run package)
```

## Doneer

Als je er veel zin in hebt kan je doneren, dan maak ik meer tijd vrij om dit te onderhouden / een schikking te treffen met Marktplaats.

Hier doen we gewoon normaal een Tikkie.

<p align="center">
  <a href="https://tikkie.me/pay/upd18kg90oap9ea32sbj" target="_blank" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/Doneer%20met-Tikkie-00b14f?style=for-the-badge" alt="Doneer met Tikkie" />
  </a>
</p>

## Licentie

MIT. Zie [`LICENSE`](LICENSE).
