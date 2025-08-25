Views.fasting = function(){
  FAB.set('fasting', () => {
    const start = new Date().toISOString();
    add('fasting', { start, end: null, type: 'Timer' });
    requestRender();
  });

  const items = list('fasting');
  const rows = items.map(x => {
    const status = x.end ? `${Math.round((new Date(x.end)-new Date(x.start))/36e5)} h` : 'In progress…';
    return `<div class="row"><div><strong>${fmtDateTime(x.start)}</strong></div><div class="meta">${status}
      ${x.end? '' : `<button class="btn" onclick="update('fasting','${x.id}',{ end:new Date().toISOString() }); requestRender()">Stop</button>`}
      <button class="btn" onclick="removeItem('fasting','${x.id}'); requestRender()">Delete</button>
    </div></div>`;
  }).join('');

  return `
    <section class="card">
      <h3>Fasting</h3>
      <form id="fastForm" onsubmit="return false">
        <label>Start <input type="datetime-local" name="start" required></label>
        <label>End (optional) <input type="datetime-local" name="end"></label>
        <label>Type
          <select name="type"><option>16:8</option><option>24h</option><option>OMAD</option><option>Timer</option></select>
        </label>
        <button class="btn primary" type="submit">Save window</button>
      </form>
      <div class="list">${rows || '<p class="meta">No fasts yet. Use the FAB to start a timer.</p>'}</div>
    </section>
  `;
};
