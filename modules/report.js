Views.report = function(){
  const today = new Date().toISOString().slice(0,10);
  return `
    <section class="card">
      <h3>CSV Export</h3>
      <form id="csvForm" onsubmit="return false">
        <div class="grid">
          <div class="span-6"><label>From <input type="date" name="from" required></label></div>
          <div class="span-6"><label>To <input type="date" name="to" value="${today}" required></label></div>
        </div>
        <div class="card" style="margin-top:1rem">
          <h4>Include</h4>
          <label><input type="checkbox" name="runs" checked> Runs</label><br>
          <label><input type="checkbox" name="strength" checked> Strength</label><br>
          <label><input type="checkbox" name="meditation" checked> Meditation</label><br>
          <label><input type="checkbox" name="fasting" checked> Fasting</label><br>
          <label><input type="checkbox" name="parkrun" checked> parkrun</label><br>
          <label><input type="checkbox" name="metrics" checked> Metrics</label>
        </div>
        <button class="btn primary" type="submit" style="margin-top:1rem">Download CSV</button>
      </form>
    </section>
  `;
};

window.exportCSV = function({from,to,mods}){
  if(!from || !to) return;
  const map = {};
  const include = new Set(mods);
  // Runs
  if(include.has('runs')){
    list('runs').forEach(r => {
      const d = r.date ? r.date.slice(0,10) : null;
      if(!d || d < from || d > to) return;
      const o = map[d] || (map[d] = {date:d});
      o.runs_distance_km = (o.runs_distance_km||0) + (r.distance_km||0);
      o.runs_count = (o.runs_count||0) + 1;
    });
  }
  // Strength
  if(include.has('strength')){
    list('strength').forEach(s => {
      const d = s.date ? s.date.slice(0,10) : null;
      if(!d || d < from || d > to) return;
      const o = map[d] || (map[d] = {date:d});
      if(s.duration_min!=null) o.strength_duration_min = (o.strength_duration_min||0) + Number(s.duration_min);
      o.strength_count = (o.strength_count||0) + 1;
    });
  }
  // Meditation
  if(include.has('meditation')){
    list('meditation').forEach(m => {
      const d = m.date ? m.date.slice(0,10) : null;
      if(!d || d < from || d > to) return;
      const o = map[d] || (map[d] = {date:d});
      if(m.duration_min!=null) o.meditation_duration_min = (o.meditation_duration_min||0) + Number(m.duration_min);
      o.meditation_count = (o.meditation_count||0) + 1;
    });
  }
  // Fasting
  if(include.has('fasting')){
    list('fasting').forEach(f => {
      if(!f.end) return; // skip ongoing
      const d = f.start ? f.start.slice(0,10) : null;
      if(!d || d < from || d > to) return;
      const o = map[d] || (map[d] = {date:d});
      const hours = (new Date(f.end) - new Date(f.start)) / 36e5;
      o.fasting_duration_h = (o.fasting_duration_h||0) + Math.round(hours*100)/100;
      o.fasting_count = (o.fasting_count||0) + 1;
    });
  }
  // parkrun
  if(include.has('parkrun')){
    list('parkrun').forEach(p => {
      const d = p.date ? p.date.slice(0,10) : null;
      if(!d || d < from || d > to) return;
      const o = map[d] || (map[d] = {date:d});
      if(p.time_sec!=null) o.parkrun_time_sec = (o.parkrun_time_sec||0) + Number(p.time_sec);
      o.parkrun_count = (o.parkrun_count||0) + 1;
    });
  }
  // Metrics (last measurement per day)
  if(include.has('metrics')){
    list('metrics').forEach(m => {
      const d = m.date ? m.date.slice(0,10) : null;
      if(!d || d < from || d > to) return;
      const o = map[d] || (map[d] = {date:d});
      if(m.weight_kg!=null) o.weight_kg = m.weight_kg;
      if(m.height_cm!=null) o.height_cm = m.height_cm;
      if(m.bmi!=null) o.bmi = m.bmi;
      if(m.waist_cm!=null) o.waist_cm = m.waist_cm;
      if(m.hips_cm!=null) o.hips_cm = m.hips_cm;
      if(m.bust_cm!=null) o.bust_cm = m.bust_cm;
    });
  }
  // Build rows for range
  const rows = [];
  const start = new Date(from);
  const end = new Date(to);
  for(let d=new Date(start); d<=end; d.setDate(d.getDate()+1)){
    const key = d.toISOString().slice(0,10);
    rows.push(map[key] || {date:key});
  }
  const moduleCols = {
    runs:['runs_distance_km','runs_count'],
    strength:['strength_duration_min','strength_count'],
    meditation:['meditation_duration_min','meditation_count'],
    fasting:['fasting_duration_h','fasting_count'],
    parkrun:['parkrun_time_sec','parkrun_count'],
    metrics:['weight_kg','height_cm','bmi','waist_cm','hips_cm','bust_cm']
  };
  const cols = ['date'];
  mods.forEach(m => { (moduleCols[m]||[]).forEach(c => cols.push(c)); });
  const csv = [cols.join(',')]
    .concat(rows.map(r => cols.map(c => r[c]!=null ? r[c] : '').join(',')))
    .join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0,10);
  a.href = url;
  a.download = `training-companion-report-${stamp}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
