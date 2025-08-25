
(function(){
  const app = document.getElementById('app');
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const fab = document.getElementById('fab');
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  function render(route){
    const view = route.replace('#','').replace('/','') || '';
    const key = view || 'home';
    const fn = Views[key];
    if(!fn){
      app.innerHTML = `<div class="card"><h3>Not Found</h3><p>That page doesn't exist yet.</p></div>`;
      return;
    }
    app.innerHTML = fn();
    // update FAB handler
    fab.onclick = () => FAB.run(key);
    // highlight active nav
    if(nav){
      [...nav.querySelectorAll('a')].forEach(a => {
        const active = a.getAttribute('href') === `#/${key}` || (key==='home' && a.getAttribute('href')==='#/');
        a.classList.toggle('active', !!active);
      });
    }
  }

  // Default home view
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
          <form id="qaRun">
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
          <form id="qaMed">
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

  // Wire quick add forms after each render
  function afterRender(){
    const r = document.getElementById('qaRun');
    if(r){
      r.addEventListener('submit', (e)=>{
        e.preventDefault();
        const f = new FormData(r);
        const time = toSeconds(String(f.get('time')||''));
        add('runs', {
          date: f.get('date'),
          distance_km: Number(f.get('dist')),
          time_sec: time,
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
        add('meditation', {
          date: f.get('date'),
          method: f.get('method'),
          duration_min: Number(f.get('min'))
        });
        location.hash = '#/meditation';
      });
    }
  }

  // Nav menu toggle (mobile)
  if(menuBtn && nav){
    menuBtn.addEventListener('click', ()=> nav.classList.toggle('open'));
    nav.addEventListener('click', (e)=>{
      if(e.target.matches('a[data-link]')) nav.classList.remove('open');
    });
  }

  // Route changes
  window.addEventListener('hashchange', ()=>{ render(location.hash); afterRender(); });
  window.addEventListener('load', ()=>{ render(location.hash); afterRender(); });

  // Expose a small helper for modules to re-render
  window.requestRender = () => { render(location.hash); afterRender(); };
})();


Views.settings = function(){
  const s = getSettings();
  return `
    <section class="card">
      <h3>Settings</h3>
      <form id="setForm">
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
          <h4>Backup</h4>
          <button class="btn" type="button" id="exportBtn">Export data (JSON)</button>
          <label class="meta" style="display:block;margin-top:.6rem">Import JSON <input type="file" id="importFile" accept="application/json"></label>
          <div class="meta">Import replaces your current data (choose “merge” below to append uniques).</div>
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
    <script>
      (function(){
        const f = document.getElementById('setForm');
        const exportBtn = document.getElementById('exportBtn');
        const importFile = document.getElementById('importFile');
        const mergeChk = document.getElementById('mergeChk');
        const clearBtn = document.getElementById('clearBtn');
        f.addEventListener('submit', (e)=>{
          e.preventDefault();
          const fd = new FormData(f);
          setSettings({
            name: fd.get('name'),
            age: fd.get('age') ? Number(fd.get('age')) : null,
            units: fd.get('units')
          });
          alert('Saved');
          requestRender();
        });
        exportBtn.addEventListener('click', exportJSON);
        importFile.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if(!file) return;
          try{
            await importJSON(file, { merge: mergeChk.checked });
            alert('Import complete');
            requestRender();
          }catch(err){
            alert('Import failed: ' + err.message);
          }
          e.target.value = '';
        });
        clearBtn.addEventListener('click', ()=>{
          if(confirm('This will delete ALL your data from this browser. Continue?')){
            localStorage.removeItem('tc_data_v1');
            alert('Cleared');
            requestRender();
          }
        });
      })();
    </script>
  `;
};

Views.about = function(){
  return `
    <section class="card">
      <h3>About</h3>
      <p>This is a local-first, offline-capable Progressive Web App designed for training: runs, strength, fasting, meditation, and parkrun logs. Your data lives in your browser (localStorage). You can export/import JSON anytime.</p>
      <p>Tip: Add this to your phone Home Screen to use it like a native app.</p>
      <ul class="meta">
        <li>No accounts. No trackers. Works offline.</li>
        <li>Free to host on GitHub Pages.</li>
        <li>Pluggable modules — add more over time.</li>
      </ul>
    </section>
  `;
};

