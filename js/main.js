// BREINWAR 3D — bootstrap: overlays, knoppen, game-loop.
'use strict';
(function () {
  const $ = id => document.getElementById(id);
  const cv = $('screen');
  const game = new Game(cv);
  window.__game = game;

  const OV = ['ov-menu', 'ov-intro', 'ov-pause', 'ov-dead', 'ov-clear', 'ov-over', 'ov-win'];
  function show(id) { OV.forEach(o => $(o).classList.toggle('hidden', o !== id)); }
  function hideAll() { OV.forEach(o => $(o).classList.add('hidden')); }

  game.onState = function (s) {
    if (s === 'play') { hideAll(); return; }
    if (s === 'menu') show('ov-menu');
    if (s === 'intro') {
      const L = LEVELS[game.levelIdx];
      $('intro-title').textContent = L.name;
      $('intro-sub').textContent = L.sub;
      $('intro-tip').textContent = L.tip;
      show('ov-intro');
    }
    if (s === 'pause') show('ov-pause');
    if (s === 'dead') { $('dead-sub').textContent = 'Nog ' + game.lives + ' leven' + (game.lives === 1 ? '' : 's') + ' over.'; show('ov-dead'); }
    if (s === 'clear') {
      const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
      $('clear-stats').innerHTML =
        'Vijanden uitgeschakeld: ' + pct(game.kills, game.enemiesTotal) + '%<br>' +
        'Geheimen gevonden: ' + pct(game.secretsFound, game.secretsTotal) + '%<br>' +
        'Tijd: ' + Math.floor(game.levelTime) + 's &nbsp;·&nbsp; Bonus: +' + game.clearBonus +
        '<br><b>TOTAAL SCORE: ' + game.score + '</b>';
      show('ov-clear');
    }
    if (s === 'gameover') { $('over-score').textContent = 'Eindscore: ' + game.score; show('ov-over'); }
    if (s === 'win') { $('win-score').textContent = 'Eindscore: ' + game.score; show('ov-win'); }
  };

  $('btn-start').onclick = () => { AudioSys.init(); AudioSys.resume(); game.newGame(); };
  $('btn-intro').onclick = () => game.beginPlay();
  $('btn-resume').onclick = () => game.resume();
  $('btn-dead').onclick = () => game.respawn();
  $('btn-clear').onclick = () => game.nextLevel();
  $('btn-over').onclick = () => game.newGame();
  $('btn-win').onclick = () => game.newGame();

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    game.update(dt);
    game.render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  window.onerror = function (m, src, line) {
    const box = $('errbox'); box.classList.remove('hidden');
    box.textContent = 'FOUT: ' + m + ' (' + src + ':' + line + ')';
    return false;
  };
})();
