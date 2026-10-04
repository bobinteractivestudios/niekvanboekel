# Herdenkingssite

Een rustige plek met herinneringen: foto's, video's en tekstjes, gebundeld
rond één centrale foto en een officiële tekst. Het delen via de site staat
uit — alle herinneringen staan als bestanden in de repository.

## De site lokaal starten

```bash
npm run dev
```

Open daarna [http://localhost:3000](http://localhost:3000).

## Inhoud aanpassen

**Naam, data en officiële tekst** staan in [`content/site.json`](content/site.json).
Dit is gewoon tekst, geen code — pas het rechtstreeks aan:

```json
{
  "name": "...",
  "introLine": "...",
  "birthDate": "JJJJ-MM-DD",
  "deathDate": "JJJJ-MM-DD",
  "heroImage": "/photos/hero-placeholder.svg",
  "officialText": ["Eerste alinea...", "Tweede alinea..."]
}
```

**De centrale foto** (bovenaan de pagina): zet een echte foto in
`public/photos/` (bv. `public/photos/hero.jpg`) en verwijs ernaar via
`heroImage` in `content/site.json`, bijvoorbeeld `"/photos/hero.jpg"`.

**De grote foto-bibliotheek** die je zelf aanlevert: zet die bestanden gewoon
in de map `public/gallery/`. Alles wat daarin staat (jpg, png, webp, gif,
heic) verschijnt automatisch op de homepage — er is geen upload-stap nodig,
gewoon bestanden in de map plaatsen. De huidige grijze vlakken staan er als
placeholder; die mag je verwijderen en vervangen.

De foto's én de tekstherinneringen worden samen willekeurig verspreid over
de breedte van de pagina, in wisselende formaten en zonder dat ze elkaar
overlappen — een herinnering met een foto erbij staat als één kaartje, een
herinnering zonder foto is een tekstkaartje, en een losse foto (uit de
bibliotheek, of zonder tekst ingestuurd) is gewoon een foto. Bij elke keer
dat de pagina opnieuw geladen wordt, krijgt alles een nieuwe verdeling.
Tijdens het scrollen blijft alles staan waar het staat; het verandert alleen
bij een herlaadbeurt. Op een telefoon staat alles netjes onder elkaar in één
kolom.

Technisch detail: omdat tekst geen vaste hoogte heeft zoals een foto (dat
hangt af van hoe de tekst afbreekt), wordt de hoogte van een tekstkaartje
geschat op basis van de lengte van het bericht, met wat extra marge om
overlap te voorkomen. Bij een uitzonderlijk lang bericht kan een kaartje dus
iets meer lucht hebben dan strikt nodig — dat weegt niet op tegen het risico
dat tekst zou overlappen.

Let op voor later: omdat de indeling per bezoek verschilt, moet de homepage
straks online niet "gecached" worden. Dat is in de code al geregeld
(`force-dynamic` in `src/app/page.tsx`) — belangrijk om te weten als er ooit
een CDN of caching-laag voor gezet wordt.

## De herinneringen

- Alle gedeelde herinneringen staan in
  [`content/memories.json`](content/memories.json): per herinnering de naam
  (`author_name`, of `null` voor anoniem), de tekst (`body`, of `null` voor
  een losse foto/video), de datum (`created_at`) en de bijbehorende foto's
  en video's (`media`).
- De foto's en video's zelf staan in `public/memories/`.
- Iets verwijderen: haal het blok uit `memories.json` (en eventueel het
  bestand uit `public/memories/`). Iets toevoegen: zet het bestand in
  `public/memories/` en voeg een blok toe in hetzelfde formaat.
- Er is geen database, geen uploadformulier en geen beheerpagina meer.

## Techniek (voor als je hier later iemand bij vraagt)

- Next.js (App Router) + TypeScript + Tailwind.
- Alles wordt uit bestanden in de repository geladen
  ([`src/lib/memories.ts`](src/lib/memories.ts)); er zijn geen
  omgevingsvariabelen, database of externe opslag nodig.

## Live zetten op Vercel, met de domeinnaam van Hostnet

De domeinnaam blijft gewoon bij Hostnet geregistreerd — je wijst 'm alleen
naar Vercel. Vercel is waar de site zelf continu draait; dat is nodig omdat
dit geen statische pagina is maar een applicatie die formulieren verwerkt.

**1. Code staat al op GitHub** — [`bobinteractivestudios/niekvanboekel`](https://github.com/bobinteractivestudios/niekvanboekel).
Vercel bouwt de site rechtstreeks vanuit die repository.

**2. Vercel-account + project**
1. Ga naar [vercel.com](https://vercel.com) en log in (bijvoorbeeld met je
   GitHub-account — dat maakt de koppeling met de repository het makkelijkst).
2. "Add New" → "Project" → kies `bobinteractivestudios/niekvanboekel`.
3. Bij het instellen van het project: laat de standaardinstellingen staan
   (Vercel herkent Next.js automatisch) en klik nog niet op "Deploy" — eerst
   nog de omgevingsvariabelen instellen (volgende stap), anders moet je na
   deze stap opnieuw deployen.

**3. Geen opslag of omgevingsvariabelen nodig** — de site draait volledig
op de bestanden uit de repository. Een eerder gekoppelde Postgres-database
en Blob store kunnen in Vercel (Project → Storage) ontkoppeld en verwijderd
worden.

**5. Domeinnaam koppelen** (Project → Settings → Domains):
1. Vul `niekvanboekel.nl` in en klik "Add". Vercel laat dan zien welke
   DNS-records nodig zijn (meestal een A-record naar een IP-adres, en een
   CNAME voor `www`).
2. Log in bij Hostnet ([mijn.hostnet.nl](https://mijn.hostnet.nl)), ga naar
   het DNS-beheer van `niekvanboekel.nl`, en voeg precies die records toe
   die Vercel aangeeft.
3. Dit kan tot enkele uren duren voordat het overal doorkomt. Vercel regelt
   het SSL-certificaat (het slotje/https) daarna automatisch.

**6. Testen**: bezoek de site op de Vercel-URL (`niekvanboekel.vercel.app`
oid.) en straks op `niekvanboekel.nl` — kijk of de homepage laadt, probeer
en of de herinneringen met foto's en video's zichtbaar zijn.

Ik kan dit niet namens jou uitvoeren — de accountstappen bij Vercel en
Hostnet vereisen jouw eigen inloggegevens — maar loop graag met je mee als
je vastloopt op een van de stappen.
