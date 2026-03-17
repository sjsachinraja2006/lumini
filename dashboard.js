const state = {
  area: '',
  style: 'Modern',
  budget: 0,
  city: '',
  photo: null,
  currentStep: 1
};

const BUDGET_SPLIT = {
  'Exterior':    { pct: 100, color: '#00eeff' },
  'Living Hall': { pct: 100, color: '#ffb830' },
  'Kitchen':     { pct: 100, color: '#5cb8e0' },
  'Bedroom':     { pct: 100, color: '#9b7fe8' },
  'Bathroom':    { pct: 100, color: '#4ecdc4' },
  'Terrace':     { pct: 100, color: '#5ce085' }
};

// CANVAS PARTICLES
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let W, H, mx = 0, my = 0;

function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W;
    this.y = H + 10;
    this.vx = (Math.random() - .5) * .4;
    this.vy = -(Math.random() * .6 + .2);
    this.size = Math.random() * 2 + .4;
    this.alpha = Math.random() * .35 + .08;
    this.color = Math.random() > .5 ? '0,238,255' : '255,184,48';
    this.life = 0;
    this.maxLife = Math.random() * 200 + 150;
  }
  update() {
    this.x += this.vx; this.y += this.vy; this.life++;
    if (this.life > this.maxLife || this.y < -10) this.reset();
    const dx = this.x - mx, dy = this.y - my;
    const d = Math.sqrt(dx*dx + dy*dy);
    if (d < 100) { const f=(100-d)/100; this.vx+=dx/d*f*.2; this.vy+=dy/d*f*.2; }
    this.vx *= .99; this.vy *= .99;
  }
  draw() {
    const fade = this.life < 20 ? this.life/20 : this.life > this.maxLife-20 ? (this.maxLife-this.life)/20 : 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${this.color},${this.alpha*fade})`;
    ctx.fill();
  }
}

const particles = [];
for (let i = 0; i < 80; i++) {
  const p = new Particle();
  p.y = Math.random() * H;
  p.life = Math.random() * p.maxLife;
  particles.push(p);
}

(function animate() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animate);
})();

// STEP NAVIGATION
function goStep(n) {
  if (n === 2 && !state.area) { alert('Please select an area first!'); return; }
  if (n === 3) {
    state.budget = parseInt(document.getElementById('budgetInput').value) || 0;
    state.city   = document.getElementById('cityInput').value || 'your city';
    updateAIMeta();
  }

  document.querySelectorAll('.dash-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step' + n).classList.add('active');

  document.querySelectorAll('.pb-step').forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i + 1 < n)  s.classList.add('done');
    if (i + 1 === n) s.classList.add('active');
  });

  document.getElementById('stepLabel').textContent = `Step ${n} of 4`;
  state.currentStep = n;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// AREA SELECT
function selectArea(el) {
  document.querySelectorAll('.area-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  state.area = el.getAttribute('data-area');
  document.getElementById('nextBtn1').disabled = false;
  document.getElementById('areaLabel').textContent = state.area;
  document.getElementById('idleAreaLabel').textContent = state.area;
  document.getElementById('photoAreaLabel').textContent = state.area;
  document.getElementById('loadingArea').textContent = state.area;
}

// STYLE SELECT
function selectStyle(el, style) {
  document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  state.style = style;
}

// FILE UPLOAD
function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  state.photo = file;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const img = document.getElementById('previewImg');
    img.src = ev.target.result;
    img.style.display = 'block';
    document.getElementById('uploadInner').style.display = 'none';

    const aiPhoto = document.getElementById('aiPhotoPreview');
    aiPhoto.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

// BUDGET SPLIT
function updateBudgetSplit() {
  const val = parseInt(document.getElementById('budgetInput').value);
  if (!val || val < 1000) { document.getElementById('budgetSplit').style.display = 'none'; return; }
  state.budget = val;

  const splits = [
    { name: 'Exterior', pct: 28, color: '#00eeff' },
    { name: 'Hall',     pct: 22, color: '#ffb830' },
    { name: 'Kitchen',  pct: 18, color: '#5cb8e0' },
    { name: 'Bedroom',  pct: 14, color: '#9b7fe8' },
    { name: 'Bathroom', pct: 12, color: '#4ecdc4' },
    { name: 'Terrace',  pct: 6,  color: '#5ce085' }
  ];

  const html = splits.map(s => `
    <div class="bs-row">
      <span>${s.name}</span>
      <div class="bs-track">
        <div class="bs-fill" style="width:${s.pct}%;background:${s.color}"></div>
      </div>
      <span>₹${Math.round(val * s.pct / 100).toLocaleString()}</span>
    </div>
  `).join('');

  document.getElementById('bsBars').innerHTML = html;
  document.getElementById('budgetSplit').style.display = 'block';

  // summary for step 4
  document.getElementById('summaryContent').innerHTML = splits.map(s =>
    `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05)">
      <span>${s.name}</span>
      <span style="color:${s.color}">₹${Math.round(val * s.pct / 100).toLocaleString()}</span>
    </div>`
  ).join('') + `<div style="padding:8px 0 0;font-weight:700;color:var(--text)">Total: ₹${val.toLocaleString()}</div>`;
}

// UPDATE META
function updateAIMeta() {
  document.getElementById('metaArea').textContent   = state.area   || '—';
  document.getElementById('metaBudget').textContent = state.budget ? `₹${state.budget.toLocaleString()}` : '—';
  document.getElementById('metaStyle').textContent  = state.style  || '—';
  document.getElementById('metaCity').textContent   = state.city   || '—';
  document.getElementById('shopCity').textContent   = state.city   || 'your city';
}

// GET AI SUGGESTIONS — CLAUDE API
async function getAISuggestions() {
  const btn = document.getElementById('aiBtn');
  if (btn) btn.disabled = true;

  document.getElementById('aiIdle').style.display    = 'none';
  document.getElementById('aiOutput').style.display  = 'none';
  document.getElementById('aiLoading').style.display = 'block';

  const prompt = `You are Luminest, an expert AI home interior designer.

The user wants to design their ${state.area}.
Style preference: ${state.style}
Total budget: ₹${state.budget || 'Not specified'}
City: ${state.city || 'Not specified'}

Give detailed, practical design suggestions for their ${state.area} including:

1. **Wall Colors** - Suggest 3 specific paint colors with hex codes and brand names (Asian Paints / Berger)
2. **Furniture** - Suggest 3-4 furniture pieces with estimated prices in ₹
3. **Lighting** - Suggest ambient, task and accent lighting options
${state.area === 'Bathroom' ? '4. **Tiles** - Suggest tile patterns, sizes and color combinations\n5. **Fixtures** - Suggest faucets, shower, mirror styles' : ''}
${state.area === 'Terrace' ? '4. **Plants** - Suggest 5 plants suitable for this area with care tips' : ''}
4. **Budget Breakdown** - How to allocate the budget across items
5. **Quick Tips** - 3 pro tips for this specific area

Keep suggestions practical, budget-friendly and suitable for Indian homes. Format with clear headings using **bold**.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text;
    displayAIResult(text);

  } catch (err) {
    displayAIResult(`**Connection Note:**\n\nTo enable AI suggestions, add your Claude API key in dashboard.js.\n\nFor now, here are general tips for your ${state.area}:\n\n**Wall Colors:**\n- Warm white (#F5F0E8) - Classic and timeless\n- Sage green (#8A9E8A) - Calming and natural\n- Warm beige (#C8B89A) - Cozy and elegant\n\n**Quick Tips:**\n- Start with neutral base colors\n- Add accent walls for depth\n- Layer lighting for ambiance\n- Keep furniture proportional to room size`);
  }
}

// DISPLAY RESULT
function displayAIResult(text) {
  document.getElementById('aiLoading').style.display = 'none';
  document.getElementById('aiOutput').style.display  = 'block';

  // Convert markdown-style **bold** to HTML
  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--accent)">$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n- /g, '<br>• ')
    .replace(/\n(\d+)\. /g, '<br><strong>$1.</strong> ');

  document.getElementById('aoContent').innerHTML = `<p>${html}</p>`;
}

// SEARCH SHOPS
function searchShops(query) {
  const city = state.city || 'Salem';
  const searchQuery = encodeURIComponent(`${query} in ${city}`);
  window.open(`https://www.google.com/maps/search/${searchQuery}`, '_blank');
}

// DRAG AND DROP
const uploadBox = document.getElementById('uploadBox');
uploadBox.addEventListener('dragover', e => {
  e.preventDefault();
  uploadBox.style.borderColor = 'var(--accent)';
  uploadBox.style.background  = 'rgba(0,238,255,.06)';
});
uploadBox.addEventListener('dragleave', () => {
  uploadBox.style.borderColor = '';
  uploadBox.style.background  = '';
});
uploadBox.addEventListener('drop', e => {
  e.preventDefault();
  uploadBox.style.borderColor = '';
  uploadBox.style.background  = '';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const dt = new DataTransfer();
    dt.items.add(file);
    document.getElementById('fileInput').files = dt.files;
    handleFile({ target: { files: [file] } });
  }
});
