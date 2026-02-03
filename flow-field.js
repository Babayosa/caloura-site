// Flow Field Animation
// Particle system with simplex noise-based movement

(function() {
  'use strict';

  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const canvas = document.getElementById('flow-field');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Configuration
  const config = {
    particleCount: window.innerWidth < 768 ? 150 : 300,
    noiseScale: 0.003,
    speed: 0.5,
    fadeAlpha: 0.03,
    particleAlpha: 0.4,
    trailLength: 8
  };

  let width, height;
  let particles = [];
  let time = 0;
  let animationId;

  // Simple noise implementation (value noise)
  const noise = {
    perm: [],
    grad: [],

    init() {
      for (let i = 0; i < 256; i++) {
        this.perm[i] = i;
        this.grad[i] = (Math.random() * 2 - 1);
      }
      // Shuffle
      for (let i = 255; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.perm[i], this.perm[j]] = [this.perm[j], this.perm[i]];
      }
      // Extend
      for (let i = 0; i < 256; i++) {
        this.perm[256 + i] = this.perm[i];
        this.grad[256 + i] = this.grad[i];
      }
    },

    fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    },

    lerp(a, b, t) {
      return a + t * (b - a);
    },

    get(x, y, z) {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;

      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);

      const u = this.fade(x);
      const v = this.fade(y);
      const w = this.fade(z);

      const A = this.perm[X] + Y;
      const AA = this.perm[A] + Z;
      const AB = this.perm[A + 1] + Z;
      const B = this.perm[X + 1] + Y;
      const BA = this.perm[B] + Z;
      const BB = this.perm[B + 1] + Z;

      return this.lerp(
        this.lerp(
          this.lerp(this.grad[AA], this.grad[BA], u),
          this.lerp(this.grad[AB], this.grad[BB], u),
          v
        ),
        this.lerp(
          this.lerp(this.grad[AA + 1], this.grad[BA + 1], u),
          this.lerp(this.grad[AB + 1], this.grad[BB + 1], u),
          v
        ),
        w
      );
    }
  };

  class Particle {
    constructor() {
      this.reset();
      this.history = [];
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = 0;
      this.vy = 0;
      this.history = [];
      this.life = Math.random() * 200 + 100;
      this.maxLife = this.life;
    }

    update() {
      // Store position history for trails
      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > config.trailLength) {
        this.history.shift();
      }

      // Get flow direction from noise
      const angle = noise.get(
        this.x * config.noiseScale,
        this.y * config.noiseScale,
        time * 0.0005
      ) * Math.PI * 4;

      // Apply flow force
      this.vx += Math.cos(angle) * 0.1;
      this.vy += Math.sin(angle) * 0.1;

      // Damping
      this.vx *= 0.95;
      this.vy *= 0.95;

      // Update position
      this.x += this.vx * config.speed;
      this.y += this.vy * config.speed;

      // Decrease life
      this.life--;

      // Reset if out of bounds or dead
      if (this.x < 0 || this.x > width || this.y < 0 || this.y > height || this.life <= 0) {
        this.reset();
      }
    }

    draw() {
      if (this.history.length < 2) return;

      const lifeRatio = this.life / this.maxLife;
      const alpha = config.particleAlpha * lifeRatio;

      ctx.beginPath();
      ctx.moveTo(this.history[0].x, this.history[0].y);

      for (let i = 1; i < this.history.length; i++) {
        ctx.lineTo(this.history[i].x, this.history[i].y);
      }
      ctx.lineTo(this.x, this.y);

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    // Adjust particle count for mobile
    const targetCount = window.innerWidth < 768 ? 150 : 300;

    // Initialize particles if needed
    if (particles.length === 0) {
      for (let i = 0; i < targetCount; i++) {
        particles.push(new Particle());
      }
    } else if (particles.length !== targetCount) {
      // Adjust particle count
      if (particles.length < targetCount) {
        while (particles.length < targetCount) {
          particles.push(new Particle());
        }
      } else {
        particles.length = targetCount;
      }
    }
  }

  function animate() {
    // Fade effect
    ctx.fillStyle = `rgba(10, 10, 10, ${config.fadeAlpha})`;
    ctx.fillRect(0, 0, width, height);

    // Update and draw particles
    for (const particle of particles) {
      particle.update();
      particle.draw();
    }

    time++;
    animationId = requestAnimationFrame(animate);
  }

  function init() {
    noise.init();
    resize();
    animate();
  }

  // Handle resize with debounce
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 200);
  });

  // Handle visibility change - pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });

  // Start
  init();
})();
