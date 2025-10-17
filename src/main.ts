import * as PIXI from 'pixi.js';

// Game Configuration
const CONFIG = {
  width: 800,
  height: 600,
  playerSpeed: 8,
  asteroidSpeed: 5,
  crystalSpeed: 2.5,
  spawnRate: 0.02,
};

// External download link (update as needed)
const DOWNLOAD_URL = 'https://example.com/download';

// Particle class for visual effects
class Particle {
  sprite: PIXI.Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;

  constructor(x: number, y: number, color: number) {
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(color);
    this.sprite.drawCircle(0, 0, Math.random() * 3 + 2);
    this.sprite.endFill();
    this.sprite.x = x;
    this.sprite.y = y;

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    
    this.maxLife = 30 + Math.random() * 20;
    this.life = this.maxLife;
  }

  update(): boolean {
    this.sprite.x += this.vx;
    this.sprite.y += this.vy;
    this.life--;
    
    const alpha = this.life / this.maxLife;
    this.sprite.alpha = alpha;
    
    return this.life > 0;
  }
}

// Main Game Class
class CosmicMiner {
  app: PIXI.Application;
  player!: PIXI.Graphics;
  asteroids: PIXI.Graphics[] = [];
  crystals: PIXI.Graphics[] = [];
  particles: Particle[] = [];
  score: number = 0;
  level: number = 1;
  health: number = 3;
  scoreText!: PIXI.Text;
  levelText!: PIXI.Text;
  healthText!: PIXI.Text;
  gameOverText!: PIXI.Text;
  stars: PIXI.Graphics[] = [];
  isGameOver: boolean = false;
  mouseX: number = 0;
  mouseY: number = 0;
  defeats: number = 0;

  // UI overlay + buttons
  overlay!: PIXI.Container;
  restartButton!: PIXI.Container;
  downloadButton?: PIXI.Container;

  constructor() {
    this.app = new PIXI.Application({
      width: CONFIG.width,
      height: CONFIG.height,
      backgroundColor: 0x0a0a1a,
      antialias: true,
    });

    // Mount canvas into the correct container
    const container = document.getElementById('game');
    if (container) {
      container.appendChild(this.app.view as HTMLCanvasElement);
    }
    
    this.init();
    this.setupEventListeners();
    this.app.ticker.add(() => this.gameLoop());
  }

  init() {
    this.createStarfield();
    this.createPlayer();
    this.createUI();
  }

  createStarfield() {
    for (let i = 0; i < 100; i++) {
      const star = new PIXI.Graphics();
      const size = Math.random() * 2 + 0.5;
      star.beginFill(0xffffff, Math.random() * 0.5 + 0.5);
      star.drawCircle(0, 0, size);
      star.endFill();
      star.x = Math.random() * CONFIG.width;
      star.y = Math.random() * CONFIG.height;
      this.stars.push(star);
      this.app.stage.addChild(star);
    }
  }

  createPlayer() {
    this.player = new PIXI.Graphics();
    
    // Ship body (triangle)
    this.player.beginFill(0x00ffff);
    this.player.moveTo(0, -20);
    this.player.lineTo(-15, 15);
    this.player.lineTo(15, 15);
    this.player.closePath();
    this.player.endFill();
    
    // Engine glow
    this.player.beginFill(0xff00ff, 0.6);
    this.player.drawCircle(0, 15, 8);
    this.player.endFill();
    
    this.player.x = CONFIG.width / 2;
    this.player.y = CONFIG.height - 100;
    
    this.app.stage.addChild(this.player);
  }

  createUI() {
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#00ffff',
      fontWeight: 'bold',
    });

    this.scoreText = new PIXI.Text('Score: 0', style);
    this.scoreText.x = 20;
    this.scoreText.y = 20;
    this.app.stage.addChild(this.scoreText);

    this.levelText = new PIXI.Text('Level: 1', style);
    this.levelText.x = 20;
    this.levelText.y = 50;
    this.app.stage.addChild(this.levelText);

    this.healthText = new PIXI.Text('Health: ❤❤❤', { ...style, fill: '#ff0066' });
    this.healthText.x = CONFIG.width - 200;
    this.healthText.y = 20;
    this.app.stage.addChild(this.healthText);
    // Normalize hearts and anchor to top-right
    {
      const heart = String.fromCharCode(9829);
      this.healthText.text = `Health: ${heart.repeat(this.health)}`;
      (this.healthText as any).anchor?.set?.(1, 0);
      this.healthText.x = CONFIG.width - 20;
      this.healthText.y = 20;
    }

    this.gameOverText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: '#ff0066',
      fontWeight: 'bold',
      align: 'center',
    });
    this.gameOverText.anchor.set(0.5);
    this.gameOverText.x = CONFIG.width / 2;
    this.gameOverText.y = CONFIG.height / 2;
    this.app.stage.addChild(this.gameOverText);

    // Overlay container for buttons
    this.overlay = new PIXI.Container();
    this.overlay.visible = false;
    this.app.stage.addChild(this.overlay);

    // Create Restart button (always available on game over)
    this.restartButton = this.createButton('Click to Restart', 0x5ef3b6, () => {
      if (this.isGameOver) this.restart();
    });
    this.overlay.addChild(this.restartButton);
    // Normalize hearts display to UTF-8 hearts
    const heart = String.fromCharCode(9829);
    this.healthText.text = `Health: ${heart.repeat(this.health)}`;
  }

  // Creates a pretty, clickable button with hover/press states
  createButton(label: string, color: number, onClick: () => void): PIXI.Container {
    const paddingX = 24;
    const paddingY = 12;

    const container = new PIXI.Container();
    container.interactive = true;
    container.cursor = 'pointer';

    const text = new PIXI.Text(label, new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 22,
      fill: '#0c0f14',
      fontWeight: 'bold',
      letterSpacing: 0.3,
    }));
    text.anchor.set(0.5);

    // Compute background size based on text
    const bgWidth = text.width + paddingX * 2;
    const bgHeight = text.height + paddingY * 2;

    const bg = new PIXI.Graphics();
    const radius = 16;
    const drawBg = (g: PIXI.Graphics, alpha = 1) => {
      g.clear();
      g.beginFill(color, alpha);
      g.drawRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, radius);
      g.endFill();
      // Outline glow
      g.lineStyle(2, 0xffffff, 0.25);
      g.drawRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, radius);
    };
    drawBg(bg, 1);

    container.addChild(bg);
    container.addChild(text);

    // Hover/press states
    container.on('pointerover', () => drawBg(bg, 1));
    container.on('pointerout', () => drawBg(bg, 0.9));
    container.on('pointerdown', () => drawBg(bg, 0.8));
    container.on('pointerup', () => {
      drawBg(bg, 1);
      onClick();
    });

    return container;
  }

  setupEventListeners() {
    const canvas = this.app.view as HTMLCanvasElement;

    // Mouse move (map CSS pixels to game coordinates)
    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CONFIG.width / rect.width;
      const scaleY = CONFIG.height / rect.height;
      this.mouseX = (e.clientX - rect.left) * scaleX;
      this.mouseY = (e.clientY - rect.top) * scaleY;
    });

    // Touch move (map CSS pixels to game coordinates)
    canvas.addEventListener('touchmove', (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = CONFIG.width / rect.width;
      const scaleY = CONFIG.height / rect.height;
      const touch = e.touches[0];
      if (touch) {
        this.mouseX = (touch.clientX - rect.left) * scaleX;
        this.mouseY = (touch.clientY - rect.top) * scaleY;
      }
    }, { passive: false });

    // Restart is handled by the overlay button to avoid conflicts with other clicks
  }

  spawnAsteroid() {
    const asteroid = new PIXI.Graphics();
    const size = Math.random() * 20 + 20;
    
    asteroid.beginFill(0xff6600, 0.8);
    asteroid.drawPolygon([
      -size, 0,
      -size/2, -size,
      size/2, -size,
      size, 0,
      size/2, size,
      -size/2, size
    ]);
    asteroid.endFill();
    
    // Glow effect
    asteroid.lineStyle(3, 0xff3300, 0.5);
    asteroid.drawCircle(0, 0, size + 5);
    
    asteroid.x = Math.random() * (CONFIG.width - 100) + 50;
    asteroid.y = -50;
    (asteroid as any).speed = CONFIG.asteroidSpeed + this.level * 0.3;
    
    this.asteroids.push(asteroid);
    this.app.stage.addChild(asteroid);
  }

  spawnCrystal() {
    const crystal = new PIXI.Graphics();
    const size = 15;
    
    crystal.beginFill(0x00ff88);
    crystal.moveTo(0, -size);
    crystal.lineTo(-size/2, 0);
    crystal.lineTo(0, size);
    crystal.lineTo(size/2, 0);
    crystal.closePath();
    crystal.endFill();
    
    // Glow
    crystal.lineStyle(2, 0x00ffff, 0.6);
    crystal.drawCircle(0, 0, size + 3);
    
    crystal.x = Math.random() * (CONFIG.width - 100) + 50;
    crystal.y = -50;
    (crystal as any).speed = CONFIG.crystalSpeed + this.level * 0.2;
    
    this.crystals.push(crystal);
    this.app.stage.addChild(crystal);
  }

  createExplosion(x: number, y: number, color: number) {
    for (let i = 0; i < 15; i++) {
      const particle = new Particle(x, y, color);
      this.particles.push(particle);
      this.app.stage.addChild(particle.sprite);
    }
  }

  checkCollision(obj1: PIXI.Graphics, obj2: PIXI.Graphics, distance: number): boolean {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy) < distance;
  }

  updatePlayer() {
    const dx = this.mouseX - this.player.x;
    const dy = this.mouseY - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
      const ratio = CONFIG.playerSpeed / distance;
      this.player.x += dx * ratio;
      this.player.y += dy * ratio;
      
      // Keep player in bounds
      this.player.x = Math.max(30, Math.min(CONFIG.width - 30, this.player.x));
      this.player.y = Math.max(30, Math.min(CONFIG.height - 30, this.player.y));
      
      // Engine particles
      if (Math.random() < 0.3) {
        const particle = new Particle(this.player.x, this.player.y + 15, 0xff00ff);
        this.particles.push(particle);
        this.app.stage.addChild(particle.sprite);
      }
    }
  }

  gameLoop() {
    if (this.isGameOver) return;

    // Update starfield
    this.stars.forEach(star => {
      star.y += 1;
      if (star.y > CONFIG.height) {
        star.y = 0;
        star.x = Math.random() * CONFIG.width;
      }
    });

    // Spawn objects
    if (Math.random() < CONFIG.spawnRate * this.level) {
      this.spawnAsteroid();
    }
    if (Math.random() < CONFIG.spawnRate * 0.8) {
      this.spawnCrystal();
    }

    // Update player
    this.updatePlayer();

    // Update asteroids
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const asteroid = this.asteroids[i];
      asteroid.y += (asteroid as any).speed;
      asteroid.rotation += 0.05;

      // Check collision with player
      if (this.checkCollision(this.player, asteroid, 35)) {
        this.createExplosion(asteroid.x, asteroid.y, 0xff6600);
        this.app.stage.removeChild(asteroid);
        this.asteroids.splice(i, 1);
        this.health--;
        this.updateHealth();
        { // normalize hearts display after update
          const heart = String.fromCharCode(9829);
          this.healthText.text = `Health: ${heart.repeat(this.health)}`;
        }
        if (this.health <= 0) {
          this.gameOver();
        }
      } else if (asteroid.y > CONFIG.height + 50) {
        this.app.stage.removeChild(asteroid);
        this.asteroids.splice(i, 1);
      }
    }

    // Update crystals
    for (let i = this.crystals.length - 1; i >= 0; i--) {
      const crystal = this.crystals[i];
      crystal.y += (crystal as any).speed;
      crystal.rotation += 0.1;

      // Check collision with player
      if (this.checkCollision(this.player, crystal, 30)) {
        this.createExplosion(crystal.x, crystal.y, 0x00ff88);
        this.app.stage.removeChild(crystal);
        this.crystals.splice(i, 1);
        this.score += 10;
        this.updateScore();
      } else if (crystal.y > CONFIG.height + 50) {
        this.app.stage.removeChild(crystal);
        this.crystals.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (!this.particles[i].update()) {
        this.app.stage.removeChild(this.particles[i].sprite);
        this.particles.splice(i, 1);
      }
    }
  }

  updateScore() {
    this.scoreText.text = `Score: ${this.score}`;
    if (this.score > 0 && this.score % 100 === 0) {
      this.level++;
      this.levelText.text = `Level: ${this.level}`;
    }
  }

  updateHealth() {
    const hearts = '❤'.repeat(this.health);
    this.healthText.text = `Health: ${hearts}`;
  }

  gameOver() {
    this.isGameOver = true;
    this.defeats += 1;
    this.gameOverText.text = `GAME OVER`;
    // Hide HUD labels on game over
    this.scoreText.visible = false;
    this.levelText.visible = false;
    this.healthText.visible = false;

    // Show overlay with buttons. After second defeat, also show Download button
    this.showGameOverOverlay();
  }

  showGameOverOverlay() {
    // Center restart button and optionally download button
    this.overlay.visible = true;

    // Nudge title up to make room for buttons
    this.gameOverText.y = (CONFIG.height / 2) - 80;

    // Remove all children, we will re-add in layout order
    this.overlay.removeChildren();

    // Vertical layout under the gameOverText
    const centerX = CONFIG.width / 2;
    let currentY = (CONFIG.height / 2) + 60;

    this.restartButton.x = centerX;
    this.restartButton.y = currentY;
    this.overlay.addChild(this.restartButton);

    // Add Download button after 2 defeats
    if (this.defeats >= 2) {
      if (!this.downloadButton) {
        this.downloadButton = this.createButton('Download', 0x00d4ff, () => {
          try {
            window.open(DOWNLOAD_URL, '_blank', 'noopener');
          } catch (_) {
            // ignore
          }
        });
      }
      currentY += 64;
      this.downloadButton.x = centerX;
      this.downloadButton.y = currentY;
      this.overlay.addChild(this.downloadButton);
    }
  }

  restart() {
    // Clear game objects
    this.asteroids.forEach(a => this.app.stage.removeChild(a));
    this.crystals.forEach(c => this.app.stage.removeChild(c));
    this.particles.forEach(p => this.app.stage.removeChild(p.sprite));
    
    this.asteroids = [];
    this.crystals = [];
    this.particles = [];
    
    // Reset state
    this.score = 0;
    this.level = 1;
    this.health = 3;
    this.isGameOver = false;
    
    this.player.x = CONFIG.width / 2;
    this.player.y = CONFIG.height - 100;
    
    this.updateScore();
    this.levelText.text = 'Level: 1';
    this.updateHealth();
    { // normalize hearts display after update
      const heart = String.fromCharCode(9829);
      this.healthText.text = `Health: ${heart.repeat(this.health)}`;
    }
    // Show HUD again
    this.scoreText.visible = true;
    this.levelText.visible = true;
    this.healthText.visible = true;
    this.gameOverText.text = '';
    this.overlay.visible = false;
  }
}

// Start game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new CosmicMiner();
});
