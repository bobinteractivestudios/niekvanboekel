# Herdenkingssite

Een rustige plek om herinneringen te delen: foto's, video's en tekstjes,
gebundeld rond één centrale foto en een officiële tekst. Bezoekers kunnen zelf
iets uploaden; dat staat direct op de pagina, zonder tussenstap.

## De site lokaal starten

```bash
npm run dev
```

Open daarna [http://localhost:3000](http://localhost:3000). Het beheerscherm
(voor het verwijderen van berichten) staat op
[http://localhost:3000/beheer](http://localhost:3000/beheer).

Het admin-wachtwoord staat in `.env.local` (bestand `ADMIN_PASSWORD`). Pas dit
gerust aan naar iets dat jij makkelijk onthoudt — herstart daarna `npm run dev`.
Dit bestand wordt nooit in git meegenomen.

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

## Hoe het delen werkt

- Iedereen kan via de knop "Deel een herinnering" (`/deel`) een tekstje,
  foto('s) of video('s) insturen — of een combinatie daarvan.
- Dat verschijnt meteen op de homepage: bijdragen met tekst als kaartje,
  bijdragen met alleen foto's/video's los tussen de andere foto's. Er is
  geen goedkeurstap — alles staat meteen live.
- Op `/beheer` (met wachtwoord) zie je alles wat gedeeld is, met een
  "Verwijderen"-knop erbij voor als er iets ongepasts tussen staat.

## Techniek (voor als je hier later iemand bij vraagt)

- Next.js (App Router) + TypeScript + Tailwind.
- Opslag heeft twee standen, die de code zelf kiest — jij hoeft daar niets
  voor om te zetten:
  - **Lokaal** (`npm run dev`, geen database- of Blob-variabelen gezet): een
    SQLite-bestand in `data/memorial.db` en geüploade bestanden
    in `public/uploads/`. Beide staan buiten git en leven alleen op deze
    Mac.
  - **Productie** (op Vercel, met een Postgres-database en Blob store
    gekoppeld): berichten in Postgres, geüploade bestanden in Vercel Blob.
  Zie [`src/lib/db/`](src/lib/db) en [`src/lib/uploads.ts`](src/lib/uploads.ts)
  als je precies wil weten hoe dat omschakelen werkt.
- Inloggen op `/beheer` gebeurt met een wachtwoord uit `.env.local`
  (`ADMIN_PASSWORD`), niet met een los account.

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

**3. Omgevingsvariabelen instellen** (Project → Settings → Environment Variables):
- `ADMIN_PASSWORD` — hetzelfde wachtwoord als lokaal, of een nieuwe.
- `SESSION_SECRET` — de waarde uit je lokale `.env.local` (of een nieuwe
  lange willekeurige string).

**4. Opslag koppelen** (Project → Storage):
- **Postgres**: "Create Database" → Postgres (via de Neon-integratie) →
  koppel 'm aan dit project. Vercel zet dan automatisch een connectie-string
  klaar als environment variable — meestal `DATABASE_URL`, maar bij de
  Neon-integratie heet die vaak `STORAGE_DATABASE_URL`. De code kijkt naar
  beide namen, dus dat hoef je niet zelf gelijk te trekken.
- **Blob**: "Create Database" → Blob → koppel 'm aan dit project. Vercel zet
  hiervoor tegenwoordig meestal geen los token meer klaar, maar
  `BLOB_STORE_ID` — de code herkent dat net zo goed en regelt de rest
  (authenticatie) automatisch via Vercel zelf.
- Na het koppelen: nog een keer deployen (Deployments → laatste deploy →
  "Redeploy") zodat de nieuwe omgevingsvariabelen meegenomen worden.

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
een testbericht via `/deel`, en keur 'm goed via `/beheer`.

Ik kan dit niet namens jou uitvoeren — de accountstappen bij Vercel en
Hostnet vereisen jouw eigen inloggegevens — maar loop graag met je mee als
je vastloopt op een van de stappen.
