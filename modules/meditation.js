Views.meditation = function(){
  FAB.set('meditation', () => {
    const d = new Date().toISOString().slice(0,10);
    const method = prompt('Method? (Mindfulness, Airofit…)', 'Mindfulness') || 'Mindfulness';
    const min = Number(prompt('Minutes?', '10')||'0');
    if(min>0) add('meditation', { date:d, method, duration_min:min });
    requestRender();
  });

  const items = list('meditation');
  const rows = items.map(x => `<div class="row"><div><strong>${fmtDate(x.date)}</strong></div><div class="meta">${x.method} · ${x.duration_min} min
    <button class="btn" onclick="removeItem('meditation','${x.id}'); requestRender()">Delete</button></div></div>`).join('');

  return `
    <section class="card">
      <h3>Meditation / Breathing</h3>
      <form id="medForm" onsubmit="return false">
        <div class="grid">
          <div class="span-6"><label>Date <input type="date" name="date" required></label></div>
          <div class="span-6"><label>Method
            <select name="method"><option>Mindfulness</option><option>Box breathing</option><option>Wim Hof</option><option>Nasal-only</option><option>Airofit</option></select>
          </label></div>
        </div>
        <label>Duration (min) <input type="number" name="min" required></label>
        <button class="btn primary" type="submit">Save</button>
      </form>
      <div class="list">${rows || '<p class="meta">No sessions logged yet.</p>'}</div>
    </section>
  `;
};
