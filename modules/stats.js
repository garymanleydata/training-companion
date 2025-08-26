Views.stats = function(){
  const runs = Stats.sumByDate(list('runs'), 'distance_km');
  const strength = Stats.sumByDate(list('strength'), 'duration_min');
  const airofit = Stats.sumByDate(list('meditation'), 'duration_min', m => m.method === 'Airofit');
  const weight = Stats.lastByDate(list('metrics'), 'weight_kg');

  setTimeout(() => {
    drawLine('runsChart', runs);
    drawLine('strengthChart', strength);
    drawLine('airofitChart', airofit);
    drawLine('weightChart', weight);
  });

  function section(title, id, has){
    return `
      <section class="card">
        <h3>${title}</h3>
        ${has ? `<canvas id="${id}" width="400" height="200"></canvas>` : '<p class="meta">No data</p>'}
      </section>
    `;
  }

  return `
    ${section('Run distance (km)', 'runsChart', runs.length)}
    ${section('Strength time (min)', 'strengthChart', strength.length)}
    ${section('Airofit time (min)', 'airofitChart', airofit.length)}
    ${section('Weight (kg)', 'weightChart', weight.length)}
  `;
};

const Stats = {
  sumByDate(items, key, filter){
    const m = {};
    (filter ? items.filter(filter) : items).forEach(i => {
      const d = i.date ? i.date.slice(0,10) : null;
      const v = i[key];
      if(!d || v==null) return;
      m[d] = (m[d]||0) + v;
    });
    return Object.entries(m).sort((a,b)=> new Date(a[0]) - new Date(b[0])).map(([date,value])=>({date,value}));
  },
  lastByDate(items, key){
    const m = {};
    items.forEach(i => {
      const d = i.date ? i.date.slice(0,10) : null;
      const v = i[key];
      if(!d || v==null) return;
      m[d] = v;
    });
    return Object.entries(m).sort((a,b)=> new Date(a[0]) - new Date(b[0])).map(([date,value])=>({date,value}));
  }
};
window.Stats = Stats;

function drawLine(id, data, {color='#0ea5e9'}={}){
  const canvas = document.getElementById(id);
  if(!canvas || !data.length) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  const xs = data.map(d=>new Date(d.date).getTime());
  const ys = data.map(d=>d.value);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pad = 30;
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((d,i)=>{
    const x = pad + ((new Date(d.date).getTime() - minX) / (maxX - minX || 1)) * (w - 2*pad);
    const y = h - pad - ((d.value - minY) / (maxY - minY || 1)) * (h - 2*pad);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
}
