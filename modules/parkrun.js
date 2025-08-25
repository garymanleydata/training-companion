Views.parkrun = function(){
  FAB.set('parkrun', () => {
    const d = new Date().toISOString().slice(0,10);
    const ev = prompt('Event name?', 'Eastbourne parkrun') || 'parkrun';
    const t = prompt('Time (mm:ss)?', '22:30');
    if(t===null) return;
    add('parkrun', { date:d, event_name:ev, time_sec:toSeconds(t), position:null, age_grade:null });
    requestRender();
  });

  const items = list('parkrun');
  const rows = items.map(x => `<div class="row">
    <div><strong>${fmtDate(x.date)}</strong> <span class="meta"> ${x.event_name}</span></div>
    <div class="meta">${fmtTimeSeconds(x.time_sec)}${x.age_grade? ' · ' + x.age_grade + '%' : ''}
      <button class="btn" onclick="removeItem('parkrun','${x.id}'); requestRender()">Delete</button>
    </div>
  </div>`).join('');

  return `
    <section class="card">
      <h3>parkrun</h3>
      <form id="pkForm" onsubmit="return false">
        <div class="grid">
          <div class="span-6"><label>Date <input type="date" name="date" required></label></div>
          <div class="span-6"><label>Event name <input type="text" name="event" required placeholder="Eastbourne parkrun"></label></div>
        </div>
        <div class="grid">
          <div class="span-6"><label>Time (mm:ss) <input type="text" name="time" required placeholder="18:45"></label></div>
          <div class="span-6"><label>Age grade (%) <input type="number" name="age" step="0.01"></label></div>
        </div>
        <label>Position <input type="number" name="pos"></label>
        <button class="btn primary" type="submit">Save result</button>
      </form>
      <div class="list">${rows || '<p class="meta">No parkruns yet. Use the FAB to add one quickly.</p>'}</div>
    </section>
  `;
};
