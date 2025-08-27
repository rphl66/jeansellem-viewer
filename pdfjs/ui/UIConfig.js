// =========================================================
// JEANSELLEM — UIConfig (nettoyage UI interne, SANS barre) v33
// =========================================================
window.addEventListener('viewerLoaded', () => {
  const inst = window.instance;
  if (!inst || !inst.UI) return;
  const { UI, Core } = inst;

  // -- 1) Nettoyage total de la barre interne -----------------
  try {
    UI.setToolbarGroup?.(UI.ToolbarGroup.View);
    UI.setHeaderItems?.(h => { h.splice(0, h.length); });

    const HIDE = [
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
    ];

    UI.disableElements?.(HIDE);
    HIDE.forEach(id => UI.updateElement?.(id, { hidden: true, disabled: true }));
    UI.closeElements?.(['toolsHeader','toolStylePopup','stylePopup','pageNavOverlay','pageNavigationOverlay']);
    UI.setTheme?.('light');
  } catch (e) {
    console.warn('[JSL] UI cleanup error:', e);
  }

  // -- 2) Réglages mobiles à l’ouverture ----------------------
  const isMobile = matchMedia('(max-width: 768px)').matches;
  Core?.documentViewer?.addEventListener('documentLoaded', () => {
    if (!isMobile) return;
    try { UI.setLayoutMode(UI.LayoutMode.Single); } catch(e){}
    try { UI.setScrollMode?.(UI.ScrollMode.PAGE); } catch(e){}
    try { UI.setPageTransitionMode?.(UI.PageTransitionMode.PAGE); } catch(e){}
    try { UI.setFitMode?.(UI.FitMode.FitWidth); } catch(e){}
    try { Core.documentViewer.setCurrentPage?.(1); } catch(e){}
  });

  // -- 3) Filet de sécurité : supprimer toute barre "legacy" --
  //    (au cas où un vieux script ré-injecterait #jsl-toolbar
  //     DANS l’iframe du viewer)
  const killInternalToolbar = () => {
    const scope = document.getElementById('app') || document.body;
    scope.querySelectorAll('#jsl-toolbar, .jsl-toolbar').forEach(el => el.remove());
  };
  killInternalToolbar();
  new MutationObserver(killInternalToolbar).observe(document.body, { childList: true, subtree: true });
});
