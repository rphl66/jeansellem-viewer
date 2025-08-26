// =========================================================
// JEANSELLEM — UIConfig (UI + barre flottante) v26
// =========================================================
window.addEventListener('viewerLoaded', () => {
  const instance = window.instance;
  if (!instance || !instance.UI) return;
  const { UI, Core } = instance;

  // --- Badge debug (3 s)
  if (!document.getElementById('jsl-debug')) {
    const b = document.createElement('div');
    b.id = 'jsl-debug';
    b.textContent = 'JSL UI v26 OK';
    Object.assign(b.style, {
      position:'fixed', top:'8px', right:'8px', zIndex:2147483647,
      background:'#222', color:'#fff', font:'12px/1.2 monospace',
      padding:'4px 6px', borderRadius:'6px', opacity:'0.9'
    });
    document.body.appendChild(b);
    setTimeout(()=> b.remove(), 3000);
  }

  // ------------------------
  // 1) Nettoyage de la barre du haut
  // ------------------------
  try {
    UI.setToolbarGroup && UI.setToolbarGroup(UI.ToolbarGroup.View);

    // On vide complètement le header
    UI.setHeaderItems(h => { h.splice(0, h.length); });

    // Cache fort des éléments qu’on ne veut pas (header, overlays, outils…)
    const HIDE = [
      // boutons/panels divers
      'toolbarGroupButton','toolsHeader','toolsOverlay',
      'notesPanel','notesPanelButton','toggleNotesButton','toggleNotesPanelButton',
      'ribbonsDropdownButton','menuButton','settingsButton','searchButton',
      // petit compteur “x/xx”
      'pageNavOverlay','pageNavigationOverlay',
      // autres actions
      'downloadButton','downloadFileButton','printButton','openFileButton','shareButton',
      'languageButton','themeChangeButton',
      'selectToolButton','textSelectToolButton','panToolButton',
      'rotateClockwiseButton','rotateCounterClockwiseButton',
      'pageByPageButton','doublePageButton','coverFacingButton','pageOrientationButton',
      'fullscreenButton'
    ];
    UI.disableElements && UI.disableElements(HIDE);
    HIDE.forEach(id => UI.updateElement && UI.updateElement(id, { hidden:true, disabled:true }));
    UI.closeElements && UI.closeElements([
      'toolsHeader','toolStylePopup','stylePopup',
      'pageNavOverlay','pageNavigationOverlay'
    ]);
  } catch(e){ /* no-op */ }

  // Thème
  UI.setTheme && UI.setTheme('light');

  // ------------------------
  // 2) Réglages mobiles au chargement du doc
  // ------------------------
  const isMobile = matchMedia('(max-width: 768px)').matches;
  Core.documentViewer.addEventListener('documentLoaded', () => {
    if (!isMobile) return;
    try { UI.setLayoutMode(UI.LayoutMode.Single); } catch(e){}
    try { UI.setScrollMode && UI.setScrollMode(UI.ScrollMode.PAGE); } catch(e){}
    try { UI.setPageTransitionMode && UI.setPageTransitionMode(UI.PageTransitionMode.PAGE); } catch(e){}
    try { UI.setFitMode(UI.FitMode.FitWidth); } catch(e){}
    try { Core.documentViewer.setCurrentPage(1); } catch(e){}
  });

  // ------------------------
  // 3) Barre flottante (bas-centre)
  // ------------------------
  function mountToolbar(){
    if (document.getElementById('jsl-toolbar')) return;

    const bar = document.createElement('div');
    bar.id = 'jsl-toolbar';
    bar.className = 'jsl-toolbar';
    bar.innerHTML = `
      <button class="jsl-btn" data-act="zout" title="Zoom -" aria-label="Zoom moins">−</button>
      <button class="jsl-btn" data-act="zin"  title="Zoom +" aria-label="Zoom plus">+</button>
      <span class="jsl-sep"></span>
      <button class="jsl-btn" data-act="first" title="Première page" aria-label="Première page">⏮︎</button>
      <button class="jsl-btn" data-act="prev"  title="Page précédente" aria-label="Page précédente">◀︎</button>
      <button class="jsl-btn" data-act="next"  title="Page suivante"  aria-label="Page suivante">▶︎</button>
      <button class="jsl-btn" data-act="last"  title="Dernière page"  aria-label="Dernière page">⏭︎</button>
      <span class="jsl-sep"></span>
      <button class="jsl-btn jsl-btn-fs" data-act="fs" title="Plein écran" aria-label="Plein écran">⤢</button>
    `;

    (document.getElementById('app') || document.body).appendChild(bar);

    const dv = Core.documentViewer;
    bar.addEventListener('click', e => {
      const btn = e.target.closest('.jsl-btn'); if (!btn) return;
      const act = btn.dataset.act;
      const page = dv.getCurrentPage ? dv.getCurrentPage() : 1;
      const max  = dv.getPageCount ? dv.getPageCount() : 1;

      switch (act) {
        case 'zin':  UI.zoomIn && UI.zoomIn(); break;
        case 'zout': UI.zoomOut && UI.zoomOut(); break;
        case 'first': dv.setCurrentPage && dv.setCurrentPage(1); break;
        case 'prev':  dv.setCurrentPage && dv.setCurrentPage(Math.max(1, page - 1)); break;
        case 'next':  dv.setCurrentPage && dv.setCurrentPage(Math.min(max, page + 1)); break;
        case 'last':  dv.setCurrentPage && dv.setCurrentPage(max); break;
        case 'fs':    UI.enterFullscreen && UI.enterFullscreen(); break;
      }
    });
  }

  // -- monte (ou remonte) la barre flottante de façon obstinée
  function ensureToolbarMounted() {
    if (!document.getElementById('jsl-toolbar')) {
      mountToolbar();
    }
  }
  ensureToolbarMounted();

  // 1) au chargement du doc
  Core.documentViewer.addEventListener('documentLoaded', ensureToolbarMounted);
  // 2) si le DOM du viewer est reconstruit
  new MutationObserver(ensureToolbarMounted).observe(document.body, { childList:true, subtree:true });
  // 3) petits rappels au cas où (éditeur Squarespace recrée des nœuds)
  setTimeout(ensureToolbarMounted, 600);
  setTimeout(ensureToolbarMounted, 1500);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) setTimeout(ensureToolbarMounted, 250);
  });
});
