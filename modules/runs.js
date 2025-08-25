Views.runs = function(){
  FAB.set('runs', () => {
    const d = new Date().toISOString().slice(0,10);
    const distance = prompt('Distance (km)?', '5');
    if(distance===null) return;
    const time = prompt('Time (mm:ss)?', '25:00');
    if(time===null) return;
    add('runs', { date: d, distance_km: Number(distance), time_sec: toSeconds(time), hr_avg: null, notes: '' });
    requestRender();
  });

  const items = list('runs');
  const rows = items.map(x => `
    <div class="row">
      <div><strong>${fmtDate(x.date)}</strong> <span class="meta">${pacePerKm(x.time_sec, x.distance_km)}</span></div>
      <div class="meta">${x.distance_km} km · ${fmtTimeSeconds(x.time_sec)}
        <button class="btn" onclick="removeItem('runs','${x.id}'); requestRender()">Delete</button>
      </div>
    </div>
  `).join('');

  return `
    <section class="card">
      <h3>Runs</h3>
      <form id="runsForm" onsubmit="return false">
        <div class="grid">
          <div class="span-6"><label>Date <input type="date" name="date" required></label></div>
          <div class="span-6"><label>Distance (km) <input type="number" step="0.01" name="distance" required></label></div>
        </div>
        <div class="grid">
          <div class="span-6"><label>Time (hh:mm:ss or mm:ss) <input type="text" name="time" placeholder="00:45:00" required></label></div>
          <div class="span-6"><label>Avg HR <input type="number" name="hr"></label></div>
        </div>
        <label>Notes <textarea name="notes" rows="2" placeholder="Surface, shoes, weather, MAF notes…"></textarea></label>
        <button class="btn primary" type="submit">Add run</button>
      </form>
      <div class="list">${rows || '<p class="meta">No runs logged yet.</p>'}</div>
    </section>
  `;
};
