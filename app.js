(function(){
  console.log('[TC] app.js loaded');

  const app = document.getElementById('app');
  if(!app){ console.error('[TC] #app element not found'); return; }

  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const fab = document.getElementById('fab');
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Gracefully handle missing globals
  if(typeof Views === 'undefined'){
    app.innerHTML = '<div class=\"card\"><h3>Initialisation error</h3><p>Global <code>Views</code> is undefined. Check that <code>lib.js</code> is included before <code>app.js</code>.</p></div>';
    console.error('[TC] Views is undefined. Is lib.js loaded before app.js?');
    return;
  }
  if(typeof FAB === 'undefined'){
    app.innerHTML = '<div class=\"card\"><h3>Initialisation error</h3><p>Global <code>FAB</code> is undefined. Check that <code>lib.js</code> is included before <code>app.js</code>.</p></div>';
    console.error('[TC] FAB is undefined. Is lib.js loaded before app.js?');
    return;
  }

  function safe(fn, label){
    try{ return fn(); }
    catch(err){
      console.error('[TC] Error in', label, err);
      app.innerHTML = '<div class=\"card\"><h3>Something went wrong</h3><pre style=\"white-space:pre-wrap\">' + (err && err.stack || err) + '</pre></div>';
      return '';
    }
  }

  function render(route){
    const view = (route||'').replace('#','').replace('/','') || '';
    const key = view || 'home';
    console.log('[TC] render', {route, key, Views});
    if(!Views[key]){
      if(key === 'home'){
        app.innerHTML = '<div class=\"card\"><h3>Home view missing</h3><p><code>Views.home</code> is not defined. Check that app.js defines it.</p></div>';
      }else{
        app.innerHTML = '<div class=\"card\"><h3>Not found</h3><p>No view for <code>#/'+ key +'</code>.</p></div>';
      }
      return;
    }
    app.innerHTML = safe(() => Views[key](), 'Views.'+key);

    // FAB
    if(fab) fab.onclick = () => FAB.run(key);

    // active tab style
    if(nav){
      [...nav.querySelectorAll('a')].forEach(a => {
        const active = a.getAttribute('href') === `#/${key}` || (key==='home' && a.getAttribute('href')==='#/');
        a.classList.toggle('active', !!active);
      });
    }

    // Bind events
    afterRender();
  }

  // --- Define the Home view (baseline) ---
  Views.home = function(){
    const s = (typeof getSettings === 'function') ? getSettings() : {};
    const name = s && s.name ? `, ${s.name}` : '';
    const hr = s && s.age ? ` · MAF HR ≈ <strong>${mafHR(s.age)}</strong>` : '';
    return `
      <section class="grid">
        <div class="card span-12">
          <h3>Welcome${name}</h3>
          <p class="meta">If this renders, your JS is working. Use the navigation above to open a module. ${hr}</p>
        </div>
      </section>
    `;
  };

  // --- After-render bindings ---
  function afterRender(){
    console.log('[TC] afterRender binding start');

    // Home quick adds
    const r = document.getElementById('qaRun');
    if(r){
      r.addEventListener('submit', (e)=>{
        e.preventDefault();
        const f = new FormData(r);
        add('runs', {
          date: f.get('date'),
          distance_km: Number(f.get('dist')),
          time_sec: toSeconds(String(f.get('time')||'')),
          hr_avg: f.get('hr') ? Number(f.get('hr')) : null,
          notes: ''
        });
        location.hash = '#/runs';
      });
    }
    const m = document.getElementById('qaMed');
    if(m){
      m.addEventListener('submit', (e)=>{
        e.preventDefault();
        const f = new FormData(m);
        add('meditation', { date: f.get('date'), method: f.get('method'), duration_min: Number(f.get('min')) });
        location.hash = '#/meditation';
      });
    }

    // Runs
    const runsForm = document.getElementById('runsForm');
    if(runsForm){
      runsForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const f = new FormData(runsForm);
        add('runs', {
          date: f.get('date'),
          distance_km: Number(f.get('distance')),
          time_sec: toSeconds(String(f.get('time')||'')),
          hr_avg: f.get('hr') ? Number(f.get('hr')) : null,
          notes: f.get('notes') || ''
        });
        runsForm.reset();
        render('#/runs');
      });
    }

    // Strength
    const stForm = document.getElementById('stForm');
    const addEx = document.getElementById('addEx');
    const exWrap = document.getElementById('exWrap');
    if(addEx && exWrap){
      addEx.addEventListener('click', ()=>{
        const fs = exWrap.firstElementChild.cloneNode(true);
        fs.querySelectorAll('input').forEach(i=> i.value='');
        exWrap.appendChild(fs);
      });
    }
    if(stForm && exWrap){
      stForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const f = new FormData(stForm);
        const date = f.get('date');
        const stype = f.get('stype')||'';
        const ex = [];
        exWrap.querySelectorAll('fieldset').forEach(fs => {
          ex.push({
            name: fs.querySelector('[name=ex_name]').value,
            sets: Number(fs.querySelector('[name=ex_sets]').value||0),
            reps: Number(fs.querySelector('[name=ex_reps]').value||0),
            load_kg: Number(fs.querySelector('[name=ex_load]').value||0)
          });
        });
        add('strength', { date, session_type: stype, exercises: ex });
        stForm.reset();
        render('#/strength');
      });
    }

    // Fasting
    const fastForm = document.getElementById('fastForm');
    if(fastForm){
      fastForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const f = new FormData(fastForm);
        add('fasting', {
          start: new Date(f.get('start')).toISOString(),
          end: f.get('end') ? new Date(f.get('end')).toISOString() : null,
          type: f.get('type') || 'Timer'
        });
        fastForm.reset();
        render('#/fasting');
      });
    }

    // Meditation
    const medForm = document.getElementById('medForm');
    if(medForm){
      medForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const f = new FormData(medForm);
        add('meditation', { date:f.get('date'), method:f.get('method'), duration_min: Number(f.get('min')) });
        medForm.reset();
        render('#/meditation');
      });
    }

    // Parkrun
    const pkForm = document.getElementById('pkForm');
    if(pkForm){
      pkForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const f = new FormData(pkForm);
        add('parkrun', {
          date: f.get('date'),
          event_name: f.get('event'),
          time_sec: toSeconds(String(f.get('time'))),
          age_grade: f.get('age') ? Number(f.get('age')) : null,
          position: f.get('pos') ? Number(f.get('pos')) : null
        });
        pkForm.reset();
        render('#/parkrun');
      });
    }

    console.log('[TC] afterRender binding done');
  }

  // Mobile menu
  if(menuBtn && nav){
    menuBtn.addEventListener('click', ()=> nav.classList.toggle('open'));
    nav.addEventListener('click', (e)=>{ if(e.target.matches('a[data-link]')) nav.classList.remove('open'); });
  }

  window.addEventListener('hashchange', ()=> render(location.hash));
  window.addEventListener('load', ()=> render(location.hash));

  // Expose helpers for Console debugging
  window.tc = { render, Views };
  console.log('[TC] bootstrap complete');
})();
