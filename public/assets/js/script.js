// Small helper: animate elements into view using IntersectionObserver
document.addEventListener('DOMContentLoaded', function(){
  // Helper function to determine asset path based on current page location
  function getAssetPath(relativePath) {
    // Check if we're in the public directory (pathname includes /public/ or starts with /public/)
    const isInPublic = window.location.pathname.includes('/public/') || window.location.pathname.match(/^\/[^\/]+\/.*\.html$/);
    if (isInPublic) {
      // From public/*.html, use relative paths
      return '../' + relativePath;
    } else {
      // From index.html (root), use public/ prefix
      return 'public/' + relativePath;
    }
  }

  // Helper to get logo paths based on current location
  function getLogoPath(filename) {
    const isInPublic = window.location.pathname.includes('/public/') || window.location.pathname.match(/^\/[^\/]+\/.*\.html$/);
    if (isInPublic) {
      return 'assets/media/' + filename;
    } else {
      return 'public/assets/media/' + filename;
    }
  }

  // Helper to get icons.svg path
  function getIconsPath() {
    const isInPublic = window.location.pathname.includes('/public/') || window.location.pathname.match(/^\/[^\/]+\/.*\.html$/);
    if (isInPublic) {
      return 'assets/icons.svg';
    } else {
      return 'public/assets/icons.svg';
    }
  }

  // Sticky header on scroll
  const header = document.querySelector('.site-header');
  let lastScroll = 0;
  window.addEventListener('scroll', function(){
    const currentScroll = window.pageYOffset;
    if(currentScroll > 50){
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });

  // Reveal on scroll
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:0.12});

  document.querySelectorAll('.anim').forEach(el=>observer.observe(el));

  // Footer year
  const y = new Date().getFullYear();
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = y;

  // Try to inline svg sprite for <use> fallbacks (fetch icons.svg and inject)
  (function injectSprite(){
    if(!('content' in document.createElement('template'))){ return; }
    const iconsPath = getIconsPath();
    fetch(iconsPath).then(r=>{ if(r.ok) return r.text(); throw new Error('no sprite'); }).then(text=>{
      const div = document.createElement('div'); div.style.display='none'; div.innerHTML = text; document.body.insertBefore(div, document.body.firstChild);
    }).catch(()=>{/* silent */});
  })();

  // Page transition overlay for link clicks (simple fade)
  (function pageTransitions(){
    const overlay = document.createElement('div'); overlay.id='page-overlay'; overlay.style.position='fixed'; overlay.style.inset=0; overlay.style.background='linear-gradient(180deg, rgba(6,17,33,0.6), rgba(7,12,20,0.85))'; overlay.style.opacity='0'; overlay.style.pointerEvents='none'; overlay.style.transition='opacity .36s ease'; overlay.style.zIndex='120'; document.body.appendChild(overlay);
    document.querySelectorAll('a[href]').forEach(a=>{
      if(a.target==='_blank') return; // respect external
      a.addEventListener('click', function(e){ const href = a.getAttribute('href'); if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return; e.preventDefault(); overlay.style.pointerEvents='auto'; overlay.style.opacity='1'; setTimeout(()=>{ window.location = href },360); });
    });
  })();

  // Full contact form handling (contact.html)
  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    // Prefill from URL params (e.g., ?subject=Bonjour&email=test@example.com)
    try{
      const params = new URLSearchParams(window.location.search);
      if(params.get('subject')) contactForm.querySelector('#subject').value = params.get('subject');
      if(params.get('email')) contactForm.querySelector('#cemail').value = params.get('email');
      if(params.get('name')) contactForm.querySelector('#cname').value = params.get('name');
    }catch(e){}
    function setErr(el,msg){
      let note = el.parentNode.querySelector('.field-error');
      if(!note){ note = document.createElement('div'); note.className='field-error'; note.style.color='#e55353'; note.style.fontSize='13px'; note.style.marginTop='6px'; el.parentNode.appendChild(note); }
      note.textContent = msg;
      el.style.borderColor = '#e55353';
    }
    function clearErr(el){
      const note = el.parentNode.querySelector('.field-error');
      if(note) note.remove();
      el.style.borderColor = '';
    }

    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      const cname = contactForm.querySelector('#cname');
      const cemail = contactForm.querySelector('#cemail');
      const subject = contactForm.querySelector('#subject');
      const message = contactForm.querySelector('#message');

      let ok = true;
      // Name
      if(!cname.value.trim()){ setErr(cname,'Le nom est requis'); ok=false } else { clearErr(cname) }
      // Email simple validation
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!cemail.value.trim()){ setErr(cemail,'L\'email est requis'); ok=false }
      else if(!emailRe.test(cemail.value.trim())){ setErr(cemail,'Format d\'email invalide'); ok=false }
      else { clearErr(cemail) }
      // Message
      if(!message.value.trim()){ setErr(message,'Le message est requis'); ok=false } else { clearErr(message) }

      if(!ok){
        // focus the first invalid field
        const firstErr = contactForm.querySelector('.field-error');
        if(firstErr){
          const input = firstErr.parentNode.querySelector('input,textarea');
          if(input) input.focus();
        }
        const btn = contactForm.querySelector('button[type="submit"]');
        btn.textContent = 'Corrigez le formulaire';
        setTimeout(()=>btn.textContent = 'Envoyer',2000);
        return;
      }

      // Simulate submission
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true; submitBtn.textContent = 'Envoi...';
      setTimeout(()=>{
        submitBtn.textContent = 'Message envoyé';
        contactForm.reset();
        setTimeout(()=>{ submitBtn.disabled=false; submitBtn.textContent = 'Envoyer' },1800);
      },1200);
    });
  }

  // Mobile menu toggle (hamburger) with focus-trap
  (function mobileMenu(){
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.getElementById('main-navigation');
    if(!toggle || !nav) return;
    const BREAK = 1000;
    let previousFocus = null;

    function setAria(open){ toggle.setAttribute('aria-expanded', open ? 'true' : 'false'); toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu'); }
    function open(){ previousFocus = document.activeElement; document.body.classList.add('menu-open'); setAria(true); trapFocus(nav); }
    function close(){ document.body.classList.remove('menu-open'); setAria(false); releaseFocusTrap(); if(previousFocus && previousFocus.focus) previousFocus.focus(); }

    toggle.addEventListener('click', function(){ if(document.body.classList.contains('menu-open')) close(); else open(); });

    // close when clicking outside the menu (on the overlay)
    document.addEventListener('click', function(e){ if(document.body.classList.contains('menu-open') && !nav.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)){ close(); } });

    // close when clicking a nav link (always close on click, hamburger is always active)
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{ close(); }));

    // close on Escape
    document.addEventListener('keydown', function(e){ if(e.key==='Escape' && document.body.classList.contains('menu-open')) { e.preventDefault(); close(); } });

    // close if resizing wider than breakpoint (only for very large screens)
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', function(){ if(lastWidth<=BREAK && window.innerWidth>BREAK){ close(); } lastWidth = window.innerWidth; });

    // Focus trap implementation (simple)
    let focusable = [];
    let firstFocusable = null;
    let lastFocusable = null;
    function updateFocusable(){ focusable = Array.from(nav.querySelectorAll('a, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el=>!el.hasAttribute('disabled')); firstFocusable = focusable[0]; lastFocusable = focusable[focusable.length-1]; }

    function trapFocus(container){ updateFocusable(); if(focusable.length===0){ nav.setAttribute('tabindex','-1'); nav.focus(); return; } firstFocusable.focus(); document.addEventListener('focus', keepFocus, true); document.addEventListener('keydown', handleTabKey); }
    function releaseFocusTrap(){ document.removeEventListener('focus', keepFocus, true); document.removeEventListener('keydown', handleTabKey); }
    function keepFocus(e){ if(!nav.contains(e.target) && document.body.classList.contains('menu-open')){ e.stopPropagation(); e.preventDefault(); firstFocusable && firstFocusable.focus(); } }
    function handleTabKey(e){ if(e.key !== 'Tab') return; updateFocusable(); if(focusable.length===0) return; if(e.shiftKey){ if(document.activeElement === firstFocusable){ e.preventDefault(); lastFocusable.focus(); } } else { if(document.activeElement === lastFocusable){ e.preventDefault(); firstFocusable.focus(); } } }

  })();

  // Theme toggle: light/dark, swap logo and persist in localStorage
  (function themeToggle(){
    const toggle = document.querySelector('.theme-toggle');
    const logoImg = document.querySelector('.brand .logo');
    const iconMoon = document.querySelector('.icon-moon');
    const iconSun = document.querySelector('.icon-sun');
    if(!toggle) return;
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (prefersDark ? 'dark' : 'light');
    function applyTheme(t){ 
      document.body.setAttribute('data-theme', t); 
      toggle.setAttribute('aria-pressed', t==='dark'); 
      if(logoImg){ 
        const darkPath = getLogoPath('blanc.png');
        const lightPath = getLogoPath('noir.png');
        if(t==='dark'){ 
          logoImg.setAttribute('src', darkPath);
        } else { 
          logoImg.setAttribute('src', lightPath);
        } 
      } 
      if(iconMoon && iconSun){ 
        if(t==='dark'){ 
          iconMoon.style.display='none'; 
          iconSun.style.display='block'; 
        } else { 
          iconMoon.style.display='block'; 
          iconSun.style.display='none'; 
        } 
      } 
    }
    applyTheme(initial);
    toggle.addEventListener('click', function(){ const current = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; const next = current === 'dark' ? 'light' : 'dark'; applyTheme(next); localStorage.setItem('theme', next); });
  })();
});
