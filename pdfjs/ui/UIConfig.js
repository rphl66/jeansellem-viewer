// =========================================================
// JEANSELLEM — UIConfig (UI + barre flottante interne) v22
// =========================================================
window.addEventListener('viewerLoaded', () => {
  const instance = window.instance;
  if (!instance || !instance.UI) return;
  const { UI, Core } = instance;

  // Badge 3s
  if (!document.getElementById('jsl-debug')) {
    const b = document.createElement('div');
    b.id = 'jsl-debug';
    b.textContent = 'JSL UI v22 OK';
    Object.assign(b.style, {
      position:'fixed', top:'8px', right:'8px', zIndex:2147483647,
      background:'#111', color:'#fff', font:'12px/1.2 monospace',
      padding:'4px 6px', borderRadius:'6px', opacity:'0.85'
    });
    document.body.appendChild(b);
    setTimeout(()=> b.remove(), 3000);
  }

  // Verrous & UI en mode "View"
  UI.setFeatureFlags({ disableLocalFilePicker:true, disablePrint:true, disableDownload:true });
  if (UI.setToolbarGroup) UI.setToolbarGroup(UI.ToolbarGroup.View);

  // Cacher ce qu'on ne veut pas
  const HIDE_IDS = [
    'downloadButton','downloadFileButton','printButton',
    'themeChangeButton','languageButton',
    'selectToolButton','textSelectToolButton','panToolButton',
    'rotateClockwiseButton','rotateCounterClockwiseButton',
    'pageManipulationOverlayRotateClockwise','pageManipulationOverlayRotateCounterClockwise',
    'pageByPageButton','doublePageButton','coverFacingButton','pageOrientationButton',
    'fullscreenButton',
    'toolbarGroupButton','toolbarGroup-Annotate','toolbarGroup-Edit','toolbarGroup-Forms',
    'toolbarGroup-Insert','toolbarGroup-Measure','toolbarGroup-Shapes',
    'toolsHeader','toolsOverlay','toolStylePopup','stylePopup','annotationStylePopup',
    'notesPanelButton','toggleNotesButton','toggleNotesPanelButton','commentsPanelButton'
  ];
  try {
    UI.disableElements(HIDE_IDS);
    HIDE_IDS.forEach(id => UI.updateElement(id, { hidden:true, disabled:true }));
    UI.closeElements && UI.closeElements(['toolsHeader','toolStylePopup','stylePopup']);
  } catch(e){}

  // Aucun outil d'annotation actif
  try { UI.setToolMode && UI.setToolMode(Core.Tools.ToolNames.PAN); } catch(e){}

  // Bouton plein écran dans la barre native (après zooms)
  UI.setHeaderItems(header => {
    header.push(
      { type:'zoomOutButton' },
      { type:'zoomDropdown' },
      { type:'zoomInButton' },
      {
        type:'actionButton',
        dataElement:'myFullscreenButton',
        title:'Full screen',
        img:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5H5v3M16 5h3v3M8 19H5v-3M16 19h3v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M9 9L5 5M15 9l4-4M9 15l-4 4M15 15l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        onClick: () => UI.enterFullscreen()
      }
    );
  });

  // Mobile : couverture + page-by-page + FitWidth
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

  // -------- BARRE FLOTTANTE interne
  function mountToolbar() {
    if (document.getElementById('jsl-toolbar')) return;

    // Choisir un ancrage sûr (évite le clipping)
    const root = UI.getRootElement && UI.getRootElement();
    const overlay = root && root.querySelector('[data-element="pageNavOverlay"]');
    const anchor =
      (overlay && overlay.parentElement) ||
      root ||
      document.body;

    const bar = document.createElement('div');
    bar.id = 'jsl-toolbar';
    bar.className = 'jsl-toolbar';

    // Styles inline (fonctionne même sans viewer.css)
    Object.assign(bar.style, {
      position: 'fixed',
      left: '50%',
      bottom: '24px',
      transform: 'translateX(-50%)',
      display: 'inline-flex',
      gap: '10px',
      padding: '8px 12px',
      background: 'rgba(255,255,255,0.95)',
      color: '#000',
      borderRadius: '10px',
      boxShadow: '0 6px 16px rgba(0,0,0,.15)',
      border: '1px solid rgba(0,0,0,.08)',
      zIndex: 2147483647
    });

    const mkBtn = (act, svg, isFS=false) => {
      const btn = document.createElement('button');
      btn.className = 'jsl-btn' + (isFS ? ' jsl-btn-fs' : '');
      btn.dataset.act = act;
      Object.assign(btn.style, {
        width:'36px', height:'36px', display:'inline-flex',
        alignItems:'center', justifyContent:'center',
        background:isFS ? '#000' : 'transparent',
        color: isFS ? '#fff' : 'inherit',
        border:'0', borderRadius:'8px', cursor:'pointer'
      });
      btn.innerHTML = svg;
      btn.onmouseenter = () => { if(!isFS) btn.style.background = 'rgba(0,0,0,.06)'; };
      btn.onmouseleave = () => { if(!isFS) btn.style.background = 'transparent'; };
      return btn;
    };

    const svgMinus = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    const svgPlus  = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    const svgFirst = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6v12M10 6l8 6-8 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
    const svgPrev  = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
    const svgNext  = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
    const svgLast  = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M18 6v12M14 6l-8 6 8 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
    const svgFS    = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5H5v3M16 5h3v3M8 19H5v-3M16 19h3v-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

    const sep = document.createElement('span');
    Object.assign(sep.style, { width:'1px', height:'24px', background:'rgba(0,0,0,.15)', margin:'0 4px', display:'inline-block' });

    bar.append(
      mkBtn('zout', svgMinus),
      mkBtn('zin',  svgPlus),
      sep.cloneNode(),
      mkBtn('first', svgFirst),
      mkBtn('prev',  svgPrev),
      mkBtn('next',  svgNext),
      mkBtn('last',  svgLast),
      sep.cloneNode(),
      mkBtn('fs',    svgFS, true)
    );

    anchor.appendChild(bar);
    console.log('[JSL v22] Barre flottante injectée dans →', anchor);

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

  // Monter maintenant + re-monter si l’UI se recompose
  mountToolbar();
  setTimeout(mountToolbar, 400);
  const root = UI.getRootElement && UI.getRootElement();
  if (root) new MutationObserver(mountToolbar).observe(root, { childList:true, subtree:true });
});
