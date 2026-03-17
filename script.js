// CANVAS PARTICLES
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let W, H;
let mx = 0, my = 0;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W;
    this.y = H + 10;
    this.vx = (Math.random() - .5) * .5;
    this.vy = -(Math.random() * .8 + .3);
    this.size = Math.random() * 2 + .5;
    this.alpha = Math.random() * .4 + .1;
    this.color = Math.random() > .5 ? '0,238,255' : '255,184,48';
    this.life = 0;
    this.maxLife = Math.random() * 250 + 150;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.life > this.maxLife || this.y < -10) this.reset();
    const dx = this.x - mx;
    const dy = this.y - my;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 100) {
      const f = (100 - d) / 100;
      this.vx += (dx / d) * f * .25;
      this.vy += (dy / d) * f * .25;
    }
    this.vx *= .99;
    this.vy *= .99;
  }
  draw() {
    const fade = this.life < 20 ? this.life / 20 : this.life > this.maxLife - 20 ? (this.maxLife - this.life) / 20 : 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.alpha * fade})`;
    ctx.fill();
  }
}

const particles = [];
for (let i = 0; i < 100; i++) {
  const p = new Particle();
  p.y = Math.random() * H;
  p.life = Math.random() * p.maxLife;
  particles.push(p);
}

function drawLines() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 90) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0,238,255,${(1 - d / 90) * .06})`;
        ctx.lineWidth = .5;
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, W, H);
  drawLines();
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animate);
}
animate();

// NAVBAR SHRINK
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', scrollY > 60);
});

// SCROLL REVEAL
const ro = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('in'), i * 80);
    }
  });
}, { threshold: .1 });
document.querySelectorAll('.sec-head, .area-card, .feat-card, .how-step').forEach(el => {
  el.classList.add('reveal');
  ro.observe(el);
});

// BUDGET BARS
const bo = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.bb-fill').forEach((b, i) => {
        setTimeout(() => b.classList.add('go'), i * 120);
      });
      bo.unobserve(e.target);
    }
  });
}, { threshold: .3 });
document.querySelectorAll('.budget-bars').forEach(el => bo.observe(el));

// WALL COLOR
window.changeWall = function(el, color) {
  document.querySelectorAll('.pd').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  const wall = document.getElementById('rsWall');
  if (wall) wall.style.background = color;
};

// 3D TILT ON ROOM CARD
const roomCard = document.querySelector('.room-card');
if (roomCard) {
  roomCard.addEventListener('mousemove', e => {
    const r = roomCard.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    roomCard.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-4px)`;
  });
  roomCard.addEventListener('mouseleave', () => {
    roomCard.style.transform = '';
    roomCard.style.animation = 'floatY 7s ease-in-out infinite';
  });
}

// PARALLAX SHARDS
document.addEventListener('mousemove', e => {
  const xp = (e.clientX / W - .5) * 18;
  const yp = (e.clientY / H - .5) * 18;
  document.querySelectorAll('.float-chip').forEach((c, i) => {
    const d = (i + 1) * .3;
    c.style.transform = `translate(${xp * d}px, ${yp * d}px)`;
  });
});

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});
