# Marktplaats Zonder Spam (Firefox)

Een kleine, vanilla Firefox WebExtension die ongewenste inhoud op Marktplaats en 2dehands-resultaatpagina's verbergt. Dit is een originele MVP-implementatie op basis van zichtbaar gedrag en publieke DOM-signalen; er is geen code uit de Chrome-extensie gekopieerd.

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

## Installeren in Firefox als tijdelijke add-on

1. Open Firefox en ga naar `about:debugging`.
2. Kies **This Firefox** / **Deze Firefox**.
3. Klik op **Load Temporary Add-on...** / **Tijdelijke add-on laden...**.
4. Selecteer `manifest.json` uit deze projectmap.
5. Open of herlaad `https://www.marktplaats.nl/` of `https://www.2dehands.be/`.

Tijdelijke add-ons verdwijnen wanneer Firefox volledig wordt afgesloten. Laad de extensie daarna opnieuw via `about:debugging`.

## Instellingen

Open de extensie-opties vanuit `about:addons` of via de tijdelijke add-onpagina. Daar kun je filters aan/uit zetten, verkopers en keywords beheren, en instellingen exporteren/importeren.

Standaard keyword-blacklist:

- `VidaXL`
- `Used Products`
- `Catawiki`

Brede termen zoals `www` of `.nl` zijn bewust niet standaard actief, omdat ze snel te veel legitieme advertenties kunnen verbergen. Voeg ze alleen toe als je dat zelf wilt.

## Privacy

Deze extensie verzamelt, verstuurt of verkoopt geen data. Alle instellingen blijven lokaal in `browser.storage.local` in Firefox. Er zijn geen externe scripts, servers, analytics of npm-dependencies.

## Bekende beperkingen

- Marktplaats en 2dehands wijzigen hun HTML regelmatig; selectors kunnen daardoor breken.
- Zakelijke/high-volume en keyword-filters zijn heuristieken en kunnen false positives geven.
- Gereserveerd-detectie gebruikt waar mogelijk `script#__NEXT_DATA__` met `reserved === true`, met tekstherkenning als fallback.
- Het bedieningspaneel verschijnt alleen wanneer er listing-elementen op de pagina staan.

## Ontwikkeling

Geen buildstap nodig. Bewerk de statische bestanden en herlaad de tijdelijke add-on in Firefox.

Handige validatie:

```bash
python -m json.tool manifest.json
node --check src/content.js
node --check options/options.js
```

## Licentie

MIT. Zie [`LICENSE`](LICENSE).
