
// Local-first storage (simple, no dependencies).
// Everything lives under a single key in localStorage for portability.
const DB_KEY = 'tc_data_v1';

const defaultDB = () => ({
  settings: { name: '', age: null, units: 'km', theme: 'auto' },
  runs: [],
  strength: [],
  fasting: [],
  meditation: [],
  parkrun: [],
  metrics: []
});

function loadDB(){
  try{
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : defaultDB();
  }catch(e){
    console.warn('Corrupt storage, resetting', e);
    return defaultDB();
  }
}
function saveDB(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }
function uid(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }

// CRUD helpers
function list(module){ return loadDB()[module] || []; }
function add(module, item){
  const db = loadDB();
  const rec = { id: uid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...item };
  if(!db[module]) db[module] = [];
  db[module].unshift(rec);
  saveDB(db);
  return rec;
}
function update(module, id, patch){
  const db = loadDB();
  db[module] = (db[module]||[]).map(x => x.id===id ? { ...x, ...patch, updatedAt:new Date().toISOString() } : x);
  saveDB(db);
}
function removeItem(module, id){
  const db = loadDB();
  db[module] = (db[module]||[]).filter(x => x.id !== id);
  saveDB(db);
}
function getSettings(){ return loadDB().settings || {}; }
function setSettings(newSettings){
  const db = loadDB();
  db.settings = { ...db.settings, ...newSettings };
  saveDB(db);
}

// Export / Import
function exportJSON(){
  const data = JSON.stringify(loadDB(), null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0,10);
  a.href = url;
  a.download = `training-companion-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function importJSON(file, { merge=false }={}){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const incoming = JSON.parse(reader.result);
        if(!incoming || typeof incoming !== 'object') throw new Error('Invalid file');
        if(merge){
          const db = loadDB();
          const out = { ...db };
          for(const key of Object.keys(defaultDB())){
            if(Array.isArray(db[key])){
              const seen = new Set(db[key].map(x => x.id));
              const addl = (incoming[key]||[]).filter(x => !seen.has(x.id));
              out[key] = [...db[key], ...addl];
            }else if(key === 'settings'){
              out.settings = { ...db.settings, ...(incoming.settings||{}) };
            }
          }
          saveDB(out);
        }else{
          saveDB(incoming);
        }
        resolve(true);
      }catch(e){ reject(e); }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// Small utils
function fmtDate(d){ try{ return new Date(d).toLocaleDateString(); }catch{return d} }
function fmtTimeSeconds(total){
  if(total == null || isNaN(total)) return '';
  total = Math.round(total);
  const m = Math.floor(total/60), s = total%60;
  return `${m}:${String(s).padStart(2,'0')}`;
}
function pacePerKm(seconds, km){
  if(!km || km<=0) return '';
  const spk = seconds / km; // seconds per km
  return fmtTimeSeconds(spk) + ' /km';
}
function toSeconds(hhmmss){
  if(!hhmmss) return 0;
  const parts = hhmmss.split(':').map(Number);
  if(parts.length===3){ return parts[0]*3600 + parts[1]*60 + parts[2]; }
  if(parts.length===2){ return parts[0]*60 + parts[1]; }
  return Number(hhmmss) || 0;
}
function mafHR(age, adjust=0){ return 180 - (Number(age)||0) + (Number(adjust)||0); }

// Router
const Views = {}; // modules attach their render functions here

// Simple signals for FAB behaviour
const FAB = {
  handlers: {},
  set(view, handler){ this.handlers[view] = handler; },
  run(view){ const h = this.handlers[view]; if(h) h(); }
};

// Tiny pub/sub for modules
const Bus = {
  fns: {},
  on(evt, fn){ (this.fns[evt]||(this.fns[evt]=[])).push(fn); },
  emit(evt, data){ (this.fns[evt]||[]).forEach(fn=>fn(data)); }
};
