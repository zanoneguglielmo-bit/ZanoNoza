// MVP client-side logic per calcolo capienza porte
const panels = [];

const els = {
  numPorts: () => document.getElementById('numPorts'),
  capacityPerPort: () => document.getElementById('capacityPerPort'),
  w: () => document.getElementById('w'),
  h: () => document.getElementById('h'),
  port: () => document.getElementById('port'),
  addPanel: () => document.getElementById('addPanel'),
  panelsTable: () => document.querySelector('#panelsTable tbody'),
  resultsTable: () => document.querySelector('#resultsTable tbody'),
  csvInput: () => document.getElementById('csvInput'),
  importCsv: () => document.getElementById('importCsv'),
  exportCsv: () => document.getElementById('exportCsv'),
  presetSelect: () => document.getElementById('presetSelect'),
  loadPreset: () => document.getElementById('loadPreset')
};

function renderPanels() {
  const tbody = els.panelsTable();
  tbody.innerHTML = '';
  panels.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${p.w}</td>
      <td>${p.h}</td>
      <td>${p.w * p.h}</td>
      <td>${p.port}</td>
      <td><button data-i="${i}" class="rm">Rimuovi</button></td>
    `;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.rm').forEach(btn => btn.addEventListener('click', (e) => {
    const idx = Number(e.currentTarget.dataset.i);
    panels.splice(idx,1);
    renderPanels();
    computeAndRender();
  }));
}

function computeAndRender(){
  const numP = Number(els.numPorts().value) || 0;
  const cap = Number(els.capacityPerPort().value) || 0;
  const totals = Array.from({length:numP}, ()=>0);
  panels.forEach(p => {
    const px = Number(p.w) * Number(p.h) || 0;
    const portIdx = Math.max(0, Math.min(numP-1, Number(p.port)-1));
    if (!Number.isNaN(portIdx)) totals[portIdx] += px;
  });

  const tbody = els.resultsTable();
  tbody.innerHTML = '';
  for(let i=0;i<numP;i++){
    const tr = document.createElement('tr');
    const tot = totals[i];
    const status = (cap>0 && tot>cap) ? 'SOVRACCARICO' : 'OK';
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${tot.toLocaleString()}</td>
      <td>${cap>0?cap.toLocaleString():'(non impostata)'}</td>
      <td class="${status==='OK'?'ok':''} ${status==='SOVRACCARICO'?'danger':''}">${status}</td>
    `;
    tbody.appendChild(tr);
  }
}

function addPanelFromInputs(){
  const w = Number(els.w().value);
  const h = Number(els.h().value);
  const port = Number(els.port().value);
  if (!w || !h || !port){
    alert('Inserisci width, height e porta validi');
    return;
  }
  panels.push({w,h,port});
  els.w().value = '';
  els.h().value = '';
  els.port().value = '';
  renderPanels();
  computeAndRender();
}

function importCsvText(text){
  const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
  for(const l of lines){
    const parts = l.split(',').map(s=>s.trim());
    if (parts.length>=3){
      const w = Number(parts[0]), h = Number(parts[1]), port = Number(parts[2]);
      if (w>0 && h>0 && port>0) panels.push({w,h,port});
    }
  }
  renderPanels();
  computeAndRender();
}

function exportCsv(){
  let csv = 'width,height,port\n';
  panels.forEach(p=> csv += `${p.w},${p.h},${p.port}\n`);
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'panels.csv'; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

async function loadPresets(){
  try{
    const res = await fetch('presets.json');
    const data = await res.json();
    const sel = els.presetSelect();
    Object.keys(data).forEach(k => {
      const opt = document.createElement('option'); opt.value = k; opt.textContent = k; sel.appendChild(opt);
    });
    return data;
  }catch(e){
    console.warn('Presets non trovati', e);
    return {};
  }
}

function applyPreset(preset){
  if (!preset) return;
  if (preset.ports) els.numPorts().value = preset.ports;
  if (preset.capacityPerPort) els.capacityPerPort().value = preset.capacityPerPort;
  computeAndRender();
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const presets = await loadPresets();
  els.addPanel().addEventListener('click', addPanelFromInputs);
  els.importCsv().addEventListener('click', ()=> importCsvText(els.csvInput().value));
  els.exportCsv().addEventListener('click', exportCsv);
  els.numPorts().addEventListener('change', computeAndRender);
  els.capacityPerPort().addEventListener('change', computeAndRender);
  els.loadPreset().addEventListener('click', ()=>{
    const key = els.presetSelect().value;
    if (!key) return alert('Seleziona un preset');
    applyPreset(presets[key]);
  });
});
