# BREINWAR 3D — De Nazi-Jacht

Een originele first-person shooter in de geest van **Wolfenstein 3D** en **DOOM**,
 compleet in HTML5/JavaScript — geen engines, geen libraries, geen gekopieerde assets.
Alle textures, sprites, wapens, gezichten en geluid worden procedureel gegenereerd
in de browser (Canvas2D + WebAudio).

## Hoe te spelen

```bash
cd breinwar3d
python3 -m http.server 8080
# open http://localhost:8080
```

Of open via GitHub Pages / elke statische host. (Werkt ook via `file://`, maar een
webserver is aanbevolen.)

## Besturing

| Toets | Actie |
|---|---|
| Muis | rondkijken (pointer lock) |
| Klik / Ctrl | schieten |
| W A S D | lopen & straffen |
| Shift | rennen |
| Spatie / E | deuren, pushwalls, uitgang |
| 1–4 | wapens |
| Tab | minimap |
| Esc | pauze |
| M | geluid |
| F | CRT-filter aan/uit |

## Inhoud

- **3 levels**: De Bunker, Het Kasteel, De Fabriek — deuren, sloten, gouden/zilveren sleutels, **pushwall-geheimen**
- **4 wapens**: mes, pistool, shotgun (7 hagels), machinegun — met muzzle-flash, bob en recoil
- **Vijanden**: wacht, officier, hond — patrol/alarm/jacht/aanval-AI met line-of-sight
- **Bonussen**: health, medkit, ammunitie, schatten (score), extra leven, **RUSH** (20 s dubbele schade)
- **HUD** in Wolfenstein-stijl: munitie, gezondheid, wapen, gezicht, sleutels, leven, score, tijd, kill-teller
- **Hoe-to** scherm bij start, level-stats (kills %, geheimen %, tijd + bonus), CRT-scanline-filter
- Procedureel geluid: schoten, deuren, alarm, pickup-jingles, overwinningsfanfare

## Eigen verbeteringen t.o.v. klassieke web-raycasters

- Muis-look met pointer lock (klassiek Wolfenstein had alleen toetsen-draaien)
- Straffen met A/D, rennen, soepele versnelling
- Minimap, level-statistieken, rush-bonus (DOOM-achtige power-up)
- Complete Nederlandse handleiding in het spel
- Volledig procedurele art & audio — dus auteursrechtvrij en licht (< 60 KB)

## Credits & licentie

Hommage aan Wolfenstein 3D (id Software, 1992) en DOOM. Geen assets van die spellen
gebruikt. Code & art: Patrick W. Bömer / BrainFusion, MIT-licentie.
