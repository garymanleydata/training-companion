(function(){
  const app = document.getElementById('app');
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const fab = document.getElementById('fab');
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Router render ---
  function render(route){
    const view = route.replace('#','').replace('/','') || '';
    const key = view || 'home';
    const fn = Views[key];
    if(!fn){
      app.innerHTML = `<div class="card"><h3>Not Found</h3><p>That page doesn't exist yet.</p></div>`;
      return;
    }
    app.innerHTML = fn();
    fab.onclick = () => FAB.run(key);

    // active tab style
    if(nav){
      [...nav.querySelectorAll('a')].forEach(a => {
        const active = a.getAttribute('href') === `#/${key}` || (key==='home' && a.getAttribute('href')==='#/');
        a.classList.toggle('active', !!active);
      });
    }
    afterRender(); // bind events for the current DOM
  }

  // --- Views ---
  Views.home = function(){
    const s = getSettings();
    const name = s.name ? `, ${s.name}` : '';
    const hr = s.age ? ` · MAF HR ≈ <strong>${mafHR(s.age)}</strong>` : '';
    return `
      <section class="grid">
        <div class="card span-12">
          <h3>Welcome${name}</h3>
          <p class="meta">Local-first, offline app. Your data stays in your browser. Export from <a href="#/settings">Settings</a>.${hr}</p>
        </div>
        <div class="card span-6">
          <h3>Quick add — Run</h3>
          <form id="qaRun" onsubmit="return false">
            <label>Date <input type="date" name="date" required></label>
            <div class="grid">
              <div class="span-6"><label>Distance (km) <input type="number" step="0.01" name="dist" required></label></div>
              <div class="span-6"><label>Time (mm:ss) <input type="text" name="time" placeholder="e.g. 25:30" required></label></div>
            </div>
            <label>Avg HR (optional) <input type="number" name="hr"></label>
            <button class="btn primary" type="submit">Save run</button>
          </form>
        </div>
        <div class="card span-6">
          <h3>Quick add — Meditation</h3>
          <form id="qaMed" onsubmit="return false">
            <label>Date <input type="date" name="date" required></label>
            <label>Method
              <select name="method">
                <option>Mindfulness</option>
                <option>Box breathing</option>
                <option>Wim Hof</option>
                <option>Nasal-only</option>
              </select>
            </label>
            <label>Duration (min) <input type="number" name="min" required></label>
            <button class="btn primary" type="submit">Save meditation</button>
          </form>
        </div>
        <div class="card span-12">
          <h3>Recent</h3>
          ${recentFeed()}
        </div>
      </section>
    `;
  };

  function recentFeed(){
    const rows = [
      ...list('runs').map(x => ({...x, _type:'Run', _stamp:x.createdAt})),
      ...list('strength').map(x => ({...x, _type:'Strength', _stamp:x.createdAt})),
      ...list('fasting').map(x => ({...x, _type:'Fasting', _stamp:x.createdAt})),
      ...list('meditation').map(x => ({...x, _type:'Meditation', _stamp:x.createdAt})),
      ...list('parkrun').map(x => ({...x, _type:'parkrun', _stamp:x.createdAt}))
    ].sort((a,b)=> new Date(b._stamp) - new Date(a._stamp)).slice(0,10);
    if(!rows.length) return `<p class="meta">Nothing logged yet — try the quick add forms above or visit a module from the nav.</p>`;
    return `<div class="list">` + rows.map(r => {
      const right = (()=>{
        if(r._type==='Run') return `${r.distance_km} km · ${fmtTimeSeconds(r.time_sec)} (${pacePerKm(r.time_sec, r.distance_km)})`;
        if(r._type==='Meditation') return `${r.duration_min} min · ${r.method}`;
        if(r._type==='Fasting') return r.end ? `${Math.round((new Date(r.end)-new Date(r.start))/36e5)} h` : `Started`;
        if(r._type==='parkrun') return `${fmtTimeSeconds(r.time_sec)} · ${r.event_name}`;
        if(r._type==='Strength') return (r.exercises||[]).map(e=>`${e.name} ${e.sets}×${e.reps}@${e.load_kg||0}kg`).join(', ');
        return '';
      })();
      return `<div class="row"><div><span class="badge">${r._type}</span> ${fmtDate(r.date||r.start||r._stamp)}</div><div class="meta">${right}</div></div>`;
    }).join('') + `</div>`;
  }

  // --- Bind all events for the current DOM (fixes “page not found”) ---
  function afterRender(){
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

    // Runs module
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

    // Strength module
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
        const ex = [];
        exWrap.querySelectorAll('fieldset').forEach(fs => {
          ex.push({
            name: fs.querySelector('[name=ex_name]').value,
            sets: Number(fs.querySelector('[name=ex_sets]').value||0),
            reps: Number(fs.querySelector('[name=ex_reps]').value||0),
            load_kg: Number(fs.querySelector('[name=ex_load]').value||0)
          });
        });
        add('strength', { date: f.get('date'), session_type: f.get('stype')||'', exercises: ex });
        stForm.reset();
        render('#/strength');
      });
    }

    // Fasting module
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

    // Meditation module
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

    // parkrun module
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
  }

  // Mobile menu
  if(menuBtn && nav){
    menuBtn.addEventListener('click', ()=> nav.classList.toggle('open'));
    nav.addEventListener('click', (e)=>{ if(e.target.matches('a[data-link]')) nav.classList.remove('open'); });
  }

  window.addEventListener('hashchange', ()=> render(location.hash));
  window.addEventListener('load', ()=> render(location.hash));
  window.requestRender = () => render(location.hash);
})();
