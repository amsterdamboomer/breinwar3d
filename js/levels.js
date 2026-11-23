// BREINWAR 3D — levels, gebouwd met een carve-builder (altijd rechthoekig & gesloten).
// Legenda: # baksteen S steen M metaal W hout B marmer | E uitgang D deur G gouden deur V zilveren deur P pushwall
// Items: + health  H medkit  a ammunitie  A ammobox  k mes  p pistool  s shotgun  c machinegun
//        t schat  T grote schat  L extra leven  R rush  y gouden sleutel  v zilveren sleutel
//        Vijanden: g wacht  o officier  d hond   @ spelerstart   . vloer
'use strict';
const LEVELS = (function () {
  function blank(w, h, wallCh) {
    const g = [];
    for (let y = 0; y < h; y++) g.push(new Array(w).fill(wallCh));
    return g;
  }
  function carve(g, x, y, w, h) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = '.';
  }
  function put(g, x, y, ch) { g[y][x] = ch; }

  // ── LEVEL 1 — DE BUNKER (24x18, baksteen) ──────────────────────────
  function level1() {
    const g = blank(24, 18, '#');
    carve(g, 1, 1, 6, 7);    // A startkamer  x1-6  y1-7
    carve(g, 8, 1, 9, 7);    // B grote hal   x8-16 y1-7
    carve(g, 18, 1, 5, 7);   // C oostvleugel x18-22 y1-7 (uitgang)
    carve(g, 1, 9, 6, 8);    // D zuidkamer   x1-6  y9-16
    carve(g, 8, 9, 9, 8);    // E zuidhal     x8-16 y9-16
    carve(g, 18, 9, 4, 8);   // F schatkamer  x18-21 y9-16 (geheim)
    put(g, 7, 4, 'D');       // A -> B
    put(g, 17, 4, 'D');      // B -> C
    put(g, 3, 8, 'D');       // A -> D
    put(g, 10, 8, 'D');      // B -> E
    put(g, 17, 12, 'P');     // E -> F  PUSHWALL (geheim)
    put(g, 23, 4, 'E');      // uitgang
    put(g, 2, 2, '@');
    put(g, 4, 2, 'p'); put(g, 2, 6, '+'); put(g, 5, 5, 'a');
    put(g, 9, 2, 'a'); put(g, 15, 6, '+');
    put(g, 19, 2, 't'); put(g, 21, 6, 'a');
    put(g, 2, 10, 's'); put(g, 5, 15, '+'); put(g, 1, 12, 'a');
    put(g, 12, 10, 'H'); put(g, 9, 16, 'L'); put(g, 15, 13, 'A');
    put(g, 19, 10, 'T'); put(g, 21, 11, 't'); put(g, 19, 16, 't');
    put(g, 12, 3, 'g'); put(g, 14, 9, 'g'); put(g, 19, 6, 'g');
    put(g, 4, 13, 'g'); put(g, 11, 14, 'g'); put(g, 14, 11, 'd');
    return { name: 'LEVEL 1 — DE BUNKER', sub: 'De vijand zit diep. Vind de uitgang.',
      tip: 'Tip: die ene muur in de zuidhal voelt verdacht hol aan…', map: g.map(r => r.join('')).join('\n') };
  }

  // ── LEVEL 2 — HET KASTEEL (28x20, steen + hout) ────────────────────
  function level2() {
    const g = blank(28, 20, 'S');
    for (let x = 2; x < 26; x += 5) { put(g, x, 0, 'W'); put(g, x, 19, 'W'); }
    carve(g, 1, 1, 8, 7);    // A start     x1-8  y1-7
    carve(g, 10, 1, 8, 7);   // B burchtzaal x10-17 y1-7
    carve(g, 19, 1, 8, 7);   // C oostzaal  x19-26 y1-7
    carve(g, 1, 9, 8, 10);   // D westvleugel x1-8 y9-18
    carve(g, 10, 9, 8, 5);   // E binnenplaats x10-17 y9-13
    carve(g, 10, 16, 8, 3);  // F benedenzaal  x10-17 y16-18
    carve(g, 19, 9, 8, 10);  // G oostvleugel  x19-26 y9-18
    put(g, 9, 3, 'D');       // A -> B
    put(g, 18, 3, 'D');      // B -> C
    put(g, 4, 8, 'D');       // A -> D
    put(g, 13, 8, 'D');      // B -> E
    put(g, 13, 14, 'V'); put(g, 13, 15, '.');  // E -> F (zilver)
    put(g, 23, 8, 'D');      // C -> G
    put(g, 18, 12, 'G');     // E -> G (goud)
    put(g, 18, 17, 'P');     // F -> G  PUSHWALL (geheim)
    put(g, 27, 17, 'E');     // uitgang
    put(g, 2, 2, '@');
    put(g, 5, 1, 'p'); put(g, 1, 5, '+'); put(g, 6, 4, 'a');
    put(g, 11, 2, 'A'); put(g, 14, 1, 't'); put(g, 16, 5, '+');
    put(g, 21, 2, 'v'); put(g, 25, 5, 't'); put(g, 23, 1, 'a');
    put(g, 2, 10, 'c'); put(g, 5, 13, '+'); put(g, 2, 18, 'A'); put(g, 6, 17, 'L');
    put(g, 11, 10, 'H'); put(g, 12, 12, 't'); put(g, 16, 12, 'R');
    put(g, 11, 17, 'T'); put(g, 16, 18, 'y');
    put(g, 21, 10, 't'); put(g, 25, 15, 'T'); put(g, 22, 18, 'A'); put(g, 25, 10, '+');
    put(g, 12, 4, 'g'); put(g, 16, 2, 'g'); put(g, 22, 4, 'g');
    put(g, 3, 12, 'g'); put(g, 5, 16, 'd'); put(g, 2, 15, 'g');
    put(g, 12, 11, 'g'); put(g, 15, 10, 'd'); put(g, 14, 17, 'o');
    put(g, 22, 14, 'o'); put(g, 24, 12, 'g'); put(g, 25, 17, 'g'); put(g, 21, 16, 'd');
    return { name: 'LEVEL 2 — HET KASTEEL', sub: 'De officieren bewaken de sleutels.',
      tip: 'Tip: zilver opent de benedenzaal, goud de oostvleugel. In de benedenzaal zit een pushwall.',
      map: g.map(r => r.join('')).join('\n') };
  }

  // ── LEVEL 3 — DE FABRIEK (30x22, metaal) ───────────────────────────
  function level3() {
    const g = blank(30, 22, 'M');
    for (let y = 2; y < 21; y += 6) { put(g, 0, y, 'B'); put(g, 29, y, 'B'); }
    carve(g, 1, 1, 8, 7);    // A start     x1-8  y1-7
    carve(g, 10, 1, 8, 7);   // B montagehal x10-17 y1-7
    carve(g, 19, 1, 10, 7);  // C kantoren  x19-28 y1-7
    carve(g, 1, 9, 8, 7);    // D magazijn  x1-8  y9-15
    carve(g, 10, 9, 8, 7);   // E kerncentrale x10-17 y9-15
    carve(g, 19, 9, 10, 7);  // F laboratoria  x19-28 y9-15
    carve(g, 1, 17, 28, 4);  // G ondergrondse gang x1-28 y17-20
    put(g, 9, 3, 'D');  put(g, 18, 3, 'D');
    put(g, 4, 8, 'D');  put(g, 14, 8, 'D');  put(g, 24, 8, 'D');
    put(g, 4, 16, 'G');      // gouden deur magazijn -> gang
    put(g, 24, 16, 'V');     // zilveren deur laboratoria -> gang
    put(g, 18, 12, 'P');     // pushwall centrale -> kantoren (geheim)
    put(g, 29, 19, 'E');     // uitgang
    put(g, 2, 2, '@');
    put(g, 6, 1, 'p'); put(g, 1, 5, '+'); put(g, 7, 5, 'a');
    put(g, 12, 2, 'A'); put(g, 15, 3, 't'); put(g, 17, 6, '+');
    put(g, 22, 2, 'y'); put(g, 27, 5, 't'); put(g, 25, 1, 'v');
    put(g, 2, 10, 's'); put(g, 7, 13, 'A'); put(g, 3, 14, '+');
    put(g, 12, 10, 'H'); put(g, 13, 13, 't'); put(g, 16, 13, 'R');
    put(g, 22, 10, 'c'); put(g, 27, 13, 'T'); put(g, 23, 13, '+');
    put(g, 2, 18, 'L'); put(g, 8, 19, 'T'); put(g, 15, 18, 'A'); put(g, 20, 19, 't');
    put(g, 13, 4, 'g'); put(g, 16, 2, 'g'); put(g, 23, 4, 'o');
    put(g, 26, 2, 'g'); put(g, 5, 11, 'g'); put(g, 6, 13, 'd');
    put(g, 13, 11, 'o'); put(g, 16, 10, 'g'); put(g, 12, 13, 'd');
    put(g, 23, 11, 'g'); put(g, 26, 10, 'o'); put(g, 25, 12, 'd');
    put(g, 6, 18, 'g'); put(g, 11, 19, 'o'); put(g, 17, 19, 'g');
    put(g, 22, 18, 'o'); put(g, 26, 19, 'd'); put(g, 14, 18, 'd');
    return { name: 'LEVEL 3 — DE FABRIEK', sub: 'Het laatste bolwerk. Geen weg terug.',
      tip: 'Tip: de gouden sleutel ligt in de kantoren. Achter de muur naast de centrale zit nog een verrassing.',
      map: g.map(r => r.join('')).join('\n') };
  }

  return [level1(), level2(), level3()];
})();
