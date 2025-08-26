Views.metrics = function(){
  FAB.set('metrics', () => {
    const d = new Date().toISOString().slice(0,10);
    const weight = prompt('Weight (kg)?', '');
    if(weight===null) return;
    const waist = prompt('Waist (cm)?', '');
    if(waist===null) return;
    const hips = prompt('Hips (cm)?', '');
    if(hips===null) return;
    const bust = prompt('Bust (cm)?', '');
    if(bust===null) return;
    add('metrics', {
      date: d,
      weight_kg: weight ? Number(weight) : null,
      waist_cm: waist ? Number(waist) : null,
      hips_cm: hips ? Number(hips) : null,
      bust_cm: bust ? Number(bust) : null
    });
    requestRender();
  });
  const items = list('metrics');
  const rows = items.map(x => `
    <div class="row">
      <div><strong>${fmtDate(x.date)}</strong></div>
      <div class="meta">${[
        x.weight_kg ? x.weight_kg + ' kg' : null,
        x.waist_cm ? 'Waist ' + x.waist_cm + ' cm' : null,
        x.hips_cm ? 'Hips ' + x.hips_cm + ' cm' : null,
        x.bust_cm ? 'Bust ' + x.bust_cm + ' cm' : null
      ].filter(Boolean).join(' · ')}
        <button class="btn" onclick="removeItem('metrics','${x.id}'); requestRender()">Delete</button>
      </div>
    </div>
  `).join('');
  return `
    <section class="card">
      <h3>Metrics</h3>
      <form id="metricsForm" onsubmit="return false">
        <div class="grid">
          <div class="span-6"><label>Date <input type="date" name="date" required></label></div>
          <div class="span-6"><label>Weight (kg) <input type="number" step="0.1" name="weight"></label></div>
        </div>
        <div class="grid">
          <div class="span-4"><label>Waist (cm) <input type="number" step="0.1" name="waist"></label></div>
          <div class="span-4"><label>Hips (cm) <input type="number" step="0.1" name="hips"></label></div>
          <div class="span-4"><label>Bust (cm) <input type="number" step="0.1" name="bust"></label></div>
        </div>
        <button class="btn primary" type="submit">Add metrics</button>
      </form>
      <div class="list">${rows || '<p class="meta">No metrics logged yet.</p>'}</div>
    </section>
  `;
};

