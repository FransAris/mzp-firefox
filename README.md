<p align="center"><strong>Nederlands</strong> · <a href="README.en.md">English</a></p>

# Marktplaats Zonder Spam V2

Een kleine, vanilla browserextensie die ongewenste inhoud op Marktplaats en 2dehands-resultaatpagina's verbergt. Deze repo bevat builds voor Firefox en Chrome/Chromium. Dit is een originele MVP-implementatie op basis van zichtbaar gedrag en publieke DOM-signalen; er is geen code uit de oorspronkelijke Chrome-extensie gekopieerd.

Er was al een Firefox-plugin, gemaakt door een zekere 'Toverbal' maar deze is al 4 jaar niet meer geupdated. Vandaar deze.

Geinspireerd door de Chrome-extensie ["Marktplaats zonder spam"](https://chromewebstore.google.com/detail/lekhkeegnegccgaoakphligfonjmaodh?utm_source=item-share-cb). 

De maker van deze browserextensie is niet dezelfde maker als die van de originele, en heeft verder geen enkele band met Marktplaats.

<p align="center">
  <a href="https://addons.mozilla.org/nl/firefox/addon/mplaats-zonder-spam/" target="_blank" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/Firefox%20Add--ons-Installeer%20voor%20Firefox-FF7139?style=for-the-badge&amp;logo=firefoxbrowser&amp;logoColor=white" alt="Installeer voor Firefox op Firefox Add-ons" />
  </a>
</p>

<p align="center">
  <a href="#installerentesten-in-chromechromium" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/Chrome%20Web%20Store-Binnenkort-4285F4?style=for-the-badge&amp;logo=googlechrome&amp;logoColor=white" alt="Chrome Web Store - Binnenkort" />
  </a>
</p>

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

## Installeren in Firefox

Gebruik als normale gebruiker de stabiele versie op Firefox Add-ons: [Installeer Marktplaats Zonder Spam voor Firefox](https://addons.mozilla.org/nl/firefox/addon/mplaats-zonder-spam/). Dit is de aanbevolen installatie; Firefox houdt de add-on dan automatisch bij.

Repo-pakket: [download de Firefox XPI](dist/marktplaats-zonder-spam.xpi). Dit bestand is een ongetekend ontwikkel-/reviewpakket uit deze repo. Gebruik Firefox Add-ons voor gewone stabiele Firefox; gewone Firefox installeert een ongetekende XPI niet blijvend, tenzij je een ondertekend AMO-artefact hebt of een compatibele Firefox-variant gebruikt waarin handtekeningcontrole is uitgeschakeld.

## Handmatig installeren

### Chrome(ium)

De Chrome-versie staat in `chrome-version/`.
Voor gebruik zonder zelf te bouwen: [download de Chrome ZIP](chrome-version/dist/markplaats-zonder-spam-v2-chrome.zip), pak deze uit naar een map en laad die uitgepakte map. Ontwikkelaars kunnen ook zelf bouwen vanuit `chrome-version/`.

1. Open Chrome en ga naar `chrome://extensions`.
2. Zet **Developer mode** / **Ontwikkelaarsmodus** aan.
3. Klik op **Load unpacked** / **Uitgepakte extensie laden**.
4. Selecteer de uitgepakte ZIP-map, of vanuit de repo de map `chrome-version/

### Firefox

NB: Totdat Mozilla de plugin verifieert, is deze installatie _tijdelijk_. 

1. Open Firefox en ga naar `about:debugging`.
2. Kies **This Firefox** / **Deze Firefox**.
3. Klik op **Load Temporary Add-on...** / **Tijdelijke add-on laden...**.
4. Selecteer `manifest.json` uit deze projectmap.
5. Open of herlaad `https://www.marktplaats.nl/` of `https://www.2dehands.be/`.

Tijdelijke add-ons verdwijnen wanneer Firefox volledig wordt afgesloten. Laad de extensie daarna opnieuw via `about:debugging`. Gebruik dit alleen voor ontwikkeling of tijdelijk testen; dit is niet aanbevolen voor normale gebruikers.

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
