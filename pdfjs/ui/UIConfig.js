// =========================================================
// JEANSELLEM — UIConfig (UI + barre externe) v28
// =========================================================
window.addEventListener('viewerLoaded', () => {
  const instance = window.instance;
  if (!instance || !instance.UI) return;
  const { UI, Core } = instance;

  // --- Nettoyage de la barre native ----------------------
  try {
    UI.setToolbarGroup && UI.setToolbarGroup(UI.ToolbarGroup.View);
    UI.setHeaderItems(h => { h.splice(0, h.length); });
    UI.disableElements?.([
      'toolbarGroupButton','toolsHeader','toolsOverlay',
      'notesPanel','notesPanelButton','toggleNotesButton','toggleNotesPanelButton',
      'ribbonsDropdownButton','menuButton','settingsButton','searchButton',
      'pageNavOverlay','pageNavigationOverlay',
      'downloadButton','downloadFileButton','printButton','openFileButton','shareButton',
      'languageButton','themeChangeButton',
      'selectToolButton','textSelectToolButton','panToolButton',
      'rotateClockwiseButton','rotateCounterClockwiseButton',
      'pageByPageButton','doublePageButton','coverFacingButton','pageOrientationButton',
      'fullscreenButton'
    ]);
    UI.closeElements?.(['toolsHeader','toolStylePopup','stylePopup','pageNavOverlay','pageNavigationOverlay']);
  } catch(e){}

  UI.setTheme?.('light');

  // --- Réglages à l’ouverture du PDF ---------------------
  const applyModes = () => {
    try { UI.setLayoutMode(UI.LayoutMode.Single); } catch(e){}
    try { UI.setScrollMode?.(UI.ScrollMode.PAGE); } catch(e){}
    try { UI.setPageTransitionMode?.(UI.PageTransitionMode.PAGE); } catch(e){}
    try { UI.setFitMode(UI.FitMode.FitWidth); } catch(e){}
    try { Core.documentViewer.setCurrentPage(1); } catch(e){}
  };
  Core.documentViewer.addEventListener('documentLoaded', applyModes);
  applyModes();

  // --- BARRE EXTERNE (dans <div id="jsl-toolbar">) -------
  const bar = document.getElementById('jsl-toolbar');
  if (bar && !bar.dataset.wired) {
    bar.innerHTML = `
      <button class="jsl-btn" data-act="zout" title="Zoom −">−</button>
      <button class="jsl-btn" data-act="zin"  title="Zoom +">+</button>
      <span class="jsl-sep"></span>
      <button class="jsl-btn" data-act="first" title="Première page">⏮︎</button>
      <button class="jsl-btn" data-act="prev"  title="Page précédente">◀︎</button>
      <button class="jsl-btn" data-act="next"  title="Page suivante">▶︎</button>
      <button class="jsl-btn" data-act="last"  title="Dernière page">⏭︎</button>
      <span class="jsl-sep"></span>
      <button class="jsl-btn jsl-btn-fs" data-act="fs" title="Plein écran">⤢</button>
    `;

    const dv = Core.documentViewer;
    const zoomStep = 1.1;
    bar.addEventListener('click', e => {
      const btn = e.target.closest('.jsl-btn'); if (!btn) return;
      const act = btn.dataset.act;
      const page = dv.getCurrentPage?.() || 1;
      const max  = dv.getPageCount?.() || 1;

      try {
        switch (act) {
          case 'zin':  dv.zoomTo(dv.getZoomLevel() * zoomStep); break;
          case 'zout': dv.zoomTo(dv.getZoomLevel() / zoomStep); break;
          case 'first': dv.setCurrentPage(1); break;
          case 'prev':  dv.setCurrentPage(Math.max(1, page - 1)); break;
          case 'next':  dv.setCurrentPage(Math.min(max, page + 1)); break;
          case 'last':  dv.setCurrentPage(max); break;
          case 'fs':    UI.enterFullscreen?.(); break;
        }
      } catch(err){
        console.warn('[JSL] Action toolbar erreur:', act, err);
      }
    });

    bar.dataset.wired = '1';
  }
});
