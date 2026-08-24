# Herdenkingssite

Een rustige plek om herinneringen te delen: foto's, video's en tekstjes,
gebundeld rond één centrale foto en een officiële tekst. Bezoekers kunnen zelf
iets uploaden; dat wordt pas zichtbaar nadat jij het hebt goedgekeurd.

## De site lokaal starten

```bash
npm run dev
```

Open daarna [http://localhost:3000](http://localhost:3000). De moderatiepagina
staat op [http://localhost:3000/beheer](http://localhost:3000/beheer).

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

De foto's worden willekeurig verspreid over de breedte van de pagina, in
wisselende formaten en zonder dat ze elkaar overlappen. Bij elke keer dat de
pagina opnieuw geladen wordt, krijgen ze een nieuwe verdeling — dezelfde
foto's staan dan dus ergens anders. Tijdens het scrollen blijft alles staan
waar het staat; het verandert alleen bij een herlaadbeurt. Op een telefoon
staan de foto's netjes onder elkaar in één kolom.

Let op voor later: omdat de indeling per bezoek verschilt, moet de homepage
straks online niet "gecached" worden. Dat is in de code al geregeld
(`force-dynamic` in `src/app/page.tsx`) — belangrijk om te weten als er ooit
een CDN of caching-laag voor gezet wordt.

## Hoe het delen werkt

- Iedereen kan via de knop "Deel een herinnering" (`/deel`) een tekstje,
  foto('s) of video('s) insturen — of een combinatie daarvan.
- Nieuwe bijdragen komen in de wachtrij ("Te beoordelen") op `/beheer` en zijn
  nog niet zichtbaar voor bezoekers.
- Na goedkeuren verschijnt de bijdrage op de homepage: bijdragen met tekst als
  kaartje, bijdragen met alleen foto's/video's los tussen de andere foto's.
- Je kan een bijdrage ook afwijzen, of achteraf alsnog verwijderen.

## Techniek (voor als je hier later iemand bij vraagt)

- Next.js (App Router) + TypeScript + Tailwind.
- Opslag: SQLite-bestand in `data/memorial.db` (berichten) en geüploade
  bestanden in `public/uploads/`. Beide staan buiten git (`.gitignore`) en
  leven alleen lokaal op deze machine.
- Inloggen op `/beheer` gebeurt met een wachtwoord uit `.env.local`
  (`ADMIN_PASSWORD`), niet met een los account.

### Belangrijk voor als de site straks online komt

Deze opzet (SQLite-bestand + lokale map voor uploads) werkt prima lokaal,
maar de meeste hostingplatformen (zoals Vercel) hebben geen permanente
schijfopslag — daar verdwijnen geüploade bestanden en de database bij elke
nieuwe deploy. Zodra je een domein hebt en live wil gaan, moet dat stuk
vervangen worden door bijvoorbeeld een gehoste database (Postgres/SQLite via
Turso) en cloudopslag voor media (bv. Vercel Blob of S3). Zeg het gewoon
zodra dat aan de orde is, dan regel ik dat.
