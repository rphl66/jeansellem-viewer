// =========================================================
// JEANSELLEM — PDF Viewer (UI settings + barre flottante interne)
// =========================================================

(function () {
  function onReady(instance) {
    const { UI, Core } = instance;

    // --- Verrous fonctionnels
    UI.setFeatureFlags({
      disableLocalFilePicker: true,
      disablePrint: true,
      disableDownload: true,
    });

    // --- Cacher des éléments
    const HIDE_IDS = [
      'downloadButton','downloadFileButton',
      'printButton',
      'themeChangeButton','languageButton',
      'selectToolButton','textSelectToolButton','panToolButton',
      'rotateClockwiseButton','rotateCounterClockwiseButton',
      'pageManipulationOverlayRotateClockwise','pageManipulationOverlayRotateCounterClockwise',
      'pageByPageButton','doublePageButton','coverFacingButton','pageOrientationButton',
      'fullscreenButton'
    ];
    const KILL_TEXTS = new Set([
      'Page by Page','Page Orientation','Page Layout','Double Page','Cover Facing Page'
    ]);

    function hideById(){
      try {
        UI.disableElements(HIDE_IDS);
        HIDE_IDS.forEach(id => UI.updateElement(id, { hidden:true, disabled:true }));
      } catch(e){}
    }
    function hideByText(){
      const overlays = document.querySelectorAll(
        '[data-element="viewControlsOverlay"], .viewControlsOverlay, .Overlay, .Menu'
      );
      overlays.forEach(ov=>{
        ov.querySelectorAll('*').forEach(el=>{
          const t = (el.textContent||'').trim();
          if (KILL_TEXTS.has(t)) {
            const block = el.closest('[data-element], .Menu, .Row, li, button') || el;
            block.style.display = 'none';
          }
        });
      });
    }
    const applyAll = ()=>{ hideById(); hideByText(); };
    applyAll(); setTimeout(applyAll, 200); setTimeout(applyAll, 600);

    // Observer l'UI et le body (certains overlays sont portés)
    const root = UI.getRootElement();
    new MutationObserver(applyAll).observe(root, { childList:true, subtree:true, attributes:true });
    new MutationObserver(applyAll).observe(document.body, { childList:true, subtree:true });
    document.addEventListener('click', ()=>setTimeout(applyAll,0), true);
    document.addEventListener('keydown', ()=>setTimeout(applyAll,0), true);

    // --- Bouton Fullscreen dans la barre d'en-tête (optionnel, on le garde)
    const fullscreenSVG =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M8 5H5v3M16 5h3v3M8 19H5v-3M16 19h3v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M9 9L5 5M15 9l4-4M9 15l-4 4M15 15l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

    UI.setHeaderItems(header => {
      header.push(
        { type:'zoomOutButton' },
        { type:'zoomDropdown' },
        { type:'zoomInButton' },
        { type:'actionButton', dataElement:'myFullscreenButton', title:'Full screen', img: fullscreenSVG,
          onClick: () => UI.enterFullscreen()
        }
      );
    });

    // --- Réglages mobile (couverture, page-by-page, FitWidth)
    const isMobile = matchMedia('(max-width: 768px)').matches;
    Core.documentViewer.addEventListener('documentLoaded', () => {
      if (!isMobile) return;
      try { UI.setLayoutMode(UI.LayoutMode.Single); } catch(e){}
      try { UI.setScrollMode && UI.setScrollMode(UI.ScrollMode.PAGE); } catch(e){}
      try { UI.setPageTransitionMode && UI.setPageTransitionMode(UI.PageTransitionMode.PAGE); } catch(e){}
      try { UI.setFitMode(UI.FitMode.FitWidth); } catch(e){}
      try { Core.documentViewer.setCurrentPage(1); } catch(e){}
    });

    UI.setTheme('light');

    // --- BARRE FLOTTANTE INTERNE (dans l'iframe)
    function mountInternalToolbar(){
      if (document.getElementById('jsl-toolbar')) return;

      const bar = document.createElement('div');
      bar.id = 'jsl-toolbar';
      bar.className = 'jsl-toolbar';
      bar.innerHTML = `
        <button class="jsl-btn" data-act="zout" title="Zoom out" aria-label="Zoom out">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <button class="jsl-btn" data-act="zin" title="Zoom in" aria-label="Zoom in">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <span class="jsl-sep"></span>
        <button class="jsl-btn" data-act="first" title="Première page" aria-label="Première page">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6v12M10 6l8 6-8 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
        </button>
        <button class="jsl-btn" data-act="prev" title="Page précédente" aria-label="Page précédente">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
        </button>
        <button class="jsl-btn" data-act="next" title="Page suivante" aria-label="Page suivante">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
        </button>
        <button class="jsl-btn" data-act="last" title="Dernière page" aria-label="Dernière page">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M18 6v12M14 6l-8 6 8 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
        </button>
        <span class="jsl-sep"></span>
        <button class="jsl-btn jsl-btn-fs" data-act="fs" title="Plein écran" aria-label="Plein écran">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M8 5H5v3M16 5h3v3M8 19H5v-3M16 19h3v-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      `;

      // Attacher au BODY de l’iframe (garanti visible)
      document.body.appendChild(bar);

      // Actions
      const dv = Core.documentViewer;
      bar.addEventListener('click', e => {
        const btn = e.target.closest('.jsl-btn');
        if (!btn) return;
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

    // Monter maintenant + remonter si l’UI se recompose
    mountInternalToolbar();
    new MutationObserver(mountInternalToolbar)
      .observe(document.body, { childList:true, subtree:true });
  }

  // --- Compat : certains bundles exposent window.instance après 'viewerLoaded'
  if (window.instance && window.instance.UI) {
    onReady(window.instance);
  } else {
    window.addEventListener('viewerLoaded', () => onReady(window.instance));
  }
})();
