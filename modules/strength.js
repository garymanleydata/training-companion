Views.strength = function(){
  FAB.set('strength', () => {
    const d = new Date().toISOString().slice(0,10);
    const dur = Number(prompt('Duration (min)?', '60')||'0');
    const name = prompt('Exercise name? (e.g., Deadlift)') || 'Exercise';
    const sets = Number(prompt('Sets?', '5')||'0');
    const reps = Number(prompt('Reps?', '5')||'0');
    const load = Number(prompt('Load (kg)?', '0')||'0');
    add('strength', { date: d, duration_min: dur, exercises:[{name, sets, reps, load_kg: load}] });
    requestRender();
  });

  const items = list('strength');
  const rows = items.map(x => {
    const ex = (x.exercises||[]).map(e => `${e.name} ${e.sets}×${e.reps}@${e.load_kg||0}kg`).join(', ');
    return `<div class="row"><div><strong>${fmtDate(x.date)}</strong></div><div class="meta">${x.duration_min? x.duration_min+' min · ' : ''}${ex}
      <button class="btn" onclick="removeItem('strength','${x.id}'); requestRender()">Delete</button></div></div>`;
  }).join('');

  return `
    <section class="card">
      <h3>Strength</h3>
      <form id="stForm" onsubmit="return false">
        <div class="grid">
          <div class="span-6"><label>Date <input type="date" name="date" required></label></div>
          <div class="span-6"><label>Session type <input type="text" name="stype" placeholder="Deadlifts, squats, pull-ups"></label></div>
        </div>
        <label>Duration (min) <input type="number" name="dur"></label>
        <div id="exWrap">
          <fieldset class="card" style="margin-top:.8rem">
            <legend>Exercise</legend>
            <label>Name <input name="ex_name" placeholder="Deadlift" required></label>
            <div class="grid">
              <div class="span-4"><label>Sets <input type="number" name="ex_sets" required></label></div>
              <div class="span-4"><label>Reps <input type="number" name="ex_reps" required></label></div>
              <div class="span-4"><label>Load (kg) <input type="number" step="0.5" name="ex_load"></label></div>
            </div>
          </fieldset>
        </div>
        <button class="btn" type="button" id="addEx">＋ Add another exercise</button>
        <button class="btn primary" type="submit">Save session</button>
      </form>
      <div class="list">${rows || '<p class="meta">No strength sessions yet.</p>'}</div>
    </section>
  `;
};
