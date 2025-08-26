// =========================================================
// JEANSELLEM — UIConfig (UI minimal + barre flottante) v24
// =========================================================
window.addEventListener('viewerLoaded', () => {
  const inst = window.instance;
  if (!inst || !inst.UI || !inst.Core) return;
  const { UI, Core } = inst;

  // Badge debug 3s
  if (!document.getElementById('jsl-debug')) {
    const b = document.createElement('div');
    b.id = 'jsl-debug';
    b.textContent = 'JSL UI v24 OK';
    Object.assign(b.style, {
      position:'fixed', top:'8px', right:'8px', zIndex:2147483647,
      background:'#111', color:'#fff', font:'12px/1.2 monospace',
      padding:'4px 6px', borderRadius:'6px', opacity:'0.85'
    });
    document.body.appendChild(b); setTimeout(()=>b.remove(),3000);
  }

  // Mode "View" et verrous
  UI.setToolbarGroup?.(UI.ToolbarGroup.View);
  UI.setFeatureFlags?.({
    disableLocalFilePicker: true,
    disablePrint: true,
    disableDownload: true,
  });

  // A masquer partout (loupe, commentaires, roue, menus, annotate, pager x/xx, zoom du header, etc.)
  const HIDE = [
    'searchButton','toggleNotesButton','toggleNotesPanelButton','notesPanelButton',
    'settingsButton','menuButton','ribbonsDropdownButton',
    'toolsHeader','toolsOverlay','toolbarGroupButton',
    'toolbarGroup-Annotate','toolbarGroup-Edit','toolbarGroup-Forms',
    'toolbarGroup-Insert','toolbarGroup-Measure','toolbarGroup-Shapes',
    'pageNavOverlay','pageNavigationOverlay',
    'fullscreenButton',
    // boutons de zoom du header (on ne garde rien en haut)
    'zoomOutButton','zoomInButton','zoomDropdown'
  ];
  const applyHides = () => {
    try {
      UI.disableElements(HIDE);
      HIDE.forEach(id => UI.updateElement?.(id, { hidden:true, disabled:true }));
      UI.closeElements?.(['pageNavOverlay','pageNavigationOverlay','toolsHeader','toolsOverlay']);
    } catch {}
  };
  applyHides();

  // Barre du haut : on la vide complètement (pas de zoom, pas d’autres boutons)
  UI.setHeaderItems(header => { header.splice(0, header.length); });

  // Thème
  UI.setTheme('light');

  // Mobile : couverture + défilement page à page + FitWidth
  const isMobile = matchMedia('(max-width: 768px)').matches;
  Core.documentViewer.addEventListener('documentLoaded', () => {
    applyHides();
    if (isMobile) {
      try { UI.setLayoutMode(UI.LayoutMode.Single); } catch{}
      try { UI.setScrollMode?.(UI.ScrollMode.PAGE); } catch{}
      try { UI.setPageTransitionMode?.(UI.PageTransitionMode.PAGE); } catch{}
      try { UI.setFitMode(UI.FitMode.FitWidth); } catch{}
      try { Core.documentViewer.setCurrentPage(1); } catch{}
    }
  });

  // ===== Barre flottante (bas-centre) =====
  function mountToolbar(){
    if (document.getElementById('jsl-toolbar')) return;

    const bar = document.createElement('div');
    bar.id = 'jsl-toolbar';
    bar.className = 'jsl-toolbar';
    bar.innerHTML = `
      <button class="jsl-btn" data-act="zout" title="Zoom out" aria-label="Zoom out">−</button>
      <button class="jsl-btn" data-act="zin"  title="Zoom in"  aria-label="Zoom in">+</button>
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
      const page = dv.getCurrentPage?.() || 1;
      const max  = dv.getPageCount?.() || 1;

      switch (act) {
        case 'zin':  UI.zoomIn?.(); break;
        case 'zout': UI.zoomOut?.(); break;
        case 'first': dv.setCurrentPage?.(1); break;
        case 'prev':  dv.setCurrentPage?.(Math.max(1, page - 1)); break;
        case 'next':  dv.setCurrentPage?.(Math.min(max, page + 1)); break;
        case 'last':  dv.setCurrentPage?.(max); break;
        case 'fs':    UI.enterFullscreen?.(); break;
      }
    });
  }
  mountToolbar();

  // Re-appliquer si l’UI se recompose
  const root = UI.getRootElement?.();
  if (root) new MutationObserver(() => { applyHides(); mountToolbar(); })
    .observe(root, { childList:true, subtree:true });
});
