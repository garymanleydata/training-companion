(function(){
  const app = document.getElementById('app');
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const fab = document.getElementById('fab');
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  function applyNavVisibility(){
    if(!nav) return;
    const p = (getSettings().pages) || {};
    const mods = ['runs','strength','fasting','meditation','parkrun','metrics','stats'];
    mods.forEach(m => {
      const link = nav.querySelector(`a[href="#/${m}"]`);
      if(link) link.style.display = (p[m] !== false) ? '' : 'none';
    });
  }

  function render(route){
    const view = route.replace('#','').replace('/','') || '';
    const key = view || 'home';
    const fn = Views[key];
    if(!fn){
      app.innerHTML = `<div class="card"><h3>Not Found</h3><p>That page doesn't exist yet.</p></div>`;
      return;
    }
    app.innerHTML = fn();
    if(fab) fab.onclick = () => FAB.run(key);
    if(nav){
      [...nav.querySelectorAll('a')].forEach(a => {
        const active = a.getAttribute('href') === `#/${key}` || (key==='home' && a.getAttribute('href')==='#/');
        a.classList.toggle('active', !!active);
      });
    }
    afterRender();
  }

  // ---- Views ----
  Views.home = function(){
    const s = getSettings();
    const name = s.name ? `, ${s.name}` : '';
    const hr = s.age ? ` · MAF HR ≈ <strong>${mafHR(s.age)}</strong>` : '';
    const p = s.pages || {};
    return `
      <section class="grid">
        <div class="card span-12">
          <h3>Welcome${name}</h3>
          <p class="meta">Local-first, offline app. Your data stays in your browser. Export from <a href="#/settings">Settings</a>.${hr}</p>
        </div>

        ${p.runs===false ? '' : `<div class="card span-6">
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
        </div>`}

        ${p.meditation===false ? '' : `<div class="card span-6">
          <h3>Quick add — Meditation</h3>
          <form id="qaMed" onsubmit="return false">
            <label>Date <input type="date" name="date" required></label>
            <label>Method
              <select name="method">
                <option>Mindfulness</option>
                <option>Box breathing</option>
                <option>Wim Hof</option>
                <option>Nasal-only</option>
                <option>Airofit</option>
              </select>
            </label>
            <label>Duration (min) <input type="number" name="min" required></label>
            <button class="btn primary" type="submit">Save meditation</button>
          </form>
        </div>`}

        <div class="card span-12">
          <h3>Recent</h3>
          ${recentFeed()}
        </div>
      </section>
    `;
  };

  Views.settings = function(){
    const s = getSettings();
    const p = s.pages || {};
    return `
      <section class="card">
        <h3>Settings</h3>
        <form id="setForm" onsubmit="return false">
          <label>Your name <input name="name" value="${s.name||''}" placeholder="Gary"></label>
          <div class="grid">
            <div class="span-6"><label>Age <input type="number" name="age" value="${s.age||''}" placeholder="e.g. 40"></label></div>
            <div class="span-6"><label>Units
              <select name="units">
                <option ${s.units==='km'?'selected':''}>km</option>
                <option ${s.units==='mi'?'selected':''}>mi</option>
              </select>
            </label></div>
          </div>

          <div class="card" style="margin-top:1rem">
            <h4>Pages</h4>
            <label><input type="checkbox" name="show_runs" ${p.runs===false?'':'checked'}> Runs</label><br>
            <label><input type="checkbox" name="show_strength" ${p.strength===false?'':'checked'}> Strength</label><br>
            <label><input type="checkbox" name="show_fasting" ${p.fasting===false?'':'checked'}> Fasting</label><br>
            <label><input type="checkbox" name="show_meditation" ${p.meditation===false?'':'checked'}> Meditation</label><br>
            <label><input type="checkbox" name="show_parkrun" ${p.parkrun===false?'':'checked'}> parkrun</label><br>
            <label><input type="checkbox" name="show_metrics" ${p.metrics===false?'':'checked'}> Metrics</label><br>
            <label><input type="checkbox" name="show_stats" ${p.stats===false?'':'checked'}> Stats</label>
          </div>

          <div class="card" style="margin-top:1rem">
            <h4>Backup</h4>
            <button class="btn" type="button" id="exportBtn">Export data (JSON)</button>
            <label class="meta" style="display:block;margin-top:.6rem">Import JSON <input type="file" id="importFile" accept="application/json"></label>
            <div class="meta">Import replaces your current data (tick “merge” to append unique items).</div>
            <div style="margin-top:.6rem">
              <label><input type="checkbox" id="mergeChk"> Merge instead of replace</label>
            </div>
          </div>

          <div style="margin-top:1rem;display:flex;gap:.6rem;flex-wrap:wrap">
            <button class="btn primary" type="submit">Save settings</button>
            <button class="btn" type="button" id="clearBtn">Clear all data</button>
          </div>
        </form>
        <p class="meta" style="margin-top:1rem">MAF HR estimate: ${s.age? mafHR(s.age) : '—'} bpm (180 − age)</p>
      </section>
    `;
  };

  Views.about = function(){
    return `
      <section class="card">
        <h3>About</h3>
        <p>This is a local-first, offline-capable Progressive Web App designed for training: runs, strength, fasting, meditation, and parkrun logs. Your data lives in your browser (localStorage). You can export/import JSON anytime.</p>
        <ul class="meta">
          <li>UK locale (en-GB, Europe/London) for dates & times.</li>
          <li>No accounts. No trackers. Works offline.</li>
          <li>Free to host on GitHub Pages.</li>
        </ul>
      </section>
    `;
  };

  // ---- Helpers ----
  function recentFeed(){
    const p = (getSettings().pages) || {};
    const rows = [
      ...(p.runs===false ? [] : list('runs').map(x => ({...x, _type:'Run', _stamp:x.createdAt}))),
      ...(p.strength===false ? [] : list('strength').map(x => ({...x, _type:'Strength', _stamp:x.createdAt}))),
      ...(p.fasting===false ? [] : list('fasting').map(x => ({...x, _type:'Fasting', _stamp:x.createdAt}))),
      ...(p.meditation===false ? [] : list('meditation').map(x => ({...x, _type:'Meditation', _stamp:x.createdAt}))),
      ...(p.parkrun===false ? [] : list('parkrun').map(x => ({...x, _type:'parkrun', _stamp:x.createdAt}))),
      ...(p.metrics===false ? [] : list('metrics').map(x => ({...x, _type:'Metrics', _stamp:x.createdAt})))
    ].sort((a,b)=> new Date(b._stamp) - new Date(a._stamp)).slice(0,10);
    if(!rows.length) return `<p class="meta">Nothing logged yet — try the quick add forms above or visit a module from the nav.</p>`;
    return `<div class="list">` + rows.map(r => {
      const right = (()=>{
        if(r._type==='Run') return `${r.distance_km} km · ${fmtTimeSeconds(r.time_sec)} (${pacePerKm(r.time_sec, r.distance_km)})`;
        if(r._type==='Meditation') return `${r.duration_min} min · ${r.method}`;
        if(r._type==='Fasting') return r.end ? `${Math.round((new Date(r.end)-new Date(r.start))/36e5)} h` : `Started`;
        if(r._type==='parkrun') return `${fmtTimeSeconds(r.time_sec)} · ${r.event_name}`;
        if(r._type==='Strength') return [
          r.duration_min!=null ? r.duration_min + ' min' : null,
          (r.exercises||[]).map(e=>`${e.name} ${e.sets}×${e.reps}@${e.load_kg||0}kg`).join(', ')
        ].filter(Boolean).join(' · ');
        if(r._type==='Metrics') return [
          r.weight_kg!=null ? `${r.weight_kg} kg` : null,
          r.waist_cm!=null ? `Waist ${r.waist_cm} cm` : null,
          r.hips_cm!=null ? `Hips ${r.hips_cm} cm` : null,
          r.bust_cm!=null ? `Bust ${r.bust_cm} cm` : null
        ].filter(Boolean).join(' · ');
        return '';
      })();
      return `<div class="row"><div><span class="badge">${r._type}</span> ${fmtDate(r.date||r.start||r._stamp)}</div><div class="meta">${right}</div></div>`;
    }).join('') + `</div>`;
  }

  // ---- After-render: bind all events for current DOM ----
  function afterRender(){
    // Home quick add — Run
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
    // Home quick add — Meditation
    const m = document.getElementById('qaMed');
    if(m){
      m.addEventListener('submit', (e)=>{
        e.preventDefault();
        const f = new FormData(m);
        add('meditation', { date: f.get('date'), method: f.get('method'), duration_min: Number(f.get('min')) });
        location.hash = '#/meditation';
      });
    }
    // Runs page
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
    // Strength page
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
        add('strength', { date: f.get('date'), session_type: f.get('stype')||'', duration_min: f.get('dur') ? Number(f.get('dur')) : null, exercises: ex });
        stForm.reset();
        render('#/strength');
      });
    }
    // Fasting page
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
    // Meditation page
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
    // Parkrun page
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
    // Metrics page
    const metricsForm = document.getElementById('metricsForm');
    if(metricsForm){
      metricsForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const f = new FormData(metricsForm);
        add('metrics', {
          date: f.get('date'),
          weight_kg: f.get('weight') ? Number(f.get('weight')) : null,
          waist_cm: f.get('waist') ? Number(f.get('waist')) : null,
          hips_cm: f.get('hips') ? Number(f.get('hips')) : null,
          bust_cm: f.get('bust') ? Number(f.get('bust')) : null
        });
        metricsForm.reset();
        render('#/metrics');
      });
    }
    // Settings page
    const setForm = document.getElementById('setForm');
    const exportBtn = document.getElementById('exportBtn');
    const importFile = document.getElementById('importFile');
    const mergeChk = document.getElementById('mergeChk');
    const clearBtn = document.getElementById('clearBtn');
    if(setForm){
      setForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const fd = new FormData(setForm);
        const pages = {};
        ['runs','strength','fasting','meditation','parkrun','metrics','stats'].forEach(m => {
          pages[m] = fd.has('show_' + m);
        });
        setSettings({
          name: fd.get('name'),
          age: fd.get('age') ? Number(fd.get('age')) : null,
          units: fd.get('units'),
          pages
        });
        applyNavVisibility();
        alert('Saved');
        render('#/settings');
      });
    }
    if(exportBtn){ exportBtn.addEventListener('click', exportJSON); }
    if(importFile){
      importFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        try{
          await importJSON(file, { merge: !!(mergeChk && mergeChk.checked) });
          alert('Import complete');
          render('#/settings');
        }catch(err){
          alert('Import failed: ' + err.message);
        }
        e.target.value = '';
      });
    }
    if(clearBtn){
      clearBtn.addEventListener('click', ()=>{
        if(confirm('This will delete ALL your data from this browser. Continue?')){
          localStorage.removeItem('tc_data_v1');
          alert('Cleared');
          render('#/settings');
        }
      });
    }
  }

  // Mobile menu
  if(menuBtn && nav){
    menuBtn.addEventListener('click', ()=> nav.classList.toggle('open'));
    nav.addEventListener('click', (e)=>{ if(e.target.matches('a[data-link]')) nav.classList.remove('open'); });
  }
  applyNavVisibility();
  window.addEventListener('hashchange', ()=> render(location.hash));
  window.addEventListener('load', ()=> render(location.hash));
  window.requestRender = () => render(location.hash);
})();
