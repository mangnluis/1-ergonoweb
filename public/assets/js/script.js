// Copied script with adjusted paths for assets (icons.svg -> /icons/icons.svg, media paths are absolute /assets/media/...)
document.addEventListener('DOMContentLoaded', function(){
  // Sticky header
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', function(){ if(window.pageYOffset>50) header.classList.add('scrolled'); else header.classList.remove('scrolled'); });

  // Reveal on scroll
  const observer = new IntersectionObserver((entries)=>{ entries.forEach(entry=>{ if(entry.isIntersecting){ entry.target.classList.add('in-view'); observer.unobserve(entry.target); } }); },{threshold:0.12});
  document.querySelectorAll('.anim').forEach(el=>observer.observe(el));

  // Footer year
  const y = new Date().getFullYear(); const yearEl = document.getElementById('year'); if(yearEl) yearEl.textContent = y;

  // Inline svg sprite for <use> fallbacks (fetch icons.svg and inject) - adjusted path
  (function injectSprite(){
    if(!('content' in document.createElement('template'))){
      return;
    }
    // injectSprite: fetch absolute path to avoid relative path issues
    fetch('/icons/icons.svg')
      .then(r=>{
        if(r.ok) return r.text();
        throw new Error('no sprite');
      })
      .then(text=>{
        const div = document.createElement('div');
        div.style.display='none';
        div.innerHTML = text;
        document.body.insertBefore(div, document.body.firstChild);
      })
      .catch(()=>{ /* silently ignore missing sprite */ });
  })();

  // Page transitions
  (function pageTransitions(){ const overlay = document.createElement('div'); overlay.id='page-overlay'; overlay.style.position='fixed'; overlay.style.inset=0; overlay.style.background='linear-gradient(180deg, rgba(6,17,33,0.6), rgba(7,12,20,0.85))'; overlay.style.opacity='0'; overlay.style.pointerEvents='none'; overlay.style.transition='opacity .36s ease'; overlay.style.zIndex='120'; document.body.appendChild(overlay); document.querySelectorAll('a[href]').forEach(a=>{ if(a.target==='_blank') return; a.addEventListener('click', function(e){ const href = a.getAttribute('href'); if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return; e.preventDefault(); overlay.style.pointerEvents='auto'; overlay.style.opacity='1'; setTimeout(()=>{ window.location = href },360); }); }); })();

  // Forms (signup + contact) and mobile menu handling unchanged except asset path usage in theme toggle
  const form = document.getElementById('signup'); if(form){ form.addEventListener('submit', function(e){ e.preventDefault(); const name = form.querySelector('#name'); const email = form.querySelector('#email'); let valid = true; [name,email].forEach(f=>{ if(!f.value.trim()){ f.style.borderColor = '#e55353'; valid = false; } else { f.style.borderColor = ''; } }); if(!valid){ const btn = form.querySelector('.btn'); btn.textContent = 'Complétez le formulaire'; setTimeout(()=>btn.textContent = "S'inscrire",2300); return; } const btn = form.querySelector('.btn'); btn.disabled = true; btn.textContent = 'Merci !'; setTimeout(()=>{btn.disabled=false;btn.textContent = "S'inscrire"; form.reset()},1500); }); }

  // Contact form handling - same logic, no path changes needed

  // Mobile menu - unchanged

  // Theme toggle - update logo paths to absolute /assets/media/
  (function themeToggle(){ const toggle = document.querySelector('.theme-toggle'); const logoImg = document.querySelector('.brand .logo'); const iconMoon = document.querySelector('.icon-moon'); const iconSun = document.querySelector('.icon-sun'); if(!toggle) return; const stored = localStorage.getItem('theme'); const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; const initial = stored || (prefersDark ? 'dark' : 'light'); function applyTheme(t){ document.body.setAttribute('data-theme', t); toggle.setAttribute('aria-pressed', t==='dark'); 
  // themeToggle: logo paths -> assets media
  if(logoImg){ if(t==='dark'){ logoImg.setAttribute('src','/assets/media/blanc.png') } else { logoImg.setAttribute('src','/assets/media/noir.png') } } if(iconMoon && iconSun){ if(t==='dark'){ iconMoon.style.display='none'; iconSun.style.display='block'; } else { iconMoon.style.display='block'; iconSun.style.display='none'; } } } applyTheme(initial); toggle.addEventListener('click', function(){ const current = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; const next = current === 'dark' ? 'light' : 'dark'; applyTheme(next); localStorage.setItem('theme', next); }); })();

});
